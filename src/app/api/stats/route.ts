import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [
      { count: users },
      { count: stories },
      { count: testimonies },
      { count: prayers },
      { count: subscribers },
      { count: completedDevotions },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("stories").select("*", { count: "exact", head: true }),
      supabase.from("testimonies").select("*", { count: "exact", head: true }),
      supabase.from("prayers").select("*", { count: "exact", head: true }),
      supabase.from("push_subscriptions").select("*", { count: "exact", head: true }),
      supabase.from("devotions").select("*", { count: "exact", head: true }).eq("completed", true),
    ]);

    return NextResponse.json({
      users: users ?? 0,
      stories: stories ?? 0,
      testimonies: testimonies ?? 0,
      prayers: prayers ?? 0,
      subscribers: subscribers ?? 0,
      completedDevotions: completedDevotions ?? 0,
    });
  } catch {
    return NextResponse.json({ users: 0, stories: 0, testimonies: 0, prayers: 0, subscribers: 0, completedDevotions: 0 });
  }
}
