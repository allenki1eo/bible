"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Fire,
  BookOpen,
  UsersThree,
  BookBookmark,
  Star,
  Lock,
  CheckCircle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Achievement {
  id: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  emoji: string;
  category: "streak" | "community" | "stories" | "devotions";
  requirement: number;
  progress: number;
  unlocked: boolean;
}

const ACHIEVEMENTS: Omit<Achievement, "progress" | "unlocked">[] = [
  // Streak achievements
  { id: "first_day", title: "First Step", titleSw: "Hatua ya Kwanza", description: "Complete your first devotional", descriptionSw: "Kamilisha ibada yako ya kwanza", emoji: "\u{1F331}", category: "streak", requirement: 1 },
  { id: "week_warrior", title: "Week Warrior", titleSw: "Mpiganaji wa Wiki", description: "7-day streak", descriptionSw: "Siku 7 mfululizo", emoji: "\u2694\uFE0F", category: "streak", requirement: 7 },
  { id: "fortnight", title: "Fortnight Faith", titleSw: "Imani ya Siku 14", description: "14-day streak", descriptionSw: "Siku 14 mfululizo", emoji: "\u{1F3C6}", category: "streak", requirement: 14 },
  { id: "month_mighty", title: "Month Mighty", titleSw: "Nguvu ya Mwezi", description: "30-day streak", descriptionSw: "Siku 30 mfululizo", emoji: "\u{1F396}\uFE0F", category: "streak", requirement: 30 },
  { id: "two_months", title: "Unstoppable", titleSw: "Asiyekuweza Kuzuiwa", description: "60-day streak", descriptionSw: "Siku 60 mfululizo", emoji: "\u{1F525}", category: "streak", requirement: 60 },
  { id: "centurion", title: "Centurion", titleSw: "Kamanda wa Mia", description: "100-day streak", descriptionSw: "Siku 100 mfululizo", emoji: "\u{1F451}", category: "streak", requirement: 100 },

  // Community achievements
  { id: "first_testimony", title: "First Voice", titleSw: "Sauti ya Kwanza", description: "Share your first testimony", descriptionSw: "Shiriki ushuhuda wako wa kwanza", emoji: "\u{1F4E2}", category: "community", requirement: 1 },
  { id: "encourager", title: "Encourager", titleSw: "Mtia Moyo", description: "Give 10 Amens", descriptionSw: "Toa Amina 10", emoji: "\u{1F64F}", category: "community", requirement: 10 },
  { id: "pillar", title: "Pillar of Prayer", titleSw: "Nguzo ya Maombi", description: "Give 50 reactions", descriptionSw: "Toa majibu 50", emoji: "\u{1F3DB}\uFE0F", category: "community", requirement: 50 },

  // Stories achievements
  { id: "first_story", title: "Storyteller", titleSw: "Mwongezi Hadithi", description: "Generate your first story", descriptionSw: "Tengeneza hadithi yako ya kwanza", emoji: "\u{1F4D6}", category: "stories", requirement: 1 },
  { id: "story_collector", title: "Story Collector", titleSw: "Mkusanyaji Hadithi", description: "Save 5 stories to library", descriptionSw: "Hifadhi hadithi 5", emoji: "\u{1F4DA}", category: "stories", requirement: 5 },
  { id: "bilingual", title: "Bilingual", titleSw: "Mzungumzaji Lugha Mbili", description: "Generate stories in both languages", descriptionSw: "Tengeneza hadithi kwa lugha zote mbili", emoji: "\u{1F30D}", category: "stories", requirement: 2 },

  // Devotions achievements
  { id: "prayer_start", title: "Prayer Starter", titleSw: "Anzisha Maombi", description: "Write your first prayer", descriptionSw: "Andika lako la kwanza", emoji: "\u270D\uFE0F", category: "devotions", requirement: 1 },
  { id: "prayer_answered", title: "Answered!", titleSw: "Limejibiwa!", description: "Mark your first answered prayer", descriptionSw: "Weka ombi lako la kwanza limejibiwa", emoji: "\u2705", category: "devotions", requirement: 1 },
  { id: "quiz_master", title: "Quiz Master", titleSw: "Bwana wa Jaribio", description: "Answer 10 quiz questions correctly", descriptionSw: "Jibu maswali 10 kwa usahihi", emoji: "\u{1F3AF}", category: "devotions", requirement: 10 },
];

