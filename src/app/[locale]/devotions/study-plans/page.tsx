"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, ArrowLeft, Play, CheckCircle, ArrowRight, ArrowClockwise,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { STUDY_PLANS, getTodayChapter, getProgressDays, type StudyPlan } from "@/lib/study-plans";

type Enrollment = Record<string, { enrolledAt: string }>;
type Completions = Record<string, number[]>;

function loadEnrollments(): Enrollment {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("nuru_study_plans") || "{}"); } catch { return {}; }
}
function saveEnrollments(e: Enrollment) {
  localStorage.setItem("nuru_study_plans", JSON.stringify(e));
}
function loadCompletions(): Completions {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("nuru_study_completions") || "{}"); } catch { return {}; }
}

export default function StudyPlansPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const isSw = locale === "sw";

  const [enrollments, setEnrollments] = useState<Enrollment>({});
  const [completions, setCompletions] = useState<Completions>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnrollments(loadEnrollments());
    setCompletions(loadCompletions());
    setMounted(true);
  }, []);

  const enroll = (plan: StudyPlan) => {
    const updated = { ...enrollments, [plan.id]: { enrolledAt: new Date().toISOString().slice(0, 10) } };
    setEnrollments(updated);
    saveEnrollments(updated);
  };

  const unenroll = (planId: string) => {
    const updated = { ...enrollments };
    delete updated[planId];
    setEnrollments(updated);
    saveEnrollments(updated);
  };

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
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen size={20} className="text-primary" weight="fill" />
              {isSw ? "Mipango ya Usomaji wa Biblia" : "Bible Study Plans"}
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {isSw ? "Mafunzo ya kina kama kikundi cha Biblia — sura moja kwa wakati" : "In-depth group-style study — one chapter at a time"}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {STUDY_PLANS.map((plan) => {
            const enrollment = enrollments[plan.id];
            const isEnrolled = !!enrollment;
            // completedDays = days the user manually marked ✓ (source of truth)
            const completedDays = (completions[plan.id] ?? []).length;
            // nextDay = the day they should study next (1-based)
            const nextDay = completedDays + 1;
            // todayChapter = the chapter for the next uncompleted day
            const todayChapter = mounted && isEnrolled
              ? (plan.chapters.find((c) => c.day === nextDay) ?? null)
              : null;
            const isPlanComplete = isEnrolled && completedDays >= plan.totalDays;
            const progressPct   = Math.min((completedDays / plan.totalDays) * 100, 100);

            return (
              <Card key={plan.id} className={isEnrolled ? "border-primary/30" : ""}>
                <CardContent className="p-5 space-y-4">
                  {/* Plan header */}
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none mt-0.5 select-none">{plan.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-base">{isSw ? plan.titleSw : plan.title}</h2>
                        {isPlanComplete && (
                          <Badge className="gap-1 text-xs bg-green-600">
                            <CheckCircle size={11} weight="fill" /> {isSw ? "Imekamilika" : "Complete"}
                          </Badge>
                        )}
                        {isEnrolled && !isPlanComplete && (
                          <Badge variant="secondary" className="text-xs">{isSw ? "Inaendelea" : "In Progress"}</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {isSw ? plan.descriptionSw : plan.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {plan.totalDays} {isSw ? "siku" : "days"}
                        {isEnrolled && ` · ${completedDays} ${isSw ? "zimekamilika" : "completed"}`}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {isEnrolled && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{isSw ? "Maendeleo" : "Progress"}</span>
                        <span>{completedDays}/{plan.totalDays}</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                  )}

                  {/* Today's chapter preview */}
                  {mounted && isEnrolled && !isPlanComplete && todayChapter && (
                    <div className="bg-primary/8 border border-primary/15 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">
                        {isSw ? `Siku ${nextDay} — Leo` : `Day ${nextDay} — Today`}
                      </p>
                      <p className="text-sm font-semibold">
                        {todayChapter.book} {todayChapter.chapter} — {todayChapter.title}
                      </p>
                      <p className="text-xs text-muted-foreground italic leading-snug line-clamp-2">
                        &ldquo;{todayChapter.memoryVerse}&rdquo; — {todayChapter.memoryRef}
                      </p>
                    </div>
                  )}

                  {/* Complete message */}
                  {isPlanComplete && (
                    <div className="text-center py-2 space-y-1">
                      <div className="text-3xl">🏆</div>
                      <p className="font-semibold text-sm">
                        {isSw ? "Hongera! Umekamilisha mpango huu!" : "You completed this plan!"}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isEnrolled ? (
                      <Button onClick={() => enroll(plan)} className="flex-1 gap-2" size="sm">
                        <Play size={14} weight="fill" />
                        {isSw ? "Anza Mpango" : "Start This Plan"}
                      </Button>
                    ) : isPlanComplete ? (
                      <Button variant="outline" onClick={() => unenroll(plan.id)} className="flex-1 gap-2" size="sm">
                        <ArrowClockwise size={14} />
                        {isSw ? "Anza Upya" : "Restart Plan"}
                      </Button>
                    ) : (
                      <>
                        <Button
                          className="flex-1 gap-2"
                          size="sm"
                          onClick={() => router.push(`study-plans/${plan.id}`)}
                        >
                          <BookOpen size={14} />
                          {isSw ? "Soma Siku ya Leo" : "Study Today"}
                          <ArrowRight size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => unenroll(plan.id)}
                        >
                          {isSw ? "Ondoka" : "Leave"}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="h-4" />
      </div>
    </PageWrapper>
  );
}
