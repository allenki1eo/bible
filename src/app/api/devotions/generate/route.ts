import { NextRequest, NextResponse } from "next/server";

const MOOD_KEYWORDS: Record<string, {
  en: string;
  sw: string;
  theme: string;
  themeSw: string;
  verses: { book: string; chapter: number; verse: number }[];
}> = {
  struggling: {
    en: "Struggling",
    sw: "Anapambana",
    theme: "God's comfort in hard times",
    themeSw: "Faraja ya Mungu wakati wa shida",
    verses: [
      { book: "psalms", chapter: 34, verse: 18 },
      { book: "matthew", chapter: 11, verse: 28 },
      { book: "romans", chapter: 8, verse: 28 },
      { book: "2 corinthians", chapter: 1, verse: 3 },
      { book: "isaiah", chapter: 41, verse: 10 },
    ],
  },
  neutral: {
    en: "Neutral",
    sw: "Wastani",
    theme: "Daily guidance and trust in God",
    themeSw: "Mwongozo wa kila siku na kumwamini Mungu",
    verses: [
      { book: "psalms", chapter: 119, verse: 105 },
      { book: "proverbs", chapter: 3, verse: 5 },
      { book: "philippians", chapter: 4, verse: 13 },
      { book: "jeremiah", chapter: 29, verse: 11 },
      { book: "colossians", chapter: 3, verse: 23 },
    ],
  },
  peaceful: {
    en: "Peaceful",
    sw: "Ana amani",
    theme: "Resting in God's peace",
    themeSw: "Kupumzika katika amani ya Mungu",
    verses: [
      { book: "psalms", chapter: 23, verse: 1 },
      { book: "john", chapter: 14, verse: 27 },
      { book: "isaiah", chapter: 26, verse: 3 },
      { book: "philippians", chapter: 4, verse: 6 },
      { book: "psalms", chapter: 46, verse: 10 },
    ],
  },
  joyful: {
    en: "Joyful",
    sw: "Anafurahi",
    theme: "Giving thanks and praising God",
    themeSw: "Kushukuru na kumsifu Mungu",
    verses: [
      { book: "psalms", chapter: 100, verse: 2 },
      { book: "philippians", chapter: 4, verse: 4 },
      { book: "nehemiah", chapter: 8, verse: 10 },
      { book: "psalms", chapter: 16, verse: 11 },
      { book: "1 thessalonians", chapter: 5, verse: 16 },
    ],
  },
  seeking: {
    en: "Seeking",
    sw: "Anatafuta",
    theme: "Searching for God's purpose and direction",
    themeSw: "Kutafuta kusudi na mwelekeo wa Mungu",
    verses: [
      { book: "jeremiah", chapter: 29, verse: 13 },
      { book: "matthew", chapter: 7, verse: 7 },
      { book: "james", chapter: 1, verse: 5 },
      { book: "proverbs", chapter: 2, verse: 6 },
      { book: "psalms", chapter: 27, verse: 4 },
    ],
  },
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

async function fetchVerses(verses: { book: string; chapter: number; verse: number }[], version: string): Promise<{ reference: string; text: string }[]> {
  const results = await Promise.all(
    verses.map(async (v) => {
      const text = await fetchBibleVerse(version, v.book, v.chapter, v.verse);
      if (text) {
        const ref = `${v.book} ${v.chapter}:${v.verse}`;
        return { reference: ref, text };
      }
      return null;
    })
  );
  return results.filter((r): r is { reference: string; text: string } => r !== null);
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

    // Step 1: Understand the mood/word and find matching theme
    const moodKey = Object.keys(MOOD_KEYWORDS).find(
      (key) => key === mood?.toLowerCase()
    ) || "neutral";
    const moodData = MOOD_KEYWORDS[moodKey];

    // Step 2: Fetch actual Bible verses from the free API
    const version = language === "sw" ? "swh_bib" : "en-kjv";
    const fetchedVerses = await fetchVerses(moodData.verses, version);

    // Format verses for the prompt
    const verseBlockSw = fetchedVerses.length > 0
      ? fetchedVerses.map((v, i) => `${i + 1}. "${v.text}" -- (${v.reference})`).join("\n")
      : "Hakuna maandiko yaliyopatikana.";

    const verseBlockEn = fetchedVerses.length > 0
      ? fetchedVerses.map((v, i) => `${i + 1}. "${v.text}" -- (${v.reference})`).join("\n")
      : "No scriptures were found.";

    const verseRefsSw = fetchedVerses.length > 0
      ? fetchedVerses.map((v) => v.reference).join(", ")
      : "Zaburi 23:1";

    const verseRefsEn = fetchedVerses.length > 0
      ? fetchedVerses.map((v) => v.reference).join(", ")
      : "Psalm 23:1";

    // Step 3: Build the system prompt with full context
    const systemPrompt =
      language === "sw"
        ? `Wewe ni kiongozi wa ibada mwenye hekima na upendo. Kazi yako ni kuandika tafakari fupi ya dakika 2 kwa mtoto wa Mungu.

HALI YA MTU: "${moodData.sw}" (${moodData.themeSw})

MAANDIKO HALISI YA BIBLIA (yameletwa kutoka Biblia ya Kiswahili):
${verseBlockSw}

MUONGOZO WA KUANDIKA:
1. ANZA kwa kichwa cha tafakari kinachovutia
2. ELEZA hali ya mtu kwa huruma na uelewe -- onyesha kwamba unaelewa anachopitia
3. TUMIA maandiko yaliyotolewa hapo juu kama msingi wa tafakari -- nukuu au urejee angalau maandiko 2
4. TOA mwongozo wa kiroho na maneno ya faraja yanayotokana na maandiko hayo
5. MALIZA KWA MAOMBI fupi yenye nguvu inayofaa hali ya mtu

MUHIMU:
- Tafakari lazima iishe kwa sehemu ya "MAOMBI:" yenye maombi halisi
- Tumia Kiswahili safi, rahisi, na cha moyo
- Usitumie maneno magumu ya Kiarabu au Kiingereza
- Maombi ya mwisho ianze na "Bwana," au "Mungu wetu," na iishe "Amina."
- Urefu: takriban 400-500 maneno`
        : `You are a wise and loving devotional writer. Your task is to write a 2-minute reflection for a child of God.

PERSON'S STATE: "${moodData.en}" (${moodData.theme})

ACTUAL BIBLE VERSES (from the King James Version):
${verseBlockEn}

WRITING GUIDE:
1. START with an engaging devotional title
2. ACKNOWLEDGE the person's situation with empathy and understanding
3. USE the scriptures provided above as the foundation -- quote or reference at least 2 verses
4. OFFER spiritual guidance and words of comfort drawn from those scriptures
5. END WITH a short, powerful prayer that matches the person's situation

IMPORTANT:
- The devotional MUST end with a "PRAYER:" section containing an actual prayer
- Use simple, warm, heartfelt language
- The prayer should start with "Lord," or "Dear God," and end with "Amen."
- Length: approximately 400-500 words`;

    const userPrompt =
      language === "sw"
        ? `Andika tafakari ya ibada kwa mtu anayehisi "${moodData.sw}". Tumia maandiko halisi yaliyotolewa hapo juu. Hakikisha tafakari ina mwanzo, katikati, na mwisho wenye maombi.`
        : `Write a devotional reflection for someone feeling "${moodData.en}". Use the actual scripture texts provided above. Make sure the devotional has a clear beginning, middle, and ends with a prayer.`;

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
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 800,
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

    return NextResponse.json({
      content,
      scripture_ref: language === "sw" ? verseRefsSw : verseRefsEn,
      mood: moodData[language === "sw" ? "sw" : "en"],
      theme: language === "sw" ? moodData.themeSw : moodData.theme,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Devotion generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
