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
    sw: "Esther 4:14 (Kwa wakati kama huu), Esther 2:17 (Kupata upendeleo)",
    enVerses: [{ book: "esther", chapter: 4, verse: 14 }, { book: "esther", chapter: 2, verse: 17 }],
    swVerses: [{ book: "esther", chapter: 4, verse: 14 }, { book: "esther", chapter: 2, verse: 17 }],
  },
  daniel: {
    en: "Daniel 6 (The Lion's Den), Daniel 1 (Faithful in Babylon)",
    sw: "Danieli 6 (Tundu la Simba), Danieli 1 (Aliaminifu Babeli)",
    enVerses: [{ book: "daniel", chapter: 6, verse: 22 }, { book: "daniel", chapter: 1, verse: 8 }],
    swVerses: [{ book: "daniel", chapter: 6, verse: 22 }, { book: "daniel", chapter: 1, verse: 8 }],
  },
  ruth: {
    en: "Ruth 1:16 (Where you go I will go), Ruth 2:12 (Finding favor)",
    sw: "Ruthu 1:16 (Nenda utakapokwenda), Ruthu 2:12 (Kupata upendeleo)",
    enVerses: [{ book: "ruth", chapter: 1, verse: 16 }, { book: "ruth", chapter: 2, verse: 12 }],
    swVerses: [{ book: "ruth", chapter: 1, verse: 16 }, { book: "ruth", chapter: 2, verse: 12 }],
  },
  joseph: {
    en: "Genesis 37 (The coat of many colors), Genesis 50:20 (God meant it for good)",
    sw: "Mwanzo 37 (Mwanzo wa rangi nyingi), Mwanzo 50:20 (Mungu alilitegemeza kwa wema)",
    enVerses: [{ book: "genesis", chapter: 37, verse: 3 }, { book: "genesis", chapter: 50, verse: 20 }],
    swVerses: [{ book: "genesis", chapter: 37, verse: 3 }, { book: "genesis", chapter: 50, verse: 20 }],
  },
  mary: {
    en: "Luke 1:38 (I am the Lord's servant), Luke 2:19 (Treasured in heart)",
    sw: "Luka 1:38 (Mimi ni mtumishi wa Bwana), Luka 2:19 (Aliyaficha moyoni)",
    enVerses: [{ book: "luke", chapter: 1, verse: 38 }, { book: "luke", chapter: 2, verse: 19 }],
    swVerses: [{ book: "luke", chapter: 1, verse: 38 }, { book: "luke", chapter: 2, verse: 19 }],
  },
  moses: {
    en: "Exodus 3 (The burning bush), Exodus 14 (Parting the Red Sea)",
    sw: "Kutoka 3 (Mwali unaowaka), Kutoka 14 (Kugawa Bahari Nyekundu)",
    enVerses: [{ book: "exodus", chapter: 3, verse: 14 }, { book: "exodus", chapter: 14, verse: 21 }],
    swVerses: [{ book: "exodus", chapter: 3, verse: 14 }, { book: "exodus", chapter: 14, verse: 21 }],
  },
  noah: {
    en: "Genesis 6-9 (Building the ark, the flood, the rainbow)",
    sw: "Mwanzo 6-9 (Kujenga safina, mafuriko, upinde wa mvua)",
    enVerses: [{ book: "genesis", chapter: 6, verse: 22 }, { book: "genesis", chapter: 9, verse: 13 }],
    swVerses: [{ book: "genesis", chapter: 6, verse: 22 }, { book: "genesis", chapter: 9, verse: 13 }],
  },
  samson: {
    en: "Judges 13-16 (Samson's strength, dedication to God)",
    sw: "Waamuzi 13-16 (Nguvu ya Samsoni, kujitoa kwa Mungu)",
    enVerses: [{ book: "judges", chapter: 16, verse: 28 }, { book: "judges", chapter: 13, verse: 5 }],
    swVerses: [{ book: "judges", chapter: 16, verse: 28 }, { book: "judges", chapter: 13, verse: 5 }],
  },
  solomon: {
    en: "1 Kings 3 (Asking for wisdom), 1 Kings 10 (The queen of Sheba)",
    sw: "1 Wafalme 3 (Kuomba hekima), 1 Wafalme 10 (Malkia wa Sheba)",
    enVerses: [{ book: "1-kings", chapter: 3, verse: 9 }, { book: "proverbs", chapter: 1, verse: 7 }],
    swVerses: [{ book: "1-kings", chapter: 3, verse: 9 }, { book: "proverbs", chapter: 1, verse: 7 }],
  },
  paul: {
    en: "Acts 9 (Paul's conversion), Philippians 4:13 (Strength through Christ)",
    sw: "Matendo 9 (Ubadiliko wa Paulo), Wafilipi 4:13 (Nguvu kupitia Kristo)",
    enVerses: [{ book: "acts", chapter: 9, verse: 3 }, { book: "philippians", chapter: 4, verse: 13 }],
    swVerses: [{ book: "acts", chapter: 9, verse: 3 }, { book: "philippians", chapter: 4, verse: 13 }],
  },
  peter: {
    en: "Matthew 14:29 (Walking on water), Acts 2 (Peter's sermon at Pentecost)",
    sw: "Mathayo 14:29 (Kutembea juu ya maji), Matendo 2 (Hotuba ya Petro Pentekoste)",
    enVerses: [{ book: "matthew", chapter: 14, verse: 29 }, { book: "acts", chapter: 2, verse: 14 }],
    swVerses: [{ book: "matthew", chapter: 14, verse: 29 }, { book: "acts", chapter: 2, verse: 14 }],
  },
  abraham: {
    en: "Genesis 12 (Called to leave home), Genesis 22 (Willing to sacrifice Isaac)",
    sw: "Mwanzo 12 (Kuagwa kuacha nyumbani), Mwanzo 22 (Tayari kumtoa Isaka)",
    enVerses: [{ book: "genesis", chapter: 12, verse: 1 }, { book: "genesis", chapter: 22, verse: 8 }],
    swVerses: [{ book: "genesis", chapter: 12, verse: 1 }, { book: "genesis", chapter: 22, verse: 8 }],
  },
  hannah: {
    en: "1 Samuel 1 (Hannah's prayer for a child), 1 Samuel 2 (Song of Hannah)",
    sw: "1 Samweli 1 (Maombi ya Hanna kwa mtoto), 1 Samweli 2 (Wimbo wa Hanna)",
    enVerses: [{ book: "1-samuel", chapter: 1, verse: 27 }, { book: "1-samuel", chapter: 2, verse: 1 }],
    swVerses: [{ book: "1-samuel", chapter: 1, verse: 27 }, { book: "1-samuel", chapter: 2, verse: 1 }],
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

async function fetchVerses(verses: { book: string; chapter: number; verse: number }[], version: string): Promise<string[]> {
  const results = await Promise.all(
    verses.map(async (v) => {
      const text = await fetchBibleVerse(version, v.book, v.chapter, v.verse);
      if (text) {
        return `"${text}" (${v.book} ${v.chapter}:${v.verse})`;
      }
      return null;
    })
  );
  return results.filter((r): r is string => r !== null);
}

async function generateSwahiliStory(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  const models = [
    "google/gemma-2-9b-it",
    "gemma2-9b-it",
    "gemma-2-9b-it",
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log("Swahili story generated with model:", model);
          return content;
        }
      } else {
        const errText = await response.text();
        console.warn(`Swahili model ${model} failed:`, response.status, errText);
      }
    } catch (err) {
      console.warn(`Swahili model ${model} fetch error:`, err);
    }
  }

  console.log("Falling back to llama-3.1-8b-instant for Swahili");
  try {
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
          max_tokens: maxTokens,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } else {
      const errText = await response.text();
      console.error("Llama Swahili fallback error:", response.status, errText);
    }
  } catch (err) {
    console.error("Llama Swahili fallback fetch error:", err);
  }

  return null;
}

