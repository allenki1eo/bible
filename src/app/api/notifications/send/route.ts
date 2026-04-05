import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

// Configure VAPID details once
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || "nuru@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function POST(req: NextRequest) {
  // Require an internal secret to prevent abuse
  const authHeader = req.headers.get("authorization");
  const secret = process.env.NOTIFICATION_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "VAPID keys not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local" },
      { status: 500 }
    );
  }

  try {
    const { title, body, url, userId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch subscriptions — optionally filter by userId
    let query = supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("Failed to fetch subscriptions:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: "No subscriptions found" });
    }

    const payload = JSON.stringify({
      title: title || "Nuru",
      body: body || "You have a new notification",
      url: url || "/",
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub: PushSubscriptionRow) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: "normal",
          }
        )
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Remove expired/invalid subscriptions
    const expiredEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const err = result.reason;
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
    }

    return NextResponse.json({ sent, failed });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Push send error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
