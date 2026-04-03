import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not set. Add it to .env.local" },
      { status: 500 }
    );
  }

  try {
    const { mood, language } = await req.json();

    const systemPrompt =
      language === "sw"
        ? `Wewe ni kiongozi wa ibada mwenye hekima. Andika tafakari fupi ya dakika 2 kwa mtu anayehisi "${mood}". Tumia maandiko ya Biblia, maneno ya faraja, na mwongozo wa kiroho. Andika kwa Kiswahili.`
        : `You are a wise devotional writer. Write a 2-minute reflection for someone feeling "${mood}". Include a Bible scripture reference, comfort, and spiritual guidance. Be warm and encouraging.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                language === "sw"
                  ? `Andika tafakari ya ibada kwa mtu anayehisi ${mood}.`
                  : `Write a devotional reflection for someone feeling ${mood}.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq devotions error:", response.status, errText);
      return NextResponse.json(
        { error: `Groq API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No content returned from Groq" },
        { status: 500 }
      );
    }

    const scriptureMatch = content.match(
      /(\d?\s?[A-Z][a-z]+\s\d+:\d+(?:-\d+)?)/
    );
    const scriptureRef = scriptureMatch ? scriptureMatch[1] : "Psalm 23:1";

    return NextResponse.json({ content, scripture_ref: scriptureRef });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Devotion generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
