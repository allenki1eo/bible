import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60; // cache 1 minute

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";
  const userId = req.nextUrl.searchParams.get("userId") ?? "";

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get best score per user (deduplicated)
    const { data: raw } = await supabase
      .from("quiz_leaderboard")
      .select("user_id, username, score, best_streak, accuracy, locale, played_at")
      .order("score", { ascending: false })
      .limit(200);

    if (!raw) return NextResponse.json({ entries: [], userRank: null });

    // Deduplicate — keep highest score per user_id (or username for anonymous)
    const seen = new Map<string, typeof raw[0]>();
    for (const row of raw) {
      const key = row.user_id || `anon:${row.username}`;
      if (!seen.has(key)) seen.set(key, row);
    }

    const entries = Array.from(seen.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 25)
      .map((e, i) => ({ rank: i + 1, ...e }));

    // Find user's rank in full deduplicated list
    let userRank: number | null = null;
    if (userId) {
      const allSorted = Array.from(seen.values()).sort((a, b) => b.score - a.score);
      const idx = allSorted.findIndex((e) => e.user_id === userId);
      if (idx !== -1) userRank = idx + 1;
    }

    return NextResponse.json({ entries, userRank });
  } catch {
    return NextResponse.json({ entries: [], userRank: null });
  }
}
