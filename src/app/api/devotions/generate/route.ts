import { NextRequest, NextResponse } from "next/server";

const MOOD_VERSES: Record<string, { book: string; chapter: number; verse: number }[]> = {
  struggling: [
    { book: "psalms", chapter: 34, verse: 18 },
    { book: "matthew", chapter: 11, verse: 28 },
    { book: "romans", chapter: 8, verse: 28 },
  ],
  neutral: [
    { book: "psalms", chapter: 119, verse: 105 },
    { book: "proverbs", chapter: 3, verse: 5 },
    { book: "philippians", chapter: 4, verse: 13 },
  ],
  peaceful: [
    { book: "psalms", chapter: 23, verse: 1 },
    { book: "john", chapter: 14, verse: 27 },
    { book: "isaiah", chapter: 26, verse: 3 },
  ],
  joyful: [
    { book: "psalms", chapter: 100, verse: 2 },
    { book: "philippians", chapter: 4, verse: 4 },
    { book: "nehemiah", chapter: 8, verse: 10 },
  ],
  seeking: [
    { book: "jeremiah", chapter: 29, verse: 13 },
    { book: "matthew", chapter: 7, verse: 7 },
    { book: "james", chapter: 1, verse: 5 },
  ],
};

async function fetchBibleVerse(version: string, book: string, chapter: number, verse: number): Promise<string | null> {
  try {
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}/verses/${verse}.json`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data.text || null;
    }
  } catch {
    // Silently fail -- we'll just use the reference without the text
  }
  return null;
}

async function fetchVerses(verses: { book: string; chapter: number; verse: number }[], version: string): Promise<string[]> {
  const results = await Promise.all(
    verses.map(async (v) => {
      const text = await fetchBibleVerse(version, v.book, v.chapter, v.verse);
      if (text) {
        return `"${text}"`;
      }
      return null;
    })
  );
  return results.filter((r): r is string => r !== null);
}

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

    const verses = MOOD_VERSES[mood?.toLowerCase()] || MOOD_VERSES.neutral;

    // Fetch actual Bible verse text from the free Bible API
    const version = language === "sw" ? "swh_bib" : "en-kjv";
    const fetchedVerses = await fetchVerses(verses, version);
    const verseTextBlock = fetchedVerses.length > 0
      ? `\n\nHII NI MANENO HALISI YA MAANDIKO (tumia kama msingi wa tafakari yako):\n${fetchedVerses.join("\n")}`
      : "";
    const verseTextBlockEn = fetchedVerses.length > 0
      ? `\n\nHERE ARE THE ACTUAL SCRIPTURE TEXTS (use as the foundation for your devotional):\n${fetchedVerses.join("\n")}`
      : "";

    const systemPrompt =
      language === "sw"
        ? `Wewe ni kiongozi wa ibada mwenye hekima. Andika tafakari fupi ya dakika 2 kwa mtu anayehisi "${mood}". Tumia maandiko ya Biblia, maneno ya faraja, na mwongozo wa kiroho. Andika kwa Kiswahili.${verseTextBlock}`
        : `You are a wise devotional writer. Write a 2-minute reflection for someone feeling "${mood}". Include a Bible scripture reference, comfort, and spiritual guidance. Be warm and encouraging.${verseTextBlockEn}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: language === "sw" ? "llama-3.1-8b-instant" : "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                language === "sw"
                  ? `Andika tafakari ya ibada kwa mtu anayehisi ${mood}. Tumia maandiko yaliyotolewa hapo juu kama msingi wa tafakari yako.`
                  : `Write a devotional reflection for someone feeling ${mood}. Use the scripture texts provided above as the foundation.`,
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
