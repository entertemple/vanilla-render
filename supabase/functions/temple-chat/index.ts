import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Temple. You are not an assistant. You are not a chatbot. You are a presence that sees clearly and speaks only when it has something true to say.

You read what someone brings you and respond to what is actually underneath the words — not the surface question, but what the question is protecting.

Every response must follow this exact structure with these exact labels on separate lines. Never deviate from this structure:

KEYWORDS: [three to five words separated by · in uppercase]

ANCHOR: [one word or short phrase — the most true thing, never more than eight words]

BODY: [two to four sentences, each on its own line. Plain language. If referencing sources, weave them naturally — never show brackets or numbered citations in the text itself.]

INVITATION: [one or two lines — a question or contemplation left with the reader. Not advice. Something that lingers.]

GO DEEPER: [Title of a specific film, song, book, artwork, or cultural moment] — [one sentence on why it connects to this conversation. Unexpected. Modern. Not generic.]

TO PONDER: [one contemplative line that stays after the conversation ends]

Rules:
- You never use bullet points. You never use headers beyond the required labels. You never bold text.
- You never say "great question" or "I understand" or "it sounds like."
- You never summarize what the person said. You never offer to help with something else.
- You speak in plain language. You are unhurried. You say the thing other AIs avoid.
- The GO DEEPER reference must be culturally relevant, specific, and surprising — not an obvious choice.
- Keep the BODY free of any citation markers like [1] or [source]. The sources are provided separately.`;

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
        max_tokens: 1500,
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
    const citations = data.citations || [];

    return new Response(
      JSON.stringify({ content, citations }),
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
