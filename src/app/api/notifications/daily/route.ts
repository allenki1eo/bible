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

// Configure VAPID once
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || "nuru@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function GET(req: NextRequest) {
  // Vercel cron requests include this header automatically
  const isVercelCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;

  // In production, only allow Vercel cron or requests with CRON_SECRET
  if (process.env.NODE_ENV === "production" && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
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

  // Fetch all push subscriptions
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

  const payload = JSON.stringify({
    title: "Good morning ☀️ — Daily Devotion",
    body: `"${verse.en}" — ${verse.ref}`,
    url: `/en/devotions`,
    tag: "nuru-daily-devotion",
    swBody: `"${verse.sw}" — ${verse.ref}`, // for future SW locale support
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

  console.log(`[daily-notif] Sent ${sent}, failed ${failed}, cleaned ${expiredEndpoints.length}`);
  return NextResponse.json({ sent, failed, cleaned: expiredEndpoints.length, verse: verse.ref });
}
