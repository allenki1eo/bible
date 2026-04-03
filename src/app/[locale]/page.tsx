"use client";

import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  UsersThree,
  BookBookmark,
  Fire,
  ArrowRight,
  Sparkle,
  Sun,
  Moon,
  CloudSun,
  Clock,
  FileText,
  Megaphone,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { createBrowserClient } from "@/lib/supabase-browser";

interface Verse {
  text: string;
  ref: string;
}

interface DashboardStats {
  streak: number;
  stories: number;
  testimonies: number;
}

interface RecentActivity {
  type: "devotion" | "story";
  title: string;
  date: string;
  icon: string;
}

function TimeIcon() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return <Sun size={20} weight="fill" className="text-amber-500" />;
  }
  if (hour >= 12 && hour < 17) {
    return <CloudSun size={20} weight="fill" className="text-orange-400" />;
  }
  return <Moon size={20} weight="fill" className="text-indigo-400" />;
}

function TimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export default function HomePage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const pathname = usePathname();
  const [verse, setVerse] = useState<Verse | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ streak: 0, stories: 0, testimonies: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const isSw = locale === "sw";

  // Fetch verse
  useEffect(() => {
    const fetchVerse = async () => {
      setVerseLoading(true);
      try {
        const res = await fetch(`/api/bible/verse?lang=${locale}`);
        if (res.ok) {
          const data = await res.json();
          setVerse({ text: data.text, ref: data.ref });
        }
      } catch {
        setVerse(
          isSw
            ? { text: "Kwa maana najua mawazo ninayowawazia, asema BWANA, ndiyo mawazo ya amani.", ref: "Yeremia 29:11" }
            : { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", ref: "Jeremiah 29:11" }
        );
      }
      setVerseLoading(false);
    };
    fetchVerse();
  }, [locale, isSw]);

  // Fetch stats + recent activity
  const fetchDashboard = useCallback(async () => {
    if (!user || user.isGuest) {
      setStatsLoading(false);
      return;
    }

    try {
      const supabase = createBrowserClient();

      // Streak
      const { data: streakData } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .single();

      // Stories count
      const { count: storiesCount } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Testimonies count
      const { count: testimoniesCount } = await supabase
        .from("testimonies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        streak: streakData?.current_streak || 0,
        stories: storiesCount || 0,
        testimonies: testimoniesCount || 0,
      });

      // Recent activity
      const activities: RecentActivity[] = [];

      // Last devotion
      const { data: lastDevotion } = await supabase
        .from("devotions")
        .select("date, mood")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (lastDevotion) {
        activities.push({
          type: "devotion",
          title: lastDevotion.mood
            ? t(`devotions.moods.${lastDevotion.mood}`)
            : (isSw ? "Ibada ya leo" : "Today's devotion"),
          date: lastDevotion.date,
          icon: "\u{1F4D6}",
        });
      }

      // Last story
      const { data: lastStory } = await supabase
        .from("stories")
        .select("title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastStory) {
        activities.push({
          type: "story",
          title: lastStory.title,
          date: new Date(lastStory.created_at).toLocaleDateString(),
          icon: "\u{1F4D4}",
        });
      }

      setRecentActivity(activities);
    } catch {
      // Silently fail
    }
    setStatsLoading(false);
  }, [user, t, isSw]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const timeOfDay = TimeGreeting();

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-8 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-md animate-pulse bg-muted" />
            <div className="h-8 w-56 rounded-md animate-pulse bg-muted" />
          </div>
          <div className="h-48 rounded-lg animate-pulse bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 rounded-lg animate-pulse bg-muted" />
            <div className="h-28 rounded-lg animate-pulse bg-muted" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showBell={!!user}>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Greeting with time icon */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TimeIcon />
              <p className="text-muted-foreground text-sm capitalize">
                {timeOfDay === "morning"
                  ? (isSw ? "Habari za asubuhi" : "Good morning")
                  : timeOfDay === "afternoon"
                    ? (isSw ? "Habari za mchana" : "Good afternoon")
                    : (isSw ? "Habari za jioni" : "Good evening")}
              </p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              {user ? user.displayName : t("app.name")}
              <span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("app.tagline")}</p>
          </div>
        </div>

        {/* Quick Stats Row */}
        {user && !user.isGuest && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Fire size={18} className="text-orange-500 mx-auto mb-1" weight="fill" />
                {statsLoading ? (
                  <div className="h-5 w-8 mx-auto rounded bg-muted animate-pulse" />
                ) : (
                  <p className="text-xl font-bold">{stats.streak}</p>
                )}
                <p className="text-muted-foreground text-[10px]">
                  {isSw ? "Siku" : "Day streak"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <BookBookmark size={18} className="text-primary mx-auto mb-1" weight="fill" />
                {statsLoading ? (
                  <div className="h-5 w-8 mx-auto rounded bg-muted animate-pulse" />
                ) : (
                  <p className="text-xl font-bold">{stats.stories}</p>
                )}
                <p className="text-muted-foreground text-[10px]">
                  {isSw ? "Hadithi" : "Stories"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Megaphone size={18} className="text-emerald-500 mx-auto mb-1" weight="fill" />
                {statsLoading ? (
                  <div className="h-5 w-8 mx-auto rounded bg-muted animate-pulse" />
                ) : (
                  <p className="text-xl font-bold">{stats.testimonies}</p>
                )}
                <p className="text-muted-foreground text-[10px]">
                  {isSw ? "Ushuhuda" : "Shared"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Daily Verse — prominent card */}
        <Card className="relative overflow-hidden">
          {/* Decorative quote marks */}
          <div className="absolute top-2 left-3 text-6xl text-primary/10 font-serif leading-none select-none">
            &ldquo;
          </div>
          <div className="absolute bottom-2 right-3 text-6xl text-primary/10 font-serif leading-none select-none rotate-180">
            &ldquo;
          </div>

          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkle size={12} weight="fill" className="text-primary" />
              </div>
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                {t("home.verse_of_the_day")}
              </span>
            </div>

            {verseLoading ? (
              <div className="space-y-3">
                <div className="h-5 w-full rounded-md animate-pulse bg-muted" />
                <div className="h-5 w-3/4 rounded-md animate-pulse bg-muted" />
                <div className="h-4 w-24 rounded-md animate-pulse bg-muted mt-4" />
              </div>
            ) : verse ? (
              <>
                <blockquote className="text-lg font-serif leading-relaxed italic text-foreground/90 pl-4 border-l-2 border-primary/30">
                  {verse.text}
                </blockquote>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-6 h-px bg-primary/30" />
                  <p className="text-primary text-sm font-medium">
                    {verse.ref}
                  </p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("home.quick_actions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`${pathname}/devotions`}>
              <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("home.start_devotion")}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isSw ? "Fungua ibada yako" : "Open your devotional"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`${pathname}/community`}>
              <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UsersThree size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("home.read_testimonies")}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isSw ? "Soma ushuhuda" : "Read community stories"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`${pathname}/stories`}>
              <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookBookmark size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("home.create_story")}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isSw ? "Hadithi za watoto" : "AI Bible stories"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {user && !user.isGuest ? (
              <Link href={`${pathname}/devotions/streak`}>
                <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Fire size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("home.your_streak")}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {isSw ? "Angalia mchanganyiko" : "View your streak"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Link href={`${pathname}/auth`}>
                <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full">
                  <CardContent className="p-4 flex flex-col items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ArrowRight size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t("home.get_started")}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {isSw ? "Anza safari yako" : "Start your journey"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {user && !user.isGuest && recentActivity.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-muted-foreground" />
              <h2 className="text-lg font-semibold">
                {isSw ? "Shughuli za hivi karibuni" : "Recent Activity"}
              </h2>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <Card key={i} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {activity.type === "devotion"
                          ? (isSw ? "Ibada" : "Devotion")
                          : (isSw ? "Hadithi" : "Story")}
                        {" \u00B7 "}
                        {activity.date}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground/30" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sign In CTA */}
        {!user && (
          <Card className="border-dashed">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkle size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{t("home.get_started")}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isSw ? "Jisajili kuhifadhi safari yako" : "Sign up to track your journey"}
                </p>
              </div>
              <Link href={`${pathname}/auth`}>
                <Button size="sm" className="gap-1">
                  {t("home.sign_in")}
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="h-4" />
      </div>
    </PageWrapper>
  );
}
