"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Fire, Shield, Lock, Star } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";
import confetti from "canvas-confetti";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_check_in: string | null;
  grace_days_used: number;
}

interface HeroCard {
  id: string;
  name_en: string;
  name_sw: string;
  unlock_day: number;
  superpower_en: string;
  superpower_sw: string;
  fact_en: string;
  fact_sw: string;
  emoji: string;
  unlocked: boolean;
}

const HEROES: Omit<HeroCard, "unlocked">[] = [
  { id: "abraham", name_en: "Abraham", name_sw: "Ibrahimu", unlock_day: 7, superpower_en: "Trusted the impossible. Father of nations.", superpower_sw: "Alisikiliza lisilowezekana.", fact_en: "Left everything at age 75 on God's promise.", fact_sw: "Aliacha yote akiwa na umri wa miaka 75.", emoji: "\u2B50" },
  { id: "moses", name_en: "Moses", name_sw: "Musa", unlock_day: 14, superpower_en: "Parted seas. Led millions.", superpower_sw: "Aligawanya bahari.", fact_en: "Spoke with God face to face.", fact_sw: "Alizungumza na Mungu uso kwa uso.", emoji: "\u{1F30A}" },
  { id: "ruth", name_en: "Ruth", name_sw: "Ruthu", unlock_day: 21, superpower_en: "Unwavering loyalty.", superpower_sw: "Uaminifu usiotikisika.", fact_en: "One of two books named after women.", fact_sw: "Moja ya vitabu viwili kwa wanawake.", emoji: "\u{1F33E}" },
  { id: "esther", name_en: "Esther", name_sw: "Esther", unlock_day: 30, superpower_en: "Saved a nation with courage.", superpower_sw: "Aliokoa taifa kwa ujasiri.", fact_en: "Became queen when her people needed her.", fact_sw: "Alifana Malkia walipomhitaji.", emoji: "\u{1F451}" },
  { id: "david", name_en: "David", name_sw: "Daudi", unlock_day: 45, superpower_en: "Shepherd boy who became a king.", superpower_sw: "Mchungaji aliyekuwa mfalme.", fact_en: "Defeated Goliath as a young boy.", fact_sw: "Alimshinda Goliathi akiwa kijana.", emoji: "\u{1F3B5}" },
  { id: "paul", name_en: "Paul", name_sw: "Paulo", unlock_day: 60, superpower_en: "Transformed persecutor. Wrote half the New Testament.", superpower_sw: "Mtesaji aliyebadilika.", fact_en: "Planted churches across the Roman Empire.", fact_sw: "Alipanda makanisa katika Dola la Roma.", emoji: "\u2694\uFE0F" },
  { id: "daniel", name_en: "Daniel", name_sw: "Danieli", unlock_day: 80, superpower_en: "Faithful in the lion's den.", superpower_sw: "Aliaminifu katika tundu la simba.", fact_en: "Interpreted dreams of kings.", fact_sw: "Alifasiri ndoto za wafalme.", emoji: "\u{1F981}" },
  { id: "mary", name_en: "Mary", name_sw: "Mariamu", unlock_day: 100, superpower_en: "Said yes to the impossible.", superpower_sw: "Alisema ndiyo.", fact_en: "A teenager chosen to carry the Savior.", fact_sw: "Kijana aliyechaguliwa kubeba Mwokzi.", emoji: "\u{1F54A}\uFE0F" },
];