export default function AchievementsPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isSw = locale === "sw";

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    // Default progress for demo (will be wired to Supabase)
    let streakDays = 0;
    let testimoniesCount = 0;
    let reactionsCount = 0;
    let storiesCount = 0;
    let prayersCount = 0;
    let quizCorrect = 0;

    if (user && !user.isGuest) {
      try {
        const supabase = createBrowserClient();

        const { data: streak } = await supabase
          .from("streaks")
          .select("current_streak")
          .eq("user_id", user.id)
          .single();
        streakDays = streak?.current_streak || 0;

        const { count: tCount } = await supabase
          .from("testimonies")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        testimoniesCount = tCount || 0;

        const { count: rCount } = await supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        reactionsCount = rCount || 0;

        const { count: sCount } = await supabase
          .from("stories")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        storiesCount = sCount || 0;

        const { count: pCount } = await supabase
          .from("prayers")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        prayersCount = pCount || 0;
      } catch {
        // Use defaults
      }
    }

    const progressMap: Record<string, number> = {
      first_day: streakDays,
      week_warrior: streakDays,
      fortnight: streakDays,
      month_mighty: streakDays,
      two_months: streakDays,
      centurion: streakDays,
      first_testimony: testimoniesCount,
      encourager: reactionsCount,
      pillar: reactionsCount,
      first_story: storiesCount,
      story_collector: storiesCount,
      bilingual: storiesCount >= 2 ? 2 : storiesCount,
      prayer_start: prayersCount,
      prayer_answered: 0,
      quiz_master: quizCorrect,
    };

    const mapped = ACHIEVEMENTS.map((a) => {
      const progress = progressMap[a.id] || 0;
      return {
        ...a,
        progress: Math.min(progress, a.requirement),
        unlocked: progress >= a.requirement,
      };
    });

    setAchievements(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const categories = [
    { id: "streak", label: isSw ? "Mfululizo" : "Streak", icon: Fire },
    { id: "community", label: isSw ? "Jamii" : "Community", icon: UsersThree },
    { id: "stories", label: isSw ? "Hadithi" : "Stories", icon: BookBookmark },
    { id: "devotions", label: isSw ? "Ibada" : "Devotions", icon: BookOpen },
  ] as const;

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
          <h1 className="text-xl font-bold flex-1">
            {isSw ? "Mafanikio" : "Achievements"}
          </h1>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Trophy size={28} className="text-yellow-500" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold">
                  {unlockedCount}/{totalCount}
                </p>
                <p className="text-muted-foreground text-sm">
                  {isSw ? "Mafanikio yaliyofunguliwa" : "Achievements unlocked"}
                </p>
              </div>
            </div>
            <Progress
              value={(unlockedCount / totalCount) * 100}
              className="h-2 mt-4"
            />
          </CardContent>
        </Card>

        {/* Categories */}
        {categories.map((cat) => {
          const catAchievements = achievements.filter((a) => a.category === cat.id);
          const catUnlocked = catAchievements.filter((a) => a.unlocked).length;

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-3">
                <cat.icon size={18} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.label}
                </h2>
                <span className="text-muted-foreground text-xs ml-auto">
                  {catUnlocked}/{catAchievements.length}
                </span>
              </div>

              <div className="space-y-2">
                {catAchievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={achievement.unlocked ? "border-yellow-500/20" : ""}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                          achievement.unlocked
                            ? "bg-yellow-500/10"
                            : "bg-muted"
                        }`}
                      >
                        {achievement.unlocked ? achievement.emoji : <Lock size={18} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium text-sm ${achievement.unlocked ? "" : "text-muted-foreground"}`}>
                            {isSw ? achievement.titleSw : achievement.title}
                          </h3>
                          {achievement.unlocked && (
                            <CheckCircle size={14} className="text-green-500" weight="fill" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {isSw ? achievement.descriptionSw : achievement.description}
                        </p>
                        {!achievement.unlocked && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-muted-foreground">
                                {achievement.progress}/{achievement.requirement}
                              </span>
                            </div>
                            <Progress
                              value={(achievement.progress / achievement.requirement) * 100}
                              className="h-1"
                            />
                          </div>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                          <Star size={10} weight="fill" className="mr-1 text-yellow-500" />
                          {isSw ? "Imefunguliwa" : "Unlocked"}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
