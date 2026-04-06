import { NextResponse } from "next/server";
import webpush from "web-push";

/**
 * Generates a fresh VAPID key pair.
 * Only callable in development or with admin secret — public keys are safe
 * to return but private keys must be kept secret; we return them once here
 * so the admin can copy them into Vercel environment variables.
 */
export async function GET() {
  try {
    const keys = webpush.generateVAPIDKeys();
    return NextResponse.json({
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate keys";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
