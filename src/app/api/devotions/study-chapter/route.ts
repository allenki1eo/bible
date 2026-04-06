import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function generateWithGroq(prompt: string): Promise<string> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1800,
          temperature: 0.65,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (text.length > 100) return text;
    } catch {
      continue;
    }
  }
  throw new Error("All Groq models failed");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const book    = searchParams.get("book") ?? "";
  const chapter = searchParams.get("chapter") ?? "1";
  const title   = searchParams.get("title") ?? "";
  const locale  = searchParams.get("locale") ?? "en";
  const memoryVerse = searchParams.get("memoryVerse") ?? "";
  const memoryRef   = searchParams.get("memoryRef") ?? "";
  const planId  = searchParams.get("planId") ?? "";
  const day     = searchParams.get("day") ?? "1";

  if (!book) {
    return NextResponse.json({ error: "Missing book parameter" }, { status: 400 });
  }

  const cacheKey = `${book}-${chapter}-${locale}`;
  const today = new Date().toISOString().slice(0, 10);
  const isSw = locale === "sw";

  // Try Supabase cache first
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: cached } = await supabase
      .from("study_chapter_content")
      .select("*")
      .eq("cache_key", cacheKey)
      .single();

    if (cached?.content && cached.content.length > 200) {
      return NextResponse.json({ content: cached.content, cached: true });
    }
  } catch {
    // table may not exist yet, continue to generate
  }

  // Build a rich Bible study prompt
  const prompt = isSw
    ? `Wewe ni kiongozi wa kikundi cha kusoma Biblia wenye uzoefu wa kina. Andika mafunzo kamili ya Biblia kwa Kiswahili cha asili kuhusu ${book} Sura ${chapter}: "${title}".

Hii ni kwa kikundi cha kusoma Biblia — si mahubiri mafupi bali mafunzo ya kina ya saa moja ambayo yanashughulikia kila sehemu ya sura.

Muundo wa LAZIMA:

## Utangulizi
[Maelezo mafupi ya muktadha — ni nani aliyeandika, lini, kwa nini, na inaunganika na nini kabla yake — aya 2-3]

## Muktadha wa Kihistoria
[Hali ya kijamii, kidini, na kijiografia wakati huo — aya 1-2]

## Aya Kuu ya Kumbukumbu
**"${memoryVerse}"** — *${memoryRef}*
[Eleza kwa undani maana ya kina ya aya hii — aya 2]

## Mafunzo ya Sehemu kwa Sehemu
[Gawanya sura katika sehemu 3-4. Kwa kila sehemu:]
### [Kichwa cha Sehemu]
*[Mstari unaohusiana, kwa mfano ${book} ${chapter}:1-5]*
[Ufafanuzi wa kina wa mistari, maana yake ya kithiolojia, na umuhimu wake — aya 2-3 kwa kila sehemu]

## Mafunzo ya Msingi
[Pointi 3-4 kuu za kithiolojia zinazotoka kwenye sura hii — kila moja na ufafanuzi wake]

## Matumizi ya Maisha ya Kila Siku
[Jinsi ya kutumia mafunzo haya maishani leo — maswali ya vitendo 2-3 pamoja na majibu]

## Maswali ya Mjadala wa Kikundi
1. [Swali la kwanza lenye kina]
2. [Swali la pili]
3. [Swali la tatu]

## Maombi ya Kufunga
[Maombi ya kweli yanayofunika mada kuu ya sura hii — mistari 4-6, inaisha "kwa jina la Yesu, Amina."]

Andika kwa Kiswahili cha asili kabisa, cha kina, na cha kuvutia. Urefu: maneno 600-800.`
    : `You are an experienced Bible study group leader with deep theological knowledge. Write a complete, rich Bible study lesson on ${book} Chapter ${chapter}: "${title}".

This is for a Bible study group — not a short devotional but a thorough one-hour study that walks through the entire chapter section by section.

REQUIRED FORMAT:

## Introduction
[Brief overview of context — who wrote it, when, why, how it connects to what came before — 2-3 paragraphs]

## Historical & Cultural Background
[The social, religious, and geographical setting relevant to understanding this chapter — 1-2 paragraphs]

## Memory Verse Deep Dive
**"${memoryVerse}"** — *${memoryRef}*
[Unpack the deep theological meaning of this verse — 2 paragraphs]

## Section-by-Section Study
[Divide the chapter into 3-4 natural sections. For each:]
### [Section Title]
*[Verse range, e.g. ${book} ${chapter}:1-7]*
[Thorough exposition of those verses — what they say, what they mean theologically, what they reveal about God and humanity — 2-3 paragraphs per section]

## Core Themes & Theology
[3-4 major theological truths that emerge from this chapter, each with explanation]

## Life Application
[How to practically apply these truths today — 2-3 specific, real-world applications with brief guidance]

## Group Discussion Questions
1. [First deep discussion question]
2. [Second question]
3. [Third question]

## Closing Prayer
[A heartfelt, biblically grounded prayer covering the main themes of this chapter — 4-6 lines, ending "In Jesus' name, Amen."]

Write with warmth, theological depth, and pastoral care. Treat the reader as a serious student of the Word. Length: 700-900 words.`;

  let content: string;
  try {
    content = await generateWithGroq(prompt);
  } catch {
    // Fallback if Groq fails
    content = isSw
      ? `## Utangulizi\n\n${book} Sura ${chapter} — "${title}" ni sura muhimu sana katika Biblia. Leo tunasoma pamoja ili kuelewa mafunzo ya Mungu kwetu.\n\n## Aya Kuu\n\n**"${memoryVerse}"** — *${memoryRef}*\n\nAya hii inatufundisha ukweli muhimu wa imani yetu. Mungu anazungumza na mioyo yetu kupitia maneno haya.\n\n## Maombi\n\nBwana, tufundishe kupitia Neno lako. Ufungue mioyo yetu kusikia na kutenda. Kwa jina la Yesu, Amina.`
      : `## Introduction\n\n${book} Chapter ${chapter} — "${title}" is a foundational passage in the Scriptures. We come to it today as serious students of the Word.\n\n## Memory Verse\n\n**"${memoryVerse}"** — *${memoryRef}*\n\nThis verse captures the heart of what God is communicating through this chapter. It calls us to deeper faith and obedience.\n\n## Closing Prayer\n\nLord, open our hearts and minds as we study Your Word today. May these truths transform how we live. In Jesus' name, Amen.`;
  }

  // Cache in Supabase (best-effort)
  try {
    await supabase.from("study_chapter_content").upsert(
      { cache_key: cacheKey, book, chapter: parseInt(chapter), locale, content, created_at: today },
      { onConflict: "cache_key" }
    );
  } catch {
    // table may not exist, that's OK
  }

  return NextResponse.json({ content, cached: false });
}
