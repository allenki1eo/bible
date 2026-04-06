"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Brain, Check, X, Sparkle, ArrowClockwise,
  Crown, Fire, Lightning, Trophy, ArrowRight,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────
type MCQuestion  = { type: "multiple_choice"; question: string; options: string[]; answer: string };
type FillQuestion = { type: "fill_blank"; verse: string; answer: string; ref: string };
type TFQuestion  = { type: "true_false"; statement: string; answer: boolean };
type Question    = MCQuestion | FillQuestion | TFQuestion;

// ── Constants ───────────────────────────────────────────────────────────────
const TIMER_SECS = 15;
const BASE_POINTS = 100;
const SPEED_BONUS = 50;  // max bonus for fast answers

// Tier thresholds (max score = questions * 150 with 3x streak)
const TIERS = [
  { min: 580, label: "Champion",   labelSw: "Bingwa",       emoji: "🏆", color: "text-amber-500" },
  { min: 430, label: "Theologian", labelSw: "Mwanatheolojia",emoji: "⭐", color: "text-purple-500" },
  { min: 300, label: "Scholar",    labelSw: "Msomi",         emoji: "📚", color: "text-blue-500"  },
  { min: 150, label: "Disciple",   labelSw: "Mwanafunzi",    emoji: "✝️", color: "text-green-500" },
  { min: 0,   label: "Novice",     labelSw: "Mwanzo",        emoji: "🌱", color: "text-muted-foreground" },
];
function getTier(score: number) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

