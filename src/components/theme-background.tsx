"use client";

import { useThemeStore, THEME_BACKGROUNDS } from "@/stores/theme-store";
import { useEffect } from "react";

interface ImageColors {
  overlay: string;
  cardBg: string;
  headerBg: string;
  navBg: string;
  accentGlow: string;
  textColor: string;
  mutedText: string;
  borderColor: string;
}

// Pre-computed color profiles for each background image
const IMAGE_PROFILES: Record<string, ImageColors> = {
  sunset1: {
    // Deep warm sunset — dark orange/red tones
    overlay: "rgba(0, 0, 0, 0.15)",
    cardBg: "rgba(0, 0, 0, 0.55)",
    headerBg: "rgba(0, 0, 0, 0.45)",
    navBg: "rgba(0, 0, 0, 0.5)",
    accentGlow: "rgba(234, 88, 12, 0.15)",
    textColor: "rgba(255, 255, 255, 0.95)",
    mutedText: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sunset2: {
    // Soft golden hour — warm yellow/pink
    overlay: "rgba(0, 0, 0, 0.1)",
    cardBg: "rgba(0, 0, 0, 0.5)",
    headerBg: "rgba(0, 0, 0, 0.4)",
    navBg: "rgba(0, 0, 0, 0.45)",
    accentGlow: "rgba(245, 158, 11, 0.15)",
    textColor: "rgba(255, 255, 255, 0.95)",
    mutedText: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sunset3: {
    // Vibrant purple/orange sunset
    overlay: "rgba(0, 0, 0, 0.12)",
    cardBg: "rgba(0, 0, 0, 0.52)",
    headerBg: "rgba(0, 0, 0, 0.42)",
    navBg: "rgba(0, 0, 0, 0.48)",
    accentGlow: "rgba(168, 85, 247, 0.15)",
    textColor: "rgba(255, 255, 255, 0.95)",
    mutedText: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sunset4: {
    // Cool blue/pink twilight
    overlay: "rgba(0, 0, 0, 0.1)",
    cardBg: "rgba(0, 0, 0, 0.48)",
    headerBg: "rgba(0, 0, 0, 0.38)",
    navBg: "rgba(0, 0, 0, 0.42)",
    accentGlow: "rgba(59, 130, 246, 0.15)",
    textColor: "rgba(255, 255, 255, 0.95)",
    mutedText: "rgba(255, 255, 255, 0.55)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
};

export function ThemeBackground() {
  const background = useThemeStore((s) => s.background);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const bg = THEME_BACKGROUNDS.find((b) => b.id === background);

  // No custom background — show default solid theme
  if (!bg || !bg.src) {
    return (
      <style>{`
        body { background: hsl(var(--background)) !important; }
      `}</style>
    );
  }

  const profile = IMAGE_PROFILES[bg.id] || IMAGE_PROFILES.sunset1;

  return (
    <>
      {/* Background image — no parallax, just static cover */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bg.src})` }}
      />

      {/* Gradient overlay matching image tones */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, ${profile.overlay} 0%, transparent 30%, transparent 70%, ${profile.overlay} 100%),
            radial-gradient(ellipse at 50% 0%, ${profile.accentGlow} 0%, transparent 60%)
          `,
        }}
      />

      {/* Liquid Glass CSS with image-specific colors */}
      <style>{`
        body {
          background: transparent !important;
          color: ${profile.textColor} !important;
        }

        /* Cards — frosted glass panels */
        .bg-card {
          background: ${profile.cardBg} !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid ${profile.borderColor} !important;
        }

        /* Background surfaces */
        .bg-background {
          background: rgba(0, 0, 0, 0.3) !important;
          backdrop-filter: blur(16px) saturate(160%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
        }

        /* Header / top bar */
        header {
          background: ${profile.headerBg} !important;
          backdrop-filter: blur(24px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
          border-bottom: 1px solid ${profile.borderColor} !important;
        }

        /* Bottom navigation */
        nav.fixed {
          background: ${profile.navBg} !important;
          backdrop-filter: blur(24px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
          border-top: 1px solid ${profile.borderColor} !important;
        }

        /* Popover / dropdowns */
        .bg-popover {
          background: rgba(0, 0, 0, 0.7) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border: 1px solid ${profile.borderColor} !important;
        }

        /* Muted surfaces */
        .bg-muted {
          background: rgba(255, 255, 255, 0.06) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }

        /* Text colors */
        .text-foreground, .text-primary {
          color: ${profile.textColor} !important;
        }

        .text-muted-foreground {
          color: ${profile.mutedText} !important;
        }

        /* Inputs */
        input, textarea {
          background: rgba(255, 255, 255, 0.06) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          border: 1px solid ${profile.borderColor} !important;
          color: ${profile.textColor} !important;
        }

        input:focus, textarea:focus {
          border-color: rgba(255, 255, 255, 0.25) !important;
        }

        /* Tabs list */
        [role="tablist"] {
          background: rgba(255, 255, 255, 0.06) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
        }

        /* Active tab */
        [data-state="active"] {
          background: rgba(255, 255, 255, 0.15) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
        }

        /* Dialog / modal */
        [role="dialog"] {
          background: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: blur(24px) saturate(200%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(200%) !important;
          border: 1px solid ${profile.borderColor} !important;
        }

        /* Skeleton loading */
        .animate-pulse {
          background: rgba(255, 255, 255, 0.06) !important;
        }

        /* Badge outlines */
        .border {
          border-color: ${profile.borderColor} !important;
        }

        /* Scrollbar */
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
    </>
  );
}
