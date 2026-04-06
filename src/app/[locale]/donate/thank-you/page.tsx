"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowRight, ShareNetwork, BookOpen } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GRATITUDE_VERSES = [
  {
    text: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
    ref: "2 Corinthians 9:7",
    sw: "Kila mmoja na atoe kwa kadri alivyokusudia moyoni mwake; si kwa huzuni, wala si kwa lazima; kwa maana Mungu hupenda mtu anayetoa kwa furaha.",
    refSw: "2 Wakorintho 9:7",
  },
  {
    text: "Whoever is kind to the poor lends to the Lord, and he will reward them for what they have done.",
    ref: "Proverbs 19:17",
    sw: "Yeye amrehemu maskini humkopesha Bwana; naye Bwana atamlipia kwa tendo lake jema.",
    refSw: "Mithali 19:17",
  },
  {
    text: "And do not forget to do good and to share with others, for with such sacrifices God is pleased.",
    ref: "Hebrews 13:16",
    sw: "Wala msisahau kutenda mema na kushirikiana; kwa maana Mungu anapendezwa na dhabihu kama hizo.",
    refSw: "Waebrania 13:16",
  },
];

export default function ThankYouPage() {
  const { locale } = useTranslation();
  const router = useRouter();
  const isSw = locale === "sw";
  const [verse] = useState(() => GRATITUDE_VERSES[Math.floor(Math.random() * GRATITUDE_VERSES.length)]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti burst animation
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const handleShare = async () => {
    const msg = isSw
      ? "Nimesaidia Nuru — programu ya ibada ya Afrika Mashariki. Jiunge nawe! https://nuru1.vercel.app"
      : "I just supported Nuru — a free faith app for East Africa. Join us! https://nuru1.vercel.app";
    try {
      await navigator.share({ title: "Nuru App", text: msg, url: "https://nuru1.vercel.app" });
    } catch {
      await navigator.clipboard.writeText(msg).catch(() => {});
    }
  };

  return (
    <PageWrapper>
      {/* Confetti particles */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-8px",
                background: ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"][i % 6],
                animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>

      <div className="px-4 py-12 space-y-8 page-enter max-w-md mx-auto text-center">
        {/* Hero */}
        <div className="space-y-4">
          <div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/30"
            style={{ animation: "heartPulse 2s ease-in-out infinite" }}
          >
            <Heart size={44} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black">
              {isSw ? "Asante Sana! 🙏" : "God Bless You! 🙏"}
            </h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {isSw
                ? "Mchango wako utasaidia Nuru kuendelea kufikia waumini zaidi Afrika Mashariki. Mungu akubariki wingi."
                : "Your generosity helps Nuru reach more believers across East Africa with free, ad-free devotionals and Bible content. This truly means the world to us."}
            </p>
          </div>
        </div>

        {/* Scripture card */}
        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-amber-500/5">
          <CardContent className="p-6 space-y-3">
            <div className="text-2xl">✨</div>
            <p className="text-sm italic leading-relaxed font-medium text-foreground/90">
              &ldquo;{isSw ? verse.sw : verse.text}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground font-semibold">
              — {isSw ? verse.refSw : verse.ref}
            </p>
          </CardContent>
        </Card>

        {/* What your gift does */}
        <div className="space-y-3 text-left">
          <h2 className="text-sm font-bold text-center text-muted-foreground uppercase tracking-wider">
            {isSw ? "Mchango wako unasaidia" : "Your gift helps us"}
          </h2>
          {[
            { emoji: "📖", en: "Keep devotionals & Bible study free for everyone",     sw: "Ibada na masomo ya Biblia yabaki bure kwa wote" },
            { emoji: "🌍", en: "Expand to more languages across East Africa",          sw: "Kupanua kwa lugha zaidi Afrika Mashariki" },
            { emoji: "👧", en: "Build more Bible stories & games for children",        sw: "Kutengeneza hadithi na michezo zaidi ya watoto" },
            { emoji: "📴", en: "Keep the app working offline in low-connectivity areas",sw: "Programu ifanye kazi bila mtandao" },
          ].map((item) => (
            <div key={item.en} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-muted/40">
              <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
              <p className="text-sm text-foreground/80">{isSw ? item.sw : item.en}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/${locale}`} className="block">
            <Button size="lg" className="w-full gap-2 text-base font-bold py-6">
              <BookOpen size={20} weight="fill" />
              {isSw ? "Rudi Kwenye Programu" : "Back to the App"}
              <ArrowRight size={18} />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleShare}
          >
            <ShareNetwork size={18} />
            {isSw ? "Shiriki Nuru na Rafiki" : "Share Nuru with a Friend"}
          </Button>

          <Link href={`/${locale}/donate`} className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1">
            {isSw ? "Rudi kwa ukurasa wa mchango" : "Back to donations page"}
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground/60 leading-relaxed pb-4">
          {isSw
            ? "Asante kwa moyo wako wa ukarimu. Tutaendelea kufanya kazi kwa ajili ya Ufalme wa Mungu."
            : "Thank you for your generous heart. We will keep building for the Kingdom."}
        </p>
      </div>
    </PageWrapper>
  );
}
