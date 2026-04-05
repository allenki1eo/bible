"use client";

import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

function TimeGreeting(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}

const TIME_META = {
  morning: {
    Icon: Sun,
    color: "text-amber-500",
    en: "Good morning",
    sw: "Habari za asubuhi",
    bg: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
  },
  afternoon: {
    Icon: CloudSun,
    color: "text-orange-400",
    en: "Good afternoon",
    sw: "Habari za mchana",
    bg: "from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20",
  },
  evening: {
    Icon: Moon,
    color: "text-indigo-400",
    en: "Good evening",
    sw: "Habari za jioni",
    bg: "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
  },
};

const QUICK_ACTIONS = [
  {
    id: "devotions",
    icon: BookOpen,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    cardHover: "hover:border-emerald-200 dark:hover:border-emerald-800",
    enTitle: "Daily Devotion",
    swTitle: "Ibada ya Leo",
    enSub: "Start your devotional",
    swSub: "Fungua ibada yako",
    href: "devotions",
  },
  {
    id: "community",
    icon: UsersThree,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    cardHover: "hover:border-blue-200 dark:hover:border-blue-800",
    enTitle: "Community",
    swTitle: "Jamii",
    enSub: "Read testimonies",
    swSub: "Soma ushuhuda",
    href: "community",
  },
  {
    id: "stories",
    icon: BookBookmark,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    cardHover: "hover:border-purple-200 dark:hover:border-purple-800",
    enTitle: "Bible Stories",
    swTitle: "Hadithi za Biblia",
    enSub: "AI-powered for kids",
    swSub: "Kwa watoto na AI",
    href: "stories",
  },
];

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
  const timeOfDay = TimeGreeting();
  const timeMeta = TIME_META[timeOfDay];

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

  const fetchDashboard = useCallback(async () => {
    if (!user || user.isGuest) { setStatsLoading(false); return; }
    try {
      const supabase = createBrowserClient();
      const [
        { data: streakData },
        { count: storiesCount },
        { count: testimoniesCount },
        { data: lastDevotion },
        { data: lastStory },
      ] = await Promise.all([
        supabase.from("streaks").select("current_streak").eq("user_id", user.id).single(),
        supabase.from("stories").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("testimonies").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("devotions").select("date,mood").eq("user_id", user.id).order("date", { ascending: false }).limit(1).single(),
        supabase.from("stories").select("title,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
      ]);

      setStats({
        streak: streakData?.current_streak || 0,
        stories: storiesCount || 0,
        testimonies: testimoniesCount || 0,
      });

      const activities: RecentActivity[] = [];
      if (lastDevotion) {
        activities.push({
          type: "devotion",
          title: lastDevotion.mood ? t(`devotions.moods.${lastDevotion.mood}`) : (isSw ? "Ibada ya leo" : "Today's devotion"),
          date: lastDevotion.date,
          icon: "📖",
        });
      }
      if (lastStory) {
        activities.push({
          type: "story",
          title: lastStory.title,
          date: new Date(lastStory.created_at).toLocaleDateString(),
          icon: "📕",
        });
      }
      setRecentActivity(activities);
    } catch { /* silently fail */ }
    setStatsLoading(false);
  }, [user, t, isSw]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-8 space-y-5">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-md animate-pulse bg-muted" />
            <div className="h-9 w-56 rounded-md animate-pulse bg-muted" />
          </div>
          <div className="h-40 rounded-2xl animate-pulse bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl animate-pulse bg-muted" />)}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showBell={!!user}>
      <div className="page-enter">
        {/* ── Hero greeting band ── */}
        <div className={`px-4 pt-6 pb-5 bg-gradient-to-br ${timeMeta.bg}`}>
          <div className="flex items-center gap-2 mb-1">
            <timeMeta.Icon size={17} weight="fill" className={timeMeta.color} />
            <p className="text-muted-foreground text-sm">
              {isSw ? timeMeta.sw : timeMeta.en}
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user ? user.displayName : t("app.name")}
            <span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("app.tagline")}</p>
        </div>

        <div className="px-4 space-y-5 mt-4">
          {/* ── Stats row ── */}
          {user && !user.isGuest && (
            <div className="grid grid-cols-3 gap-2.5">
              {/* Streak */}
              <Card className="border-orange-200/60 dark:border-orange-800/40 bg-orange-50/50 dark:bg-orange-950/20">
                <CardContent className="p-3 text-center">
                  <Fire size={20} className="text-orange-500 mx-auto mb-1.5" weight="fill" />
                  {statsLoading
                    ? <div className="h-6 w-10 mx-auto rounded bg-muted animate-pulse mb-0.5" />
                    : <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 leading-none">{stats.streak}</p>}
                  <p className="text-muted-foreground text-[10px] mt-1">{isSw ? "Mfululizo" : "Streak"}</p>
                </CardContent>
              </Card>
              {/* Stories */}
              <Card className="border-purple-200/60 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-950/20">
                <CardContent className="p-3 text-center">
                  <BookBookmark size={20} className="text-purple-500 mx-auto mb-1.5" weight="fill" />
                  {statsLoading
                    ? <div className="h-6 w-10 mx-auto rounded bg-muted animate-pulse mb-0.5" />
                    : <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 leading-none">{stats.stories}</p>}
                  <p className="text-muted-foreground text-[10px] mt-1">{isSw ? "Hadithi" : "Stories"}</p>
                </CardContent>
              </Card>
              {/* Testimonies */}
              <Card className="border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardContent className="p-3 text-center">
                  <UsersThree size={20} className="text-emerald-500 mx-auto mb-1.5" weight="fill" />
                  {statsLoading
                    ? <div className="h-6 w-10 mx-auto rounded bg-muted animate-pulse mb-0.5" />
                    : <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">{stats.testimonies}</p>}
                  <p className="text-muted-foreground text-[10px] mt-1">{isSw ? "Ushuhuda" : "Shared"}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Verse of the Day ── */}
          <Card className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
            <div className="absolute -top-3 -left-2 text-8xl text-primary/8 font-serif leading-none select-none pointer-events-none">
              &ldquo;
            </div>
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <Sparkle size={11} weight="fill" className="text-primary" />
                </div>
                <span className="text-primary text-[11px] font-semibold uppercase tracking-widest">
                  {t("home.verse_of_the_day")}
                </span>
              </div>

              {verseLoading ? (
                <div className="space-y-2.5">
                  <div className="h-5 w-full rounded bg-muted animate-pulse" />
                  <div className="h-5 w-4/5 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse mt-3" />
                </div>
              ) : verse ? (
                <>
                  <blockquote className="text-[15px] font-serif leading-[1.75] italic text-foreground/85 border-l-[3px] border-primary/30 pl-4">
                    {verse.text}
                  </blockquote>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-5 h-px bg-primary/40" />
                    <p className="text-primary text-[13px] font-semibold">{verse.ref}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* ── Quick Actions ── */}
          <div>
            <h2 className="text-base font-semibold mb-3 text-foreground/80">{t("home.quick_actions")}</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.id} href={`${pathname}/${action.href}`}>
                    <Card className={`card-lift cursor-pointer transition-colors h-full ${action.cardHover}`}>
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                          <Icon size={20} className={action.iconColor} weight="fill" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm leading-snug">
                            {isSw ? action.swTitle : action.enTitle}
                          </p>
                          <p className="text-muted-foreground text-xs mt-0.5 leading-snug">
                            {isSw ? action.swSub : action.enSub}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}

              {/* 4th card: Streak or Get Started */}
              {user && !user.isGuest ? (
                <Link href={`${pathname}/devotions/streak`}>
                  <Card className="card-lift cursor-pointer hover:border-orange-200 dark:hover:border-orange-800 transition-colors h-full">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Fire size={20} className="text-orange-500" weight="fill" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{t("home.your_streak")}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 leading-snug">
                          {isSw ? "Angalia mfululizo" : "View your streak"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Link href={`${pathname}/auth`}>
                  <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors h-full border-primary/20 bg-primary/[0.03]">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ArrowRight size={20} className="text-primary" weight="bold" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{t("home.get_started")}</p>
                        <p className="text-muted-foreground text-xs mt-0.5 leading-snug">
                          {isSw ? "Anza safari yako" : "Start your journey"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>

          {/* ── Recent Activity ── */}
          {user && !user.isGuest && recentActivity.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} className="text-muted-foreground" />
                <h2 className="text-base font-semibold text-foreground/80">
                  {isSw ? "Shughuli za Hivi Karibuni" : "Recent Activity"}
                </h2>
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity, i) => (
                  <Card key={i} className="hover:bg-muted/40 transition-colors">
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <span className="text-xl">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{activity.title}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {activity.type === "devotion" ? (isSw ? "Ibada" : "Devotion") : (isSw ? "Hadithi" : "Story")}
                          {" · "}
                          {activity.date}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground/30 shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Sign In CTA ── */}
          {!user && (
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkle size={20} className="text-primary" weight="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{t("home.get_started")}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {isSw ? "Jisajili kuhifadhi safari yako" : "Sign up to track your journey"}
                  </p>
                </div>
                <Link href={`${pathname}/auth`}>
                  <Button size="sm" className="gap-1 shrink-0">
                    {t("home.sign_in")}
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="h-2" />
        </div>
      </div>
    </PageWrapper>
  );
}
