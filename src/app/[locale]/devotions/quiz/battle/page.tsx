"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Users, Link as LinkIcon, Crown, Lightning, ShareNetwork, ArrowRight,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

function getStoredName(email?: string) {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("nuru_display_name");
  if (stored) return stored;
  if (email) return email.split("@")[0];
  return `Believer_${Math.floor(Math.random() * 9000 + 1000)}`;
}

export default function BattleLobbyPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isSw = locale === "sw";

  const [tab, setTab] = useState<"create" | "join">("create");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const name = getStoredName(user?.email);
    setDisplayName(name);
  }, [user]);

  const saveNameAndProceed = (name: string) => {
    localStorage.setItem("nuru_display_name", name.trim());
  };

  const createRoom = async () => {
    if (!displayName.trim()) { setError(isSw ? "Weka jina lako" : "Enter your display name"); return; }
    setLoading(true);
    setError("");
    try {
      // Load today's questions
      const qRes = await fetch(`/api/devotions/quiz?locale=${locale}&fresh=1`);
      const qData = await qRes.json();
      if (!qData.questions?.length) throw new Error("Could not load questions");

      const res = await fetch("/api/quiz/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: displayName.trim(), questions: qData.questions, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      saveNameAndProceed(displayName);
      router.push(`battle/${data.code}?role=host&name=${encodeURIComponent(displayName.trim())}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!displayName.trim()) { setError(isSw ? "Weka jina lako" : "Enter your display name"); return; }
    if (code.length !== 6)   { setError(isSw ? "Nambari ya chumba lazima iwe herufi 6" : "Room code must be 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quiz/rooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "join", guestName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      saveNameAndProceed(displayName);
      router.push(`battle/${code}?role=guest&name=${encodeURIComponent(displayName.trim())}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users size={20} className="text-primary" weight="fill" />
              {isSw ? "Vita vya Biblia" : "Bible Battle"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSw ? "Shindana na rafiki yako kwa wakati mmoja!" : "Compete with a friend in real-time!"}
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { emoji: "🏠", en: "Create a room", sw: "Tengeneza chumba" },
            { emoji: "📤", en: "Share the code", sw: "Shiriki nambari" },
            { emoji: "⚔️", en: "Battle live!", sw: "Pigana!" },
          ].map((s, i) => (
            <div key={i} className="bg-muted/50 rounded-xl p-3 space-y-1">
              <div className="text-2xl">{s.emoji}</div>
              <p className="text-xs font-medium">{isSw ? s.sw : s.en}</p>
            </div>
          ))}
        </div>

        {/* Name input (shared) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {isSw ? "Jina Lako la Mchezo" : "Your Display Name"}
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={isSw ? "Jina la kuonekana..." : "Your battle name..."}
            maxLength={24}
          />
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(["create", "join"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t === "create"
                ? (isSw ? "🏠 Tengeneza" : "🏠 Create Room")
                : (isSw ? "🚪 Jiunge" : "🚪 Join Room")}
            </button>
          ))}
        </div>

        {tab === "create" ? (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-4xl">🏆</div>
                <p className="font-semibold">{isSw ? "Tengeneza Chumba Kipya" : "Create a New Battle Room"}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isSw
                    ? "Utapata nambari ya siri ya herufi 6. Shiriki na rafiki yako ili waingie."
                    : "You'll get a 6-character room code. Share it with your friend so they can join."}
                </p>
              </div>
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <Button onClick={createRoom} disabled={loading} className="w-full gap-2" size="lg">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSw ? "Inaunda..." : "Creating..."}</>
                ) : (
                  <><Lightning size={18} weight="fill" />{isSw ? "Unda Chumba" : "Create Battle Room"}</>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="text-center space-y-2">
                <div className="text-4xl">🚪</div>
                <p className="font-semibold">{isSw ? "Ingia Chumbani" : "Join a Battle Room"}</p>
                <p className="text-xs text-muted-foreground">
                  {isSw ? "Weka nambari ya chumba uliyopewa na rafiki yako" : "Enter the 6-character code shared by your friend"}
                </p>
              </div>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                className="text-center text-2xl font-black tracking-widest h-14"
                maxLength={6}
              />
              {error && <p className="text-xs text-destructive text-center">{error}</p>}
              <Button onClick={joinRoom} disabled={loading || joinCode.length !== 6} className="w-full gap-2" size="lg">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {isSw ? "Inaingia..." : "Joining..."}</>
                ) : (
                  <><ArrowRight size={18} />{isSw ? "Ingia Kucheza" : "Join & Play"}</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
