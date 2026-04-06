"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import {
  UsersThree,
  BookOpen,
  HandsPraying,
  Sparkle,
  ArrowUp,
  ChartBar,
  CheckCircle,
  Bell,
} from "@phosphor-icons/react";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Stats {
  users: number;
  stories: number;
  testimonies: number;
  prayers: number;
  subscribers: number;
  completedDevotions: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
  suffix?: string;
}

function StatCard({ icon, label, value, color, bg, suffix }: StatCardProps) {
  const display = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  return (
    <Card>
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
          <span className={color}>{icon}</span>
        </div>
        <div className="text-3xl font-bold tabular-nums">
          {display}{suffix}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export default function AnalyticsPage() {
  const { locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const isAdmin = user && !user.isGuest && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const [stats, setStats] = useState<Stats>({ users: 0, stories: 0, testimonies: 0, prayers: 0, subscribers: 0, completedDevotions: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{ date: string; testimonies: number; stories: number }[]>([]);

  useEffect(() => {
    // Redirect non-admins to the full admin panel
    if (user !== null && !isAdmin) {
      router.replace("/admin");
      return;
    }
    if (isAdmin) loadStats();
  }, [user, isAdmin]);

  async function loadStats() {
    try {
      // Public aggregate stats from our API
      const res = await fetch("/api/stats");
      const data = await res.json();

      // Extra counts from Supabase (public tables)
      const supabase = createBrowserClient();

      const [{ count: subscribers }, { count: completedDevotions }] = await Promise.all([
        supabase.from("push_subscriptions").select("*", { count: "exact", head: true }),
        supabase.from("devotions").select("*", { count: "exact", head: true }).eq("completed", true),
      ]);

      setStats({
        users: data.users ?? 0,
        stories: data.stories ?? 0,
        testimonies: data.testimonies ?? 0,
        prayers: data.prayers ?? 0,
        subscribers: subscribers ?? 0,
        completedDevotions: completedDevotions ?? 0,
      });

      // Last 7 days activity (testimonies by day)
      const days: { date: string; testimonies: number; stories: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const { count: tc } = await supabase
          .from("testimonies")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${dateStr}T00:00:00`)
          .lt("created_at", `${dateStr}T23:59:59`);
        const { count: sc } = await supabase
          .from("stories")
          .select("*", { count: "exact", head: true })
          .gte("created_at", `${dateStr}T00:00:00`)
          .lt("created_at", `${dateStr}T23:59:59`);
        days.push({ date: dateStr, testimonies: tc ?? 0, stories: sc ?? 0 });
      }
      setRecentActivity(days);
    } catch (e) {
      console.error("Analytics load error:", e);
    }
    setLoading(false);
  }

  const STAT_CARDS: StatCardProps[] = [
    { icon: <UsersThree size={20} />, label: isSw ? "Watumiaji Wote" : "Total Believers", value: stats.users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { icon: <Sparkle size={20} />, label: isSw ? "Hadithi Zilizoundwa" : "Stories Generated", value: stats.stories, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { icon: <ArrowUp size={20} />, label: isSw ? "Ushuhuda Uliotolewa" : "Testimonies Shared", value: stats.testimonies, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: <HandsPraying size={20} />, label: isSw ? "Maombi Yaliyoandikwa" : "Prayers Written", value: stats.prayers, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
    { icon: <Bell size={20} />, label: isSw ? "Wanaopokea Arifa" : "Push Subscribers", value: stats.subscribers, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
    { icon: <CheckCircle size={20} />, label: isSw ? "Ibada Zilizokamilika" : "Devotions Completed", value: stats.completedDevotions, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
  ];

  // Simple bar chart helpers
  const maxActivity = Math.max(...recentActivity.map((d) => d.testimonies + d.stories), 1);

  return (
    <PageWrapper title={isSw ? "Takwimu" : "Analytics"}>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ChartBar size={22} className="text-primary" weight="fill" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{isSw ? "Takwimu za Nuru" : "Nuru Analytics"}</h1>
            <p className="text-xs text-muted-foreground">
              {isSw ? "Muhtasari wa shughuli za programu" : "App activity overview"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}><CardContent className="p-5"><div className="animate-pulse h-16 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* 7-day activity bar chart */}
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-muted-foreground" />
              {isSw ? "Shughuli za Siku 7" : "Last 7 Days Activity"}
            </h2>
            {loading ? (
              <div className="h-24 animate-pulse bg-muted rounded" />
            ) : (
              <div className="flex items-end gap-2 h-24">
                {recentActivity.map((day) => {
                  const total = day.testimonies + day.stories;
                  const pct = (total / maxActivity) * 100;
                  const dayLabel = new Date(day.date + "T12:00:00").toLocaleDateString(
                    locale === "sw" ? "sw-KE" : "en-US",
                    { weekday: "short" }
                  );
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "80px" }}>
                        {/* Stories bar (purple) */}
                        {day.stories > 0 && (
                          <div
                            className="w-full rounded-t bg-purple-400/70"
                            style={{ height: `${(day.stories / maxActivity) * 80}px` }}
                          />
                        )}
                        {/* Testimonies bar (emerald) */}
                        {day.testimonies > 0 && (
                          <div
                            className="w-full rounded-t bg-emerald-400/70"
                            style={{ height: `${(day.testimonies / maxActivity) * 80}px` }}
                          />
                        )}
                        {/* Empty placeholder */}
                        {total === 0 && (
                          <div className="w-full rounded bg-muted" style={{ height: "4px" }} />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/70 inline-block" /> {isSw ? "Ushuhuda" : "Testimonies"}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-purple-400/70 inline-block" /> {isSw ? "Hadithi" : "Stories"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Engagement rate */}
        {!loading && stats.users > 0 && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm">{isSw ? "Viwango vya Ushirikiano" : "Engagement Rates"}</h2>
              {[
                {
                  label: isSw ? "Wanaopokea Arifa" : "Push opt-in rate",
                  value: stats.users > 0 ? Math.round((stats.subscribers / stats.users) * 100) : 0,
                  color: "bg-rose-500",
                },
                {
                  label: isSw ? "Wanaoshiriki Ushuhuda" : "Testimony participation",
                  value: stats.users > 0 ? Math.round((stats.testimonies / stats.users) * 100) : 0,
                  color: "bg-emerald-500",
                },
                {
                  label: isSw ? "Wanaosali kila Siku" : "Daily prayer writers",
                  value: stats.users > 0 ? Math.round((stats.prayers / stats.users) * 100) : 0,
                  color: "bg-orange-500",
                },
              ].map((row) => (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold">{Math.min(row.value, 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${Math.min(row.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          {isSw ? "Takwimu zinahusu watumiaji wote wa Nuru" : "Stats reflect all Nuru users globally"}
        </p>
      </div>
    </PageWrapper>
  );
}
