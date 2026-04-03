import { NextRequest, NextResponse } from "next/server";

// Bible stories mapped to characters with real Scripture references
const BIBLE_REFERENCES: Record<string, { en: string; sw: string; verses: string[] }> = {
  david: {
    en: "1 Samuel 17 (David and Goliath), Psalm 23 (The Lord is my Shepherd)",
    sw: "1 Samweli 17 (Daudi na Goliathi), Zaburi 23 (BWANA ndiye mchungaji wangu)",
    verses: ["1 Samuel 17:45", "Psalm 23:1", "Psalm 27:1"],
  },
  esther: {
    en: "Esther 4:14 (For such a time as this), Esther 2:17 (Finding favor)",
    sw: "Esther 4:14 (Kwa wakati kama huu), Esther 2:17 (Kupata upendeleo)",
    verses: ["Esther 4:14", "Esther 2:17"],
  },
  daniel: {
    en: "Daniel 6 (The Lion's Den), Daniel 1 (Faithful in Babylon)",
    sw: "Danieli 6 (Tundu la Simba), Danieli 1 (Aliaminifu Babeli)",
    verses: ["Daniel 6:22", "Daniel 1:8"],
  },
  ruth: {
    en: "Ruth 1:16 (Where you go I will go), Ruth 2:12 (Finding favor)",
    sw: "Ruthu 1:16 (Nenda utakapokwenda), Ruthu 2:12 (Kupata upendeleo)",
    verses: ["Ruth 1:16", "Ruth 2:12"],
  },
  joseph: {
    en: "Genesis 37 (The coat of many colors), Genesis 50:20 (God meant it for good)",
    sw: "Mwanzo 37 (Mwanzo wa rangi nyingi), Mwanzo 50:20 (Mungu alilitegemeza kwa wema)",
    verses: ["Genesis 37:3", "Genesis 50:20"],
  },
  mary: {
    en: "Luke 1:38 (I am the Lord's servant), Luke 2:19 (Treasured in heart)",
    sw: "Luka 1:38 (Mimi ni mtumishi wa BWF), Luka 2:19 (Aliyaficha moyoni)",
    verses: ["Luke 1:38", "Luke 2:19"],
  },
  moses: {
    en: "Exodus 3 (The burning bush), Exodus 14 (Parting the Red Sea)",
    sw: "Kutoka 3 (Mwali unaowaka), Kutoka 14 (Kugawa Bahari Nyekundu)",
    verses: ["Exodus 3:14", "Exodus 14:21"],
  },
  noah: {
    en: "Genesis 6-9 (Building the ark, the flood, the rainbow)",
    sw: "Mwanzo 6-9 (Kujenga safina, mafuriko, upinde wa mvua)",
    verses: ["Genesis 6:22", "Genesis 9:13"],
  },
  samson: {
    en: "Judges 13-16 (Samson's strength, dedication to God)",
    sw: "Waamuzi 13-16 (Nguvu ya Samsoni, kujitoa kwa Mungu)",
    verses: ["Judges 16:28", "Judges 13:5"],
  },
  solomon: {
    en: "1 Kings 3 (Asking for wisdom), 1 Kings 10 (The queen of Sheba)",
    sw: "1 Wafalme 3 (Kuomba hekima), 1 Wafalme 10 (Malkia wa Sheba)",
    verses: ["1 Kings 3:9", "Proverbs 1:7"],
  },
  paul: {
    en: "Acts 9 (Paul's conversion), Philippians 4:13 (Strength through Christ)",
    sw: "Matendo 9 (Ubadiliko wa Paulo), Wafilipi 4:13 (Nguvu kupitia Kristo)",
    verses: ["Acts 9:3", "Philippians 4:13"],
  },
  peter: {
    en: "Matthew 14:29 (Walking on water), Acts 2 (Peter's sermon at Pentecost)",
    sw: "Mathayo 14:29 (Kutembea juu ya maji), Matendo 2 (Hotuba ya Petro Pentekoste)",
    verses: ["Matthew 14:29", "Acts 2:14"],
  },
  abraham: {
    en: "Genesis 12 (Called to leave home), Genesis 22 (Willing to sacrifice Isaac)",
    sw: "Mwanzo 12 (Kuagwa kuacha nyumbani), Mwanzo 22 (Tayari kumtoa Isaka)",
    verses: ["Genesis 12:1", "Genesis 22:8"],
  },
  hannah: {
    en: "1 Samuel 1 (Hannah's prayer for a child), 1 Samuel 2 (Song of Hannah)",
    sw: "1 Samweli 1 (Maombi ya Hanna kwa mtoto), 1 Samweli 2 (Wimbo wa Hanna)",
    verses: ["1 Samuel 1:27", "1 Samuel 2:1"],
  },
};

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not set. Add it to .env" },
      { status: 500 }
    );
  }

  try {
    const { hero, lesson, language, length } = await req.json();

    const heroKey = hero?.toLowerCase().replace(/\s+/g, "") || "";
    const bibleRef = BIBLE_REFERENCES[heroKey] || {
      en: `Stories from the Bible featuring ${hero}`,
      sw: `Hadithi za Biblia zinazomhusu ${hero}`,
      verses: ["Proverbs 22:6"],
    };

    const refs = language === "sw" ? bibleRef.sw : bibleRef.en;
    const verseList = bibleRef.verses.join(", ");
    const wordCount = length === "short" ? "300" : "500";

    const systemPrompt =
      language === "sw"
        ? `Wewe ni mwandishi wa hadithi za Biblia kwa watoto wa umri wa miaka 5-10.

MUHIMU: Hadithi lazima iwe KATIKA MAANDIKO MATAKATIFU ya Biblia. Tafadhali soma na urejelee maandiko haya kabla ya kuandika:
${refs}

Vidokezo vya maandiko: ${verseList}

ANDIKA HADITHI halisi kutoka Biblia, si hadithi ya ufundi (fantasy). Tumia ukweli wa kibiblia. Onyesha somo la "${lesson}" kupitia hadithi halisi ya ${hero}.

MWISHO wa hadithi, ongeza sehemu ya "MAANDIKO:" yenye vidokezo vya Biblia vilivyotumika.

Andika kwa Kiswahili rahisi, ${wordCount} maneno.`
        : `You are a Bible story writer for children ages 5-10.

IMPORTANT: The story MUST be based on REAL Scripture. Please read and reference these Bible passages before writing:
${refs}

Scripture references: ${verseList}

Write a TRUE Bible story, NOT fantasy or made-up fiction. Use the actual Biblical account of ${hero} to teach the lesson of "${lesson}". Keep the story faithful to Scripture while making it engaging for children.

At the END of the story, add a "SCRIPTURE REFERENCES:" section listing the Bible verses used.

Write in simple, warm language, about ${wordCount} words.`;

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
                  ? `Andika hadithi ya kibiblia kuhusu ${hero} kuhusu somo la ${lesson}.`
                  : `Write a Bible story about ${hero} teaching the lesson of ${lesson}.`,
            },
          ],
          temperature: 0.6,
          max_tokens: length === "short" ? 800 : 1200,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq story error:", response.status, errText);
      return NextResponse.json(
        { error: `Groq API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const storyContent = data.choices?.[0]?.message?.content;

    if (!storyContent) {
      return NextResponse.json(
        { error: "No content returned from Groq" },
        { status: 500 }
      );
    }

    // Extract title from first line
    const firstLine = storyContent
      .split("\n")[0]
      .replace(/^#+\s*/, "")
      .replace(/["\u201C\u201D]/g, "")
      .trim();
    const title = firstLine.length > 60 ? firstLine.slice(0, 57) + "..." : firstLine;

    // Extract scene description for image (first 2-3 sentences)
    const sentences = storyContent.replace(/\n/g, " ").split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
    const sceneDescription = sentences.slice(0, 3).join(". ").slice(0, 250);

    return NextResponse.json({
      title,
      content: storyContent,
      sceneDescription,
      scriptureRefs: verseList,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Story generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
