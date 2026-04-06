import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Verses that rotate daily based on day-of-year
const MORNING_VERSES = [
  { ref: "Psalm 118:24", en: "This is the day the Lord has made; let us rejoice and be glad in it.", sw: "Huu ndio mwisho wa Bwana; tutashangilia na kufurahi ndani yake." },
  { ref: "Lamentations 3:22-23", en: "His mercies are new every morning; great is your faithfulness.", sw: "Rehema zake mpya kila asubuhi; uaminifu wako ni mkubwa sana." },
  { ref: "Psalm 5:3", en: "In the morning, Lord, you hear my voice; in the morning I lay my requests before you.", sw: "Asubuhi, Bwana, utasikia sauti yangu; asubuhi nitaacha maombi yangu mbele yako." },
  { ref: "Isaiah 40:31", en: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", sw: "Wanaomtumainia Bwana watapata nguvu mpya. Wataruka juu kama tai." },
  { ref: "Psalm 143:8", en: "Let the morning bring me word of your unfailing love, for I have put my trust in you.", sw: "Asubuhi niletee habari za upendo wako usiokoma, kwa maana nimekutumainia." },
  { ref: "Proverbs 3:5-6", en: "Trust in the Lord with all your heart and lean not on your own understanding.", sw: "Mtumainie Bwana kwa moyo wako wote wala usitegemee akili yako mwenyewe." },
  { ref: "Psalm 46:1", en: "God is our refuge and strength, an ever-present help in trouble.", sw: "Mungu ni kimbilio letu na nguvu zetu, msaada uliopo wakati wa dhiki." },
];

// Study plan chapters for notification enrichment
// Maps plan_id -> array indexed by day (0-based)
const STUDY_PLAN_DAILY: Record<string, { book: string; chapter: number; title: string }[]> = {
  "acts-28": [
    { book: "Acts", chapter: 1, title: "The Ascension & Matthias" },
    { book: "Acts", chapter: 2, title: "Pentecost" },
    { book: "Acts", chapter: 3, title: "The Lame Man Healed" },
    { book: "Acts", chapter: 4, title: "Peter & John Before the Council" },
    { book: "Acts", chapter: 5, title: "Ananias, Sapphira & the Apostles" },
    { book: "Acts", chapter: 6, title: "The Seven Deacons" },
    { book: "Acts", chapter: 7, title: "Stephen's Speech" },
    { book: "Acts", chapter: 8, title: "Philip & the Ethiopian" },
    { book: "Acts", chapter: 9, title: "Saul's Conversion" },
    { book: "Acts", chapter: 10, title: "Cornelius & Peter" },
    { book: "Acts", chapter: 11, title: "Peter's Report" },
    { book: "Acts", chapter: 12, title: "Peter's Escape" },
    { book: "Acts", chapter: 13, title: "First Missionary Journey" },
    { book: "Acts", chapter: 14, title: "Lystra & Derbe" },
    { book: "Acts", chapter: 15, title: "Jerusalem Council" },
    { book: "Acts", chapter: 16, title: "Lydia & the Jailer" },
    { book: "Acts", chapter: 17, title: "Athens & Mars Hill" },
    { book: "Acts", chapter: 18, title: "Corinth & Priscilla" },
    { book: "Acts", chapter: 19, title: "Ephesus & the Riot" },
    { book: "Acts", chapter: 20, title: "Farewell to Ephesus" },
    { book: "Acts", chapter: 21, title: "Paul Arrested in Jerusalem" },
    { book: "Acts", chapter: 22, title: "Paul's Defense" },
    { book: "Acts", chapter: 23, title: "Before the Sanhedrin" },
    { book: "Acts", chapter: 24, title: "Before Felix" },
    { book: "Acts", chapter: 25, title: "Before Festus" },
    { book: "Acts", chapter: 26, title: "Before Agrippa" },
    { book: "Acts", chapter: 27, title: "The Storm at Sea" },
    { book: "Acts", chapter: 28, title: "Malta & Rome" },
  ],
};

// Configure VAPID once — wrapped in try/catch so a bad key doesn't crash the
// build-time static analysis step (Next.js evaluates module-level code).
function configureWebPush(): boolean {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return false;
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_CONTACT_EMAIL || "nuru@example.com"}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    return true;
  } catch (err) {
    console.error("[daily-notif] Invalid VAPID keys:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Vercel cron requests include this header automatically
  const isVercelCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  // In production, only allow Vercel cron or requests with CRON_SECRET
  if (process.env.NODE_ENV === "production" && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!configureWebPush()) {
    return NextResponse.json({ error: "VAPID keys not configured or invalid — regenerate from the admin panel" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Pick verse based on day of year for variety
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const verse = MORNING_VERSES[dayOfYear % MORNING_VERSES.length];

  // Fetch all push subscriptions with user_id for study plan lookup
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, user_id");

  if (error) {
    console.error("[daily-notif] DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscribers" });
  }

  // Try to get today's daily devotion theme for richer notification
  let devotionTheme = "";
  try {
    const { data: devotion } = await supabase
      .from("daily_devotions")
      .select("theme, title, scripture_ref")
      .eq("date", new Date().toISOString().slice(0, 10))
      .eq("locale", "en")
      .single();
    if (devotion) {
      devotionTheme = devotion.title || devotion.theme || "";
    }
  } catch {}

  const baseTitle = devotionTheme
    ? `Good morning ☀️ — ${devotionTheme}`
    : "Good morning ☀️ — Daily Devotion";

  const payload = JSON.stringify({
    title: baseTitle,
    body: `"${verse.en}" — ${verse.ref}`,
    url: `/en/devotions`,
    tag: "nuru-daily-devotion",
    swBody: `"${verse.sw}" — ${verse.ref}`,
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        { TTL: 60 * 60 * 6, urgency: "normal" } // expire after 6 hours if device offline
      )
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  // Clean up expired/invalid subscriptions (410 Gone or 404)
  const expiredEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        expiredEndpoints.push(subscriptions[i].endpoint);
      }
    }
  });

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
    console.log(`[daily-notif] Removed ${expiredEndpoints.length} expired subscriptions`);
  }

  // Also try to generate today's daily devotion if not yet cached (prime the cache)
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { data: existingEn } = await supabase.from("daily_devotions").select("date").eq("date", today).eq("locale", "en").single();
    if (!existingEn) {
      // Fire-and-forget to prime the cache for both locales
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nuru1.vercel.app";
      fetch(`${baseUrl}/api/devotions/daily?locale=en`).catch(() => {});
      fetch(`${baseUrl}/api/devotions/daily?locale=sw`).catch(() => {});
    }
  } catch {}

  console.log(`[daily-notif] Sent ${sent}, failed ${failed}, cleaned ${expiredEndpoints.length}`);
  return NextResponse.json({ sent, failed, cleaned: expiredEndpoints.length, verse: verse.ref });
}