// ── Timer Bar ───────────────────────────────────────────────────────────────
function TimerBar({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100;
  const color = pct > 50 ? "bg-green-500" : pct > 25 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-linear ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Points Popup ─────────────────────────────────────────────────────────────
function PointsPopup({ pts, show }: { pts: number; show: boolean }) {
  if (!show || pts === 0) return null;
  return (
    <div
      key={pts}
      className="absolute top-0 right-4 text-green-500 font-black text-xl pointer-events-none z-20"
      style={{ animation: "floatUp 1.2s ease-out forwards" }}
    >
      +{pts}
    </div>
  );
}

// ── Streak Flames ─────────────────────────────────────────────────────────────
function StreakDisplay({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return (
    <div className="flex items-center gap-1 text-orange-500">
      <Fire size={16} weight="fill" className="animate-pulse" />
      <span className="text-xs font-bold">{streak}x {streak >= 3 ? "🔥" : ""}</span>
    </div>
  );
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({
  label, selected, feedback, isCorrect, isWrong, onClick,
}: {
  label: string; selected: boolean; feedback: boolean;
  isCorrect: boolean; isWrong: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={feedback}
      className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
        feedback && isCorrect
          ? "border-green-500 bg-green-500/15 text-green-700 dark:text-green-300 scale-[1.01]"
          : feedback && isWrong
            ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300"
            : feedback
              ? "border-border bg-background opacity-40"
              : selected
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent active:scale-95"
      }`}
    >
      <span className="flex items-center gap-2">
        {feedback && isCorrect && <Check size={15} weight="bold" className="text-green-500 shrink-0" />}
        {feedback && isWrong   && <X    size={15} weight="bold" className="text-red-500 shrink-0" />}
        {label}
      </span>
    </button>
  );
}

// ── Main Quiz Component ───────────────────────────────────────────────────────
export default function QuizPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSw = locale === "sw";

  // Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Game state
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Per-question state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput]     = useState("");
  const [tfAnswer, setTfAnswer]       = useState<boolean | null>(null);
  const [feedback, setFeedback]       = useState<"correct" | "wrong" | null>(null);
  const [lastPts, setLastPts]         = useState(0);
  const [showPts, setShowPts]         = useState(false);
  const [questionEnter, setQuestionEnter] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft]     = useState(TIMER_SECS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // ── Load questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/devotions/quiz?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.questions?.length) { setQuestions(d.questions); setTheme(d.theme || ""); }
        else setError(isSw ? "Imeshindwa kupata maswali" : "Could not load questions");
      })
      .catch(() => setError(isSw ? "Hitilafu ya mtandao" : "Network error"))
      .finally(() => setLoading(false));
  }, [locale, isSw]);

  // ── Timer tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;
    if (timeLeft <= 0) { handleAnswer(false, 0); return; }
    timerRef.current = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, feedback]);

  // ── Start game ──────────────────────────────────────────────────────────────
  const startGame = () => {
    setPhase("playing");
    setCurrentIdx(0);
    setTotalScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    resetQuestion();
  };

  const resetQuestion = useCallback(() => {
    clearTimer();
    setTimeLeft(TIMER_SECS);
    setSelectedOption(null);
    setFillInput("");
    setTfAnswer(null);
    setFeedback(null);
    setShowPts(false);
    setQuestionEnter(false);
    setTimeout(() => setQuestionEnter(true), 50);
  }, []);

  // ── Handle answer ───────────────────────────────────────────────────────────
  const handleAnswer = useCallback((correct: boolean, timeSpent: number) => {
    clearTimer();
    const speedBonus = correct
      ? Math.round((Math.max(0, TIMER_SECS - timeSpent) / TIMER_SECS) * SPEED_BONUS)
      : 0;
    const streakMultiplier = correct ? (streak >= 3 ? 2 : streak >= 2 ? 1.5 : 1) : 1;
    const pts = correct ? Math.round((BASE_POINTS + speedBonus) * streakMultiplier) : 0;

    setFeedback(correct ? "correct" : "wrong");
    setLastPts(pts);
    setShowPts(correct);

    if (correct) {
      setTotalScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    // Auto-advance after 1.8 s
    setTimeout(() => advance(), 1800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak]);

  const checkAnswer = () => {
    const current = questions[currentIdx];
    if (!current) return;
    const timeSpent = TIMER_SECS - timeLeft;
    let correct = false;
    if (current.type === "multiple_choice") correct = selectedOption === current.answer;
    else if (current.type === "fill_blank")  correct = fillInput.trim().toLowerCase() === current.answer.toLowerCase();
    else if (current.type === "true_false")  correct = tfAnswer === current.answer;
    handleAnswer(correct, timeSpent);
  };

  const advance = useCallback(() => {
    setCurrentIdx((prev) => {
      const next = prev + 1;
      if (next >= questions.length) {
        setPhase("result");
        return prev;
      }
      resetQuestion();
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, resetQuestion]);

  // ── Save score on result ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "result") return;

    const username = user && !user.isGuest
      ? (user.email?.split("@")[0] ?? "Believer")
      : `Believer_${Math.floor(Math.random() * 9000 + 1000)}`;

    fetch("/api/quiz/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user && !user.isGuest ? user.id : null,
        username,
        score: totalScore,
        totalQuestions: questions.length,
        locale,
        streak: maxStreak,
      }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const current = questions[currentIdx];
  const canCheck =
    (current?.type === "multiple_choice" && selectedOption !== null) ||
    (current?.type === "fill_blank" && fillInput.trim().length > 0) ||
    (current?.type === "true_false" && tfAnswer !== null);

  const pctDone = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
            <h1 className="text-xl font-bold">{isSw ? "Mchezo wa Biblia" : "Scripture Quest"}</h1>
          </div>
          <div className="flex flex-col items-center gap-4 pt-16 pb-8">
            <Brain size={48} className="text-primary animate-pulse" weight="fill" />
            <p className="text-muted-foreground text-sm">{isSw ? "Inaandaa maswali..." : "Preparing your questions..."}</p>
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error || questions.length === 0) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
            <h1 className="text-xl font-bold">{isSw ? "Mchezo wa Biblia" : "Scripture Quest"}</h1>
          </div>
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <Brain size={36} className="text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground text-sm">{error || (isSw ? "Hakuna maswali leo" : "No questions available today")}</p>
              <Button onClick={() => router.back()} variant="outline" className="gap-2"><ArrowLeft size={14} />{isSw ? "Rudi" : "Go Back"}</Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ── Intro Screen ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6 page-enter">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
          </div>
          <div className="text-center space-y-4 pt-6">
            <div className="text-7xl">🎮</div>
            <div>
              <h1 className="text-2xl font-black">{isSw ? "Mchezo wa Maandiko" : "Scripture Quest"}</h1>
              <p className="text-muted-foreground text-sm mt-1">{isSw ? "Shindana na waumini duniani kote!" : "Compete with believers around the world!"}</p>
            </div>
            {theme && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <Sparkle size={14} weight="fill" />
                {isSw ? "Mada:" : "Theme:"} {theme}
              </div>
            )}
          </div>

          {/* Rules */}
          <div className="space-y-2">
            {[
              { icon: "⏱️", text: isSw ? `${TIMER_SECS} sekunde kwa kila swali` : `${TIMER_SECS} seconds per question` },
              { icon: "⚡", text: isSw ? "Jibu haraka = pointi zaidi" : "Answer faster = more points" },
              { icon: "🔥", text: isSw ? "Majibu mfululizo = mzidishaji" : "Consecutive correct = streak multiplier" },
              { icon: "🌍", text: isSw ? "Alama zako zinaonekana duniani" : "Your score goes on the global board" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 text-sm">
                <span className="text-xl">{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>

          <Button onClick={startGame} size="lg" className="w-full text-base font-bold gap-2 py-6">
            <Lightning size={20} weight="fill" />
            {isSw ? "Anza Mchezo!" : "Start Playing!"}
          </Button>

          <Link href="leaderboard" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <span className="flex items-center justify-center gap-1.5">
              <Crown size={14} className="text-amber-500" weight="fill" />
              {isSw ? "Angalia Ubingwa wa Dunia" : "View Global Leaderboard"}
            </span>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    const tierInfo = getTier(totalScore);
    const maxPossible = questions.length * 150;
    const pct = Math.round((totalScore / maxPossible) * 100);

    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-5 page-enter">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
          </div>

          {/* Score card */}
          <Card className="border-primary/20 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-purple-500 to-amber-500" />
            <CardContent className="p-8 text-center space-y-5">
              <div className="text-6xl">{tierInfo.emoji}</div>
              <div>
                <p className={`text-lg font-black uppercase tracking-widest ${tierInfo.color}`}>{isSw ? tierInfo.labelSw : tierInfo.label}</p>
                <p className="text-4xl font-black mt-1">{totalScore}</p>
                <p className="text-muted-foreground text-sm">{isSw ? "pointi" : "points"}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: isSw ? "Sahihi" : "Correct", value: `${correctCount}/${questions.length}`, icon: "✅" },
                  { label: isSw ? "Mfululizo" : "Best Streak", value: `🔥${maxStreak}`, icon: "" },
                  { label: isSw ? "Usahihi" : "Accuracy", value: `${Math.round((correctCount / questions.length) * 100)}%`, icon: "" },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* XP bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isSw ? "Alama" : "Score"}</span>
                  <span>{pct}% {isSw ? "ya alama kamili" : "of max possible"}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-1000"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {theme && (
                <p className="text-xs text-muted-foreground">
                  {isSw ? "Mada ya wiki:" : "Week's theme:"} <strong>{theme}</strong>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Link href="leaderboard">
              <Button variant="outline" className="w-full gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                <Crown size={16} weight="fill" />
                {isSw ? "Angalia Ubingwa wa Dunia" : "See Global Leaderboard"}
              </Button>
            </Link>
            <Button
              onClick={() => { setPhase("intro"); setCurrentIdx(0); setTotalScore(0); setStreak(0); setMaxStreak(0); setCorrectCount(0); }}
              className="w-full gap-2"
            >
              <ArrowClockwise size={16} />
              {isSw ? "Cheza Tena" : "Play Again"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const timerPct = (timeLeft / TIMER_SECS) * 100;

  return (
    <PageWrapper>
      {/* Inject float-up animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1);   opacity: 1; }
          60%  { transform: translateY(-40px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
        }
      `}</style>

      <div className="px-4 py-4 space-y-4 page-enter">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{isSw ? "Swali" : "Q"} {currentIdx + 1}/{questions.length}</span>
              <div className="flex items-center gap-3">
                <StreakDisplay streak={streak} />
                <span className="font-bold text-foreground">{totalScore} {isSw ? "pt" : "pts"}</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pctDone}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {isSw ? "Muda" : "Time"}
            </span>
            <span className={`text-sm font-bold tabular-nums ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-foreground"}`}>
              {timeLeft}s
            </span>
          </div>
          <TimerBar timeLeft={timeLeft} total={TIMER_SECS} />
        </div>

        {/* Question Card */}
        <div className="relative">
          <PointsPopup pts={lastPts} show={showPts} />

          <Card
            className={`transition-all duration-300 ${
              feedback === "correct"
                ? "border-green-500/50 shadow-green-500/10 shadow-lg"
                : feedback === "wrong"
                  ? "border-red-500/50"
                  : "border-border"
            }`}
          >
            <CardContent className="p-5 space-y-5">
              {/* Type label */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  {current.type === "multiple_choice" ? (isSw ? "Chaguo Nyingi" : "Multiple Choice") :
                   current.type === "fill_blank"       ? (isSw ? "Jaza Nafasi" : "Fill the Blank") :
                                                         (isSw ? "Kweli / Uongo" : "True or False")}
                </span>
                {streak >= 2 && (
                  <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                    <Fire size={13} weight="fill" /> {streak}x
                  </span>
                )}
              </div>

              {/* Multiple choice */}
              {current.type === "multiple_choice" && (
                <div className="space-y-3">
                  <p className="font-semibold text-sm leading-relaxed">{current.question}</p>
                  <div className="space-y-2.5">
                    {current.options.map((opt) => (
                      <OptionBtn
                        key={opt}
                        label={opt}
                        selected={selectedOption === opt}
                        feedback={feedback !== null}
                        isCorrect={feedback !== null && opt === current.answer}
                        isWrong={feedback !== null && opt === selectedOption && opt !== current.answer}
                        onClick={() => feedback === null && setSelectedOption(opt)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fill in the blank */}
              {current.type === "fill_blank" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">{isSw ? "Jaza nafasi:" : "Fill in the blank:"}</p>
                  <p className="text-sm leading-loose bg-muted/50 rounded-lg p-3">{current.verse}</p>
                  <Input
                    value={fillInput}
                    onChange={(e) => !feedback && setFillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canCheck && !feedback && checkAnswer()}
                    placeholder={isSw ? "Andika jibu..." : "Type the missing word..."}
                    disabled={!!feedback}
                    autoFocus
                    className={`text-center text-base font-semibold ${
                      feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : ""
                    }`}
                  />
                  {feedback === "wrong" && (
                    <p className="text-xs text-center text-muted-foreground">
                      {isSw ? "Jibu:" : "Answer:"} <strong className="text-foreground">{current.answer}</strong>
                    </p>
                  )}
                  <p className="text-xs text-right text-muted-foreground italic">— {current.ref}</p>
                </div>
              )}

              {/* True / False */}
              {current.type === "true_false" && (
                <div className="space-y-4">
                  <p className="font-semibold text-sm leading-relaxed">{current.statement}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([true, false] as const).map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => !feedback && setTfAnswer(val)}
                        disabled={!!feedback}
                        className={`py-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          feedback && val === current.answer
                            ? "border-green-500 bg-green-500/15 text-green-700 dark:text-green-300"
                            : feedback && val === tfAnswer && val !== current.answer
                              ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300"
                              : feedback
                                ? "border-border opacity-40"
                                : tfAnswer === val
                                  ? val ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"
                                  : "border-border bg-card hover:bg-accent active:scale-95"
                        }`}
                      >
                        {val ? "✓ True" : "✗ False"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {feedback === "correct" && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                  <span className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                    <Check size={16} weight="bold" />
                    {streak >= 3 ? (isSw ? "Bora sana! 🔥🔥🔥" : "On fire! 🔥🔥🔥")
                     : streak >= 2 ? (isSw ? "Vizuri sana! 🔥" : "Great streak! 🔥")
                     : (isSw ? "Sahihi! ✓" : "Correct! ✓")}
                  </span>
                  <span className="font-black text-green-600 dark:text-green-400">+{lastPts}</span>
                </div>
              )}
              {feedback === "wrong" && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <X size={16} weight="bold" className="text-red-500 shrink-0" />
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {timeLeft === 0 ? (isSw ? "Muda uliisha!" : "Time's up!") : (isSw ? "Jibu si sahihi" : "Not quite")}
                  </span>
                </div>
              )}

              {/* Action */}
              {!feedback && (
                <Button onClick={checkAnswer} disabled={!canCheck} className="w-full gap-2 font-semibold">
                  <Lightning size={16} weight="fill" />
                  {isSw ? "Angalia" : "Submit Answer"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Score summary strip */}
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Trophy size={12} weight="fill" className="text-amber-500" />
            {totalScore} {isSw ? "pointi" : "pts"}
          </span>
          <span>{correctCount}/{currentIdx + (feedback ? 1 : 0)} {isSw ? "sahihi" : "correct"}</span>
          <span>{isSw ? "🔥 Mfululizo:" : "🔥 Streak:"} {streak}</span>
        </div>
      </div>
    </PageWrapper>
  );
}
