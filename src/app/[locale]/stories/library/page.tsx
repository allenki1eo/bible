"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Story {
  id: string;
  hero: string;
  lesson: string;
  title: string;
  created_at: string;
}

export default function LibraryPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const isSw = locale === "sw";

  const fetchStories = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setStories(data);
      }
    } catch {
      setStories([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const deleteStory = async (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    try {
      const supabase = createBrowserClient();
      await supabase.from("stories").delete().eq("id", id);
    } catch {}
  };

  const heroEmojis: Record<string, string> = {
    david: "\u{1F3B5}",
    esther: "\u{1F451}",
    daniel: "\u{1F981}",
    ruth: "\u{1F33E}",
    joseph: "\u{1F308}",
    mary: "\u{1F54A}",
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t("stories.library_title")}</h1>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && stories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center space-y-4">
              <BookOpen
                size={48}
                className="text-muted-foreground/30 mx-auto"
              />
              <p className="text-muted-foreground text-sm">
                {t("stories.no_stories")}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                  {heroEmojis[story.hero] || "\u{1F4D6}"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {story.title}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {story.hero} &middot;{" "}
                    {new Date(story.created_at).toLocaleDateString()}
                  </p>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {t(`stories.lessons.${story.lesson}`)}
                  </Badge>
                </div>
                <button
                  onClick={() => deleteStory(story.id)}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash size={16} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
