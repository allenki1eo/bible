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
    theme: "God's comfort and strength in hard times",
    themeSw: "Faraja na nguvu ya Mungu wakati wa shida",
    verses: [
      { book: "psalms", chapter: 34, verse: 18 },
      { book: "matthew", chapter: 11, verse: 28 },
      { book: "isaiah", chapter: 41, verse: 10 },
      { book: "2-corinthians", chapter: 12, verse: 9 },
      { book: "psalms", chapter: 46, verse: 1 },
    ],
  },
  neutral: {
    en: "Neutral",
    sw: "Kawaida",
    theme: "Daily guidance and trust in God's plan",
    themeSw: "Mwongozo wa kila siku na kumwamini Mungu",
    verses: [
      { book: "psalms", chapter: 119, verse: 105 },
      { book: "proverbs", chapter: 3, verse: 5 },
      { book: "jeremiah", chapter: 29, verse: 11 },
      { book: "philippians", chapter: 4, verse: 6 },
      { book: "colossians", chapter: 3, verse: 23 },
    ],
  },
  peaceful: {
    en: "Peaceful",
    sw: "Ana amani",
    theme: "Resting and abiding in God's presence",
    themeSw: "Kupumzika na kukaa katika uwepo wa Mungu",
    verses: [
      { book: "psalms", chapter: 23, verse: 2 },
      { book: "john", chapter: 14, verse: 27 },
      { book: "isaiah", chapter: 26, verse: 3 },
      { book: "philippians", chapter: 4, verse: 7 },
      { book: "psalms", chapter: 46, verse: 10 },
    ],
  },
  joyful: {
    en: "Joyful",
    sw: "Anafurahi",
    theme: "Giving thanks and celebrating God's goodness",
    themeSw: "Kushukuru na kusherehekea wema wa Mungu",
    verses: [
      { book: "psalms", chapter: 100, verse: 2 },
      { book: "philippians", chapter: 4, verse: 4 },
      { book: "nehemiah", chapter: 8, verse: 10 },
      { book: "psalms", chapter: 16, verse: 11 },
      { book: "1-thessalonians", chapter: 5, verse: 18 },
    ],
  },
  seeking: {
    en: "Seeking",
    sw: "Anatafuta",
    theme: "Finding God's purpose, wisdom, and direction",
    themeSw: "Kupata kusudi, hekima, na mwelekeo wa Mungu",
    verses: [
      { book: "jeremiah", chapter: 29, verse: 13 },
      { book: "matthew", chapter: 7, verse: 7 },
      { book: "james", chapter: 1, verse: 5 },
      { book: "proverbs", chapter: 3, verse: 6 },
      { book: "psalms", chapter: 37, verse: 4 },
    ],
  },
};

