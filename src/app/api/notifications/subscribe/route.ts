import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { subscription, userId, notifPrefs } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: "Missing subscription or userId" }, { status: 400 });
    }

    const sub = subscription as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription object" }, { status: 400 });
    }

    // Use service-role key so RLS doesn't block the upsert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        // store optional preferences alongside the subscription
        notif_time: notifPrefs?.time ?? "07:00",
        notif_topics: notifPrefs?.topics ?? ["devotions"],
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      // Fallback: upsert without the optional pref columns (schema may not have them yet)
      const { error: fallbackError } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: sub.endpoint,
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
        { onConflict: "endpoint" }
      );
      if (fallbackError) {
        console.error("[subscribe] DB error:", fallbackError);
        return NextResponse.json({ error: fallbackError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[subscribe] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
