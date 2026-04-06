import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Weekly theme rotation (52 weeks) ─────────────────────────────────────────
const WEEKLY_TOPICS = [
  { theme: "The Love of God",          ref: "John 3:16",            verse: "For God so loved the world that he gave his one and only Son." },
  { theme: "Faith over Fear",          ref: "Isaiah 41:10",         verse: "So do not fear, for I am with you; do not be dismayed, for I am your God." },
  { theme: "Forgiveness",              ref: "Colossians 3:13",      verse: "Forgive as the Lord forgave you." },
  { theme: "God's Provision",          ref: "Philippians 4:19",     verse: "My God will meet all your needs according to his glorious riches in Christ Jesus." },
  { theme: "Prayer",                   ref: "Philippians 4:6-7",    verse: "Do not be anxious about anything, but in every situation, present your requests to God." },
  { theme: "Hope",                     ref: "Jeremiah 29:11",       verse: "For I know the plans I have for you, plans to prosper you and not to harm you." },
  { theme: "Strength in Weakness",     ref: "2 Corinthians 12:9",   verse: "My grace is sufficient for you, for my power is made perfect in weakness." },
  { theme: "God's Word",               ref: "Psalm 119:105",        verse: "Your word is a lamp for my feet, a light on my path." },
  { theme: "Gratitude",                ref: "1 Thessalonians 5:18", verse: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
  { theme: "The Holy Spirit",          ref: "John 14:26",           verse: "The Holy Spirit will teach you all things and remind you of everything I have said." },
  { theme: "Humility",                 ref: "James 4:10",           verse: "Humble yourselves before the Lord, and he will lift you up." },
  { theme: "Trust in God",             ref: "Proverbs 3:5-6",       verse: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { theme: "Serving Others",           ref: "Mark 10:45",           verse: "The Son of Man did not come to be served, but to serve." },
  { theme: "Perseverance",             ref: "James 1:3-4",          verse: "The testing of your faith produces perseverance." },
  { theme: "Joy",                      ref: "Psalm 16:11",          verse: "You will fill me with joy in your presence." },
  { theme: "Peace",                    ref: "John 14:27",           verse: "Peace I leave with you; my peace I give you." },
  { theme: "Wisdom",                   ref: "James 1:5",            verse: "If any of you lacks wisdom, you should ask God, who gives generously to all." },
  { theme: "Grace",                    ref: "Ephesians 2:8-9",      verse: "For it is by grace you have been saved, through faith — not from yourselves, it is the gift of God." },
  { theme: "Praise and Worship",       ref: "Psalm 150:6",          verse: "Let everything that has breath praise the Lord." },
  { theme: "God's Faithfulness",       ref: "Lamentations 3:22-23", verse: "His compassions never fail. They are new every morning." },
  { theme: "Courage",                  ref: "Joshua 1:9",           verse: "Be strong and courageous. The Lord your God will be with you wherever you go." },
  { theme: "Compassion",               ref: "Micah 6:8",            verse: "Act justly, love mercy, and walk humbly with your God." },
  { theme: "Resurrection and Life",    ref: "John 11:25",           verse: "I am the resurrection and the life. Whoever believes in me will live." },
  { theme: "The Armour of God",        ref: "Ephesians 6:10-11",    verse: "Put on the full armour of God, so that you can take your stand against the devil." },
  { theme: "Rest in God",              ref: "Matthew 11:28-29",     verse: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { theme: "Obedience",                ref: "John 14:15",           verse: "If you love me, keep my commands." },
  { theme: "Transformation",           ref: "Romans 12:2",          verse: "Be transformed by the renewing of your mind." },
  { theme: "Community",                ref: "Hebrews 10:24-25",     verse: "Let us consider how we may spur one another on toward love and good deeds." },
  { theme: "God's Sovereignty",        ref: "Romans 8:28",          verse: "In all things God works for the good of those who love him." },
  { theme: "Salvation",                ref: "Romans 10:9",          verse: "If you declare Jesus is Lord and believe God raised him from the dead, you will be saved." },
  { theme: "Identity in Christ",       ref: "2 Corinthians 5:17",   verse: "If anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
  { theme: "Generosity",               ref: "2 Corinthians 9:7",    verse: "God loves a cheerful giver." },
  { theme: "Suffering and Glory",      ref: "Romans 8:18",          verse: "Our present sufferings are not worth comparing with the glory that will be revealed in us." },
  { theme: "The Second Coming",        ref: "Revelation 22:20",     verse: "He who testifies says, 'Yes, I am coming soon.' Amen. Come, Lord Jesus." },
  { theme: "Spiritual Growth",         ref: "2 Peter 3:18",         verse: "Grow in the grace and knowledge of our Lord and Savior Jesus Christ." },
  { theme: "Evangelism",               ref: "Matthew 28:19-20",     verse: "Go and make disciples of all nations." },
  { theme: "Family and Home",          ref: "Joshua 24:15",         verse: "As for me and my household, we will serve the Lord." },
  { theme: "Work and Purpose",         ref: "Colossians 3:23",      verse: "Whatever you do, work at it with all your heart, as working for the Lord." },
  { theme: "Healing",                  ref: "James 5:15",           verse: "The prayer offered in faith will make the sick person well." },
  { theme: "God's Presence",           ref: "Psalm 46:1",           verse: "God is our refuge and strength, an ever-present help in trouble." },
  { theme: "Contentment",              ref: "Philippians 4:11",     verse: "I have learned, in whatever state I am, to be content." },
  { theme: "The Cross",                ref: "Galatians 2:20",       verse: "I have been crucified with Christ and I no longer live, but Christ lives in me." },
  { theme: "The Kingdom of God",       ref: "Matthew 6:33",         verse: "Seek first his kingdom and his righteousness, and all these things will be given to you." },
  { theme: "Children and Youth",       ref: "Proverbs 22:6",        verse: "Start children off on the way they should go." },
  { theme: "Leadership",               ref: "Proverbs 11:14",       verse: "In an abundance of counselors there is safety." },
  { theme: "Integrity",                ref: "Proverbs 10:9",        verse: "Whoever walks in integrity walks securely." },
  { theme: "Perseverance",             ref: "Philippians 3:13-14",  verse: "Forgetting what is behind and straining toward what is ahead, I press on." },
  { theme: "Unity",                    ref: "Psalm 133:1",          verse: "How good and pleasant it is when God's people live together in unity!" },
  { theme: "Spiritual Warfare",        ref: "Ephesians 6:12",       verse: "Our struggle is not against flesh and blood, but against spiritual forces of evil." },
  { theme: "Baptism and New Life",     ref: "Romans 6:4",           verse: "We were buried with him through baptism that we too may live a new life." },
  { theme: "Listening to God",         ref: "John 10:27",           verse: "My sheep listen to my voice; I know them, and they follow me." },
  { theme: "Wisdom and Reflection",    ref: "Psalm 90:12",          verse: "Teach us to number our days, that we may gain a heart of wisdom." },
];

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

async function generateWithGroq(prompt: string): Promise<string> {
  const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of models) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1200, temperature: 0.6 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() ?? "";
      if (text.length > 50) return text;
    } catch { continue; }
  }
  throw new Error("All Groq models failed");
}

type Question =
  | { type: "multiple_choice"; question: string; options: string[]; answer: string; category?: string }
  | { type: "fill_blank"; verse: string; answer: string; ref: string; category?: string }
  | { type: "true_false"; statement: string; answer: boolean; category?: string }
  | { type: "who_said_it"; quote: string; options: string[]; answer: string; category?: string };

// ── Rich fallback questions by game category ─────────────────────────────────
function buildFallbackQuestions(theme: string, ref: string, verse: string): Question[] {
  const words = verse.split(" ");
  const blankIdx = Math.floor(words.length / 2);
  const blankWord = words[blankIdx].replace(/[^a-zA-Z]/g, "");
  const blankVerse = words.map((w, i) => i === blankIdx ? w.replace(blankWord, "___") : w).join(" ");

  return [
    {
      type: "who_said_it",
      quote: "Let my people go!",
      options: ["Moses", "Abraham", "Joshua", "Elijah"],
      answer: "Moses",
      category: "Who Said It?",
    },
    {
      type: "multiple_choice",
      question: `This week's theme is "${theme}". Which verse is the key memory scripture?`,
      options: [ref, "Genesis 1:1", "John 1:1", "Psalm 23:1"],
      answer: ref,
      category: "Scripture Memory",
    },
    {
      type: "fill_blank",
      verse: blankVerse,
      answer: blankWord,
      ref,
      category: "Verse Completion",
    },
    {
      type: "true_false",
      statement: "The Bible contains 66 books in total — 39 in the Old Testament and 27 in the New Testament.",
      answer: true,
      category: "Bible Facts",
    },
    {
      type: "multiple_choice",
      question: "How many days did it take God to create the world?",
      options: ["6 days", "7 days", "3 days", "40 days"],
      answer: "6 days",
      category: "Bible Events",
    },
    {
      type: "who_said_it",
      quote: "I am the way, the truth, and the life.",
      options: ["Jesus", "Paul", "John the Baptist", "Moses"],
      answer: "Jesus",
      category: "Who Said It?",
    },
    {
      type: "multiple_choice",
      question: "In which city was Jesus born?",
      options: ["Bethlehem", "Nazareth", "Jerusalem", "Capernaum"],
      answer: "Bethlehem",
      category: "Bible Geography",
    },
  ];
}

// ── Prompt for diverse, fun quiz questions ────────────────────────────────────
function buildPrompt(theme: string, ref: string, verse: string, isSw: boolean): string {
  if (isSw) {
    return `Wewe ni mtaalamu wa Biblia na mchezo. Tengeneza maswali 6 ya mchezo wa Biblia kwa Kiswahili. Tumia aina TOFAUTI za maswali ili mchezo uwe wa kufurahisha zaidi.

Mada ya wiki: "${theme}" (maandiko: ${ref})

Rudisha JSON PEKE YAKE (bila maelezo), muundo huu HASA:
{
  "questions": [
    { "type": "who_said_it", "category": "Alisema Nani?", "quote": "...", "options": ["A. Yesu", "B. Paulo", "C. Petro", "D. Musa"], "answer": "A. Yesu" },
    { "type": "multiple_choice", "category": "Jiografia ya Biblia", "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A. ..." },
    { "type": "fill_blank", "category": "Kumbuka Andiko", "verse": "${verse.split(" ").slice(0,4).join(" ")} ___ ${verse.split(" ").slice(5,8).join(" ")}", "answer": "${verse.split(" ")[4]?.replace(/[^a-zA-Z]/g,"") || "Mungu"}", "ref": "${ref}" },
    { "type": "true_false", "category": "Kweli au Uongo", "statement": "...", "answer": true },
    { "type": "multiple_choice", "category": "Matukio ya Biblia", "question": "Miujiza ya Yesu — alimfufua nani kutoka kwa wafu?", "options": ["A. Lazaro", "B. Petro", "C. Yohana", "D. Andrea"], "answer": "A. Lazaro" },
    { "type": "who_said_it", "category": "Alisema Nani?", "quote": "Sitakuacha wala sitakukimbia", "options": ["A. Mungu kwa Yoshua", "B. Yesu kwa wanafunzi", "C. Paulo kwa Timotheo", "D. Musa kwa Waisraeli"], "answer": "A. Mungu kwa Yoshua" }
  ]
}

Maswali lazima yajumuishe: "Alisema Nani?" (nukuu za Biblia), jiografia, matukio, miujiza, takwimu za Biblia.`;
  }

  return `You are a fun, engaging Bible game designer. Generate exactly 6 diverse Bible quiz questions that mix DIFFERENT game categories to keep it exciting. Today's theme: "${theme}" (scripture: ${ref}).

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    {
      "type": "who_said_it",
      "category": "Who Said It?",
      "quote": "I can do all this through him who gives me strength.",
      "options": ["A. Paul", "B. Peter", "C. David", "D. Isaiah"],
      "answer": "A. Paul"
    },
    {
      "type": "multiple_choice",
      "category": "Bible Geography",
      "question": "On which mountain did Moses receive the Ten Commandments?",
      "options": ["A. Mount Sinai", "B. Mount Carmel", "C. Mount Zion", "D. Mount Hermon"],
      "answer": "A. Mount Sinai"
    },
    {
      "type": "fill_blank",
      "category": "Verse Completion",
      "verse": "${verse.split(" ").slice(0, 5).join(" ")} ___ ${verse.split(" ").slice(6, 11).join(" ")}",
      "answer": "${verse.split(" ")[5]?.replace(/[^a-zA-Z]/g, "") || "God"}",
      "ref": "${ref}"
    },
    {
      "type": "true_false",
      "category": "Bible Facts",
      "statement": "The book of Psalms is the longest book in the Bible with 150 chapters.",
      "answer": true
    },
    {
      "type": "multiple_choice",
      "category": "Bible Miracles",
      "question": "Which miracle did Jesus perform at the wedding in Cana?",
      "options": ["A. Turned water into wine", "B. Fed 5000 people", "C. Walked on water", "D. Healed a blind man"],
      "answer": "A. Turned water into wine"
    },
    {
      "type": "who_said_it",
      "category": "Who Said It?",
      "quote": "Here I am. Send me!",
      "options": ["A. Isaiah", "B. Jeremiah", "C. Ezekiel", "D. Moses"],
      "answer": "A. Isaiah"
    }
  ]
}

Rules for GREAT Bible game questions:
- Mix categories: "Who Said It?", "Bible Geography", "Bible Miracles", "Verse Completion", "Bible Facts", "Bible Numbers", "Bible Firsts", "Name That Person"
- "Who Said It?" questions: use real Bible quotes, 4 plausible options
- Make options plausible but clearly one correct — no trick questions
- Difficulty: mix easy (Sunday school) + medium (regular reader) questions
- Keep questions SHORT and punchy — this is a fast-paced game
- Always start each option with a letter: "A. ...", "B. ...", etc.
- The answer must exactly match one of the options`;
}

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const fresh  = req.nextUrl.searchParams.get("fresh") === "1"; // bypass cache for testing
  const isSw   = locale === "sw";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (!fresh) {
    try {
      const { data: cached } = await supabase
        .from("daily_quiz")
        .select("*")
        .eq("date", today)
        .eq("locale", locale)
        .single();

      if (cached?.questions && Array.isArray(cached.questions) && cached.questions.length >= 4) {
        return NextResponse.json({ date: today, locale, questions: cached.questions, theme: cached.theme, ref: cached.ref });
      }
    } catch {
      // table may not exist, continue
    }
  }

  const week  = getISOWeek(new Date());
  const topic = WEEKLY_TOPICS[(week - 1) % WEEKLY_TOPICS.length];

  let questions: Question[] = [];

  try {
    const raw = await generateWithGroq(buildPrompt(topic.theme, topic.ref, topic.verse, isSw));
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.questions) && parsed.questions.length >= 4) {
        questions = parsed.questions;
      }
    }
  } catch {
    // fall through to fallback
  }

  if (questions.length === 0) {
    questions = buildFallbackQuestions(topic.theme, topic.ref, topic.verse);
  }

  // Cache
  try {
    await supabase.from("daily_quiz").upsert(
      { date: today, locale, theme: topic.theme, ref: topic.ref, questions },
      { onConflict: "date,locale" }
    );
  } catch {}

  return NextResponse.json({ date: today, locale, questions, theme: topic.theme, ref: topic.ref });
}
