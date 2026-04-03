"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function DevotionReaderPage({ params }: { params: Promise<{ date: string }> }) {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const [devotion, setDevotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => fetchDevotion(p.date));
  }, [params]);

  const fetchDevotion = useCallback(async (date: string) => {
    if (!user) { setLoading(false); return; }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("devotions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", date)
        .single();
      setDevotion(data);
    } catch {}
    setLoading(false);
  }, [user]);

  const moodEmojis: Record<string, string> = {
    struggling: "\u{1F614}", neutral: "\u{1F610}",
    peaceful: "\u{1F642}", joyful: "\u{1F60A}", seeking: "\u{1F64F}",
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse h-7 w-32 bg-muted rounded" />
          <div className="animate-pulse h-4 w-full bg-muted rounded" />
          <div className="animate-pulse h-4 w-3/4 bg-muted rounded" />
        </div>
      </PageWrapper>
    );
  }

  if (!devotion) {
    return (
      <PageWrapper>
        <div className="px-4 py-6">
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {isSw ? "Ibada haipatikani" : "Devotion not found"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              {isSw ? "Rudi" : "Go Back"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{isSw ? "Ibada Yangu" : "My Devotion"}</h1>
        </div>

        {/* Mood & Date */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{moodEmojis[devotion.mood] || "\u{1F4D6}"}</span>
          <div>
            <h2 className="font-semibold text-lg">
              {t(`devotions.moods.${devotion.mood}`) || devotion.mood}
            </h2>
            <p className="text-muted-foreground text-sm">{devotion.date}</p>
          </div>
          {devotion.completed && (
            <Badge variant="secondary" className="ml-auto gap-1">
              <Check size={12} weight="bold" />
              {isSw ? "Imekamilika" : "Completed"}
            </Badge>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">
            <Sparkle size={12} weight="fill" className="inline mr-1" />
            {isSw ? "Tafakari" : "Reflection"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
        </div>

        {/* Devotion Content */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <p className="text-[17px] leading-[1.85] text-foreground/90 whitespace-pre-line font-serif italic">
              {devotion.content}
            </p>
          </CardContent>
        </Card>

        {/* End ornament */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-muted-foreground/20" />
            <span className="text-muted-foreground/30 text-lg">\u2726</span>
            <div className="w-8 h-px bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
