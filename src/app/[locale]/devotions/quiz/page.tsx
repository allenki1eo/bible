"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, Check, X, Sparkle, ArrowClockwise } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

const quizData = {
  en: { verse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16", blanks: [{ answer: "loved", position: 3 }, { answer: "believes", position: 16 }] },
  sw: { verse: "Kwa maana Mungu aliupenda ulimwengu hivi hata akamtoa Mwanawe wa pecke, ili kila ampendaye asipotee, bali awe na uzima wa milele.", ref: "Yohana 3:16", blanks: [{ answer: "alipenda", position: 5 }, { answer: "ampendaye", position: 14 }] },
};

export default function QuizPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const isSw = locale === "sw";
  const data = (quizData as Record<string, typeof quizData.en>)[locale] || quizData.en;
  const words = data.verse.split(" ");
  const blankIndices = data.blanks.map((b) => b.position);
  const answers = data.blanks.map((b) => b.answer.toLowerCase());

  const [inputs, setInputs] = useState<string[]>(data.blanks.map(() => ""));
  const [attempts, setAttempts] = useState(3);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleCheck = () => {
    const allCorrect = inputs.every((input, i) => input.toLowerCase().trim() === answers[i]);
    if (allCorrect) { setResult("correct"); setCompleted(true); }
    else { setResult("wrong"); setAttempts((prev) => prev - 1); if (attempts <= 1) setCompleted(true); }
  };

  const handleReset = () => { setInputs(data.blanks.map(() => "")); setAttempts(3); setResult(null); setCompleted(false); };

  let blankIdx = 0;
  const renderedVerse = words.map((word, i) => {
    if (blankIndices.includes(i)) {
      const ci = blankIdx++;
      return (
        <span key={i} className="inline-block mx-1">
          {completed && result === "correct" ? (
            <span className="font-bold underline decoration-primary/50">{answers[ci]}</span>
          ) : (
            <Input value={inputs[ci]} onChange={(e) => { const ni = [...inputs]; ni[ci] = e.target.value; setInputs(ni); }} className="inline-block w-28 h-8 text-center text-sm font-bold" disabled={completed} />
          )}
        </span>
      );
    }
    return <span key={i}>{word} </span>;
  });

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1">{t("devotions.quiz_title")}</h1>
          {result === "correct" && <Badge className="gap-1"><Sparkle size={12} weight="fill" /> +10 XP</Badge>}
        </div>

        <div>
          <p className="text-muted-foreground text-sm">{t("devotions.fill_blanks")}</p>
          <div className="flex items-center gap-2 mt-2">
            <Brain size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{attempts} {t("devotions.attempts_remaining")}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="text-lg leading-relaxed">{renderedVerse}</div>
            <p className="text-muted-foreground text-sm font-medium text-right">\u2014 {data.ref}</p>
            <Progress value={((3 - attempts) / 3) * 100} className="h-1.5" />

            {result === "correct" && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20">
                <Check size={18} className="text-green-500" weight="bold" />
                <p className="text-green-500 text-sm font-medium">{t("devotions.correct")}</p>
              </div>
            )}
            {result === "wrong" && !completed && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <X size={18} className="text-red-500" weight="bold" />
                <p className="text-red-500 text-sm font-medium">{t("devotions.try_again")}</p>
              </div>
            )}

            <div className="flex gap-2">
              {!completed ? (
                <Button onClick={handleCheck} className="flex-1" disabled={inputs.some((i) => !i.trim())}>
                  {t("devotions.check_answer")}
                </Button>
              ) : (
                <Button onClick={handleReset} variant="outline" className="flex-1 gap-2">
                  <ArrowClockwise size={16} />
                  {t("common.retry")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
