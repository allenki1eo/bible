"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ArrowLeft,
  Play,
  CheckCircle,
  CaretDown,
  CaretUp,
  Sparkle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { STUDY_PLANS, getTodayChapter, getProgressDays, type StudyPlan, type StudyPlanChapter } from "@/lib/study-plans";

// ── Persistence helpers ──────────────────────────────────────────────────────

type Enrollment = Record<string, { enrolledAt: string }>;
type Completions = Record<string, number[]>; // planId → array of completed day numbers

function loadEnrollments(): Enrollment {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("nuru_study_plans") || "{}"); } catch { return {}; }
}
function saveEnrollments(e: Enrollment) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nuru_study_plans", JSON.stringify(e));
}
function loadCompletions(): Completions {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("nuru_study_completions") || "{}"); } catch { return {}; }
}
function saveCompletions(c: Completions) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nuru_study_completions", JSON.stringify(c));
}

// ── Markdown-like renderer ───────────────────────────────────────────────────
// Renders the AI-generated markdown (##, ###, **bold**, *italic*, numbered lists)
function StudyContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) { nodes.push(<div key={key++} className="h-3" />); continue; }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={key++} className="text-sm font-bold mt-4 mb-1 text-foreground">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      nodes.push(
        <h2 key={key++} className="text-base font-bold mt-5 mb-2 text-primary border-b border-primary/20 pb-1">
          {line.slice(3)}
        </h2>
      );
    } else if (/^\d+\.\s/.test(line)) {
      nodes.push(
        <li key={key++} className="ml-4 text-sm leading-relaxed text-foreground/90 list-decimal">
          <InlineText text={line.replace(/^\d+\.\s/, "")} />
        </li>
      );
    } else {
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed text-foreground/90">
          <InlineText text={line} />
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

function InlineText({ text }: { text: string }) {
  // Handle **bold** and *italic* inline
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Plan reading panel ───────────────────────────────────────────────────────

function PlanStudyPanel({
  plan,
  todayChapter,
  dayNumber,
  locale,
  isComplete: alreadyComplete,
  onComplete,
}: {
  plan: StudyPlan;
  todayChapter: StudyPlanChapter;
  dayNumber: number;
  locale: string;
  isComplete: boolean;
  onComplete: () => void;
}) {
  const isSw = locale === "sw";
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");

  const fetchContent = useCallback(async () => {
    if (content || loading) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        book: todayChapter.book,
        chapter: String(todayChapter.chapter),
        title: todayChapter.title,
        memoryVerse: todayChapter.memoryVerse,
        memoryRef: todayChapter.memoryRef,
        locale,
        planId: plan.id,
        day: String(dayNumber),
      });
      const res = await fetch(`/api/devotions/study-chapter?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setContent(data.content);
    } catch {
      setError(isSw ? "Imeshindwa kupakia mafunzo" : "Could not load study content");
    }
    setLoading(false);
  }, [content, loading, todayChapter, locale, plan.id, dayNumber, isSw]);

  // Trigger fetch when user wants to read
  const handleReadMore = () => {
    if (!expanded) {
      fetchContent();
    }
    setExpanded((v) => !v);
  };

  const PREVIEW_CHARS = 300;
  const preview = content ? content.replace(/#{1,3} /g, "").replace(/\*\*/g, "").slice(0, PREVIEW_CHARS) : "";

  return (
    <div className="space-y-3">
      {/* Chapter card */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            {isSw ? `Siku ${dayNumber}` : `Day ${dayNumber}`}
          </span>
          {alreadyComplete && (
            <Badge className="gap-1 text-xs bg-green-600">
              <CheckCircle size={11} weight="fill" />
              {isSw ? "Imekamilika" : "Complete"}
            </Badge>
          )}
        </div>
        <p className="font-bold text-base">
          {todayChapter.book} {todayChapter.chapter} — {todayChapter.title}
        </p>
        <blockquote className="border-l-2 border-primary/40 pl-3 italic text-xs text-muted-foreground leading-relaxed">
          &ldquo;{todayChapter.memoryVerse}&rdquo;
          <span className="block not-italic font-medium mt-0.5">— {todayChapter.memoryRef}</span>
        </blockquote>
      </div>

      {/* Content preview / full */}
      {content && !expanded && (
        <div className="text-sm text-foreground/80 leading-relaxed px-1">
          {preview}{preview.length >= PREVIEW_CHARS ? "..." : ""}
        </div>
      )}

      {/* Full content */}
      {expanded && (
        <Card className="border-primary/10">
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[80, 100, 60, 90, 70].map((w, i) => (
                  <div key={i} className={`h-3 rounded bg-muted animate-pulse`} style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button size="sm" variant="outline" onClick={() => { setError(""); fetchContent(); }} className="gap-2">
                  <ArrowClockwise size={14} /> {isSw ? "Jaribu tena" : "Try again"}
                </Button>
              </div>
            ) : content ? (
              <StudyContent text={content} />
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Loading state before content arrives */}
      {loading && !expanded && (
        <Card>
          <CardContent className="p-5 space-y-3">
            {[80, 100, 60, 90, 70].map((w, i) => (
              <div key={i} className="h-3 rounded bg-muted animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Read More / Show Less button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleReadMore}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            {isSw ? "Inapakia..." : "Loading study..."}
          </>
        ) : expanded ? (
          <>
            <CaretUp size={15} />
            {isSw ? "Funga" : "Show Less"}
          </>
        ) : (
          <>
            <CaretDown size={15} />
            {isSw ? "Soma Zaidi" : "Read More"}
          </>
        )}
      </Button>

      {/* Mark complete */}
      {!alreadyComplete && (
        <Button
          className="w-full gap-2"
          onClick={onComplete}
        >
          <CheckCircle size={16} weight="fill" />
          {isSw ? "Nimekamilisha Siku Hii" : "Mark Day Complete"}
        </Button>
      )}

      {alreadyComplete && (
        <div className="flex items-center justify-center gap-2 py-2 text-green-600 dark:text-green-400 text-sm font-medium">
          <CheckCircle size={16} weight="fill" />
          {isSw ? "Umekamilisha siku hii! 🎉" : "You completed this day! 🎉"}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function StudyPlansPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const isSw = locale === "sw";

  const [enrollments, setEnrollments] = useState<Enrollment>({});
  const [completions, setCompletions] = useState<Completions>({});
  const [mounted, setMounted] = useState(false);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  useEffect(() => {
    setEnrollments(loadEnrollments());
    setCompletions(loadCompletions());
    setMounted(true);
  }, []);

  const enroll = (plan: StudyPlan) => {
    const updated = { ...enrollments, [plan.id]: { enrolledAt: new Date().toISOString().slice(0, 10) } };
    setEnrollments(updated);
    saveEnrollments(updated);
    setOpenPlanId(plan.id);
  };

  const unenroll = (planId: string) => {
    const updatedE = { ...enrollments };
    delete updatedE[planId];
    setEnrollments(updatedE);
    saveEnrollments(updatedE);

    const updatedC = { ...completions };
    delete updatedC[planId];
    setCompletions(updatedC);
    saveCompletions(updatedC);

    if (openPlanId === planId) setOpenPlanId(null);
  };

  const markComplete = (planId: string, dayNumber: number) => {
    const current = completions[planId] ?? [];
    if (current.includes(dayNumber)) return;
    const updated = { ...completions, [planId]: [...current, dayNumber] };
    setCompletions(updated);
    saveCompletions(updated);
  };

  const isDayComplete = (planId: string, dayNumber: number) =>
    (completions[planId] ?? []).includes(dayNumber);

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
              {isSw
                ? "Mafunzo ya kina kama kikundi cha Biblia — sura moja kwa wakati"
                : "In-depth group-style study — one chapter at a time"}
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-5">
          {STUDY_PLANS.map((plan) => {
            const enrollment = enrollments[plan.id];
            const isEnrolled = !!enrollment;
            const progressDays = isEnrolled ? getProgressDays(enrollment.enrolledAt, plan.totalDays) : 0;
            const todayChapter = mounted && isEnrolled ? getTodayChapter(plan, enrollment.enrolledAt) : null;
            const isPlanComplete = isEnrolled && progressDays >= plan.totalDays;
            const progressPct = Math.min((progressDays / plan.totalDays) * 100, 100);
            const completedDays = (completions[plan.id] ?? []).length;
            const isOpen = openPlanId === plan.id;

            return (
              <Card
                key={plan.id}
                className={isEnrolled ? "border-primary/30" : ""}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Plan header — always visible */}
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => isEnrolled && setOpenPlanId(isOpen ? null : plan.id)}
                  >
                    <div className="text-3xl leading-none mt-0.5 select-none">{plan.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-base">
                          {isSw ? plan.titleSw : plan.title}
                        </h2>
                        {isPlanComplete && (
                          <Badge className="gap-1 text-xs bg-green-600">
                            <CheckCircle size={11} weight="fill" />
                            {isSw ? "Imekamilika" : "Complete"}
                          </Badge>
                        )}
                        {isEnrolled && !isPlanComplete && (
                          <Badge variant="secondary" className="text-xs">
                            {isSw ? "Inaendelea" : "In Progress"}
                          </Badge>
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
                    {isEnrolled && (
                      <div className="text-muted-foreground mt-1">
                        {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {isEnrolled && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{isSw ? "Maendeleo" : "Progress"}</span>
                        <span>{progressDays}/{plan.totalDays}</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                  )}

                  {/* Expanded: today's full study */}
                  {mounted && isEnrolled && !isPlanComplete && isOpen && todayChapter && (
                    <PlanStudyPanel
                      plan={plan}
                      todayChapter={todayChapter}
                      dayNumber={progressDays + 1}
                      locale={locale}
                      isComplete={isDayComplete(plan.id, progressDays + 1)}
                      onComplete={() => markComplete(plan.id, progressDays + 1)}
                    />
                  )}

                  {/* Plan complete message */}
                  {isPlanComplete && isOpen && (
                    <div className="text-center py-4 space-y-2">
                      <div className="text-4xl">🏆</div>
                      <p className="font-semibold">
                        {isSw ? "Hongera! Umekamilisha mpango huu!" : "Congratulations! You finished this plan!"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSw ? `Umesoma sura ${plan.totalDays}` : `${plan.totalDays} chapters studied`}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
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
                          variant={isOpen ? "secondary" : "default"}
                          className="flex-1 gap-2"
                          size="sm"
                          onClick={() => setOpenPlanId(isOpen ? null : plan.id)}
                        >
                          <Sparkle size={14} weight="fill" />
                          {isOpen
                            ? (isSw ? "Funga" : "Close")
                            : (isSw ? "Soma Leo" : "Study Today")}
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