async function generateEnglishStory(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
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
          temperature: 0.6,
          max_tokens: maxTokens,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (err) {
    console.error("Groq English error:", err);
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
      swVerses: [{ book: "methali", chapter: 22, verse: 6 }],
    };

    const refs = language === "sw" ? bibleRef.sw : bibleRef.en;
    const verses = language === "sw" ? bibleRef.swVerses : bibleRef.enVerses;
    const verseList = verses.map((v) => `${v.chapter}:${v.verse}`).join(", ");
    const wordCount = length === "short" ? "300" : "500";
    const maxTokens = length === "short" ? 800 : 1200;

    // Fetch actual Bible verse text from the free Bible API
    const version = language === "sw" ? "swh_bib" : "en-kjv";
    const fetchedVerses = await fetchVerses(verses, version);
    const verseTextBlock = fetchedVerses.length > 0
      ? `\n\nHII NI MANENO HALISI YA MAANDIKO ( soma na utumie kama msingi wa hadithi yako):\n${fetchedVerses.join("\n")}`
      : `\n\nSCRIPTURE REFERENCES: ${verseList}`;

    const verseTextBlockEn = fetchedVerses.length > 0
      ? `\n\nHERE ARE THE ACTUAL SCRIPTURE TEXTS (read and use as the foundation for your story):\n${fetchedVerses.join("\n")}`
      : `\n\nSCRIPTURE REFERENCES: ${verseList}`;

    const titleInstruction = customTitle
      ? `\n\nMUHIMU: Tumia kichwa hiki cha hadithi: "${customTitle}". Anza hadithi kwa kichwa hiki.`
      : "";
    const titleInstructionEn = customTitle
      ? `\n\nIMPORTANT: Use this story title: "${customTitle}". Start the story with this title.`
      : "";

    const systemPrompt =
      language === "sw"
        ? `Wewe ni mwandishi bora wa hadithi za Biblia kwa watoto wa umri wa miaka 5-10. Kazi yako ni kuandika hadithi za kuvutia, rahisi kuelewa, na zinazofundisha maadili kutoka Maandiko Matakatifu.

MUHIMU SANA:
1. Hadithi lazima iwe HALISI kutoka Biblia - si hadithi ya kubuni (fantasy) au hadithi ya kufikirika.
2. Rejelea maandiko haya kama msingi wa hadithi yako:
${refs}

Vidokezo vya maandiko: ${verseList}
${verseTextBlock}

MUONGOZO WA KUANDIKA:
- Anza hadithi kwa kichwa cha hadithi, kisha sentensi 1-2 zinazovutia msomaji mdogo (mfano: "Zamani, katika nchi ya...", "Kulikuwa na mtoto mwenye...")
- Elezea matukio kwa mpangilio wa hadithi halisi ya Biblia - usibadilishe ukweli wa maandiko
- Tumia maneno rahisi, ya Kiswahili sanifu ambayo mtoto wa miaka 5-10 anaweza kuelewa
- Onyesha somo la "${lesson}" kupitia matendo na maneno ya wahusika, si kwa kuhubiri
- Weka hisia na maelezo yanayomsaidia mtoto kujifunga na hadithi (mfano: "Daudi alihofika, lakini alimwamini Mungu")
- Maliza kwa somo wazi na la kusisimua ambalo mtoto anaweza kutumia maishani mwake
- Tumia mazungumzo kati ya wahusika ili hadithi iwe hai
${titleInstruction}

MUHIMU: Usitumie maneno magumu ya Kiarabu au Kiingereza. Tumia Kiswahili safi na rahisi.

MWISHO wa hadithi, ongeza sehemu ya "MAANDIKO:" yenye vidokezo vya Biblia vilivyotumika.

Andika kwa Kiswahili rahisi na cha kuvutia, takriban ${wordCount} maneno.`
        : `You are a Bible story writer for children ages 5-10.

IMPORTANT: The story MUST be based on REAL Scripture. Please read and reference these Bible passages before writing:
${refs}

Scripture references: ${verseList}
${verseTextBlockEn}

Write a TRUE Bible story, NOT fantasy or made-up fiction. Use the actual Biblical account of ${hero} to teach the lesson of "${lesson}". Keep the story faithful to Scripture while making it engaging for children.
${titleInstructionEn}

At the END of the story, add a "SCRIPTURE REFERENCES:" section listing the Bible verses used.

Write in simple, warm language, about ${wordCount} words.`;

    const userPrompt =
      language === "sw"
        ? `Andika hadithi ya kibiblia inayovutia kuhusu ${hero} inayofundisha somo la "${lesson}". Anza kwa kichwa cha hadithi, kisha andika hadithi nzima kwa Kiswahili rahisi na cha kuvutia kwa watoto. Hakikisha hadithi inafuata ukweli wa Biblia na ina mwanzo, katikati, na mwisho wazi.`
        : `Write a Bible story about ${hero} teaching the lesson of ${lesson}.`;

    let storyContent: string | null = null;

    if (language === "sw") {
      storyContent = await generateSwahiliStory(systemPrompt, userPrompt, maxTokens);
    } else {
      storyContent = await generateEnglishStory(systemPrompt, userPrompt, maxTokens);
    }

    if (!storyContent) {
      return NextResponse.json(
        { error: "Story generation failed. Check your GROQ_API_KEY." },
        { status: 500 }
      );
    }

    // Extract title: use custom title if provided, otherwise extract from first line
    let title: string;
    if (customTitle && customTitle.trim()) {
      title = customTitle.trim();
    } else {
      const firstLine = storyContent
        .split("\n")[0]
        .replace(/^#+\s*/, "")
        .replace(/["\u201C\u201D]/g, "")
        .trim();
      title = firstLine.length > 60 ? firstLine.slice(0, 57) + "..." : firstLine;
    }

    // Extract scene description for image (first 2-3 sentences after the title)
    const contentWithoutTitle = storyContent.includes("\n")
      ? storyContent.split("\n").slice(1).join(" ")
      : storyContent;
    const sentences = contentWithoutTitle.replace(/\n/g, " ").split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
    const sceneDescription = sentences.slice(0, 3).join(". ").slice(0, 250);

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
