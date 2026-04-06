"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BookOpen, CheckCircle, ArrowClockwise,
  BookmarkSimple, SpeakerHigh
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { STUDY_PLANS, getTodayChapter, getProgressDays } from "@/lib/study-plans";
import { useToast } from "@/components/toast";

// ── Markdown renderer ──────────────────────────────────────────────────────
function StudyContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let key = 0;
  let inList = false;

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line) {
      inList = false;
      nodes.push(<div key={key++} className="h-4" />);
      continue;
    }

    if (line.startsWith("## ")) {
      inList = false;
      nodes.push(
        <h2 key={key++} className="text-xl font-black mt-8 mb-3 text-foreground border-b-2 border-primary/20 pb-2 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-primary inline-block" />
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      inList = false;
      nodes.push(
        <h3 key={key++} className="text-base font-bold mt-5 mb-2 text-primary">
          {line.slice(4)}
        </h3>
      );
    } else if (/^\d+\.\s/.test(line)) {
      if (!inList) { inList = true; }
      nodes.push(
        <div key={key++} className="flex gap-3 mb-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {line.match(/^(\d+)\./)?.[1]}
          </span>
          <p className="text-sm leading-relaxed text-foreground/90 flex-1">
            <InlineText text={line.replace(/^\d+\.\s/, "")} />
          </p>
        </div>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      nodes.push(
        <div key={key++} className="flex gap-2 mb-1.5">
          <span className="text-primary mt-1.5 text-xs">●</span>
          <p className="text-sm leading-relaxed text-foreground/90">
            <InlineText text={line.slice(2)} />
          </p>
        </div>
      );
    } else {
      inList = false;
      nodes.push(
        <p key={key++} className="text-sm leading-relaxed text-foreground/90 mb-1">
          <InlineText text={line} />
        </p>
      );
    }
  }

  return <div>{nodes}</div>;
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Completion helpers ─────────────────────────────────────────────────────
function loadCompletions(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("nuru_study_completions") || "{}"); } catch { return {}; }
}
function saveCompletions(c: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nuru_study_completions", JSON.stringify(c));
}
function loadEnrollment(planId: string): { enrolledAt: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem("nuru_study_plans") || "{}");
    return all[planId] ?? null;
  } catch { return null; }
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function StudyPlanReaderPage({ params }: { params: Promise<{ planId: string }> }) {
  const { locale } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const isSw = locale === "sw";

  const { planId } = use(params);
  const plan = STUDY_PLANS.find((p) => p.id === planId);

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [dayNumber, setDayNumber] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!plan) return;
    const enrollment = loadEnrollment(planId);
    if (!enrollment) return;

    const progressDays = getProgressDays(enrollment.enrolledAt, plan.totalDays);
    const day = progressDays + 1;
    setDayNumber(day);

    const completions = loadCompletions();
    setIsComplete((completions[planId] ?? []).includes(day));

    const todayChapter = getTodayChapter(plan, enrollment.enrolledAt);
    if (todayChapter) loadContent(todayChapter, day);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, plan]);

  // Scroll progress tracking
  useEffect(() => {
    const handler = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const loadContent = useCallback(async (todayChapter: NonNullable<ReturnType<typeof getTodayChapter>>, day: number) => {
    if (!plan) return;
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
        day: String(day),
      });
      const res = await fetch(`/api/devotions/study-chapter?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContent(data.content);
    } catch {
      setError(isSw ? "Imeshindwa kupakia mafunzo" : "Could not load the study content. Please try again.");
    }
    setLoading(false);
  }, [plan, locale, isSw]);

  const markComplete = () => {
    if (!plan) return;
    const completions = loadCompletions();
    const current = completions[planId] ?? [];
    if (!current.includes(dayNumber)) {
      const updated = { ...completions, [planId]: [...current, dayNumber] };
      saveCompletions(updated);
    }
    setIsComplete(true);
    toast(isSw ? "Umekamilisha siku hii! 🎉" : "Day marked complete! 🎉", "success");
  };

  if (!plan) {
    return (
      <PageWrapper>
        <div className="px-4 py-6">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
          <p className="text-muted-foreground mt-4">{isSw ? "Mpango haukupatikana" : "Plan not found"}</p>
        </div>
      </PageWrapper>
    );
  }

  const enrollment = typeof window !== "undefined" ? loadEnrollment(planId) : null;
  const todayChapter = enrollment ? getTodayChapter(plan, enrollment.enrolledAt) : null;
  const progressDays = enrollment ? getProgressDays(enrollment.enrolledAt, plan.totalDays) : 0;

  return (
    <PageWrapper>
      {/* Reading progress bar (fixed top) */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary to-emerald-500 z-50 transition-all"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={12} />
              {isSw ? plan.titleSw : plan.title}
            </p>
            <h1 className="font-bold text-lg leading-tight truncate">
              {todayChapter
                ? `${todayChapter.book} ${todayChapter.chapter}`
                : (isSw ? "Siku ya Leo" : "Today's Study")}
            </h1>
          </div>
          {isComplete && (
            <Badge className="gap-1 bg-green-600 shrink-0">
              <CheckCircle size={11} weight="fill" />
              {isSw ? "Imekamilika" : "Done"}
            </Badge>
          )}
        </div>

        {/* Chapter Hero Card */}
        {todayChapter && (
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 p-5 mb-8 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {isSw ? `Siku ${dayNumber} kati ya ${plan.totalDays}` : `Day ${dayNumber} of ${plan.totalDays}`}
                </span>
                <h2 className="text-2xl font-black mt-1">
                  {todayChapter.book} {todayChapter.chapter}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">{todayChapter.title}</p>
              </div>
              <div className="text-4xl shrink-0">{plan.icon}</div>
            </div>

            {/* Memory verse */}
            <div className="border-l-4 border-primary pl-4 py-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                {isSw ? "Aya ya Kumbukumbu" : "Memory Verse"}
              </p>
              <p className="text-sm italic leading-relaxed text-foreground/90">
                &ldquo;{todayChapter.memoryVerse}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-1">— {todayChapter.memoryRef}</p>
            </div>

            {/* Progress pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{progressDays}/{plan.totalDays} {isSw ? "siku" : "days"}</span>
              <div className="flex-1 h-1.5 rounded-full bg-background/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(progressDays / plan.totalDays) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Study Content */}
        <div className="pb-32">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="flex flex-col items-center gap-4">
                <BookOpen size={36} className="text-primary animate-pulse" weight="fill" />
                <p className="text-muted-foreground text-sm">
                  {isSw ? "Inaandaa mafunzo ya Biblia..." : "Preparing your Bible study..."}
                </p>
              </div>
              <div className="space-y-3 pt-4">
                {[100, 80, 95, 70, 85, 60, 90].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-muted animate-pulse"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => todayChapter && loadContent(todayChapter, dayNumber)}
              >
                <ArrowClockwise size={15} />
                {isSw ? "Jaribu tena" : "Try again"}
              </Button>
            </div>
          ) : content ? (
            <StudyContent text={content} />
          ) : null}

          {/* Mark complete — inline at bottom of content, always visible above nav */}
          {!loading && !error && (
            <div className="mt-10 pt-6 border-t border-border">
              {!isComplete ? (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={markComplete}
                >
                  <CheckCircle size={18} weight="fill" />
                  {isSw ? "Nimekamilisha Siku Hii" : "Mark Day as Complete"}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-600/10 border border-green-600/20 text-green-600 dark:text-green-400 font-semibold">
                    <CheckCircle size={18} weight="fill" />
                    {isSw ? "Umekamilisha siku hii! 🎉" : "Day Complete! Great work! 🎉"}
                  </div>
                  <Button variant="outline" className="w-full gap-2" onClick={() => router.back()}>
                    <BookmarkSimple size={16} />
                    {isSw ? "Rudi kwenye Mipango" : "Back to Study Plans"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
