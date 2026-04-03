import { NextRequest, NextResponse } from "next/server";

// Generates a beautiful SVG placeholder as a data URL
function generateStoryImage(hero: string, lesson: string): string {
  const colors: Record<string, string> = {
    sharing: "#3B82F6",
    bravery: "#EF4444",
    kindness: "#EC4899",
    forgiveness: "#A855F7",
    honesty: "#F59E0B",
    faith: "#10B981",
    obedience: "#6366F1",
    patience: "#14B8A6",
  };

  const accent = colors[lesson?.toLowerCase()] || "#6366F1";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="576" viewBox="0 0 768 576">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="50%" style="stop-color:#16213e"/>
          <stop offset="100%" style="stop-color:#0f3460"/>
        </linearGradient>
        <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${accent};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${accent};stop-opacity:0.05"/>
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="40"/>
        </filter>
      </defs>
      <rect width="768" height="576" fill="url(#bg)"/>
      <circle cx="384" cy="288" r="200" fill="url(#glow)" filter="url(#blur)"/>
      <circle cx="200" cy="150" r="80" fill="${accent}" opacity="0.1" filter="url(#blur)"/>
      <circle cx="600" cy="400" r="120" fill="${accent}" opacity="0.08" filter="url(#blur)"/>
      <text x="384" y="260" text-anchor="middle" font-family="Georgia,serif" font-size="72" fill="${accent}" font-weight="bold">${hero}</text>
      <text x="384" y="320" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#ffffff" opacity="0.6">${lesson}</text>
      <text x="384" y="370" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#ffffff" opacity="0.3">Story Illustration</text>
      <rect x="334" y="390" width="100" height="2" fill="${accent}" opacity="0.3" rx="1"/>
    </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  if (!hfKey) {
    const { hero, lesson } = await req.json();
    return NextResponse.json({ image: generateStoryImage(hero || "Bible", lesson || "Faith") });
  }

  try {
    const { hero, lesson, sceneDescription } = await req.json();

    const scene = (sceneDescription || `${hero}, ${lesson}`)
      .replace(/[^a-zA-Z0-9\s,.\-]/g, "")
      .slice(0, 150);

    const prompt = `children's book watercolor illustration, ${scene}, ${lesson} theme, soft pastel, warm light, storybook style, whimsical, gentle`;

    // Try router endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return NextResponse.json({
          image: `data:image/png;base64,${buffer.toString("base64")}`,
        });
      }
    }

    const errText = await response.text();
    console.error("HF Image error:", response.status, errText);
  } catch (err) {
    console.error("HF Image error:", err);
  }

  // Fallback: generate SVG placeholder
  const { hero, lesson } = await req.json().catch(() => ({ hero: "Bible", lesson: "Faith" }));
  return NextResponse.json({ image: generateStoryImage(hero || "Bible", lesson || "Faith") });
}
