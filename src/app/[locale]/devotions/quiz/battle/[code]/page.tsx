"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Crown, Users, Lightning, ShareNetwork, ArrowClockwise } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";

const TIMER_SECS = 15;
const BASE_PTS   = 100;
const SPEED_BONUS = 50;

type Question =
  | { type: "multiple_choice" | "who_said_it"; question?: string; quote?: string; options: string[]; answer: string; category?: string }
  | { type: "fill_blank"; verse: string; answer: string; ref: string; category?: string }
  | { type: "true_false"; statement: string; answer: boolean; category?: string };

type Room = {
  code: string;
  host_name: string;
  guest_name: string | null;
  questions: Question[];
  host_score: number;
  guest_score: number;
  host_finished: boolean;
  guest_finished: boolean;
  status: "waiting" | "playing" | "finished";
};

// ── Poll hook — replaces Realtime for simplicity ─────────────────────────────
function useRoomPoll(code: string, interval = 2000) {
  const [room, setRoom]   = useState<Room | null>(null);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const r = await fetch(`/api/quiz/rooms?code=${code}`);
      if (!r.ok) { setError("Room not found"); return; }
      const data: Room = await r.json();
      setRoom(data);
    } catch { setError("Network error"); }
  }, [code]);

  useEffect(() => {
    fetch_();
    timerRef.current = setInterval(fetch_, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetch_, interval]);

  return { room, error, refresh: fetch_ };
}

