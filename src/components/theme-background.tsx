"use client";

import { useThemeStore, THEME_BACKGROUNDS } from "@/stores/theme-store";
import { useEffect } from "react";

/**
 * Per-image colour profiles — tuned to each sunset photo's dominant palette.
 *
 * KEY PRINCIPLE:
 * Cards use a LIGHT, colour-tinted frost (not black) so the image shows
 * through the glass panel. This is what makes glassmorphism look beautiful
 * instead of like a dark overlay on top of a photo.
 *
 * Glass formula:
 *   background: rgba(image-tint, 0.10-0.15)
 *   backdrop-filter: blur(28px) saturate(200%) brightness(1.08)
 *   border: rgba(light-tint, 0.25-0.30)
 *   box-shadow: drop shadow + inset top highlight
 */
interface ImageProfile {
  vignette: string;      // Subtle edge darkening only — NOT a full dark overlay
  ambient: string;       // Faint glow matching the image's key colour
  cardGlass: string;     // Light translucent panel background
  cardBorder: string;    // Frosted border
  cardShadow: string;    // Drop shadow + inner top-edge highlight
  chromeGlass: string;   // Header / nav — slightly more opaque
  chromeBorder: string;
  surfaceMuted: string;  // Tags, inputs, skeleton backgrounds
  textPrimary: string;
  textMuted: string;
  textShadow: string;    // For h1/h2/h3 readability
  primaryBtn: string;    // Accent-matched CTA button
  primaryBtnText: string;
}

const PROFILES: Record<string, ImageProfile> = {
  // ── Warm orange/crimson sunset ────────────────────────────────────────────
  sunset1: {
    vignette: `linear-gradient(180deg,
      rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.04) 18%,
      rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.14) 78%,
      rgba(0,0,0,0.42) 100%)`,
    ambient: "radial-gradient(ellipse 80% 50% at 50% 28%, rgba(234,88,12,0.20) 0%, transparent 70%)",
    cardGlass:   "rgba(255,210,160,0.13)",
    cardBorder:  "rgba(255,195,130,0.30)",
    cardShadow:  "0 8px 32px rgba(100,30,0,0.22), inset 0 1px 0 rgba(255,220,170,0.38)",
    chromeGlass: "rgba(25,8,0,0.40)",
    chromeBorder:"rgba(255,185,110,0.22)",
    surfaceMuted:"rgba(255,195,140,0.10)",
    textPrimary: "rgba(255,248,235,0.97)",
    textMuted:   "rgba(255,225,190,0.64)",
    textShadow:  "0 1px 10px rgba(80,15,0,0.60)",
    primaryBtn:  "rgba(220,80,10,0.85)",
    primaryBtnText: "#fff8f0",
  },
  // ── Soft honey golden hour ────────────────────────────────────────────────
  sunset2: {
    vignette: `linear-gradient(180deg,
      rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.03) 20%,
      rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.10) 76%,
      rgba(0,0,0,0.38) 100%)`,
    ambient: "radial-gradient(ellipse 80% 50% at 50% 24%, rgba(251,191,36,0.18) 0%, transparent 70%)",
    cardGlass:   "rgba(255,238,190,0.14)",
    cardBorder:  "rgba(255,218,110,0.32)",
    cardShadow:  "0 8px 32px rgba(100,55,0,0.20), inset 0 1px 0 rgba(255,240,185,0.42)",
    chromeGlass: "rgba(20,10,0,0.36)",
    chromeBorder:"rgba(255,210,90,0.20)",
    surfaceMuted:"rgba(255,228,150,0.10)",
    textPrimary: "rgba(255,252,238,0.97)",
    textMuted:   "rgba(255,234,172,0.66)",
    textShadow:  "0 1px 10px rgba(80,40,0,0.55)",
    primaryBtn:  "rgba(210,115,0,0.88)",
    primaryBtnText: "#fffaf0",
  },
  // ── Vibrant violet/purple sunset ─────────────────────────────────────────
  sunset3: {
    vignette: `linear-gradient(180deg,
      rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.04) 20%,
      rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.12) 76%,
      rgba(0,0,0,0.42) 100%)`,
    ambient: "radial-gradient(ellipse 80% 50% at 50% 28%, rgba(168,85,247,0.20) 0%, transparent 70%)",
    cardGlass:   "rgba(230,195,255,0.12)",
    cardBorder:  "rgba(200,155,255,0.30)",
    cardShadow:  "0 8px 32px rgba(50,0,110,0.25), inset 0 1px 0 rgba(220,185,255,0.40)",
    chromeGlass: "rgba(18,0,38,0.40)",
    chromeBorder:"rgba(178,125,255,0.22)",
    surfaceMuted:"rgba(210,175,255,0.10)",
    textPrimary: "rgba(250,244,255,0.97)",
    textMuted:   "rgba(218,195,255,0.66)",
    textShadow:  "0 1px 10px rgba(40,0,80,0.58)",
    primaryBtn:  "rgba(124,58,237,0.88)",
    primaryBtnText: "#faf5ff",
  },
  // ── Cool blue/pink twilight ───────────────────────────────────────────────
  sunset4: {
    vignette: `linear-gradient(180deg,
      rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.03) 20%,
      rgba(0,0,0,0.00) 50%, rgba(0,0,0,0.11) 76%,
      rgba(0,0,0,0.38) 100%)`,
    ambient: "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(59,130,246,0.16) 0%, transparent 70%)",
    cardGlass:   "rgba(195,218,255,0.12)",
    cardBorder:  "rgba(155,198,255,0.28)",
    cardShadow:  "0 8px 32px rgba(0,25,75,0.22), inset 0 1px 0 rgba(198,218,255,0.40)",
    chromeGlass: "rgba(0,8,28,0.38)",
    chromeBorder:"rgba(118,175,255,0.20)",
    surfaceMuted:"rgba(178,208,255,0.10)",
    textPrimary: "rgba(238,245,255,0.97)",
    textMuted:   "rgba(188,213,255,0.66)",
    textShadow:  "0 1px 10px rgba(0,18,60,0.58)",
    primaryBtn:  "rgba(29,78,216,0.88)",
    primaryBtnText: "#eff6ff",
  },
};

