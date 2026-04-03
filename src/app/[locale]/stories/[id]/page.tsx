"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Pause,
  SpeakerHigh,
  Palette,
  FloppyDisk,
  Trash,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { DrawingCanvas } from "@/components/drawing-canvas";
import { useToast } from "@/components/toast";

export default function StoryReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const { toast } = useToast();
  const isSw = locale === "sw";

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [drawingOpen, setDrawingOpen] = useState(false);

  useEffect(() => {
    params.then((p) => fetchStory(p.id));
  }, [params]);

  const fetchStory = useCallback(async (id: string) => {
    if (!user) { setLoading(false); return; }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();
      setStory(data);
    } catch {}
    setLoading(false);
  }, [user]);

  const deleteStory = async () => {
    if (!story || !user) return;
    try {
      const supabase = createBrowserClient();
      await supabase.from("stories").delete().eq("id", story.id);
      toast(isSw ? "Hadithi imefutwa" : "Story deleted", "info");
      router.back();
    } catch {}
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse h-7 w-32 bg-muted rounded" />
          <div className="animate-pulse h-48 bg-muted rounded-lg" />
          <div className="animate-pulse h-4 w-full bg-muted rounded" />
          <div className="animate-pulse h-4 w-3/4 bg-muted rounded" />
        </div>
      </PageWrapper>
    );
  }

  if (!story) {
    return (
      <PageWrapper>
        <div className="px-4 py-6">
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              {isSw ? "Hadithi haipatikani" : "Story not found"}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              {isSw ? "Rudi" : "Go Back"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const heroEmojis: Record<string, string> = {
    david: "\u{1F3B5}", esther: "\u{1F451}", daniel: "\u{1F981}",
    ruth: "\u{1F33E}", joseph: "\u{1F308}", mary: "\u{1F54A}",
    moses: "\u{1F4A1}", noah: "\u{1F3A8}", samson: "\u{1F4AA}",
    solomon: "\u{1F4DA}", paul: "\u2694\uFE0F", peter: "\u{1F30A}",
    abraham: "\u2B50", hannah: "\u{1F64F}",
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={deleteStory}>
              <Trash size={18} className="text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Story Image */}
        {story.image_url ? (
          <div className="-mx-4 -mt-6 overflow-hidden">
            <img src={story.image_url} alt={story.title} className="w-full aspect-[4/3] object-cover" />
          </div>
        ) : (
          <div className="-mx-4 -mt-6 overflow-hidden">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl">{heroEmojis[story.hero] || "\u{1F4D6}"}</div>
                <p className="text-muted-foreground text-sm">
                  {isSw ? "Taswira haipatikani" : "Image not available"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline">{story.hero}</Badge>
            <Badge variant="secondary">
              {t(`stories.lessons.${story.lesson}`) || story.lesson}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{story.title}</h1>
          <p className="text-muted-foreground text-xs mt-2">
            {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Audio */}
        {story.audio_url && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <button
              onClick={() => {
                const audio = new Audio(story.audio_url);
                if (playing) { audio.pause(); setPlaying(false); }
                else { audio.play(); setPlaying(true); }
              }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              {playing
                ? <Pause size={18} className="text-primary" weight="fill" />
                : <Play size={18} className="text-primary ml-0.5" weight="fill" />}
            </button>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs">
                {t("stories.play_audio")} &middot; {story.language === "sw" ? "Kiswahili" : "English"}
              </p>
            </div>
            <SpeakerHigh size={16} className="text-muted-foreground" />
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">
            {isSw ? "Hadithi" : "The Story"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
        </div>

        {/* Story Content */}
        <div className="py-4">
          <div className="space-y-6">
            {story.content?.split("\n\n").map((paragraph: string, i: number) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (i === 0) {
                const firstChar = trimmed.charAt(0);
                const rest = trimmed.slice(1);
                return (
                  <p key={i} className="text-[17px] leading-[1.85] text-foreground/90">
                    <span className="float-left text-5xl font-bold text-primary leading-[0.8] mr-2 mt-1 font-serif">
                      {firstChar}
                    </span>
                    {rest}
                  </p>
                );
              }

              if (trimmed.toUpperCase().includes("SCRIPTURE") || trimmed.toUpperCase().includes("MAANDIKO")) {
                return (
                  <div key={i} className="my-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                        {isSw ? "Maandiko" : "Scripture References"}
                      </span>
                      <div className="flex-1 h-px bg-primary/20" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {trimmed}
                    </p>
                  </div>
                );
              }

              return (
                <p key={i} className="text-[17px] leading-[1.85] text-foreground/90">
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>

        {/* End ornament */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-muted-foreground/20" />
            <span className="text-muted-foreground/30 text-lg">\u2726</span>
            <div className="w-8 h-px bg-muted-foreground/20" />
          </div>
        </div>

        {/* Draw button */}
        <Button variant="outline" className="w-full gap-2" size="lg" onClick={() => setDrawingOpen(true)}>
          <Palette size={20} />
          {t("stories.draw_with_story")}
        </Button>

        {/* Drawing Canvas */}
        <DrawingCanvas
          isOpen={drawingOpen}
          onClose={() => setDrawingOpen(false)}
          backgroundImage={story.image_url}
        />
      </div>
    </PageWrapper>
  );
}