async function fetchBibleVerse(version: string, book: string, chapter: number, verse: number): Promise<string | null> {
  try {
    const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${version}/books/${book}/chapters/${chapter}/verses/${verse}.json`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (response.ok) {
      const data = await response.json();
      return data.text || null;
    }
  } catch {
    // Silently fail
  }
  return null;
}

async function fetchVerses(verses: { book: string; chapter: number; verse: number }[], version: string): Promise<{ reference: string; text: string }[]> {
  const results = await Promise.all(
    verses.map(async (v) => {
      const text = await fetchBibleVerse(version, v.book, v.chapter, v.verse);
      if (text) {
        return { reference: `${v.book.replace(/-/g, " ")} ${v.chapter}:${v.verse}`, text: text.trim() };
      }
      return null;
    })
  );
  return results.filter((r): r is { reference: string; text: string } => r !== null);
}

async function callGroq(model: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.7,
        max_tokens: 900,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
    const err = await response.text();
    console.warn(`Groq ${model} failed:`, response.status, err.slice(0, 200));
  } catch (err) {
    console.warn(`Groq ${model} error:`, err);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not set. Add it to .env.local" }, { status: 500 });
  }

  try {
    const { mood, language } = await req.json();

    const moodKey = Object.keys(MOOD_KEYWORDS).find((k) => k === mood?.toLowerCase()) || "neutral";
    const moodData = MOOD_KEYWORDS[moodKey];
    const isSw = language === "sw";

    // Fetch actual Bible verses
    const version = isSw ? "swh_bib" : "en-kjv";
    const fetchedVerses = await fetchVerses(moodData.verses, version);

    const verseBlock = fetchedVerses.length > 0
      ? fetchedVerses.map((v, i) => `${i + 1}. "${v.text}" — ${v.reference}`).join("\n")
      : isSw ? "Zaburi 23:1 — BWANA ndiye mchungaji wangu" : "Psalm 23:1 — The Lord is my shepherd";

    const verseRefs = fetchedVerses.length > 0
      ? fetchedVerses.map((v) => v.reference).join(", ")
      : isSw ? "Zaburi 23:1" : "Psalm 23:1";

    const systemPrompt = isSw
      ? `Wewe ni kiongozi wa ibada mwenye hekima, upendo, na Kiswahili ni lugha yako ya mama. Unaandika tafakari za ibada kwa waumini wa Afrika Mashariki — Kiswahili cha asili, cha moyo, na cha kuvutia.

━━━ HALI YA MTU ━━━
Mtu anayehisi: "${moodData.sw}" (${moodData.themeSw})

━━━ MAANDIKO HALISI YA BIBLIA ━━━
Maandiko haya yametolewa moja kwa moja kutoka Biblia ya Kiswahili. Yasome kwa makini:
${verseBlock}

━━━ MUUNDO WA TAFAKARI ━━━
1. KICHWA — kinachovutia na kinachofaa hali ya mtu
2. UTANGULIZI — maneno ya huruma yanayomkaribishia mtu pale alipo (mistari 2-3)
3. MSINGI WA MAANDIKO — nukuu angalau maandiko 2 kutoka hapo juu, uyaeleze kwa undani
4. MWONGOZO — mafundisho ya kiroho yanayotoka moja kwa moja kwenye maandiko hayo
5. MATUMIZI — jinsi somo hilo linavyotumika maishani leo
6. MAOMBI — maombi ya kweli yanayofaa hali ya mtu (angalau mistari 4)

━━━ UBORA WA KISWAHILI ━━━
• Andika kama unavyozungumza na mtu wa karibu — wazi, wa moyo, wa kweli
• KAMWE usitumie Kiingereza au maneno ya kigeni bila sababu
• SAHIHI: "Moyo wake ulipumzika", "Mungu alimshika mkono", "Machozi ya furaha"
• MBAYA: "Alirelax", "God alimprotect", "Alikuwa okay"
• Maombi: ianze "Bwana," au "Mungu Baba," na iishe "kwa jina la Yesu, Amina."

Urefu: maneno 350-450.`
      : `You are a wise, warm devotional writer. You write for believers who need to encounter God through Scripture — not self-help advice, but genuine biblical truth applied to real life.

━━━ PERSON'S STATE ━━━
Feeling: "${moodData.en}" (${moodData.theme})

━━━ ACTUAL BIBLE VERSES (King James Version) ━━━
Read these carefully — they are the foundation for the entire devotional:
${verseBlock}

━━━ DEVOTIONAL STRUCTURE ━━━
1. TITLE — compelling and relevant to their state
2. OPENING — 2-3 sentences meeting them where they are with empathy
3. SCRIPTURE — quote at least 2 verses from the list above, expound their meaning
4. APPLICATION — practical, Spirit-led guidance drawn directly from those scriptures
5. REFLECTION QUESTION — one simple question to carry through the day
6. PRAYER — a heartfelt prayer that matches their situation (at least 4 lines)

━━━ WRITING STANDARDS ━━━
• Write from Scripture outward, not self-help inward
• Every point of guidance must trace back to a verse above
• Warm, personal, direct — like a trusted pastor speaking to a friend
• Prayer: start "Lord," or "Dear God," end with "Amen."

Length: 400-500 words.`;

    const userPrompt = isSw
      ? `Andika tafakari ya ibada kwa mtu anayehisi "${moodData.sw}". Tumia maandiko halisi yaliyotolewa. Hakikisha tafakari ina mwanzo, mwili, na maombi ya kweli mwishoni.`
      : `Write a devotional for someone feeling "${moodData.en}". Use the actual scriptures provided. Make sure it has a clear opening, scriptural body, and ends with a real prayer.`;

    // Try best models first
    const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];
    let content: string | null = null;
    for (const model of models) {
      content = await callGroq(model, systemPrompt, userPrompt);
      if (content) {
        console.log(`Devotion generated with: ${model}`);
        break;
      }
    }

    if (!content) {
      return NextResponse.json({ error: "Devotion generation failed. Check your GROQ_API_KEY." }, { status: 500 });
    }

    return NextResponse.json({
      content,
      scripture_ref: verseRefs,
      mood: isSw ? moodData.sw : moodData.en,
      theme: isSw ? moodData.themeSw : moodData.theme,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Devotion generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