export function ThemeBackground() {
  const background = useThemeStore((s) => s.background);
  const loadTheme  = useThemeStore((s) => s.loadTheme);

  useEffect(() => { loadTheme(); }, [loadTheme]);

  const bg = THEME_BACKGROUNDS.find((b) => b.id === background);

  // ── No background → default solid theme ───────────────────────────────────
  if (!bg?.src) {
    if (typeof document !== "undefined") document.body.removeAttribute("data-bg");
    return <style>{`body { background: hsl(var(--background)) !important; }`}</style>;
  }

  // Mark body so CSS is scoped to bg-active state only
  if (typeof document !== "undefined") document.body.setAttribute("data-bg", bg.id);

  const p = PROFILES[bg.id] ?? PROFILES.sunset1;

  return (
    <>
      {/* 1 ── Raw image — full-bleed, no blur, no dark filter */}
      <div
        aria-hidden
        className="fixed inset-0 -z-30 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bg.src})` }}
      />

      {/* 2 ── Subtle vignette — darkens only the very edges */}
      <div aria-hidden className="fixed inset-0 -z-20 pointer-events-none" style={{ background: p.vignette }} />

      {/* 3 ── Faint ambient colour pulse — barely visible */}
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none" style={{ background: p.ambient }} />

      {/* 4 ── Scoped style overrides */}
      <style>{`
        /* Body transparent — image is the background */
        body[data-bg] {
          background: transparent !important;
        }

        /* ── Cards — light frosted glass, image visible through panel ─── */
        body[data-bg] .bg-card {
          background: ${p.cardGlass} !important;
          backdrop-filter: blur(28px) saturate(200%) brightness(1.08) !important;
          -webkit-backdrop-filter: blur(28px) saturate(200%) brightness(1.08) !important;
          border-color: ${p.cardBorder} !important;
          box-shadow: ${p.cardShadow} !important;
        }

        /* ── Elevated panels (modals, popovers) — slightly richer glass ─ */
        body[data-bg] .bg-popover,
        body[data-bg] [role="dialog"],
        body[data-bg] [data-radix-popper-content-wrapper] > div {
          background: ${p.chromeGlass} !important;
          backdrop-filter: blur(36px) saturate(210%) !important;
          -webkit-backdrop-filter: blur(36px) saturate(210%) !important;
          border-color: ${p.chromeBorder} !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 ${p.cardBorder} !important;
        }

        /* ── Page background surfaces ──────────────────────────────────── */
        body[data-bg] .bg-background {
          background: rgba(0,0,0,0.12) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }

        /* ── Top bar ───────────────────────────────────────────────────── */
        body[data-bg] header {
          background: ${p.chromeGlass} !important;
          backdrop-filter: blur(36px) saturate(210%) !important;
          -webkit-backdrop-filter: blur(36px) saturate(210%) !important;
          border-bottom-color: ${p.chromeBorder} !important;
          box-shadow: 0 1px 0 ${p.chromeBorder}, 0 4px 24px rgba(0,0,0,0.15) !important;
        }

        /* ── Floating bottom nav pill ──────────────────────────────────── */
        body[data-bg] nav.fixed > div > div {
          background: ${p.chromeGlass} !important;
          backdrop-filter: blur(36px) saturate(220%) !important;
          -webkit-backdrop-filter: blur(36px) saturate(220%) !important;
          border-color: ${p.chromeBorder} !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 ${p.cardBorder} !important;
        }

        /* ── Muted surfaces ────────────────────────────────────────────── */
        body[data-bg] .bg-muted {
          background: ${p.surfaceMuted} !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
        body[data-bg] .bg-muted\\/50,
        body[data-bg] .bg-muted\\/40,
        body[data-bg] .bg-muted\\/30 {
          background: ${p.surfaceMuted} !important;
        }

        /* ── Inputs & textareas ────────────────────────────────────────── */
        body[data-bg] input,
        body[data-bg] textarea,
        body[data-bg] select {
          background: ${p.surfaceMuted} !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          border-color: ${p.cardBorder} !important;
          color: ${p.textPrimary} !important;
        }
        body[data-bg] input::placeholder,
        body[data-bg] textarea::placeholder {
          color: ${p.textMuted} !important;
          opacity: 1 !important;
        }
        body[data-bg] input:focus,
        body[data-bg] textarea:focus {
          border-color: rgba(255,255,255,0.42) !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.10) !important;
          outline: none !important;
        }

        /* ── Typography ────────────────────────────────────────────────── */
        body[data-bg] .text-foreground    { color: ${p.textPrimary} !important; }
        body[data-bg] .text-card-foreground { color: ${p.textPrimary} !important; }
        body[data-bg] .text-muted-foreground { color: ${p.textMuted} !important; }
        body[data-bg] h1, body[data-bg] h2, body[data-bg] h3 {
          text-shadow: ${p.textShadow} !important;
        }

        /* ── Primary CTA buttons ───────────────────────────────────────── */
        body[data-bg] .bg-primary {
          background: ${p.primaryBtn} !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.28) !important;
          border-color: transparent !important;
        }
        body[data-bg] .text-primary-foreground { color: ${p.primaryBtnText} !important; }

        /* ── Active nav / accent colour ────────────────────────────────── */
        body[data-bg] .text-primary {
          color: ${p.textPrimary} !important;
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.35));
        }
        body[data-bg] .bg-primary\\/12,
        body[data-bg] .bg-primary\\/10,
        body[data-bg] .bg-primary\\/8 {
          background: rgba(255,255,255,0.14) !important;
        }

        /* ── Borders ───────────────────────────────────────────────────── */
        body[data-bg] .border         { border-color: ${p.cardBorder} !important; }
        body[data-bg] .border-border  { border-color: ${p.cardBorder} !important; }

        /* ── Tabs ──────────────────────────────────────────────────────── */
        body[data-bg] [role="tablist"] {
          background: ${p.surfaceMuted} !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }
        body[data-bg] [data-state="active"][role="tab"] {
          background: rgba(255,255,255,0.20) !important;
          box-shadow: 0 1px 6px rgba(0,0,0,0.15) !important;
        }

        /* ── Skeleton loading ──────────────────────────────────────────── */
        body[data-bg] .animate-pulse {
          background: rgba(255,255,255,0.08) !important;
        }

        /* ── Scrollbar ─────────────────────────────────────────────────── */
        body[data-bg] ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.22) !important;
          border-radius: 6px;
        }
        body[data-bg] ::-webkit-scrollbar-track { background: transparent !important; }
      `}</style>
    </>
  );
}
