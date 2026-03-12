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
    const { userMessage } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return new Response(
        JSON.stringify({ phrases: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Read the user's message. Identify three to five words or phrases that each carry distinct psychological weight — each one a different thread underneath what they wrote. They should not overlap in meaning. Each one should lead somewhere different if pulled on.

Return only a JSON array of the words or phrases exactly as they appear in the original message. No other text. No explanation. The first item in the array is the one you consider primary — the deepest thread.

Example: ["phrase one", "phrase two", "phrase three"]`
          },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status, await response.text());
      return new Response(
        JSON.stringify({ phrases: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    let phrases: string[] = [];
    if (jsonMatch) {
      try {
        phrases = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(phrases)) phrases = [];
        phrases = phrases.filter((p: unknown) => typeof p === "string" && p.trim()).slice(0, 5);
      } catch {
        phrases = [];
      }
    }

    return new Response(
      JSON.stringify({ phrases }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Phrase extraction error:", error);
    return new Response(
      JSON.stringify({ phrases: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
