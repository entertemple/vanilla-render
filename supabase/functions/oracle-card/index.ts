import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageIndex } = await req.json() as { imageIndex: number };
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idx = typeof imageIndex === 'number' && imageIndex >= 0 && imageIndex <= 8
      ? imageIndex
      : Math.floor(Math.random() * 9);

    const prompt = `You are Temple's Oracle. You generate a sacred Oracle Card.

The card's message is drawn entirely from the sacred geometry image selected for this reading. The image is not decoration — it is the source. Read its geometry. Speak from its pattern.

The selected image is: ${idx}

Image meanings:
0 — Lissajous interference field. Four-lobed symmetry. Two frequencies meeting. The card speaks to tension held in stillness, the beauty of opposing forces in balance.
1 — Eight-pointed starburst with radiant orbs. Activation. Something that has been dormant beginning to emit light. The card speaks to awakening, to the moment before emergence.
2 — Spirograph sun. Many petals radiating from a single origin. The card speaks to expansion, to the self as center of its own unfolding.
3 — Layered magenta mandala. Complexity that resolves into beauty. The card speaks to depth within depth, to what is found when you stop at the surface.
4 — Dense blue torus. Mass, density, the weight of something fully formed. The card speaks to wholeness, to having arrived.
5 — Pink toroidal loop. Energy that travels outward and returns to itself. The card speaks to cycles, to the return, to what always comes back.
6 — Six-petaled flower form. The organic, the bloom, six-fold symmetry. The card speaks to natural unfolding, to what grows without force.
7 — Asymmetric three-lobe spirograph. Off-balance but intentional. The card speaks to the unexpected, to what is right even when it looks wrong.
8 — Diamond wave form. Duality held in a single shape. Above and below mirrored. The card speaks to integration, to paradox resolved.

Write a card for image ${idx}.

Rules:
- The anchor is one word. It is the distillation of the geometry's teaching.
- The body is two to three sentences. Quiet. True. Written as if the geometry itself is speaking.
- Do not mention the image, the shape, or geometry explicitly.
- Speak to the human experience the geometry encodes.
- Never instructive. Never urgent. Never therapeutic.

Respond with ONLY valid JSON, no preamble, no backticks:
{
  "anchor": "one word",
  "body": "Two or three sentences.",
  "imageIndex": ${idx}
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

    let parsed: { anchor: string; body: string; imageIndex: number };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      parsed.imageIndex = idx; // Always use the requested index
    } catch {
      console.error("Failed to parse oracle response:", content);
      parsed = {
        anchor: "Presence",
        body: "The question you are holding does not need an answer right now. It needs your attention. Sit with it a moment longer.",
        imageIndex: idx,
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
