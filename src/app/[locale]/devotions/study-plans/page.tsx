"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Play, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { STUDY_PLANS, getTodayChapter, getProgressDays, type StudyPlan } from "@/lib/study-plans";

type Enrollment = Record<string, { enrolledAt: string }>;

function loadEnrollments(): Enrollment {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("nuru_study_plans") || "{}");
  } catch {
    return {};
  }
}

function saveEnrollments(e: Enrollment) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nuru_study_plans", JSON.stringify(e));
}

export default function StudyPlansPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isSw = locale === "sw";

  const [enrollments, setEnrollments] = useState<Enrollment>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnrollments(loadEnrollments());
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
              {isSw ? "Mipango ya Usomaji" : "Bible Study Plans"}
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              {isSw ? "Soma Biblia kwa mpango, siku moja kwa wakati" : "Read through the Bible, one chapter at a time"}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {STUDY_PLANS.map((plan) => {
            const enrollment = enrollments[plan.id];
            const isEnrolled = !!enrollment;
            const progressDays = isEnrolled ? getProgressDays(enrollment.enrolledAt, plan.totalDays) : 0;
            const todayChapter = isEnrolled ? getTodayChapter(plan, enrollment.enrolledAt) : null;
            const isComplete = isEnrolled && progressDays >= plan.totalDays;
            const progressPct = (progressDays / plan.totalDays) * 100;

            return (
              <Card key={plan.id} className={isEnrolled ? "border-primary/30 bg-primary/5" : ""}>
                <CardContent className="p-5 space-y-4">
                  {/* Plan header */}
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none mt-0.5">{plan.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-base">
                          {isSw ? plan.titleSw : plan.title}
                        </h2>
                        {isComplete && (
                          <Badge className="gap-1 text-xs">
                            <CheckCircle size={11} weight="fill" /> {isSw ? "Imekamilika" : "Complete"}
                          </Badge>
                        )}
                        {isEnrolled && !isComplete && (
                          <Badge variant="secondary" className="text-xs">
                            {isSw ? "Inaendelea" : "In Progress"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {isSw ? plan.descriptionSw : plan.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {plan.totalDays} {isSw ? "siku" : "days"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar (only when enrolled) */}
                  {isEnrolled && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{isSw ? "Maendeleo" : "Progress"}</span>
                        <span>{progressDays}/{plan.totalDays} {isSw ? "siku" : "days"}</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                  )}

                  {/* Today's chapter */}
                  {mounted && isEnrolled && !isComplete && todayChapter && (
                    <div className="bg-primary/10 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {isSw ? "Leo" : "Today"}
                      </p>
                      <p className="text-sm font-medium">
                        {todayChapter.book} {todayChapter.chapter} — {todayChapter.title}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        "{todayChapter.memoryVerse}" — {todayChapter.memoryRef}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isEnrolled ? (
                      <Button onClick={() => enroll(plan)} className="flex-1 gap-2" size="sm">
                        <Play size={14} weight="fill" />
                        {isSw ? "Anza Mpango" : "Start Plan"}
                      </Button>
                    ) : isComplete ? (
                      <Button
                        variant="outline"
                        onClick={() => unenroll(plan.id)}
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        {isSw ? "Anza Upya" : "Restart Plan"}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          size="sm"
                          onClick={() => {
                            if (todayChapter) {
                              router.push(`/${locale}/devotions`);
                            }
                          }}
                        >
                          <BookOpen size={14} />
                          {isSw ? "Soma Leo" : "Read Today"}
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
