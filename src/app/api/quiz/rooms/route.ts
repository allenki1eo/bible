import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// POST — create a new battle room
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { hostName, questions, locale } = body;

  if (!hostName || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Missing hostName or questions" }, { status: 400 });
  }

  const db = supabase();
  let code = generateCode();

  // Ensure unique code
  for (let i = 0; i < 5; i++) {
    const { data } = await db.from("quiz_rooms").select("code").eq("code", code).single();
    if (!data) break;
    code = generateCode();
  }

  const { data, error } = await db.from("quiz_rooms").insert({
    code,
    host_name: hostName.slice(0, 24),
    guest_name: null,
    questions,
    host_score: 0,
    guest_score: 0,
    host_answers: [],
    guest_answers: [],
    host_finished: false,
    guest_finished: false,
    status: "waiting",
    locale: locale || "en",
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) {
    console.error("quiz_rooms insert error:", error);
    return NextResponse.json({ error: "Failed to create room. Ensure quiz_rooms table exists." }, { status: 500 });
  }

  return NextResponse.json({ code: data.code, roomId: data.id });
}

// GET — fetch room by code
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.toUpperCase();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const db = supabase();
  const { data, error } = await db
    .from("quiz_rooms")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — join room, submit score, or finish
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { code, action, guestName, score, answers } = body;

  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const upperCode = code.toUpperCase();
  const db = supabase();

  if (action === "join") {
    if (!guestName) return NextResponse.json({ error: "Missing guestName" }, { status: 400 });
    const { data: room } = await db.from("quiz_rooms").select("status, guest_name").eq("code", upperCode).single();
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
    if (room.status === "finished") return NextResponse.json({ error: "Room has ended" }, { status: 410 });
    if (room.guest_name) return NextResponse.json({ error: "Room is full" }, { status: 409 });

    await db.from("quiz_rooms").update({ guest_name: guestName.slice(0, 24), status: "playing" }).eq("code", upperCode);
    return NextResponse.json({ ok: true });
  }

  if (action === "host_finish") {
    await db.from("quiz_rooms").update({
      host_score: score ?? 0,
      host_answers: answers ?? [],
      host_finished: true,
    }).eq("code", upperCode);
    // Check if both finished
    const { data } = await db.from("quiz_rooms").select("guest_finished").eq("code", upperCode).single();
    if (data?.guest_finished) await db.from("quiz_rooms").update({ status: "finished" }).eq("code", upperCode);
    return NextResponse.json({ ok: true });
  }

  if (action === "guest_finish") {
    await db.from("quiz_rooms").update({
      guest_score: score ?? 0,
      guest_answers: answers ?? [],
      guest_finished: true,
    }).eq("code", upperCode);
    const { data } = await db.from("quiz_rooms").select("host_finished").eq("code", upperCode).single();
    if (data?.host_finished) await db.from("quiz_rooms").update({ status: "finished" }).eq("code", upperCode);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
