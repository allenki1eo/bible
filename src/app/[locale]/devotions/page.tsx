"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/toast";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Notebook,
  Fire,
  Trophy,
  Brain,
  Check,
  Sparkle,
  CaretRight,
  Warning,
  BookOpen,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import { STUDY_PLANS, getTodayChapter, getProgressDays } from "@/lib/study-plans";

type Enrollment = Record<string, { enrolledAt: string }>;

type Mood = "struggling" | "neutral" | "peaceful" | "joyful" | "seeking";

const moodEmojis: Record<Mood, string> = {
  struggling: "\u{1F614}",
  neutral: "\u{1F610}",
  peaceful: "\u{1F642}",
  joyful: "\u{1F60A}",
  seeking: "\u{1F64F}",
};

// Progress ring component
function ProgressRing({ value, max, size = 80, strokeWidth = 6, label, sublabel }: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-center">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground text-center">{sublabel}</p>}
    </div>
  );
}

// Vine SVG component
function VineSVG({ streak }: { streak: number }) {
  const vineLength = Math.min(streak, 30);
  const leafCount = Math.floor(streak / 3);
  const hasFruit = streak >= 30;

  return (
    <svg viewBox="0 0 200 120" className="w-full h-28">
      {/* Main vine stem */}
      <path
        d={`M10 110 C10 90, 30 80, 30 60 C30 40, 50 30, 50 20 C50 10, 70 5, 90 5 C110 5, 130 10, 130 20 C130 30, 150 35, 150 45 C150 55, 170 60, 170 70 C170 80, 190 85, 190 90`}
        fill="none"
        stroke="hsl(138 28% 49%)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="500"
        strokeDashoffset={500 - (vineLength / 30) * 500}
        className="transition-all duration-1000 ease-out"
      />

      {/* Leaves */}
      {Array.from({ length: Math.min(leafCount, 8) }).map((_, i) => {
        const positions = [
          { x: 25, y: 75, r: 30 },
          { x: 45, y: 35, r: -20 },
          { x: 65, y: 15, r: 45 },
          { x: 85, y: 10, r: -30 },
          { x: 110, y: 15, r: 15 },
          { x: 135, y: 30, r: -45 },
          { x: 155, y: 55, r: 30 },
          { x: 175, y: 80, r: -15 },
        ];
        const pos = positions[i];
        return (
          <g
            key={i}
            transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r})`}
            className="transition-all duration-500"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <ellipse cx="0" cy="-6" rx="4" ry="8" fill="hsl(138 28% 49%)" opacity="0.6" />
            <ellipse cx="0" cy="-6" rx="2" ry="8" fill="hsl(138 28% 35%)" opacity="0.3" />
          </g>
        );
      })}

      {/* Fruit */}
      {hasFruit && (
        <text x="150" y="50" fontSize="16" className="animate-bounce">
          {"\uD83C\uDF47"}
        </text>
      )}

      {/* Growing tip */}
      {streak > 0 && (
        <circle
          cx={10 + (vineLength / 30) * 180}
          cy={110 - (vineLength / 30) * 20}
          r="3"
          fill="hsl(138 28% 49%)"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

export default function DevotionsPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [generating, setGenerating] = useState(false);
  const [devotional, setDevotional] = useState<string | null>(null);
  const [devError, setDevError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, grace_days_used: 0 });
  const [weekDays, setWeekDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [studyEnrollments, setStudyEnrollments] = useState<Enrollment>({});

  const isSw = locale === "sw";

  // Fetch real streak data
  const fetchStreak = useCallback(async () => {
    if (!user || user.isGuest) return;
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setStreakData({
          current_streak: data.current_streak || 0,
          longest_streak: data.longest_streak || 0,
          grace_days_used: data.grace_days_used || 0,
        });

        // Calculate which days of the current week were active
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
        const lastCheckIn = data.last_check_in
          ? new Date(data.last_check_in + "T00:00:00")
          : null;
        if (lastCheckIn) lastCheckIn.setHours(0, 0, 0, 0);
        const days: boolean[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + i); // Start from Monday
          d.setHours(0, 0, 0, 0);
          if (lastCheckIn && d <= today) {
            const daysDiff = Math.round(
              (lastCheckIn.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
            );
            days.push(daysDiff >= 0 && daysDiff < data.current_streak);
          } else {
            days.push(false);
          }
        }
        setWeekDays(days);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  // Check if today's devotion is already completed
  const checkTodayDevotion = useCallback(async () => {
    if (!user || user.isGuest) return;
    try {
      const supabase = createBrowserClient();
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("devotions")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (data) {
        setDevotional(data.content);
        setSelectedMood(data.mood);
        setCompleted(data.completed);
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    checkTodayDevotion();
  }, [checkTodayDevotion]);

  // Load study plan enrollments from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nuru_study_plans") || "{}");
      setStudyEnrollments(stored);
    } catch {}
  }, []);

  const markDevotionComplete = async () => {
    if (completed || !selectedMood) return;
    setCompleting(true);

    try {
      if (user && !user.isGuest) {
        const supabase = createBrowserClient();
        const today = new Date().toISOString().split("T")[0];

        await supabase.from("devotions").upsert({
          user_id: user.id,
          date: today,
          mood: selectedMood,
          content: devotional || "",
          scripture_ref: "See devotion",
          completed: true,
        });

        // Update streak
        try {
          await supabase.rpc("update_streak", { p_user_id: user.id });
        } catch (streakErr) {
          console.error("Streak update failed:", streakErr);
        }

        // Refresh streak display
        await fetchStreak();
      }
      setCompleted(true);
      toast(isSw ? "Ibada imekamilika! \u{1F525}" : "Devotion completed! \u{1F525}", "success");
    } catch (err) {
      console.error("Complete error:", err);
      setCompleted(true);
    }
    setCompleting(false);
  };

  const generateDevotional = async () => {
    if (!selectedMood) return;
    setGenerating(true);
    setDevError(null);
    setDevotional(null);

    try {
      const res = await fetch("/api/devotions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: selectedMood, language: locale }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate devotional");
      }

      const data = await res.json();
      setDevotional(data.content);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setDevError(msg);
    }

    setGenerating(false);
  };

  const graceRemaining = 1 - streakData.grace_days_used;

  return (
    <PageWrapper title={t("devotions.title")} showBell={!!user}>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t("devotions.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("devotions.subtitle")}</p>
        </div>

        {/* Streak Overview with Progress Rings */}
        {user && !user.isGuest ? (
          <Card>
            <CardContent className="p-5">
              {/* Vine SVG */}
              <VineSVG streak={streakData.current_streak} />

              {/* Progress Rings */}
              <div className="flex justify-around mt-2">
                <ProgressRing
                  value={streakData.current_streak}
                  max={100}
                  size={72}
                  strokeWidth={5}
                  label={isSw ? "Sasa" : "Current"}
                  sublabel={isSw ? "siku" : "days"}
                />
                <ProgressRing
                  value={streakData.longest_streak}
                  max={100}
                  size={72}
                  strokeWidth={5}
                  label={isSw ? "Rekodi" : "Best"}
                  sublabel={isSw ? "siku" : "days"}
                />
                <ProgressRing
                  value={graceRemaining}
                  max={1}
                  size={72}
                  strokeWidth={5}
                  label={isSw ? "Neema" : "Grace"}
                  sublabel={isSw ? "siku" : "days"}
                />
              </div>

              {/* Week dots */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        weekDays[i]
                          ? "bg-primary/15 border border-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      {weekDays[i] && <Check size={14} className="text-primary" weight="bold" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Fire size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {isSw ? "Ingia kufuatilia mfululizo wako" : "Sign in to track your streak"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Study Plan Progress (if enrolled) */}
        {Object.keys(studyEnrollments).length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" weight="fill" />
              {isSw ? "Mpango wa Usomaji" : "Study Plan"}
            </h2>
            <div className="space-y-3">
              {STUDY_PLANS.filter((p) => studyEnrollments[p.id]).map((plan) => {
                const enrollment = studyEnrollments[plan.id];
                const todayChapter = getTodayChapter(plan, enrollment.enrolledAt);
                const progress = getProgressDays(enrollment.enrolledAt, plan.totalDays);
                const pct = (progress / plan.totalDays) * 100;
                const isComplete = progress >= plan.totalDays;
                return (
                  <Link key={plan.id} href={`${pathname}/study-plans`}>
                    <Card className="card-lift cursor-pointer border-primary/20 hover:bg-accent/30 transition-colors">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{plan.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{isSw ? plan.titleSw : plan.title}</p>
                            {isComplete ? (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {isSw ? "Imekamilika! 🎉" : "Completed! 🎉"}
                              </p>
                            ) : todayChapter ? (
                              <p className="text-xs text-muted-foreground truncate">
                                {isSw ? "Leo:" : "Today:"} {todayChapter.book} {todayChapter.chapter} — {todayChapter.title}
                              </p>
                            ) : null}
                          </div>
                          <CaretRight size={16} className="text-muted-foreground shrink-0" />
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {progress}/{plan.totalDays} {isSw ? "siku" : "days"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Devotional */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkle size={18} className="text-primary" weight="fill" />
            {t("devotions.daily_devotional")}
          </h2>

          {!devotional ? (
            <Card>
              <CardContent className="p-5 space-y-4">
                <p className="text-muted-foreground text-sm">{t("devotions.how_are_you")}</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(moodEmojis) as Mood[]).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] border btn-press ${
                        selectedMood === mood
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      <span className="text-lg">{moodEmojis[mood]}</span>
                      <span>{t(`devotions.moods.${mood}`)}</span>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={generateDevotional}
                  disabled={!selectedMood || generating}
                  className="w-full gap-2"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t("devotions.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkle size={18} weight="bold" />
                      {t("devotions.generate_devotional")}
                    </>
                  )}
                </Button>
                {devError && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    <Warning size={16} weight="bold" />
                    <span>{devError}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                  <Sparkle size={14} weight="fill" />
                  {t("devotions.daily_devotional")}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line italic">
                  {devotional}
                </p>
                <Button
                  className="w-full gap-1.5"
                  onClick={markDevotionComplete}
                  disabled={completed || completing}
                  variant={completed ? "secondary" : "default"}
                >
                  <Check size={16} weight="bold" />
                  {completed
                    ? (isSw ? "Imekamilika!" : "Completed!")
                    : completing
                      ? (isSw ? "Inahifadhi..." : "Saving...")
                      : t("devotions.mark_complete")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{isSw ? "Chagua" : "Explore"}</h2>
          {[
            { id: "journal",     icon: Notebook, label: t("devotions.prayer_journal"),         href: `${pathname}/journal` },
            { id: "streak",      icon: Fire,     label: t("devotions.vine_streak"),             href: `${pathname}/streak` },
            { id: "study-plans", icon: BookOpen, label: isSw ? "Mipango ya Usomaji" : "Bible Study Plans", href: `${pathname}/study-plans` },
            { id: "achievements",icon: Trophy,   label: isSw ? "Mafanikio" : "Achievements",   href: `${pathname.replace("/devotions", "")}/achievements` },
          ].map((item) => (
            <Link key={item.id} href={item.href}>
              <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <item.icon size={20} className="text-foreground" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <CaretRight size={16} className="text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Games section */}
          <h2 className="text-lg font-semibold pt-2">{isSw ? "Michezo" : "Games & Challenges"}</h2>
          <Link href={`${pathname}/quiz`}>
            <Card className="card-lift cursor-pointer border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-lg">🎮</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{isSw ? "Mchezo wa Maandiko" : "Scripture Quest"}</p>
                  <p className="text-xs text-muted-foreground">{isSw ? "Shindana na waumini duniani" : "Compete globally • Earn XP • Climb ranks"}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Brain size={10} />
                    {isSw ? "Cheza" : "Play"}
                  </Badge>
                  <CaretRight size={16} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={`${pathname}/quiz/battle`}>
            <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors border-purple-500/20 bg-purple-500/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <span className="text-lg">⚔️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{isSw ? "Vita vya Biblia" : "Bible Battle"}</p>
                  <p className="text-xs text-muted-foreground">{isSw ? "Shindana na rafiki kwa wakati mmoja" : "Challenge a friend in real-time with a room code"}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">NEW</Badge>
              </CardContent>
            </Card>
          </Link>
          <Link href={`${pathname}/quiz/leaderboard`}>
            <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{isSw ? "Ubingwa wa Dunia" : "Global Leaderboard"}</p>
                  <p className="text-xs text-muted-foreground">{isSw ? "Angalia wasomi bora duniani kote" : "See the top Scripture champions worldwide"}</p>
                </div>
                <CaretRight size={16} className="text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="h-4" />
      </div>
    </PageWrapper>
  );
}
