"use client";

import { useThemeStore, THEME_BACKGROUNDS } from "@/stores/theme-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeSelector() {
  const background = useThemeStore((s) => s.background);
  const liquidGlass = useThemeStore((s) => s.liquidGlass);
  const setBackground = useThemeStore((s) => s.setBackground);
  const setLiquidGlass = useThemeStore((s) => s.setLiquidGlass);

  return (
    <div className="space-y-4">
      {/* Background images */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Background</Label>
        <div className="grid grid-cols-2 gap-3">
          {THEME_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setBackground(bg.id)}
              className={`relative rounded-lg overflow-hidden aspect-[4/3] border-2 transition-all ${
                background === bg.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {bg.id === "none" ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Default</span>
                </div>
              ) : (
                <img
                  src={bg.thumb}
                  alt={bg.name}
                  className="w-full h-full object-cover"
                />
              )}
              {background === bg.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Liquid glass toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border">
        <div>
          <Label className="text-sm font-medium">Liquid Glass</Label>
          <p className="text-muted-foreground text-xs mt-0.5">
            Frosted glass effect on UI elements
          </p>
        </div>
        <Switch checked={liquidGlass} onCheckedChange={setLiquidGlass} />
      </div>
    </div>
  );
}
