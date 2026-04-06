"use client";

import { useTranslation } from "@/hooks/use-client-i18n";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  UsersThree,
  BookOpen,
  BookBookmark,
  Globe,
  ArrowSquareOut,
  Sparkle,
  Coffee,
  ShieldCheck,
  Megaphone,
  ChartBar,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface AppStats {
  users: number;
  stories: number;
  testimonies: number;
  prayers: number;
}

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-2xl font-bold text-primary">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export default function DonatePage() {
  const { t, locale } = useTranslation();
  const isSw = locale === "sw";

  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const reasons = [
    {
      icon: <BookOpen size={24} weight="fill" />,
      title: isSw ? "Hadithi za Biblia za AI" : "AI Bible Stories",
      description: isSw
        ? "Tunatumia AI kutengeneza hadithi za Biblia kwa watoto kwa lugha mbili. Kila hadithi inahitaji nguvu ya kompyuta na huduma za AI zinazolipwa."
        : "We use AI to generate personalized Bible stories for children in both English and Swahili. Each story requires computing power and paid AI services.",
    },
    {
      icon: <Globe size={24} weight="fill" />,
      title: isSw ? "Lugha Mbili Bure" : "Free Bilingual Access",
      description: isSw
        ? "Nuru inapatikana kwa Kiingereza na Kiswahili bure. Tunataka kila mtu aweze kupata maneno ya Mungu bila malipo."
        : "Nuru is available in English and Swahili completely free. We believe everyone deserves access to God's word without financial barriers.",
    },
    {
      icon: <ShieldCheck size={24} weight="fill" />,
      title: isSw ? "Usalama na Faragha" : "Security & Privacy",
      description: isSw
        ? "Maombi yako yamefichwa na data yako inalindwa. Huduma za usalama zinahitaji rasilimali za kila mwezi."
        : "Your prayers are encrypted and your data is protected. Security services require ongoing monthly resources.",
    },
    {
      icon: <UsersThree size={24} weight="fill" />,
      title: isSw ? "Jamii Inayokua" : "Growing Community",
      description: isSw
        ? "Ukuta wetu wa ushuhuda unakua kila siku. Tunahitaji seva bora kuhudumia watu wengi zaidi."
        : "Our testimony wall grows every day. We need better servers to serve more people as the community expands.",
    },
    {
      icon: <BookBookmark size={24} weight="fill" />,
      title: isSw ? "Ibada za Kila Siku" : "Daily Devotionals",
      description: isSw
        ? "Kila siku tunatoa tafakari mpya inayotokana na hali yako. Huduma hii ya AI inahitaji rasilimali za kila siku."
        : "Every day we provide personalized devotionals based on your mood. This AI service needs daily computing resources.",
    },
    {
      icon: <Sparkle size={24} weight="fill" />,
      title: isSw ? "Maendeleo ya Baadaye" : "Future Development",
      description: isSw
        ? "Tunapanga kuongeza lugha zaidi, hadithi za sauti, na vipengele vipya. Msaada wako unafanya hii iwezekane."
        : "We plan to add more languages, audio stories, and new features. Your support makes this possible.",
    },
  ];

  const tiers = [
    {
      name: isSw ? "Msaada Mdogo" : "Small Support",
      price: "$3",
      emoji: "\u{2615}",
      description: isSw
        ? "Kama kununua kahawa - inasaidia kulipa huduma za AI za siku moja"
        : "Like buying a coffee - covers one day of AI story generation",
    },
    {
      name: isSw ? "Msaada wa Kila Mwezi" : "Monthly Supporter",
      price: "$10",
      emoji: "\u{1F49B}",
      description: isSw
        ? "Inasaidia kulipa seva na huduma za AI kwa wiki nzima"
        : "Covers a full week of server and AI service costs",
    },
    {
      name: isSw ? "Mfadhili wa Nuru" : "Nuru Supporter",
      price: "$25",
      emoji: "\u{1F31F}",
      description: isSw
        ? "Inasaidia maendeleo ya vipengele vipya na lugha zaidi"
        : "Supports new feature development and additional languages",
    },
  ];

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-8 page-enter">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Heart size={32} className="text-red-500" weight="fill" />
          </div>
          <h1 className="text-3xl font-bold">
            {isSw ? "Tusaidie Kuendelea" : "Help Us Continue"}
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            {isSw
              ? "Nuru ni bure kwa kila mtu. Msaada wako unatusaidia kuendelea kutoa hadithi za Biblia, ibada, na jamii ya imani bila malipo."
              : "Nuru is free for everyone. Your support helps us continue providing Bible stories, devotionals, and a faith community at no cost."}
          </p>
        </div>

        {/* Giving Tracker */}
        {stats && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <ChartBar size={18} className="text-primary" weight="fill" />
                <p className="font-semibold text-sm">
                  {isSw ? "Msaada wenu umefanya hivi:" : "Your support has powered:"}
                </p>
              </div>
              <div className="flex divide-x divide-border">
                <StatPill value={stats.users} label={isSw ? "Watumiaji" : "Believers"} />
                <StatPill value={stats.stories} label={isSw ? "Hadithi" : "Stories"} />
                <StatPill value={stats.testimonies} label={isSw ? "Ushuhuda" : "Testimonies"} />
                <StatPill value={stats.prayers} label={isSw ? "Maombi" : "Prayers"} />
              </div>
              <p className="text-xs text-muted-foreground/60 text-center mt-3">
                {isSw
                  ? "Kila mchango unasaidia kuendelea kutoa huduma hizi bure."
                  : "Every contribution keeps these services free for everyone."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Why We Need Help */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {isSw ? "Kwa Nini Tunahitaji Msaada Wako" : "Why We Need Your Help"}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {isSw
              ? "Nuru inaendeshwa na mapendo na imani, lakini teknolojia nyuma yake inahitaji rasilimali halisi. Kila hadithi inayotengenezwa, kila ibada inayotolewa, na kila mtumiaji anayehudumiwa inahitaji nguvu ya kompyuta na huduma zinazolipwa. Msaada wako unahakikisha kwamba Nuru inabaki bure na inafikia watu wengi zaidi kila siku."
              : "Nuru is powered by love and faith, but the technology behind it requires real resources. Every story generated, every devotional delivered, and every user served needs computing power and paid services. Your support ensures Nuru stays free and reaches more people every day."}
          </p>

          <div className="grid gap-3">
            {reasons.map((reason, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    {reason.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{reason.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Tiers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Coffee size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {isSw ? "Jinsi Unavyoweza Kusaidia" : "How You Can Help"}
            </h2>
          </div>

          <div className="grid gap-3">
            {tiers.map((tier, i) => (
              <a
                key={i}
                href="https://snippe.me/pay/nuru"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="card-lift cursor-pointer hover:border-primary/30 transition-colors">
                  <CardContent className="p-5 flex items-center gap-4">
                    <span className="text-3xl">{tier.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{tier.name}</h3>
                        <span className="text-primary font-bold">{tier.price}/mo</span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        {tier.description}
                      </p>
                    </div>
                    <ArrowSquareOut size={16} className="text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart size={24} className="text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isSw ? "Kuwa Sehemu ya Safari Yetu" : "Be Part of Our Journey"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                {isSw
                  ? "Msaada wowote, mdogo au mkubwa, unafanya tofauti kubwa katika kueneza Nuru kwa watu wengi zaidi."
                  : "Every contribution, big or small, makes a real difference in spreading Nuru to more people."}
              </p>
            </div>
            <a
              href="https://snippe.me/pay/nuru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button className="gap-2 btn-press" size="lg">
                <Heart size={20} weight="fill" />
                {isSw ? "Tusaidie kupitia Snippe" : "Support Us via Snippe"}
                <ArrowSquareOut size={18} />
              </Button>
            </a>
            <p className="text-muted-foreground/60 text-xs">
              {isSw ? "Utapelekwa kwenye ukurasa wetu wa malipo" : "You'll be taken to our secure payment page"}
            </p>
          </CardContent>
        </Card>

        {/* Thank You */}
        <div className="text-center py-4">
          <p className="text-muted-foreground/60 text-sm italic">
            {isSw
              ? "\"Kila mmoja apewe kulingana na alivyokusudia moyoni mwake, si kwa uchungu wala kwa lazima, kwa maana Mungu apenda anayetoa kwa furaha.\" \u2014 2 Wakorintho 9:7"
              : "\"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.\" \u2014 2 Corinthians 9:7"}
          </p>
        </div>

        <div className="h-4" />
      </div>
    </PageWrapper>
  );
}
