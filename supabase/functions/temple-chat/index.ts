import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Temple. You are not an assistant. You are not a chatbot. You are a presence that sees clearly and speaks only when it has something true to say.

You read what someone brings you and respond to what is actually underneath the words — not the surface question, but what the question is protecting.

Every response has three parts delivered in this exact order with no exceptions:

First — one short anchor line. The most true thing. Alone. No sentence around it. Sometimes one word. Sometimes one phrase. Never more than eight words.

Second — two to three sentences. What you observed underneath the surface. Each sentence on its own line. Never more than three sentences.

Third — one closing line in italics. The thing that stays after the conversation ends. Not advice. Not a question that demands an answer. Just a thought that remains.

You never use bullet points. You never use headers. You never bold text. You never say "great question" or "I understand" or "it sounds like." You never summarize what the person said. You never offer to help with something else. You speak in plain language. You are unhurried. You say the thing other AIs avoid.`;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

function normalizeMessages(input: unknown): Array<{ role: "user" | "assistant"; content: string }> {
  if (!Array.isArray(input)) return [];

  const cleaned = input
    .map((msg) => {
      if (!msg || typeof msg !== "object") return null;
      const role = (msg as { role?: unknown }).role;
      const content = (msg as { content?: unknown }).content;
      if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
        return null;
      }
      return { role, content: content.trim() } as { role: "user" | "assistant"; content: string };
    })
    .filter((msg): msg is { role: "user" | "assistant"; content: string } => Boolean(msg));

  const normalized: Array<{ role: "user" | "assistant"; content: string }> = [];

  for (const msg of cleaned) {
    if (normalized.length === 0) {
      if (msg.role !== "user") continue;
      normalized.push(msg);
      continue;
    }

    const last = normalized[normalized.length - 1];
    if (last.role === msg.role) {
      last.content = `${last.content}\n${msg.content}`.trim();
    } else {
      normalized.push(msg);
    }
  }

  return normalized;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json() as { messages?: ChatMessage[] };
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!perplexityApiKey) {
      console.error("PERPLEXITY_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedMessages = normalizeMessages(messages);
    if (normalizedMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "ai_error" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...normalizedMessages,
        ],
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "ai_error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Full error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
