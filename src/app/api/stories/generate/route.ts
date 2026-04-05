import { NextRequest, NextResponse } from "next/server";

const BIBLE_REFERENCES: Record<string, {
  en: string;
  sw: string;
  enVerses: { book: string; chapter: number; verse: number }[];
  swVerses: { book: string; chapter: number; verse: number }[];
}> = {
  david: {
    en: "1 Samuel 17 (David and Goliath), Psalm 23 (The Lord is my Shepherd)",
    sw: "1 Samweli 17 (Daudi na Goliathi), Zaburi 23 (BWANA ndiye mchungaji wangu)",
    enVerses: [{ book: "1-samuel", chapter: 17, verse: 45 }, { book: "psalms", chapter: 23, verse: 1 }, { book: "psalms", chapter: 27, verse: 1 }],
    swVerses: [{ book: "1-samuel", chapter: 17, verse: 45 }, { book: "psalms", chapter: 23, verse: 1 }, { book: "psalms", chapter: 27, verse: 1 }],
  },
  esther: {
    en: "Esther 4:14 (For such a time as this), Esther 2:17 (Finding favor)",
    sw: "Esta 4:14 (Kwa wakati kama huu), Esta 2:17 (Kupata upendeleo)",
    enVerses: [{ book: "esther", chapter: 4, verse: 14 }, { book: "esther", chapter: 2, verse: 17 }],
    swVerses: [{ book: "esther", chapter: 4, verse: 14 }, { book: "esther", chapter: 2, verse: 17 }],
  },
  daniel: {
    en: "Daniel 6 (The Lion's Den), Daniel 1 (Faithful in Babylon)",
    sw: "Danieli 6 (Tundu la Simba), Danieli 1 (Uaminifu Babeli)",
    enVerses: [{ book: "daniel", chapter: 6, verse: 22 }, { book: "daniel", chapter: 1, verse: 8 }],
    swVerses: [{ book: "daniel", chapter: 6, verse: 22 }, { book: "daniel", chapter: 1, verse: 8 }],
  },
  ruth: {
    en: "Ruth 1:16 (Where you go I will go), Ruth 2:12 (Finding favor)",
    sw: "Ruthu 1:16 (Utakakokwenda nami nitakwenda), Ruthu 2:12 (Kupata thawabu)",
    enVerses: [{ book: "ruth", chapter: 1, verse: 16 }, { book: "ruth", chapter: 2, verse: 12 }],
    swVerses: [{ book: "ruth", chapter: 1, verse: 16 }, { book: "ruth", chapter: 2, verse: 12 }],
  },
  joseph: {
    en: "Genesis 37 (The coat of many colors), Genesis 50:20 (God meant it for good)",
    sw: "Mwanzo 37 (Kanzu ya rangi nyingi), Mwanzo 50:20 (Mungu alikusudia mema)",
    enVerses: [{ book: "genesis", chapter: 37, verse: 3 }, { book: "genesis", chapter: 50, verse: 20 }],
    swVerses: [{ book: "genesis", chapter: 37, verse: 3 }, { book: "genesis", chapter: 50, verse: 20 }],
  },
  mary: {
    en: "Luke 1:38 (I am the Lord's servant), Luke 2:19 (Treasured in heart)",
    sw: "Luka 1:38 (Mimi ni mtumishi wa Bwana), Luka 2:19 (Aliyaficha moyoni mwake)",
    enVerses: [{ book: "luke", chapter: 1, verse: 38 }, { book: "luke", chapter: 2, verse: 19 }],
    swVerses: [{ book: "luke", chapter: 1, verse: 38 }, { book: "luke", chapter: 2, verse: 19 }],
  },
  moses: {
    en: "Exodus 3 (The burning bush), Exodus 14 (Parting the Red Sea)",
    sw: "Kutoka 3 (Kichaka kinachowaka moto), Kutoka 14 (Kugawanya Bahari ya Shamu)",
    enVerses: [{ book: "exodus", chapter: 3, verse: 14 }, { book: "exodus", chapter: 14, verse: 21 }],
    swVerses: [{ book: "exodus", chapter: 3, verse: 14 }, { book: "exodus", chapter: 14, verse: 21 }],
  },
  noah: {
    en: "Genesis 6-9 (Building the ark, the flood, the rainbow)",
    sw: "Mwanzo 6-9 (Kujenga safina, gharika, upinde wa mvua)",
    enVerses: [{ book: "genesis", chapter: 6, verse: 22 }, { book: "genesis", chapter: 9, verse: 13 }],
    swVerses: [{ book: "genesis", chapter: 6, verse: 22 }, { book: "genesis", chapter: 9, verse: 13 }],
  },
  samson: {
    en: "Judges 13-16 (Samson's strength and dedication to God)",
    sw: "Waamuzi 13-16 (Nguvu ya Samsoni na kujitoa kwake kwa Mungu)",
    enVerses: [{ book: "judges", chapter: 16, verse: 28 }, { book: "judges", chapter: 13, verse: 5 }],
    swVerses: [{ book: "judges", chapter: 16, verse: 28 }, { book: "judges", chapter: 13, verse: 5 }],
  },
  solomon: {
    en: "1 Kings 3 (Asking for wisdom), Proverbs 1:7 (Fear of the Lord)",
    sw: "1 Wafalme 3 (Kuomba hekima), Mithali 1:7 (Kumcha Bwana)",
    enVerses: [{ book: "1-kings", chapter: 3, verse: 9 }, { book: "proverbs", chapter: 1, verse: 7 }],
    swVerses: [{ book: "1-kings", chapter: 3, verse: 9 }, { book: "proverbs", chapter: 1, verse: 7 }],
  },
  paul: {
    en: "Acts 9 (Paul's conversion on the road to Damascus), Philippians 4:13",
    sw: "Matendo 9 (Mabadiliko ya Paulo njiani kwenda Dameski), Wafilipi 4:13",
    enVerses: [{ book: "acts", chapter: 9, verse: 3 }, { book: "philippians", chapter: 4, verse: 13 }],
    swVerses: [{ book: "acts", chapter: 9, verse: 3 }, { book: "philippians", chapter: 4, verse: 13 }],
  },
  peter: {
    en: "Matthew 14:29 (Walking on water), Acts 2 (Peter's sermon at Pentecost)",
    sw: "Mathayo 14:29 (Kutembea juu ya maji), Matendo 2 (Hotuba ya Petro siku ya Pentekoste)",
    enVerses: [{ book: "matthew", chapter: 14, verse: 29 }, { book: "acts", chapter: 2, verse: 14 }],
    swVerses: [{ book: "matthew", chapter: 14, verse: 29 }, { book: "acts", chapter: 2, verse: 14 }],
  },
  abraham: {
    en: "Genesis 12 (Called to leave home), Genesis 22 (The sacrifice of Isaac)",
    sw: "Mwanzo 12 (Kuitwa kuacha nchi yake), Mwanzo 22 (Kutoa Isaka kafara)",
    enVerses: [{ book: "genesis", chapter: 12, verse: 1 }, { book: "genesis", chapter: 22, verse: 8 }],
    swVerses: [{ book: "genesis", chapter: 12, verse: 1 }, { book: "genesis", chapter: 22, verse: 8 }],
  },
  hannah: {
    en: "1 Samuel 1 (Hannah's prayer for a child), 1 Samuel 2 (Song of Hannah)",
    sw: "1 Samweli 1 (Maombi ya Hana kwa mtoto), 1 Samweli 2 (Wimbo wa Hana)",
    enVerses: [{ book: "1-samuel", chapter: 1, verse: 27 }, { book: "1-samuel", chapter: 2, verse: 1 }],
    swVerses: [{ book: "1-samuel", chapter: 1, verse: 27 }, { book: "1-samuel", chapter: 2, verse: 1 }],
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

async function fetchVerses(verses: { book: string; chapter: number; verse: number }[], version: string): Promise<string[]> {
  const results = await Promise.all(
    verses.map(async (v) => {
      const text = await fetchBibleVerse(version, v.book, v.chapter, v.verse);
      if (text) {
        return `"${text.trim()}" (${v.book.replace(/-/g, " ")} ${v.chapter}:${v.verse})`;
      }
      return null;
    })
  );
  return results.filter((r): r is string => r !== null);
}

async function callGroq(model: string, systemPrompt: string, userPrompt: string, maxTokens: number, temperature = 0.65): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
    const err = await response.text();
    console.warn(`Groq model ${model} failed:`, response.status, err.slice(0, 200));
  } catch (err) {
    console.warn(`Groq model ${model} error:`, err);
  }
  return null;
}