export default function BattleGamePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { locale } = useTranslation();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();

  const role = searchParams.get("role") ?? "guest"; // "host" | "guest"
  const myName = searchParams.get("name") ?? (role === "host" ? "Host" : "Guest");
  const isSw = locale === "sw";

  const { room, error: roomError, refresh } = useRoomPoll(code, 1500);

  // Game state
  const [phase, setPhase]           = useState<"waiting" | "playing" | "result">("waiting");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [myScore, setMyScore]       = useState(0);
  const [myAnswers, setMyAnswers]   = useState<string[]>([]);
  const [streak, setStreak]         = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Per-question
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput]           = useState("");
  const [tfAnswer, setTfAnswer]             = useState<boolean | null>(null);
  const [feedback, setFeedback]             = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft]             = useState(TIMER_SECS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  const questions: Question[] = room?.questions ?? [];
  const current = questions[currentIdx];

  // ── Start playing when guest joins ───────────────────────────────────────────
  useEffect(() => {
    if (room?.status === "playing" && phase === "waiting") setPhase("playing");
  }, [room?.status, phase]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "playing" || feedback !== null) return;
    if (timeLeft <= 0) { handleAnswer(false, TIMER_SECS); return; }
    timerRef.current = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, feedback]);

  const resetQuestion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeLeft(TIMER_SECS);
    setSelectedOption(null);
    setFillInput("");
    setTfAnswer(null);
    setFeedback(null);
  };

  const handleAnswer = useCallback((correct: boolean, timeSpent: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const speed = correct ? Math.round((Math.max(0, TIMER_SECS - timeSpent) / TIMER_SECS) * SPEED_BONUS) : 0;
    const mult  = correct ? (streak >= 3 ? 2 : streak >= 2 ? 1.5 : 1) : 1;
    const pts   = correct ? Math.round((BASE_PTS + speed) * mult) : 0;

    setFeedback(correct ? "correct" : "wrong");
    const newScore = myScore + pts;
    const newAnswers = [...myAnswers, correct ? "correct" : "wrong"];
    setMyScore(newScore);
    setMyAnswers(newAnswers);
    if (correct) { setCorrectCount((c) => c + 1); setStreak((s) => s + 1); }
    else setStreak(0);

    const nextIdx = currentIdx + 1;
    setTimeout(() => {
      if (nextIdx >= questions.length) {
        // Submit score
        if (!submittedRef.current) {
          submittedRef.current = true;
          fetch("/api/quiz/rooms", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              action: role === "host" ? "host_finish" : "guest_finish",
              score: newScore,
              answers: newAnswers,
            }),
          }).then(refresh);
        }
        setPhase("result");
      } else {
        setCurrentIdx(nextIdx);
        resetQuestion();
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myScore, myAnswers, streak, currentIdx, questions.length, code, role]);

  const checkAnswer = () => {
    if (!current) return;
    const timeSpent = TIMER_SECS - timeLeft;
    let correct = false;
    if (current.type === "multiple_choice" || current.type === "who_said_it")
      correct = selectedOption === current.answer;
    else if (current.type === "fill_blank")
      correct = fillInput.trim().toLowerCase() === current.answer.toLowerCase();
    else if (current.type === "true_false")
      correct = tfAnswer === current.answer;
    handleAnswer(correct, timeSpent);
  };

  const canCheck =
    ((current?.type === "multiple_choice" || current?.type === "who_said_it") && selectedOption !== null) ||
    (current?.type === "fill_blank" && fillInput.trim().length > 0) ||
    (current?.type === "true_false" && tfAnswer !== null);

  const shareCode = async () => {
    const text = isSw
      ? `Jiunge na vita vya Biblia! Nambari ya chumba: ${code} — Fungua Nuru na uingie chumbani.`
      : `Join my Bible Battle! Room code: ${code} — Open Nuru and tap "Join Room".`;
    try { await navigator.share({ title: "Bible Battle — Nuru", text }); }
    catch { await navigator.clipboard.writeText(text).catch(() => {}); }
  };

  const opponentName = role === "host" ? room?.guest_name : room?.host_name;
  const opponentScore = role === "host" ? (room?.guest_score ?? 0) : (room?.host_score ?? 0);
  const opponentFinished = role === "host" ? room?.guest_finished : room?.host_finished;

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if (phase === "waiting" || (room && room.status === "waiting")) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6 page-enter">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
            <h1 className="text-xl font-bold">{isSw ? "Kusubiri Mpinzani..." : "Waiting for Opponent..."}</h1>
          </div>

          <Card className="border-primary/30">
            <CardContent className="p-8 text-center space-y-6">
              <div className="text-5xl animate-bounce">⚔️</div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  {isSw ? "Nambari ya Chumba" : "Room Code"}
                </p>
                <div className="text-4xl font-black tracking-widest text-foreground bg-muted/50 rounded-2xl py-4 px-6 inline-block">
                  {code}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isSw
                  ? "Shiriki nambari hii na rafiki yako ili waingie. Mchezo utaanza mara wakiingia."
                  : "Share this code with your friend. The battle starts as soon as they join."}
              </p>
              <Button onClick={shareCode} variant="outline" className="w-full gap-2">
                <ShareNetwork size={16} />
                {isSw ? "Shiriki Nambari" : "Share Room Code"}
              </Button>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">{myName}</span>
                </div>
                <span className="text-muted-foreground text-sm">vs</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
                  <span className="text-sm text-muted-foreground">{isSw ? "Kusubiri..." : "Waiting..."}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {roomError && <p className="text-xs text-destructive text-center">{roomError}</p>}
        </div>
      </PageWrapper>
    );
  }

  // ── RESULT ────────────────────────────────────────────────────────────────────
  if (phase === "result") {
    const myPct  = Math.round((myScore / (questions.length * 150)) * 100);
    const opPct  = Math.round((opponentScore / (questions.length * 150)) * 100);
    const iWon   = myScore > opponentScore;
    const isDraw = myScore === opponentScore;

    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-5 page-enter">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground"><ArrowLeft size={20} /></button>
          </div>

          <Card className="overflow-hidden border-primary/20">
            <div className={`h-2 ${iWon ? "bg-gradient-to-r from-amber-400 to-amber-600" : isDraw ? "bg-gradient-to-r from-primary to-blue-500" : "bg-muted"}`} />
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-5xl">
                {iWon ? "🏆" : isDraw ? "🤝" : "😤"}
              </div>
              <p className="font-black text-xl">
                {iWon ? (isSw ? "Umeshinda! 🔥" : "You Win! 🔥")
                 : isDraw ? (isSw ? "Sawa!" : "It's a Draw!")
                 : (isSw ? "Umeshindwa!" : "You Lost!")}
              </p>

              {/* Score comparison */}
              <div className="grid grid-cols-2 gap-3 py-2">
                {[
                  { name: myName, score: myScore, pct: myPct, isMe: true },
                  { name: opponentName ?? "Opponent", score: opponentScore, pct: opPct, isMe: false },
                ].map((p) => (
                  <div key={p.name} className={`rounded-xl p-4 space-y-2 border ${p.isMe ? "border-primary bg-primary/5" : "border-border"}`}>
                    <p className="text-xs font-bold truncate">{p.name}{p.isMe && " (you)"}</p>
                    <p className="text-2xl font-black">{p.score}</p>
                    <Progress value={p.pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">{p.pct}%</p>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                {correctCount}/{questions.length} {isSw ? "sahihi" : "correct"} • {isSw ? "Mfululizo bora" : "Best streak"} {streak}x
              </div>

              {!opponentFinished && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  {isSw ? "Mpinzani bado anacheza..." : "Opponent is still playing..."}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button onClick={() => router.push(`../battle`)} className="w-full gap-2">
              <ArrowClockwise size={16} />
              {isSw ? "Cheza Tena" : "Play Again"}
            </Button>
            <Button variant="outline" onClick={() => router.push("..")} className="w-full gap-2">
              <Crown size={16} />
              {isSw ? "Angalia Ubingwa" : "View Leaderboard"}
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── PLAYING ────────────────────────────────────────────────────────────────────
  const timerPct = (timeLeft / TIMER_SECS) * 100;
  const timerColor = timerPct > 50 ? "bg-green-500" : timerPct > 25 ? "bg-amber-500" : "bg-red-500";

  return (
    <PageWrapper>
      <div className="px-4 py-4 space-y-4 page-enter">
        {/* Top bar */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex-1 text-center">
            <p className="font-bold truncate">{myName}</p>
            <p className="text-primary font-black text-lg">{myScore}</p>
          </div>
          <div className="text-center px-3">
            <p className="text-muted-foreground font-bold">VS</p>
            <p className="text-[10px] text-muted-foreground">{currentIdx + 1}/{questions.length}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-bold truncate">{opponentName ?? "???"}</p>
            <p className="text-red-500 font-black text-lg">{opponentScore}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{isSw ? "Muda" : "Time"}</span>
            <span className={`text-sm font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : ""}`}>{timeLeft}s</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
          </div>
        </div>

        {/* Question */}
        <Card className={`transition-all ${feedback === "correct" ? "border-green-500/50" : feedback === "wrong" ? "border-red-500/50" : ""}`}>
          <CardContent className="p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
              {("category" in current && current.category) || current.type.replace(/_/g, " ")}
            </span>

            {/* Multiple choice / Who said it */}
            {(current.type === "multiple_choice" || current.type === "who_said_it") && (
              <div className="space-y-3">
                {current.type === "who_said_it" ? (
                  <div className="bg-muted/60 rounded-xl p-4 border-l-4 border-primary/50">
                    <p className="text-base font-bold italic">&ldquo;{current.quote}&rdquo;</p>
                    <p className="text-xs text-muted-foreground mt-1">{isSw ? "Ni nani alisema hivi?" : "Who said this?"}</p>
                  </div>
                ) : (
                  <p className="font-semibold text-sm leading-relaxed">{current.question}</p>
                )}
                {current.options.map((opt) => (
                  <button key={opt} onClick={() => !feedback && setSelectedOption(opt)} disabled={!!feedback}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      feedback && opt === current.answer ? "border-green-500 bg-green-500/15"
                      : feedback && opt === selectedOption && opt !== current.answer ? "border-red-500 bg-red-500/15"
                      : feedback ? "border-border opacity-40"
                      : selectedOption === opt ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent"}`}>
                    {feedback && opt === current.answer && <Check size={13} className="text-green-500 inline mr-1.5" weight="bold" />}
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Fill blank */}
            {current.type === "fill_blank" && (
              <div className="space-y-3">
                <p className="text-sm bg-muted/50 rounded-lg p-3 leading-loose">{current.verse}</p>
                <Input value={fillInput} onChange={(e) => !feedback && setFillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canCheck && !feedback && checkAnswer()}
                  placeholder={isSw ? "Jaza nafasi..." : "Missing word..."} disabled={!!feedback}
                  className={`text-center font-bold ${feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : ""}`} autoFocus />
                {feedback === "wrong" && <p className="text-xs text-center text-muted-foreground">{isSw ? "Jibu:" : "Answer:"} <strong>{current.answer}</strong></p>}
                <p className="text-xs text-right italic text-muted-foreground">— {current.ref}</p>
              </div>
            )}

            {/* True/False */}
            {current.type === "true_false" && (
              <div className="space-y-3">
                <p className="font-semibold text-sm leading-relaxed">{current.statement}</p>
                <div className="grid grid-cols-2 gap-3">
                  {([true, false] as const).map((val) => (
                    <button key={String(val)} onClick={() => !feedback && setTfAnswer(val)} disabled={!!feedback}
                      className={`py-4 rounded-xl text-sm font-bold border-2 transition-all ${
                        feedback && val === current.answer ? "border-green-500 bg-green-500/15"
                        : feedback && val === tfAnswer && val !== current.answer ? "border-red-500 bg-red-500/15"
                        : feedback ? "border-border opacity-40"
                        : tfAnswer === val ? (val ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")
                        : "border-border bg-card hover:bg-accent"}`}>
                      {val ? "✓ True" : "✗ False"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback === "correct" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <Check size={16} weight="bold" className="text-green-500" />
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">{isSw ? "Sahihi!" : "Correct!"}</span>
              </div>
            )}
            {feedback === "wrong" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <X size={16} weight="bold" className="text-red-500" />
                <span className="text-red-600 dark:text-red-400 text-sm font-medium">{timeLeft <= 0 ? (isSw ? "Muda uliisha!" : "Time's up!") : (isSw ? "Si sahihi" : "Wrong!")}</span>
              </div>
            )}

            {!feedback && (
              <Button onClick={checkAnswer} disabled={!canCheck} className="w-full gap-2 font-bold">
                <Lightning size={16} weight="fill" />
                {isSw ? "Jibu" : "Submit"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Live score strip */}
        <div className="text-xs text-center text-muted-foreground">
          {isSw ? "Alama zangu:" : "My score:"} <strong>{myScore}</strong>
          {" · "}{isSw ? "Mpinzani:" : "Opponent:"} <strong>{opponentScore}</strong>
          {streak >= 2 && <span className="ml-2 text-orange-500">🔥 {streak}x</span>}
        </div>
      </div>
    </PageWrapper>
  );
}
