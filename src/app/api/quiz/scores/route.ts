import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, score, totalQuestions, locale, streak } = body;

    if (!username || typeof score !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const supabase = getSupabase();
    const accuracy = totalQuestions > 0 ? Math.round((score / (totalQuestions * 150)) * 100) : 0;

    await supabase.from("quiz_leaderboard").insert({
      user_id: userId || null,
      username: username.slice(0, 30),
      score,
      total_questions: totalQuestions || 0,
      accuracy,
      locale: locale || "en",
      best_streak: streak || 0,
      played_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ bestScore: 0 });

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("quiz_leaderboard")
      .select("score")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ bestScore: data?.score ?? 0 });
  } catch {
    return NextResponse.json({ bestScore: 0 });
  }
}