async function generateSwahiliStory(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string | null> {
  // Try best available models in order
  const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    const result = await callGroq(model, systemPrompt, userPrompt, maxTokens, 0.65);
    if (result) {
      console.log(`Swahili story generated with: ${model}`);
      return result;
    }
  }
  return null;
}

async function generateEnglishStory(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string | null> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    const result = await callGroq(model, systemPrompt, userPrompt, maxTokens, 0.6);
    if (result) {
      console.log(`English story generated with: ${model}`);
      return result;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { hero, lesson, language, length, customTitle } = await req.json();

    const heroKey = hero?.toLowerCase().replace(/\s+/g, "") || "";
    const bibleRef = BIBLE_REFERENCES[heroKey] || {
      en: `Stories from the Bible featuring ${hero}`,
      sw: `Hadithi za Biblia zinazomhusu ${hero}`,
      enVerses: [{ book: "proverbs", chapter: 22, verse: 6 }],
      swVerses: [{ book: "proverbs", chapter: 22, verse: 6 }],
    };

    const isSw = language === "sw";
    const refs = isSw ? bibleRef.sw : bibleRef.en;
    const verses = isSw ? bibleRef.swVerses : bibleRef.enVerses;
    const wordCount = length === "short" ? "300–400" : "500–600";
    const maxTokens = length === "short" ? 900 : 1400;

    // Fetch actual Bible verse texts
    const version = isSw ? "swh_bib" : "en-kjv";
    const fetchedVerses = await fetchVerses(verses, version);
    const verseBlock = fetchedVerses.length > 0
      ? fetchedVerses.join("\n")
      : `(${refs})`;

    const titleInstruction = customTitle?.trim()
      ? (isSw
        ? `\n\nMUHIMU: Tumia kichwa hiki haswa: "${customTitle.trim()}"`
        : `\n\nIMPORTANT: Use this exact title: "${customTitle.trim()}"`)
      : "";

    const systemPrompt = isSw
      ? `Wewe ni mwandishi bora wa hadithi za Biblia kwa watoto wa miaka 5-10, na Kiswahili ni lugha yako ya mama. Unaandika kwa ujuzi wa asili, si tafsiri.

━━━ USAHIHI WA KIBIBLIA ━━━
Hadithi LAZIMA itokane na Biblia halisi. Matukio, mazungumzo, na maelezo lazima yafuate Maandiko.
Marejeo ya Biblia kwa hadithi hii: ${refs}

MAANDIKO HALISI (kutoka Biblia ya Kiswahili):
${verseBlock}

━━━ UBORA WA KISWAHILI ━━━
Andika Kiswahili cha asili, cha mzaliwa — si tafsiri ya Kiingereza.
• SAHIHI: "Daudi alitetemeka kwa hofu, lakini moyo wake ulimwambia: Mungu yuko nami"
• MBAYA: "Daudi alihisi scared, lakini God alimpa nguvu"
• Tumia ngeli sahihi: mtoto/watoto, kichaka/vichaka, nchi/nchi
• Tumia semi za asili: "Mungu ni upole", "moyo wake uliridhika", "machozi yalimtiririka"
• KAMWE usitumie maneno ya Kiingereza au Kiarabu badala ya Kiswahili

━━━ MUUNDO WA HADITHI ━━━
1. Kichwa cha hadithi (mstari wa kwanza)
2. Mwanzo unaovutia — elezea hali na mahali (angalau mistari 2)
3. Tatizo au changamoto — kama inavyoonyeshwa katika Biblia
4. Jinsi Mungu au mhusika alivyoshinda changamoto — kwa mujibu wa Maandiko
5. Somo wazi la "${lesson}" linaloonyeshwa kwa vitendo, si mahubiri
6. Mwisho wenye matumaini na furaha
7. Sehemu ya "MAANDIKO:" mwishoni yenye rejea za Biblia zilizotumika
${titleInstruction}

Andika takriban maneno ${wordCount}.`
      : `You are a gifted Bible storyteller for children ages 5-10. Your stories are faithful to Scripture, warm, and engaging.

━━━ BIBLICAL ACCURACY ━━━
Every event, dialogue, and detail MUST come directly from Scripture. Do NOT invent scenes or add details not found in the Bible.
Bible references for this story: ${refs}

ACTUAL SCRIPTURE TEXTS (King James Version):
${verseBlock}

━━━ STORY GUIDELINES ━━━
1. Story title on the first line
2. Engaging opening that sets the scene (describe the place and time)
3. The biblical challenge or conflict (as recorded in Scripture)
4. How God worked through the situation (follow the biblical account faithfully)
5. The lesson of "${lesson}" shown through actions and events — never preachy
6. A joyful, hope-filled ending
7. A "SCRIPTURE REFERENCES:" section at the end listing every Bible verse used
${titleInstruction}

Write approximately ${wordCount} words.`;

    const userPrompt = isSw
      ? `Andika hadithi ya kibiblia ya watoto kuhusu ${hero} inayofundisha somo la "${lesson}". Hakikisha:
- Hadithi inafuata ukweli wa Biblia ipasavyo
- Kiswahili ni cha asili na cha kuvutia
- Kuna mwanzo, katikati, na mwisho ulio wazi
- Mwisho una sehemu ya MAANDIKO na rejea za Biblia`
      : `Write a children's Bible story about ${hero} that teaches the lesson of "${lesson}". Ensure:
- All events are faithful to the biblical account
- Language is warm and engaging for ages 5-10
- Clear beginning, middle, and end
- Ends with a SCRIPTURE REFERENCES section`;

    let storyContent: string | null = null;
    if (isSw) {
      storyContent = await generateSwahiliStory(systemPrompt, userPrompt, maxTokens);
    } else {
      storyContent = await generateEnglishStory(systemPrompt, userPrompt, maxTokens);
    }

    if (!storyContent) {
      return NextResponse.json(
        { error: "Story generation failed. Please check your GROQ_API_KEY." },
        { status: 500 }
      );
    }

    // Extract title
    let title: string;
    if (customTitle?.trim()) {
      title = customTitle.trim();
    } else {
      const firstLine = storyContent
        .split("\n")[0]
        .replace(/^#+\s*/, "")
        .replace(/["\u201C\u201D*_]/g, "")
        .trim();
      title = firstLine.length > 70 ? firstLine.slice(0, 67) + "..." : firstLine;
    }

    // Build a rich scene description for the image generator:
    // Include the character, setting, key visual elements from the story
    const contentBody = storyContent.includes("\n")
      ? storyContent.split("\n").slice(1).join(" ")
      : storyContent;
    const sentences = contentBody.replace(/\n/g, " ").split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);
    // Take sentences 1-3 (skip any very short openers)
    const sceneBase = sentences.slice(0, 3).join(" ").slice(0, 300);
    // Build an image-optimized scene description
    const sceneDescription = `Bible story scene: ${hero} — ${lesson}. ${sceneBase}`.slice(0, 400);

    return NextResponse.json({
      title,
      content: storyContent,
      sceneDescription,
      scriptureRefs: refs,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Story generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