function ProgressRing({ value, max, size = 80, strokeWidth = 6, label, sublabel }: {
  value: number; max: number; size?: number; strokeWidth?: number; label: string; sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="hsl(var(--primary))" strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-1000 ease-out"
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

function VineSVG({ streak }: { streak: number }) {
  const vineLength = Math.min(streak, 30);
  const leafCount = Math.floor(streak / 3);
  const hasFruit = streak >= 30;

  return (
    <svg viewBox="0 0 200 120" className="w-full h-28">
      <path
        d="M10 110 C10 90, 30 80, 30 60 C30 40, 50 30, 50 20 C50 10, 70 5, 90 5 C110 5, 130 10, 130 20 C130 30, 150 35, 150 45 C150 55, 170 60, 170 70 C170 80, 190 85, 190 90"
        fill="none" stroke="hsl(138 28% 49%)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray="500" strokeDashoffset={500 - (vineLength / 30) * 500}
        className="transition-all duration-1000 ease-out"
      />
      {Array.from({ length: Math.min(leafCount, 8) }).map((_, i) => {
        const positions = [
          { x: 25, y: 75, r: 30 }, { x: 45, y: 35, r: -20 },
          { x: 65, y: 15, r: 45 }, { x: 85, y: 10, r: -30 },
          { x: 110, y: 15, r: 15 }, { x: 135, y: 30, r: -45 },
          { x: 155, y: 55, r: 30 }, { x: 175, y: 80, r: -15 },
        ];
        const pos = positions[i];
        return (
          <g key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r})`}>
            <ellipse cx="0" cy="-6" rx="4" ry="8" fill="hsl(138 28% 49%)" opacity="0.6" />
            <ellipse cx="0" cy="-6" rx="2" ry="8" fill="hsl(138 28% 35%)" opacity="0.3" />
          </g>
        );
      })}
      {hasFruit && <text x="150" y="50" fontSize="16" className="animate-bounce">{"\uD83C\uDF47"}</text>}
      {streak > 0 && (
        <circle cx={10 + (vineLength / 30) * 180} cy={110 - (vineLength / 30) * 20} r="3" fill="hsl(138 28% 49%)" className="animate-pulse" />
      )}
    </svg>
  );
}

export default function StreakPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0, longest_streak: 0, last_check_in: null, grace_days_used: 0,
  });
  const [loading, setLoading] = useState(true);
  const [unlockedHeroes, setUnlockedHeroes] = useState<Set<string>>(new Set());

  const fetchStreak = useCallback(async () => {
    if (!user || user.isGuest) { setLoading(false); return; }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("streaks").select("*").eq("user_id", user.id).single();
      if (data) setStreakData(data);

      // Get unlocked heroes
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select("hero_id")
        .eq("user_id", user.id);
      if (achievements) {
        setUnlockedHeroes(new Set(achievements.map((a: { hero_id: string }) => a.hero_id)));
      }
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  const heroCards: HeroCard[] = HEROES.map((h) => ({
    ...h,
    unlocked: unlockedHeroes.has(h.id) || streakData.current_streak >= h.unlock_day,
  }));

  const nextUnlock = heroCards.find((h) => !h.unlocked);
  const unlockedCount = heroCards.filter((h) => h.unlocked).length;
  const graceRemaining = 1 - streakData.grace_days_used;

  // Generate 90-day activity grid based on last_check_in and streak count
  const activityGrid: boolean[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastCheckIn = streakData.last_check_in
    ? new Date(streakData.last_check_in + "T00:00:00")
    : null;
  if (lastCheckIn) lastCheckIn.setHours(0, 0, 0, 0);
  for (let i = 89; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    if (lastCheckIn) {
      const daysDiff = Math.round(
        (lastCheckIn.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
      );
      activityGrid.push(daysDiff >= 0 && daysDiff < streakData.current_streak);
    } else {
      activityGrid.push(false);
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6">
          <div className="animate-pulse h-7 w-40 bg-muted rounded" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />)}
          </div>
          <div className="h-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1">{t("devotions.vine_streak")}</h1>
          <Badge variant="secondary" className="gap-1.5">
            <Star size={14} weight="fill" className="text-yellow-500" />
            {unlockedCount}/{heroCards.length}
          </Badge>
        </div>

        {/* Stats with Progress Rings */}
        <Card>
          <CardContent className="p-5">
            <div className="flex justify-around">
              <ProgressRing value={streakData.current_streak} max={100} size={72} strokeWidth={5} label={isSw ? "Sasa" : "Current"} sublabel={isSw ? "siku" : "days"} />
              <ProgressRing value={streakData.longest_streak} max={100} size={72} strokeWidth={5} label={isSw ? "Rekodi" : "Best"} sublabel={isSw ? "siku" : "days"} />
              <ProgressRing value={graceRemaining} max={1} size={72} strokeWidth={5} label={isSw ? "Neema" : "Grace"} sublabel={isSw ? "siku" : "days"} />
            </div>
          </CardContent>
        </Card>

        {/* Vine SVG */}
        <Card>
          <CardContent className="p-5">
            <VineSVG streak={streakData.current_streak} />
            <p className="text-center text-muted-foreground text-xs mt-2">
              {isSw ? "Mzabibu wako unakua!" : "Your vine is growing!"}
            </p>

            {nextUnlock && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {isSw ? "Mhusika anayefuata" : "Next unlock"}
                  </span>
                  <span className="text-xs font-medium">{nextUnlock.unlock_day} {isSw ? "siku" : "days"}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000"
                    style={{ width: `${(streakData.current_streak / nextUnlock.unlock_day) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GitHub-style Activity Grid */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">{isSw ? "Shughuli za Siku 90" : "Last 90 Days"}</h3>
              <span className="text-muted-foreground text-xs">{streakData.current_streak} {isSw ? "siku mfululizo" : "day streak"}</span>
            </div>
            <div className="overflow-x-auto">
              <div className="inline-grid gap-[3px]" style={{ gridTemplateColumns: "repeat(13, 1fr)" }}>
                {activityGrid.map((active, i) => (
                  <div key={i} className={`w-3 h-3 rounded-[2px] ${active ? "bg-green-500" : "bg-muted"}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
              <span>{isSw ? "Kidogo" : "Less"}</span>
              <div className="flex gap-[3px]">
                <div className="w-3 h-3 rounded-[2px] bg-muted" />
                <div className="w-3 h-3 rounded-[2px] bg-green-300" />
                <div className="w-3 h-3 rounded-[2px] bg-green-500" />
                <div className="w-3 h-3 rounded-[2px] bg-green-700" />
              </div>
              <span>{isSw ? "Zaidi" : "More"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Hero Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t("devotions.hero_cards")}</h2>
            <span className="text-muted-foreground text-xs">{unlockedCount} {isSw ? "imefunguliwa" : "unlocked"}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroCards.map((hero) => (
              <Card
                key={hero.id}
                className={`relative overflow-hidden transition-all ${
                  hero.unlocked ? "border-green-500/20" : "opacity-50"
                }`}
              >
                <CardContent className="p-4">
                  {hero.unlocked ? (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{hero.emoji}</span>
                        <Badge variant="secondary" className="text-[9px]">{hero.unlock_day}d</Badge>
                      </div>
                      <h3 className="font-bold text-sm">{isSw ? hero.name_sw : hero.name_en}</h3>
                      <p className="text-muted-foreground text-[11px] mt-1 leading-tight">
                        {isSw ? hero.superpower_sw : hero.superpower_en}
                      </p>
                      <p className="text-muted-foreground/60 text-[10px] mt-2 italic">
                        {isSw ? hero.fact_sw : hero.fact_en}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Lock size={20} className="text-muted-foreground" />
                        </div>
                        <Badge variant="outline" className="text-[9px]">{hero.unlock_day}d</Badge>
                      </div>
                      <h3 className="text-muted-foreground font-bold text-sm mt-2">???</h3>
                      <p className="text-muted-foreground/50 text-[11px] mt-1">
                        {t("devotions.unlock_at", { days: hero.unlock_day.toString() })}
                      </p>
                      <Progress value={(streakData.current_streak / hero.unlock_day) * 100} className="h-1.5 mt-2" />
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
