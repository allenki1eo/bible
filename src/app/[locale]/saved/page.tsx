"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookBookmark,
  BookOpen,
  Notebook,
  Fire,
  CaretRight,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function SavedPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const [stories, setStories] = useState<{ id: string; title: string; hero: string; lesson: string; created_at: string }[]>([]);
  const [devotions, setDevotions] = useState<{ id: string; date: string; mood: string; completed: boolean }[]>([]);
  const [prayers, setPrayers] = useState<{ id: string; encrypted_content: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user || user.isGuest) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createBrowserClient();
      const [s, d, p] = await Promise.all([
        supabase.from("stories").select("id, title, hero, lesson, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("devotions").select("id, date, mood, completed").eq("user_id", user.id).order("date", { ascending: false }).limit(30),
        supabase.from("prayers").select("id, encrypted_content, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (s.data) setStories(s.data);
      if (d.data) setDevotions(d.data);
      if (p.data) setPrayers(p.data);
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const heroEmojis = {
    david: "\uD83C\uDFB5", esther: "\uD83D\uDC51", daniel: "\uD83E\uDD81",
    ruth: "\uD83C\uDF3E", joseph: "\uD83C\uDF08", mary: "\uD83D\uDD4A",
    moses: "\uD83D\uDCA1", noah: "\uD83C\uDFA8", samson: "\uD83D\uDCAA",
    solomon: "\uD83D\uDCDA", paul: "\u2694\uFE0F", peter: "\uD83C\uDF0A",
    abraham: "\u2B50", hannah: "\uD83D\uDE4F",
  };

  const moodEmojis = {
    struggling: "\uD83D\uDE14", neutral: "\uD83D\uDE10",
    peaceful: "\uD83D\uDE42", joyful: "\uD83D\uDE0A", seeking: "\uD83D\uDE4F",
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{isSw ? "Vilivyohifadhiwa" : "Saved Content"}</h1>
        </div>

        {!user || user.isGuest ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {isSw ? "Ingia kuona vilivyohifadhiwa" : "Sign in to see your saved content"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="stories">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="stories">
                <BookBookmark size={14} className="mr-1" />
                {isSw ? "Hadithi" : "Stories"} ({stories.length})
              </TabsTrigger>
              <TabsTrigger value="devotions">
                <Fire size={14} className="mr-1" />
                {isSw ? "Ibada" : "Devotions"} ({devotions.length})
              </TabsTrigger>
              <TabsTrigger value="prayers">
                <Notebook size={14} className="mr-1" />
                {isSw ? "Maombi" : "Prayers"} ({prayers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories" className="space-y-2 mt-4">
              {loading ? (
                [1, 2].map((i) => (
                  <Card key={i}><CardContent className="p-4">
                    <div className="animate-pulse flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent></Card>
                ))
              ) : stories.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <BookBookmark size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {isSw ? "Hakuna hadithi zilizohifadhiwa" : "No saved stories yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stories.map((story) => (
                  <Link key={story.id} href={"/" + locale + "/stories/" + story.id}>
                    <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                          {heroEmojis[story.hero] || "\uD83D\uDCD6"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{story.title}</h3>
                          <p className="text-muted-foreground text-xs">{new Date(story.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">{t("stories.lessons." + story.lesson) || story.lesson}</Badge>
                        <CaretRight size={16} className="text-muted-foreground/30 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="devotions" className="space-y-2 mt-4">
              {devotions.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Fire size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {isSw ? "Hakuna ibada zilizohifadhiwa" : "No saved devotions yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                devotions.map((dev) => (
                  <Link key={dev.id} href={"/" + locale + "/devotions/" + dev.date}>
                    <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                          {moodEmojis[dev.mood] || "\uD83D\uDCD6"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{t("devotions.moods." + dev.mood) || dev.mood}</h3>
                          <p className="text-muted-foreground text-xs">{dev.date}</p>
                        </div>
                        {dev.completed && <Badge variant="secondary" className="text-[10px]">{isSw ? "Imekamilika" : "Done"}</Badge>}
                        <CaretRight size={16} className="text-muted-foreground/30 flex-shrink-0" />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="prayers" className="space-y-2 mt-4">
              {prayers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Notebook size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {isSw ? "Hakuna maombi yaliyohifadhiwa" : "No saved prayers yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                prayers.map((prayer) => (
                  <Card key={prayer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground text-xs">{new Date(prayer.created_at).toLocaleDateString()}</span>
                        <Badge variant={prayer.status === "answered" ? "secondary" : "outline"} className="text-[10px]">
                          {prayer.status === "answered" ? (isSw ? "Limejibiwa" : "Answered") : (isSw ? "Hai" : "Active")}
                        </Badge>
                      </div>
                      <p className="text-sm line-clamp-2">{prayer.encrypted_content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageWrapper>
  );
}
