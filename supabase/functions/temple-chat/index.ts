import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Temple. You are not an assistant. You are not a chatbot. You are a presence that sees clearly and speaks only when it has something true to say.

You read what someone brings you and respond to what is actually underneath the words — not the surface question, but what the question is protecting.

Every response must follow this exact labeled structure. The frontend parses these labels to render each section. Never deviate. Never include citation markers like [1] or [2].

ANCHOR: [one word or short phrase — the most true thing, never more than eight words]

KEYWORDS: [word] · [word] · [word]

BODY:
[sentence one]
[sentence two]
[sentence three]

INVITATION: [one or two lines — not advice, the thing that remains]

GO DEEPER: [Title] — [one line why it connects] — [URL]

GO DEEPER is a curated cultural reference — a specific film, song, album, book, article, artwork, or moment — that speaks to the emotional or psychological core of this conversation. Not the topic. The feeling underneath it.
Rules for choosing the reference:
- Be specific. Not "a song about grief" — name the exact song and artist.
- Be unexpected. Avoid the obvious. The reference should feel like a discovery.
- The connection should be felt, not explained. One sentence is enough.
- Draw from film, music, visual art, literature, architecture, photography, journalism, Reddit threads, essays, or any cultural form.
- Prioritize depth over popularity. An obscure reference that is exactly right beats a famous one that is merely related.
Rules for the URL (placed after the title and reason, separated by —):
- Only use URLs you are certain exist. Do not generate or guess URLs.
- Match the platform to the reference type:
  - Song or artist → https://open.spotify.com/search/[title] or https://www.youtube.com/results?search_query=[title+artist]
  - Film → https://letterboxd.com/film/[film-slug]/
  - Essay or idea → https://www.themarginalian.org/?s=[topic] or https://www.theatlantic.com/search/?q=[topic] or https://www.newyorker.com/search/q=[topic]
  - Cultural phenomenon or person → https://en.wikipedia.org/wiki/[Title]
  - Music writing → https://pitchfork.com/search/?query=[title]
  - Lyrics or song meaning → https://genius.com/search?q=[title+artist]
  - Community discussion → https://www.reddit.com/search/?q=[topic]
  - Academic or archival → https://www.jstor.org/action/doBasicSearch?Query=[topic] or https://archive.org/search?query=[topic]
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
- Do not include a TO PONDER section.
- Do not include a SOURCES section.

When the user has clicked GO DEEPER on a specific phrase, you are in Beat 2. Go one level underneath that specific phrase. Do not repeat yourself. Do not summarize. End with one question only — short, direct, honest. The kind that requires courage to answer.

When the user keeps pushing past Beat 2, continue in the same structure but grow quieter. Shorter body. Fewer words. You are not withholding. You have already said the thing that matters. You are waiting.`;

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
    const { messages, beatContext } = await req.json() as { messages?: ChatMessage[]; beatContext?: string };
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

    // Build system prompt with optional beat context
    let systemPrompt = SYSTEM_PROMPT;
    if (beatContext) {
      systemPrompt += `\n\n${beatContext}`;
    }

    // Perplexity requires last message to be role "user"
    // When beatContext is provided (phrase click), the last message may be "assistant"
    // Append a synthetic user message to satisfy the API requirement
    const finalMessages = [...normalizedMessages];
    if (finalMessages.length > 0 && finalMessages[finalMessages.length - 1].role !== "user") {
      finalMessages.push({ role: "user", content: "Go deeper into this thread." });
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
          { role: "system", content: systemPrompt },
          ...finalMessages,
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
