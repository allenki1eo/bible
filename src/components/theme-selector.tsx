"use client";

import { useThemeStore, THEME_BACKGROUNDS } from "@/stores/theme-store";
import { Label } from "@/components/ui/label";

const BG_LABELS: Record<string, { name: string; palette: string[] }> = {
  none:    { name: "Default",  palette: [] },
  sunset1: { name: "Crimson",  palette: ["#c2440e", "#f97316", "#fed7aa"] },
  sunset2: { name: "Golden",   palette: ["#d97706", "#fbbf24", "#fef3c7"] },
  sunset3: { name: "Violet",   palette: ["#7c3aed", "#a855f7", "#ede9fe"] },
  sunset4: { name: "Twilight", palette: ["#1d4ed8", "#60a5fa", "#dbeafe"] },
};

export function ThemeSelector() {
  const background    = useThemeStore((s) => s.background);
  const setBackground = useThemeStore((s) => s.setBackground);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium block">Background theme</Label>

      <div className="grid grid-cols-2 gap-2.5">
        {THEME_BACKGROUNDS.map((bg) => {
          const meta = BG_LABELS[bg.id] ?? { name: bg.name, palette: [] };
          const active = background === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => setBackground(bg.id)}
              className={`relative rounded-xl overflow-hidden aspect-[4/3] transition-all duration-200 ${
                active
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-[1.03]"
                  : "opacity-80 hover:opacity-100 hover:scale-[1.02]"
              }`}
            >
              {/* Thumbnail */}
              {bg.id === "none" ? (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex flex-col items-center justify-center gap-1">
                  <span className="text-muted-foreground text-xs font-medium">Default</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-full bg-primary/60" />
                    <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />
                    <span className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  </div>
                </div>
              ) : (
                <>
                  <img src={bg.thumb} alt={meta.name} className="w-full h-full object-cover" />
                  {/* Glass card preview overlay */}
                  <div
                    className="absolute bottom-2 left-2 right-2 rounded-lg px-2 py-1"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-[10px] font-semibold drop-shadow">{meta.name}</span>
                      <div className="flex gap-0.5">
                        {meta.palette.map((c) => (
                          <span key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Active check */}
              {active && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info callout */}
      <p className="text-muted-foreground text-[11px] leading-relaxed">
        Frosted glass panels let the background breathe through every screen.
      </p>
    </div>
  );
}
