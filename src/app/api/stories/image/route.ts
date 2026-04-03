import { NextRequest, NextResponse } from "next/server";

const HERO_THEMES: Record<string, { bg: string; accent: string; icon: string; elements: string[] }> = {
  david: { bg: "#2D5016", accent: "#F59E0B", icon: "⚔", elements: ["shepherd", "hills", "sling", "sheep"] },
  esther: { bg: "#4A1942", accent: "#FBBF24", icon: "👑", elements: ["palace", "crown", "royal", "throne"] },
  daniel: { bg: "#1E3A5F", accent: "#60A5FA", icon: "🦁", elements: ["lions", "den", "prayer", "babylon"] },
  ruth: { bg: "#78350F", accent: "#FCD34D", icon: "🌾", elements: ["fields", "harvest", "grain", "countryside"] },
  joseph: { bg: "#1E40AF", accent: "#F59E0B", icon: "🌈", elements: ["coat", "egypt", "dreams", "stars"] },
  mary: { bg: "#1E3A5F", accent: "#93C5FD", icon: "🕊", elements: ["angel", "light", "stable", "star"] },
  moses: { bg: "#92400E", accent: "#F97316", icon: "🔥", elements: ["burning bush", "desert", "sea", "staff"] },
  noah: { bg: "#1E3A5F", accent: "#34D399", icon: "🚢", elements: ["ark", "rainbow", "animals", "rain"] },
  samson: { bg: "#7F1D1D", accent: "#FCA5A5", icon: "💪", elements: ["strength", "pillars", "lion", "temple"] },
  solomon: { bg: "#451A03", accent: "#FBBF24", icon: "📖", elements: ["temple", "wisdom", "throne", "gold"] },
  paul: { bg: "#1E3A5F", accent: "#A78BFA", icon: "✝", elements: ["road", "light", "letters", "church"] },
  peter: { bg: "#1E40AF", accent: "#67E8F9", icon: "🌊", elements: ["water", "waves", "boat", "fish"] },
  abraham: { bg: "#78350F", accent: "#FDE68A", icon: "⭐", elements: ["stars", "tent", "desert", "sacrifice"] },
  hannah: { bg: "#4C1D95", accent: "#C4B5FD", icon: "🙏", elements: ["temple", "prayer", "child", "joy"] },
};

const LESSON_COLORS: Record<string, string> = {
  sharing: "#3B82F6",
  bravery: "#EF4444",
  kindness: "#EC4899",
  forgiveness: "#A855F7",
  honesty: "#F59E0B",
  faith: "#10B981",
  obedience: "#6366F1",
  patience: "#14B8A6",
  love: "#EC4899",
  hope: "#F59E0B",
  prayer: "#8B5CF6",
  trust: "#06B6D4",
};

function generateStoryImage(hero: string, lesson: string, sceneDescription?: string): string {
  const heroKey = hero?.toLowerCase().replace(/\s+/g, "") || "";
  const theme = HERO_THEMES[heroKey] || { bg: "#1a1a2e", accent: "#6366F1", icon: "📖", elements: ["bible", "faith"] };
  const lessonColor = LESSON_COLORS[lesson?.toLowerCase()] || theme.accent;

  const cleanHero = hero.charAt(0).toUpperCase() + hero.slice(1);
  const cleanLesson = lesson.charAt(0).toUpperCase() + lesson.slice(1);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="576" viewBox="0 0 768 576">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.bg}"/>
          <stop offset="50%" style="stop-color:${adjustColor(theme.bg, -20)}"/>
          <stop offset="100%" style="stop-color:${adjustColor(theme.bg, -40)}"/>
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" style="stop-color:${lessonColor};stop-opacity:0.25"/>
          <stop offset="100%" style="stop-color:${lessonColor};stop-opacity:0"/>
        </radialGradient>
        <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${lessonColor};stop-opacity:0"/>
          <stop offset="50%" style="stop-color:${lessonColor};stop-opacity:0.6"/>
          <stop offset="100%" style="stop-color:${lessonColor};stop-opacity:0"/>
        </linearGradient>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="30"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="768" height="576" fill="url(#bg)"/>
      <rect width="768" height="576" fill="url(#centerGlow)"/>

      <!-- Decorative elements -->
      <circle cx="150" cy="120" r="60" fill="${lessonColor}" opacity="0.08" filter="url(#softBlur)"/>
      <circle cx="620" cy="450" r="90" fill="${theme.accent}" opacity="0.06" filter="url(#softBlur)"/>
      <circle cx="384" cy="288" r="150" fill="${lessonColor}" opacity="0.04" filter="url(#softBlur)"/>

      <!-- Top decorative line -->
      <rect x="284" y="140" width="200" height="2" fill="url(#accentLine)" rx="1"/>

      <!-- Hero icon -->
      <text x="384" y="210" text-anchor="middle" font-size="64" filter="url(#glow)">${theme.icon}</text>

      <!-- Hero name -->
      <text x="384" y="280" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="56" fill="${lessonColor}" font-weight="bold" letter-spacing="2">${cleanHero}</text>

      <!-- Lesson -->
      <text x="384" y="330" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="24" fill="#ffffff" opacity="0.7" font-style="italic">${cleanLesson}</text>

      <!-- Bottom decorative line -->
      <rect x="284" y="360" width="200" height="2" fill="url(#accentLine)" rx="1"/>

      <!-- Theme elements as subtle badges -->
      <g transform="translate(234, 390)">
        ${theme.elements.slice(0, 3).map((el, i) => `
          <rect x="${i * 110}" y="0" width="96" height="28" rx="14" fill="${lessonColor}" opacity="0.12"/>
          <text x="${i * 110 + 48}" y="19" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#ffffff" opacity="0.5" text-transform="capitalize">${el}</text>
        `).join("")}
      </g>

      <!-- Subtitle -->
      <text x="384" y="460" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="16" fill="#ffffff" opacity="0.3">Bible Story Illustration</text>
    </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

export async function POST(req: NextRequest) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  if (!hfKey) {
    const { hero, lesson, sceneDescription } = await req.json();
    return NextResponse.json({ image: generateStoryImage(hero || "Bible", lesson || "Faith", sceneDescription) });
  }

  try {
    const { hero, lesson, sceneDescription } = await req.json();

    const heroKey = hero?.toLowerCase().replace(/\s+/g, "") || "";
    const theme = HERO_THEMES[heroKey] || { elements: ["bible", "faith"] };
    const lessonColor = LESSON_COLORS[lesson?.toLowerCase()] || "#6366F1";

    // Build a rich, descriptive prompt for FLUX
    const scene = sceneDescription || `${hero} showing ${lesson}`;

    const prompt = `A beautiful children's book illustration in watercolor style. The scene shows: ${scene}. Theme: ${lesson}. Style: soft pastel colors, warm golden lighting, gentle and whimsical storybook art, suitable for young children. Color palette: ${lessonColor} as the main accent color. Mood: inspiring, gentle, faith-filled. Professional children's book illustration quality.`;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            guidance_scale: 7.5,
            num_inference_steps: 4,
          },
        }),
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

  // Fallback: generate themed SVG placeholder
  const { hero, lesson, sceneDescription } = await req.json().catch(() => ({ hero: "Bible", lesson: "Faith", sceneDescription: undefined }));
  return NextResponse.json({ image: generateStoryImage(hero || "Bible", lesson || "Faith", sceneDescription) });
}
