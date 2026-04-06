import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 52-week topics (same as daily devotion route, duplicated here for independence)
const WEEKLY_TOPICS = [
  { theme: "The Love of God",         ref: "John 3:16",         verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { theme: "Faith over Fear",          ref: "Isaiah 41:10",      verse: "So do not fear, for I am with you; do not be dismayed, for I am your God." },
  { theme: "Forgiveness",              ref: "Colossians 3:13",   verse: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you." },
  { theme: "God's Provision",          ref: "Philippians 4:19",  verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus." },
  { theme: "Prayer",                   ref: "Philippians 4:6-7", verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." },
  { theme: "Hope",                     ref: "Jeremiah 29:11",    verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { theme: "Strength in Weakness",     ref: "2 Corinthians 12:9",verse: "My grace is sufficient for you, for my power is made perfect in weakness." },
  { theme: "God's Word",               ref: "Psalm 119:105",     verse: "Your word is a lamp for my feet, a light on my path." },
  { theme: "Gratitude",                ref: "1 Thessalonians 5:18", verse: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
  { theme: "The Holy Spirit",          ref: "John 14:26",        verse: "The Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things." },
  { theme: "Humility",                 ref: "James 4:10",        verse: "Humble yourselves before the Lord, and he will lift you up." },
  { theme: "Trust in God",             ref: "Proverbs 3:5-6",    verse: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him." },
  { theme: "Serving Others",           ref: "Mark 10:45",        verse: "For even the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many." },
  { theme: "Perseverance",             ref: "James 1:3-4",       verse: "The testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete." },
  { theme: "Joy",                      ref: "Psalm 16:11",       verse: "You make known to me the path of life; you will fill me with joy in your presence." },
  { theme: "Peace",                    ref: "John 14:27",        verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives." },
  { theme: "Wisdom",                   ref: "James 1:5",         verse: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault." },
  { theme: "Grace",                    ref: "Ephesians 2:8-9",   verse: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God." },
  { theme: "Praise and Worship",       ref: "Psalm 150:6",       verse: "Let everything that has breath praise the Lord." },
  { theme: "God's Faithfulness",       ref: "Lamentations 3:22-23", verse: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning." },
  { theme: "Courage",                  ref: "Joshua 1:9",        verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you." },
  { theme: "Compassion",               ref: "Micah 6:8",         verse: "And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God." },
  { theme: "Resurrection and Life",    ref: "John 11:25",        verse: "I am the resurrection and the life. The one who believes in me will live, even though they die." },
  { theme: "The Armour of God",        ref: "Ephesians 6:10-11", verse: "Be strong in the Lord and in his mighty power. Put on the full armour of God." },
  { theme: "Rest in God",              ref: "Matthew 11:28-29",  verse: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { theme: "Obedience",                ref: "John 14:15",        verse: "If you love me, keep my commands." },
  { theme: "Transformation",           ref: "Romans 12:2",       verse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
  { theme: "Community and Fellowship", ref: "Hebrews 10:24-25",  verse: "Let us consider how we may spur one another on toward love and good deeds, not giving up meeting together." },
  { theme: "God's Sovereignty",        ref: "Romans 8:28",       verse: "And we know that in all things God works for the good of those who love him." },
  { theme: "Salvation",                ref: "Romans 10:9",       verse: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved." },
  { theme: "Identity in Christ",       ref: "2 Corinthians 5:17",verse: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
  { theme: "Generosity",               ref: "2 Corinthians 9:7", verse: "God loves a cheerful giver." },
  { theme: "Suffering and Glory",      ref: "Romans 8:18",       verse: "I consider that our present sufferings are not worth comparing with the glory that will be revealed in us." },
  { theme: "The Second Coming",        ref: "Revelation 22:20",  verse: "He who testifies to these things says, 'Yes, I am coming soon.' Amen. Come, Lord Jesus." },
  { theme: "Spiritual Growth",         ref: "2 Peter 3:18",      verse: "But grow in the grace and knowledge of our Lord and Savior Jesus Christ." },
  { theme: "Evangelism",               ref: "Matthew 28:19-20",  verse: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." },
  { theme: "Family and Home",          ref: "Joshua 24:15",      verse: "But as for me and my household, we will serve the Lord." },
  { theme: "Work and Purpose",         ref: "Colossians 3:23",   verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters." },
  { theme: "Healing",                  ref: "James 5:15",        verse: "And the prayer offered in faith will make the sick person well; the Lord will raise them up." },
  { theme: "God's Presence",           ref: "Psalm 46:1",        verse: "God is our refuge and strength, an ever-present help in trouble." },
  { theme: "Contentment",              ref: "Philippians 4:11",  verse: "I have learned, in whatever state I am, to be content." },
  { theme: "The Cross",                ref: "Galatians 2:20",    verse: "I have been crucified with Christ and I no longer live, but Christ lives in me." },
  { theme: "The Kingdom of God",       ref: "Matthew 6:33",      verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
  { theme: "Children and Youth",       ref: "Proverbs 22:6",     verse: "Start children off on the way they should go, and even when they are old they will not turn from it." },
  { theme: "Leadership",               ref: "Proverbs 11:14",    verse: "Where there is no guidance, a people falls, but in an abundance of counselors there is safety." },
  { theme: "Integrity",                ref: "Proverbs 10:9",     verse: "Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out." },
  { theme: "Forgetting the Past",      ref: "Philippians 3:13-14", verse: "Forgetting what is behind and straining toward what is ahead, I press on toward the goal." },
  { theme: "Unity",                    ref: "Psalm 133:1",       verse: "How good and pleasant it is when God's people live together in unity!" },
  { theme: "Angels and Spiritual Warfare", ref: "Ephesians 6:12",  verse: "For our struggle is not against flesh and blood, but against the rulers, against the authorities." },
  { theme: "Baptism and New Life",     ref: "Romans 6:4",        verse: "We were therefore buried with him through baptism into death in order that, just as Christ was raised from the dead, we too may live a new life." },
  { theme: "Listening to God",         ref: "John 10:27",        verse: "My sheep listen to my voice; I know them, and they follow me." },
  { theme: "End of Year Reflection",   ref: "Psalm 90:12",       verse: "Teach us to number our days, that we may gain a heart of wisdom." },
  { theme: "Unity",                    ref: "Psalm 133:1",       verse: "How good and pleasant it is when God's people live together in unity!" },
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
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 800, temperature: 0.5 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch { continue; }
  }
  throw new Error("All Groq models failed");
}

type Question =
  | { type: "multiple_choice"; question: string; options: string[]; answer: string }
  | { type: "fill_blank"; verse: string; answer: string; ref: string }
  | { type: "true_false"; statement: string; answer: boolean };

function buildFallbackQuestions(theme: string, ref: string, verse: string): Question[] {
  // Pick a word from the verse for fill-in-blank
  const words = verse.split(" ");
  const wordIdx = Math.floor(words.length / 2);
  const blankWord = words[wordIdx].replace(/[^a-zA-Z]/g, "");
  const blankVerse = words.map((w, i) => {
    const clean = w.replace(/[^a-zA-Z]/g, "");
    return i === wordIdx && clean.toLowerCase() === blankWord.toLowerCase()
      ? w.replace(clean, "___")
      : w;
  }).join(" ");

  return [
    {
      type: "multiple_choice",
      question: `This week's theme is "${theme}". Which scripture reference is associated with it?`,
      options: [ref, "John 1:1", "Genesis 1:1", "Psalm 23:1"],
      answer: ref,
    },
    {
      type: "fill_blank",
      verse: blankVerse,
      answer: blankWord,
      ref,
    },
    {
      type: "true_false",
      statement: `The scripture ${ref} is related to the theme of "${theme}".`,
      answer: true,
    },
    {
      type: "multiple_choice",
      question: `Complete the verse from ${ref}: "${verse.split(" ").slice(0, 5).join(" ")}..."`,
      options: [
        verse.split(" ").slice(5, 10).join(" ") + "...",
        "blessed are the meek for they shall inherit...",
        "the Lord is my shepherd I shall not...",
        "love is patient love is kind...",
      ],
      answer: verse.split(" ").slice(5, 10).join(" ") + "...",
    },
  ];
}

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().slice(0, 10);
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const isSw = locale === "sw";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check cache
  const { data: cached } = await supabase
    .from("daily_quiz")
    .select("*")
    .eq("date", today)
    .eq("locale", locale)
    .single();

  if (cached?.questions) {
    return NextResponse.json({ date: today, locale, questions: cached.questions, theme: cached.theme, ref: cached.ref });
  }

  // Get today's topic
  const week = getISOWeek(new Date());
  const topic = WEEKLY_TOPICS[(week - 1) % WEEKLY_TOPICS.length];
  const theme = topic.theme;
  const ref = topic.ref;
  const verse = topic.verse;

  // Try to get more context from cached daily devotion
  let devotionContent = "";
  try {
    const { data: devotion } = await supabase
      .from("daily_devotions")
      .select("content, title")
      .eq("date", today)
      .eq("locale", "en")
      .single();
    if (devotion) devotionContent = devotion.content || "";
  } catch {}

  const prompt = isSw
    ? `Wewe ni mwalimu wa Biblia. Tengeneza maswali 4 ya mazoezi ya Biblia kwa Kiswahili kuhusu mada: "${theme}" na maandiko: "${ref}".

Rudisha JSON PEKE YAKE (bila maelezo yoyote), muundo huu:
{
  "questions": [
    { "type": "multiple_choice", "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A. ..." },
    { "type": "fill_blank", "verse": "Neno la Mungu ni ___ kwa miguu yangu...", "answer": "taa", "ref": "${ref}" },
    { "type": "true_false", "statement": "...", "answer": true },
    { "type": "multiple_choice", "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "B. ..." }
  ]
}`
    : `You are a Bible teacher. Generate exactly 4 quiz questions about this week's theme: "${theme}" (scripture: ${ref}).
${devotionContent ? `Context from today's devotion: "${devotionContent.slice(0, 300)}"` : ""}

Return ONLY valid JSON (no markdown, no explanation):
{
  "questions": [
    { "type": "multiple_choice", "question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A. ..." },
    { "type": "fill_blank", "verse": "Fill in the blank: '${verse.split(" ").slice(0, 4).join(" ")} ___ ${verse.split(" ").slice(5, 9).join(" ")}...'", "answer": "${verse.split(" ")[4]?.replace(/[^a-zA-Z]/g, "") || "God"}", "ref": "${ref}" },
    { "type": "true_false", "statement": "The theme '${theme}' is supported by ${ref}.", "answer": true },
    { "type": "multiple_choice", "question": "According to ${ref}, complete: '${verse.split(" ").slice(0, 6).join(" ")}...'", "options": ["A. ${verse.split(" ").slice(6, 10).join(" ")}", "B. all people shall be saved", "C. seek and you shall find", "D. blessed are the peacemakers"], "answer": "A. ${verse.split(" ").slice(6, 10).join(" ")}" }
  ]
}`;

  let questions: Question[] = [];

  try {
    const raw = await generateWithGroq(prompt);
    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        questions = parsed.questions;
      }
    }
  } catch {
    // fall through to fallback
  }

  if (questions.length === 0) {
    questions = buildFallbackQuestions(theme, ref, verse);
  }

  // Cache
  try {
    await supabase.from("daily_quiz").upsert(
      { date: today, locale, theme, ref, questions },
      { onConflict: "date,locale" }
    );
  } catch {}

  return NextResponse.json({ date: today, locale, questions, theme, ref });
}
