"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkle, Sun, Moon, Coffee } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Devotion {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  content: string;
  scripture_ref: string;
  completed: boolean;
}

type ReadingMode = "default" | "sepia" | "dark";

const MODE_STYLES: Record<ReadingMode, { wrapper: string; card: string; text: string }> = {
  default: { wrapper: "", card: "border-primary/20 bg-card", text: "text-foreground/90" },
  sepia: { wrapper: "bg-[#f5ead0]", card: "bg-[#fdf3dc] border-[#d4b896]/40", text: "text-[#5c3d1e]" },
  dark: { wrapper: "bg-[#0d1117]", card: "bg-[#161b22] border-gray-700/40", text: "text-gray-200" },
};

export default function DevotionReaderPage({ params }: { params: Promise<{ date: string }> }) {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const [devotion, setDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("default");

  useEffect(() => {
    const saved = localStorage.getItem("nuru_reading_mode") as ReadingMode | null;
    if (saved && ["default", "sepia", "dark"].includes(saved)) setReadingMode(saved);
  }, []);

  const setMode = (mode: ReadingMode) => {
    setReadingMode(mode);
    localStorage.setItem("nuru_reading_mode", mode);
  };

  useEffect(() => { params.then((p) => fetchDevotion(p.date)); }, [params]);

  const fetchDevotion = useCallback(async (date: string) => {
    if (!user) { setLoading(false); return; }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("devotions").select("*")
        .eq("user_id", user.id).eq("date", date).single();
      setDevotion(data);
    } catch {}
    setLoading(false);
  }, [user]);

  const moodEmojis: Record<string, string> = {
    struggling: "😔", neutral: "😐", peaceful: "🙂", joyful: "😊", seeking: "🙏",
  };

  const styles = MODE_STYLES[readingMode];

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-4">
          {[32, 100, 75].map((w, i) => (
            <div key={i} className={`animate-pulse h-4 bg-muted rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>
      </PageWrapper>
    );
  }

  if (!devotion) {
    return (
      <PageWrapper>
        <div className="px-4 py-20 text-center">
          <p className="text-muted-foreground">{isSw ? "Ibada haipatikani" : "Devotion not found"}</p>
          <Button onClick={() => router.back()} className="mt-4">{isSw ? "Rudi" : "Go Back"}</Button>
        </div>
      </PageWrapper>
    );
  }

  const inner = (
    <div className={`min-h-dvh transition-colors duration-300 ${styles.wrapper}`}>
      <div className="px-4 py-6 space-y-6 page-enter max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <ArrowLeft size={20} className={readingMode !== "default" ? styles.text : "text-muted-foreground"} />
            </button>
            <h1 className={`text-xl font-bold ${readingMode !== "default" ? styles.text : ""}`}>
              {isSw ? "Ibada Yangu" : "My Devotion"}
            </h1>
          </div>

          {/* Reading mode switcher */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border/50 bg-muted/40 p-1">
            {([
              { mode: "default" as const, icon: <Sun size={13} />, title: "Default" },
              { mode: "sepia" as const, icon: <Coffee size={13} />, title: "Sepia" },
              { mode: "dark" as const, icon: <Moon size={13} />, title: "Night" },
            ] as const).map(({ mode, icon, title }) => (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                title={title}
                className={`rounded-lg p-1.5 transition-colors ${
                  readingMode === mode ? "bg-background shadow-sm" : "hover:bg-background/40"
                }`}
              >
                <span className="text-foreground/60">{icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood & Date */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{moodEmojis[devotion.mood] || "📖"}</span>
          <div>
            <h2 className={`font-semibold text-lg ${readingMode !== "default" ? styles.text : ""}`}>
              {t(`devotions.moods.${devotion.mood}`) || devotion.mood}
            </h2>
            <p className={`text-sm opacity-60 ${readingMode !== "default" ? styles.text : "text-muted-foreground"}`}>
              {devotion.date}
            </p>
          </div>
          {devotion.completed && (
            <Badge variant="secondary" className="ml-auto gap-1">
              <Check size={12} weight="bold" />
              {isSw ? "Imekamilika" : "Completed"}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">
            <Sparkle size={11} weight="fill" className="inline mr-1" />
            {isSw ? "Tafakari" : "Reflection"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
        </div>

        {/* Content */}
        <div className={`rounded-2xl border p-6 ${styles.card}`}>
          <p className={`text-[18px] leading-[2] whitespace-pre-line font-serif italic ${styles.text}`}>
            {devotion.content}
          </p>
        </div>

        {/* Ornament */}
        <div className="flex justify-center items-center gap-3 py-4">
          <div className="w-8 h-px bg-muted-foreground/20" />
          <span className="text-muted-foreground/30 text-lg">✦</span>
          <div className="w-8 h-px bg-muted-foreground/20" />
        </div>
      </div>
    </div>
  );

  if (readingMode !== "default") return inner;
  return <PageWrapper>{inner}</PageWrapper>;
}
