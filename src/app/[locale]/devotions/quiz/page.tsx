"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Check, X, Sparkle, ArrowClockwise, ArrowRight } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

type MCQuestion = { type: "multiple_choice"; question: string; options: string[]; answer: string };
type FillQuestion = { type: "fill_blank"; verse: string; answer: string; ref: string };
type TFQuestion  = { type: "true_false"; statement: string; answer: boolean };
type Question = MCQuestion | FillQuestion | TFQuestion;

export default function QuizPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isSw = locale === "sw";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Per-question answer state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState("");
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    fetch(`/api/devotions/quiz?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.questions?.length) {
          setQuestions(data.questions);
          setTheme(data.theme || "");
        } else {
          setError(isSw ? "Imeshindwa kupata maswali" : "Could not load questions");
        }
      })
      .catch(() => setError(isSw ? "Imeshindwa kupata maswali" : "Could not load questions"))
      .finally(() => setLoading(false));
  }, [locale, isSw]);

  const current = questions[currentIdx];

  const checkAnswer = () => {
    if (!current) return;
    let correct = false;
    if (current.type === "multiple_choice") {
      correct = selectedOption === current.answer;
    } else if (current.type === "fill_blank") {
      correct = fillInput.trim().toLowerCase() === current.answer.toLowerCase();
    } else if (current.type === "true_false") {
      correct = tfAnswer === current.answer;
    }
    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setFillInput("");
      setTfAnswer(null);
      setFeedback(null);
    }
  };

  const retry = () => {
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setSelectedOption(null);
    setFillInput("");
    setTfAnswer(null);
    setFeedback(null);
  };

  const progressPct = questions.length > 0 ? ((currentIdx) / questions.length) * 100 : 0;
  const xpEarned = score * 10;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper>
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{t("devotions.quiz_title")}</h1>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (error || questions.length === 0) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{t("devotions.quiz_title")}</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Brain size={32} className="text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground text-sm">{error || (isSw ? "Hakuna maswali leo" : "No questions available today")}</p>
              <Button onClick={() => router.back()} variant="outline" className="gap-2">
                <ArrowLeft size={14} />
                {isSw ? "Rudi" : "Go Back"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ── Finished ──────────────────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6 page-enter">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">{t("devotions.quiz_title")}</h1>
          </div>
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-5xl">{pct >= 75 ? "🏆" : pct >= 50 ? "👍" : "📖"}</div>
              <div>
                <p className="text-2xl font-bold">{score}/{questions.length}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {isSw ? "Majibu sahihi" : "Correct answers"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge className="gap-1 text-sm px-3 py-1">
                  <Sparkle size={13} weight="fill" /> +{xpEarned} XP
                </Badge>
              </div>
              <Progress value={pct} className="h-2" />
              {theme && (
                <p className="text-xs text-muted-foreground">
                  {isSw ? "Mada ya wiki:" : "This week's theme:"} <strong>{theme}</strong>
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={retry} variant="outline" className="flex-1 gap-2">
                  <ArrowClockwise size={16} />
                  {t("common.retry")}
                </Button>
                <Button onClick={() => router.back()} className="flex-1 gap-2">
                  {isSw ? "Maliza" : "Done"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ── Question ───────────────────────────────────────────────────────────────────
  const canCheck =
    (current.type === "multiple_choice" && selectedOption !== null) ||
    (current.type === "fill_blank" && fillInput.trim().length > 0) ||
    (current.type === "true_false" && tfAnswer !== null);

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1">{t("devotions.quiz_title")}</h1>
          {score > 0 && (
            <Badge className="gap-1">
              <Sparkle size={12} weight="fill" /> {score * 10} XP
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{isSw ? "Swali" : "Question"} {currentIdx + 1} / {questions.length}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6 space-y-5">

            {/* Type badge */}
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {current.type === "multiple_choice" ? (isSw ? "Chagua jibu" : "Multiple Choice") :
                 current.type === "fill_blank" ? (isSw ? "Jaza nafasi" : "Fill in the Blank") :
                 (isSw ? "Kweli au Uongo" : "True or False")}
              </span>
            </div>

            {/* Multiple choice */}
            {current.type === "multiple_choice" && (
              <div className="space-y-3">
                <p className="font-medium text-sm leading-relaxed">{current.question}</p>
                <div className="space-y-2">
                  {current.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => !feedback && setSelectedOption(opt)}
                      disabled={!!feedback}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                        feedback
                          ? opt === current.answer
                            ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                            : opt === selectedOption && opt !== current.answer
                              ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
                              : "border-border bg-background opacity-50"
                          : selectedOption === opt
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fill blank */}
            {current.type === "fill_blank" && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed font-medium">
                  {isSw ? "Jaza nafasi:" : "Fill in the blank:"}
                </p>
                <p className="text-sm leading-loose">{current.verse}</p>
                <Input
                  value={fillInput}
                  onChange={(e) => !feedback && setFillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canCheck && !feedback && checkAnswer()}
                  placeholder={isSw ? "Andika jibu..." : "Type your answer..."}
                  disabled={!!feedback}
                  className={feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : ""}
                />
                {feedback === "wrong" && (
                  <p className="text-xs text-muted-foreground">
                    {isSw ? "Jibu sahihi:" : "Correct answer:"} <strong>{current.answer}</strong>
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-right">— {current.ref}</p>
              </div>
            )}

            {/* True / False */}
            {current.type === "true_false" && (
              <div className="space-y-3">
                <p className="font-medium text-sm leading-relaxed">{current.statement}</p>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map((val) => (
                    <button
                      key={String(val)}
                      onClick={() => !feedback && setTfAnswer(val)}
                      disabled={!!feedback}
                      className={`py-3 rounded-lg text-sm font-medium border transition-all ${
                        feedback
                          ? val === current.answer
                            ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
                            : val === tfAnswer && val !== current.answer
                              ? "border-red-500 bg-red-500/10"
                              : "border-border opacity-50"
                          : tfAnswer === val
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      {val ? (isSw ? "Kweli ✓" : "True ✓") : (isSw ? "Uongo ✗" : "False ✗")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback banner */}
            {feedback === "correct" && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <Check size={16} className="text-green-500" weight="bold" />
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                  {isSw ? "Sahihi! +10 XP" : "Correct! +10 XP"}
                </p>
              </div>
            )}
            {feedback === "wrong" && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <X size={16} className="text-red-500" weight="bold" />
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  {isSw ? "Si sahihi" : "Not quite"}
                </p>
              </div>
            )}

            {/* Action button */}
            <div>
              {!feedback ? (
                <Button onClick={checkAnswer} className="w-full" disabled={!canCheck}>
                  {isSw ? "Angalia Jibu" : t("devotions.check_answer")}
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full gap-2">
                  {currentIdx + 1 >= questions.length
                    ? (isSw ? "Angalia Matokeo" : "See Results")
                    : (isSw ? "Swali Lijalo" : "Next Question")}
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
