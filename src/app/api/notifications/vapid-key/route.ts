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

  const clean = publicKey.trim();

  // Decode the base64url string and validate it is a 65-byte uncompressed P-256
  // EC public key (byte 0 must be 0x04).
  try {
    // Convert base64url → base64 → Buffer
    const base64 = clean.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(base64, "base64");
    if (decoded.length !== 65) {
      return NextResponse.json(
        {
          error: `VAPID public key decodes to ${decoded.length} bytes, expected 65. ` +
            "Make sure you copied the PUBLIC key (not the private key) from the admin panel. " +
            "Regenerate and update VAPID_PUBLIC_KEY in your Vercel environment variables.",
        },
        { status: 500 }
      );
    }
    if (decoded[0] !== 0x04) {
      return NextResponse.json(
        {
          error: "VAPID public key is not an uncompressed P-256 EC point (first byte must be 0x04). " +
            "Regenerate and update VAPID_PUBLIC_KEY in your Vercel environment variables.",
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "VAPID public key is not valid base64url. Regenerate it from the admin panel." },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey: clean });
}
