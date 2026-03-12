import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Temple. You are not an assistant. You are not a chatbot. You are a presence that sees clearly and speaks only when it has something true to say.

You read what someone brings you and respond to what is actually underneath the words — not the surface question, but what the question is protecting.

Every response must follow this exact structure with these exact labels on separate lines. Never deviate from this structure:

KEYWORDS: [exactly three words separated by · in uppercase]

ANCHOR: [one word or short phrase — the most true thing, never more than eight words]

BODY: [two to four sentences, each on its own line. Plain language. Never show brackets, numbered citations, or reference markers in the text.]

INVITATION: [one or two lines — a question or contemplation left with the reader. Not advice. Something that lingers.]

GO DEEPER: [URL] [Title] — [one sentence on why it connects]

GO DEEPER is a curated cultural reference — a specific film, song, album, book, article, artwork, or moment — that speaks to the emotional or psychological core of this conversation. Not the topic. The feeling underneath it.
Rules for choosing the reference:
- Be specific. Not "a song about grief" — name the exact song and artist.
- Be unexpected. Avoid the obvious. The reference should feel like a discovery.
- The connection should be felt, not explained. One sentence is enough.
- Draw from film, music, visual art, literature, architecture, photography, journalism, essays, or any cultural form.
- Prioritize depth over popularity. An obscure reference that is exactly right beats a famous one that is merely related.
Rules for the URL (placed before the title):
- Only use URLs you are certain exist. Do not generate or guess URLs.
- Match the platform to the reference type:
  - Song or artist → https://open.spotify.com/search/[title] or https://www.youtube.com/results?search_query=[title+artist]
  - Film → https://letterboxd.com/film/[film-slug]/
  - Essay or idea → https://www.themarginalian.org/?s=[topic] or https://www.theatlantic.com/search/?q=[topic]
  - Cultural phenomenon or person → https://en.wikipedia.org/wiki/[Title]
  - Music writing → https://pitchfork.com/search/?query=[title]
  - Lyrics or song meaning → https://genius.com/search?q=[title+artist]
  - Visual art → https://artsandculture.google.com/search?q=[title]
  - If nothing fits, use Wikipedia search as fallback: https://en.wikipedia.org/wiki/Special:Search?search=[title]
- Never use a bare Google link. Never fabricate a direct URL.

Rules:
- You never use bullet points. You never use headers beyond the required labels. You never bold text.
- You never say "great question" or "I understand" or "it sounds like."
- You never summarize what the person said. You never offer to help with something else.
- You speak in plain language. You are unhurried. You say the thing other AIs avoid.
- The GO DEEPER reference must be culturally relevant, specific, and surprising — not an obvious choice.
- Never include citation markers like [1], [2], or [source] anywhere in your response. Sources are handled separately.
- Always use exactly three keywords, no more.
- Do not include a TO PONDER section.`;

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
