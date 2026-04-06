import { NextResponse } from "next/server";

/**
 * Returns the VAPID public key to the client.
 * Accepts both NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PUBLIC_KEY so admins
 * only need to set the key once (without the NEXT_PUBLIC_ prefix if preferred).
 */
export async function GET() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    "";

  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID_PUBLIC_KEY is not configured. Add it to your Vercel environment variables." },
      { status: 500 }
    );
  }

  // Validate: a VAPID public key is a URL-safe base64 string, ~87 chars
  const clean = publicKey.trim();
  if (clean.length < 80 || clean.length > 100) {
    return NextResponse.json(
      { error: `VAPID public key looks malformed (length ${clean.length}, expected ~87). Regenerate using the admin panel.` },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey: clean });
}
