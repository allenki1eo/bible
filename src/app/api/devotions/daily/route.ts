import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 52-week rotating topics anchored to ISO week number
const WEEKLY_TOPICS = [
  { theme: "The Love of God",         themeSw: "Upendo wa Mungu",         ref: "John 3:16" },
  { theme: "Faith over Fear",          themeSw: "Imani kuliko Hofu",        ref: "Isaiah 41:10" },
  { theme: "Forgiveness",              themeSw: "Msamaha",                  ref: "Colossians 3:13" },
  { theme: "God's Provision",          themeSw: "Utoaji wa Mungu",          ref: "Philippians 4:19" },
  { theme: "Prayer",                   themeSw: "Maombi",                   ref: "Philippians 4:6-7" },
  { theme: "Hope",                     themeSw: "Tumaini",                  ref: "Jeremiah 29:11" },
  { theme: "Strength in Weakness",     themeSw: "Nguvu katika Udhaifu",     ref: "2 Corinthians 12:9" },
  { theme: "God's Word",               themeSw: "Neno la Mungu",            ref: "Psalm 119:105" },
  { theme: "Gratitude",                themeSw: "Shukrani",                 ref: "1 Thessalonians 5:18" },
  { theme: "The Holy Spirit",          themeSw: "Roho Mtakatifu",           ref: "John 14:26" },
  { theme: "Humility",                 themeSw: "Unyenyekevu",              ref: "James 4:10" },
  { theme: "Trust in God",             themeSw: "Kumwamini Mungu",          ref: "Proverbs 3:5-6" },
  { theme: "Serving Others",           themeSw: "Kuwahudumia Wengine",      ref: "Mark 10:45" },
  { theme: "Perseverance",             themeSw: "Uvumilivu",                ref: "James 1:3-4" },
  { theme: "Joy",                      themeSw: "Furaha",                   ref: "Psalm 16:11" },
  { theme: "Peace",                    themeSw: "Amani",                    ref: "John 14:27" },
  { theme: "Wisdom",                   themeSw: "Hekima",                   ref: "James 1:5" },
  { theme: "Grace",                    themeSw: "Neema",                    ref: "Ephesians 2:8-9" },
  { theme: "Praise and Worship",       themeSw: "Sifa na Ibada",            ref: "Psalm 150:6" },
  { theme: "God's Faithfulness",       themeSw: "Uaminifu wa Mungu",        ref: "Lamentations 3:22-23" },
  { theme: "Courage",                  themeSw: "Ujasiri",                  ref: "Joshua 1:9" },
  { theme: "Compassion",               themeSw: "Huruma",                   ref: "Micah 6:8" },
  { theme: "Resurrection and Life",    themeSw: "Ufufuo na Uzima",          ref: "John 11:25" },
  { theme: "The Armour of God",        themeSw: "Silaha za Mungu",          ref: "Ephesians 6:10-11" },
  { theme: "Rest in God",              themeSw: "Kupumzika kwa Mungu",      ref: "Matthew 11:28-29" },
  { theme: "Obedience",                themeSw: "Utii",                     ref: "John 14:15" },
  { theme: "Transformation",           themeSw: "Mabadiliko",               ref: "Romans 12:2" },
  { theme: "Community and Fellowship", themeSw: "Ushirika wa Imani",        ref: "Hebrews 10:24-25" },
  { theme: "God's Sovereignty",        themeSw: "Utawala wa Mungu",         ref: "Romans 8:28" },
  { theme: "Salvation",                themeSw: "Wokovu",                   ref: "Romans 10:9" },
  { theme: "Identity in Christ",       themeSw: "Utambulisho wetu kwa Kristo", ref: "2 Corinthians 5:17" },
  { theme: "Generosity",               themeSw: "Ukarimu",                  ref: "2 Corinthians 9:7" },
  { theme: "Suffering and Glory",      themeSw: "Mateso na Utukufu",        ref: "Romans 8:18" },
  { theme: "The Second Coming",        themeSw: "Kuja kwa Pili kwa Kristo", ref: "Revelation 22:20" },
  { theme: "Spiritual Growth",         themeSw: "Ukuaji wa Kiroho",         ref: "2 Peter 3:18" },
  { theme: "Evangelism",               themeSw: "Uinjilisti",               ref: "Matthew 28:19-20" },
  { theme: "Family and Home",          themeSw: "Familia na Nyumbani",      ref: "Joshua 24:15" },
  { theme: "Work and Purpose",         themeSw: "Kazi na Kusudi",           ref: "Colossians 3:23" },
  { theme: "Healing",                  themeSw: "Uponyaji",                 ref: "James 5:15" },
  { theme: "God's Presence",           themeSw: "Uwepo wa Mungu",           ref: "Psalm 46:1" },
  { theme: "Contentment",              themeSw: "Kuridhika",                ref: "Philippians 4:11" },
  { theme: "The Cross",                themeSw: "Msalaba",                  ref: "Galatians 2:20" },
  { theme: "The Kingdom of God",       themeSw: "Ufalme wa Mungu",          ref: "Matthew 6:33" },
  { theme: "Children and Youth",       themeSw: "Watoto na Vijana",         ref: "Proverbs 22:6" },
  { theme: "Leadership",               themeSw: "Uongozi",                  ref: "Proverbs 11:14" },
  { theme: "Integrity",                themeSw: "Uaminifu wa Maadili",      ref: "Proverbs 10:9" },
  { theme: "Forgetting the Past",      themeSw: "Kusahau Yaliyopita",       ref: "Philippians 3:13-14" },
  { theme: "Unity",                    themeSw: "Umoja",                    ref: "Psalm 133:1" },
  { theme: "Angels and Spiritual Warfare", themeSw: "Malaika na Vita vya Kiroho", ref: "Ephesians 6:12" },
  { theme: "Baptism and New Life",     themeSw: "Ubatizo na Uzima Mpya",    ref: "Romans 6:4" },
  { theme: "Listening to God",         themeSw: "Kusikiliza Mungu",         ref: "John 10:27" },
  { theme: "End of Year Reflection",   themeSw: "Tafakari ya Mwaka",        ref: "Psalm 90:12" },
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
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 600, temperature: 0.7 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    } catch { continue; }
  }
  throw new Error("All Groq models failed");
}

