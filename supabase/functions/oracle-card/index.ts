import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "deep night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { recentAnchors } = await req.json() as { recentAnchors?: string };
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const season = getSeason();
    const timeOfDay = getTimeOfDay();

    let contextBlock: string;
    if (recentAnchors && recentAnchors.trim().length > 0) {
      contextBlock = `Here are the user's recent conversation anchor words and themes:\n${recentAnchors}\n\nDraw from what you sense underneath those themes. Not the surface topic — the emotional or psychological undercurrent.`;
    } else {
      contextBlock = `Today is ${dayOfWeek}, ${dateStr}. The season is ${season}. The time of day is ${timeOfDay}.\nDraw from the quality of this moment in the year.`;
    }

    const prompt = `You are Temple's Oracle. Generate a Daily Oracle Card for this user.

The card is not fortune telling. It is a reflection — a mirror held up to what the user is already carrying. It speaks from stillness, not urgency.

${contextBlock}

Respond with ONLY valid JSON, no preamble, no backticks:
{
  "anchor": "one word",
  "body": "Two or three sentences. Quiet. True. Written as if the card has been waiting for the person. Never instructive. Never urgent."
}`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: "You generate oracle card content. Respond with only valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.9,
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
    const content = data.choices?.[0]?.message?.content?.trim();

    // Parse JSON from response
    let parsed: { anchor: string; body: string };
    try {
      // Try to extract JSON if wrapped in backticks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      console.error("Failed to parse oracle response:", content);
      parsed = {
        anchor: "Presence",
        body: "The question you are holding does not need an answer right now. It needs your attention. Sit with it a moment longer.",
      };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Oracle error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
