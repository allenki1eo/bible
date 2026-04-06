"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Crown, Sparkle, Brain } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

type Entry = {
  rank: number;
  username: string;
  score: number;
  best_streak: number;
  accuracy: number;
  user_id: string | null;
};

function rankEmoji(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function tier(score: number) {
  if (score >= 600) return { label: "Champion", color: "text-amber-500", bg: "bg-amber-500/10" };
  if (score >= 450) return { label: "Theologian", color: "text-purple-500", bg: "bg-purple-500/10" };
  if (score >= 300) return { label: "Scholar", color: "text-blue-500", bg: "bg-blue-500/10" };
  if (score >= 150) return { label: "Disciple", color: "text-green-500", bg: "bg-green-500/10" };
  return { label: "Novice", color: "text-muted-foreground", bg: "bg-muted" };
}

export default function LeaderboardPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSw = locale === "sw";

  const [entries, setEntries] = useState<Entry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user && !user.isGuest ? user.id : null;

  useEffect(() => {
    const params = new URLSearchParams({ locale });
    if (userId) params.set("userId", userId);

    fetch(`/api/quiz/leaderboard?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setUserRank(data.userRank ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale, userId]);

  const isMe = (entry: Entry) => !!userId && entry.user_id === userId;

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
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Crown size={20} className="text-amber-500" weight="fill" />
              {isSw ? "Ubingwa wa Dunia" : "Global Leaderboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSw ? "Washindani bora duniani kote" : "Top Scripture champions worldwide"}
            </p>
          </div>
          {userRank && (
            <Badge variant="secondary" className="gap-1">
              <Trophy size={12} weight="fill" />
              {isSw ? "Nafasi yangu" : "Your rank"} #{userRank}
            </Badge>
          )}
        </div>

        {/* Top 3 podium */}
        {!loading && entries.length >= 3 && (
          <div className="flex items-end justify-center gap-3 pt-2 pb-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {entries[1].username[0].toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold truncate max-w-[64px]">{entries[1].username}</p>
                <p className="text-xs text-muted-foreground">{entries[1].score}pts</p>
              </div>
              <div className="w-16 h-16 rounded-t-lg bg-slate-400/20 border border-slate-400/30 flex items-center justify-center">
                <span className="text-2xl">🥈</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 -translate-y-4">
              <Crown size={20} className="text-amber-500" weight="fill" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg ring-4 ring-amber-500/30">
                {entries[0].username[0].toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold truncate max-w-[72px]">{entries[0].username}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{entries[0].score}pts</p>
              </div>
              <div className="w-16 h-20 rounded-t-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <span className="text-2xl">🥇</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-xl font-bold text-white shadow-md">
                {entries[2].username[0].toUpperCase()}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold truncate max-w-[64px]">{entries[2].username}</p>
                <p className="text-xs text-muted-foreground">{entries[2].score}pts</p>
              </div>
              <div className="w-16 h-12 rounded-t-lg bg-amber-700/20 border border-amber-700/30 flex items-center justify-center">
                <span className="text-2xl">🥉</span>
              </div>
            </div>
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <Brain size={32} className="text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground text-sm">
                  {isSw ? "Bado hakuna alama. Kuwa wa kwanza!" : "No scores yet. Be the first!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => {
              const t = tier(entry.score);
              const me = isMe(entry);
              return (
                <div
                  key={`${entry.rank}-${entry.username}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    me
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : entry.rank <= 3
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="w-8 text-center font-bold text-sm shrink-0">
                    {entry.rank <= 3 ? rankEmoji(entry.rank) : <span className="text-muted-foreground">#{entry.rank}</span>}
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{
                      background: me
                        ? "hsl(var(--primary))"
                        : entry.rank === 1
                          ? "linear-gradient(135deg, #f59e0b, #d97706)"
                          : "hsl(var(--muted))",
                    }}
                  >
                    {entry.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate flex items-center gap-1">
                      {entry.username}
                      {me && <span className="text-xs text-primary font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🔥 {entry.best_streak}x streak · {entry.accuracy}% accuracy
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{entry.score}</p>
                    <Badge variant="outline" className={`text-[10px] ${t.color} ${t.bg} border-0 px-1.5 py-0`}>
                      {t.label}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Play CTA */}
        <div className="pb-4">
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Sparkle size={16} weight="fill" />
            {isSw ? "Cheza Sasa" : "Play Now & Climb the Ranks"}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}