export async function GET(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const today = new Date().toISOString().slice(0, 10);
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const isSw = locale === "sw";

  // Check cache first
  const { data: cached } = await supabase
    .from("daily_devotions")
    .select("*")
    .eq("date", today)
    .eq("locale", locale)
    .single();

  if (cached) return NextResponse.json(cached);

  // Pick topic by ISO week so everyone on the same week gets the same theme
  const week = getISOWeek(new Date());
  const topic = WEEKLY_TOPICS[(week - 1) % WEEKLY_TOPICS.length];

  const theme = isSw ? topic.themeSw : topic.theme;
  const ref   = topic.ref;

  const prompt = isSw
    ? `Wewe ni mwalimu wa Biblia wa uzoefu mkubwa. Andika ibada fupi ya asubuhi kwa Kiswahili SAFI cha asili (si Kiswahili cha msimbo au maandishi) kuhusu mada: "${theme}".

Muundo LAZIMA uwe hivi:
KICHWA: [Kichwa kifupi kinachovutia]
UFUNGUZI: [Aya moja ya utangulizi yenye nguvu - maneno 30-40]
MAANDIKO: ${ref}
MAOMBI: [Aya ya maombi ya dhati inayoanza "Bwana," au "Mungu Baba," na kuisha "kwa jina la Yesu, Amina."]
SWALI: [Swali moja la kutafakari]

Andika kwa Kiswahili cha asili kabisa. Usichanganye na Kiingereza.`
    : `You are an experienced Bible teacher. Write a short morning devotion in English on the theme: "${theme}".

Format EXACTLY as:
TITLE: [Short compelling title]
OPENING: [One strong opening paragraph, 40-50 words]
SCRIPTURE: ${ref}
PRAYER: [A sincere prayer starting "Lord," or "Heavenly Father," ending "in Jesus' name, Amen."]
QUESTION: [One reflection question]`;

  try {
    const raw = await generateWithGroq(prompt);

    // Parse sections
    const get = (key: string) => {
      const match = raw.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, "i"));
      return match?.[1]?.trim() ?? "";
    };

    const title    = get("TITLE") || get("KICHWA") || theme;
    const opening  = get("OPENING") || get("UFUNGUZI") || raw.slice(0, 200);
    const prayer   = get("PRAYER") || get("MAOMBI") || "";
    const question = get("QUESTION") || get("SWALI") || "";

    const record = { date: today, locale, theme, scripture_ref: ref, title, content: opening, prayer, reflection_question: question };

    // Cache in DB (best-effort — table may not exist yet, that's OK)
    try { await supabase.from("daily_devotions").upsert(record, { onConflict: "date,locale" }); } catch {}

    return NextResponse.json(record);
  } catch (err) {
    // Fallback: return topic metadata without AI content
    return NextResponse.json({
      date: today, locale, theme, scripture_ref: ref,
      title: theme, content: "", prayer: "", reflection_question: "",
    });
  }
}
