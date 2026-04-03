import { NextRequest, NextResponse } from "next/server";

// HF free tier doesn't support TTS models.
// The client-side Web Speech API is used instead (free, offline-capable).
// This route exists for completeness but returns a redirect to use browser TTS.
export async function POST(_req: NextRequest) {
  return NextResponse.json({
    audio: null,
    useBrowserTTS: true,
    message: "Use browser SpeechSynthesis API instead",
  });
}
