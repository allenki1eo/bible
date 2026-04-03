"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TestimonyComments } from "@/components/testimony-comments";
import {
  HandsPraying,
  Heart,
  ShareNetwork,
  Plus,
  CaretDown,
  CaretUp,
  UsersThree,
  Star,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Testimony {
  id: string;
  content: string;
  author_name: string;
  is_anonymous: boolean;
  amen_count: number;
  praying_count: number;
  created_at: string;
  is_milestone: boolean;
  user_id: string;
}

const AVATAR_COLORS = [
  "bg-amber-500", "bg-blue-500", "bg-emerald-500", "bg-purple-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
  "bg-teal-500", "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ReactionCounter({
  count,
  active,
  onClick,
  disabled,
  icon,
  label,
  activeColor,
}: {
  count: number;
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  activeColor: string;
}) {
  const [popping, setPopping] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onClick();
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`group flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
        active
          ? `${activeColor} scale-[1.02]`
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "active:scale-95"}`}
    >
      <span className={`transition-transform duration-200 ${popping ? "scale-125" : ""}`}>
        {icon}
      </span>
      <span>{label}</span>
      <span
        className={`inline-block min-w-[1.25rem] text-center font-semibold transition-all duration-200 ${
          popping ? "scale-125 -translate-y-0.5" : "scale-100 translate-y-0"
        } ${active ? "text-current" : "opacity-60"}`}
      >
        {count}
      </span>
    </button>
  );
}

function TestimonyCard({ testimony, user, isSw, t }: {
  testimony: Testimony;
  user: { id: string } | null;
  isSw: boolean;
  t: (key: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [amenCount, setAmenCount] = useState(testimony.amen_count);
  const [prayingCount, setPrayingCount] = useState(testimony.praying_count);
  const [amenActive, setAmenActive] = useState(false);
  const [prayingActive, setPrayingActive] = useState(false);

  const long = testimony.content.length > 180;
  const isMilestone = amenCount >= 50;
  const authorName = testimony.is_anonymous
    ? t("community.anonymous")
    : testimony.author_name;
  const avatarColor = getAvatarColor(testimony.id);
  const isOwn = testimony.user_id === user?.id;
  const initials = testimony.is_anonymous
    ? "?"
    : testimony.author_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        isMilestone
          ? "bg-card/80 backdrop-blur-sm"
          : "bg-card/60 backdrop-blur-sm"
      }`}
      style={{
        borderLeft: isMilestone
          ? "3px solid hsl(43 56% 54%)"
          : "3px solid hsl(138 28% 49%)",
        boxShadow: isMilestone
          ? "0 0 0 1px rgba(201,168,76,0.1), 0 2px 8px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Milestone shimmer overlay */}
      {isMilestone && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.3) 25%, rgba(201,168,76,0.5) 50%, rgba(201,168,76,0.3) 75%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
        </div>
      )}

      <div className="p-4 relative z-10">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{authorName}</p>
              {isOwn && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium shrink-0">
                  {isSw ? "Wewe" : "You"}
                </span>
              )}
              {isMilestone && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium shrink-0">
                  <Star size={10} weight="fill" />
                  {isSw ? "Milestoni" : "Milestone"}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-[11px]">
              {testimony.created_at}
            </p>
          </div>
        </div>

        {/* Testimony text — quote style */}
        <div className="relative">
          <span className="absolute -top-1 -left-1 text-4xl text-muted-foreground/10 font-serif leading-none select-none">
            &ldquo;
          </span>
          <p className="text-[15px] leading-relaxed text-foreground/85 pl-5 pt-1">
            {long && !expanded
              ? testimony.content.slice(0, 180) + "..."
              : testimony.content}
          </p>
        </div>

        {long && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground text-xs mt-2 flex items-center gap-0.5 hover:text-foreground transition-colors ml-5"
          >
            {expanded ? (
              <>
                {t("community.read_less")}
                <CaretUp size={12} />
              </>
            ) : (
              <>
                {t("community.read_more")}
                <CaretDown size={12} />
              </>
            )}
          </button>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <ReactionCounter
            count={amenCount + (amenActive ? 1 : 0)}
            active={amenActive}
            onClick={() => setAmenActive(!amenActive)}
            disabled={!user}
            icon={<HandsPraying size={14} weight={amenActive ? "fill" : "regular"} />}
            label={t("community.amen")}
            activeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <ReactionCounter
            count={prayingCount + (prayingActive ? 1 : 0)}
            active={prayingActive}
            onClick={() => setPrayingActive(!prayingActive)}
            disabled={!user}
            icon={<Heart size={14} weight={prayingActive ? "fill" : "regular"} />}
            label={t("community.praying")}
            activeColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
          />
          <button className="ml-auto p-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50 transition-colors">
            <ShareNetwork size={16} />
          </button>
        </div>

        {/* Comments */}
        <TestimonyComments
          testimonyId={testimony.id}
          userId={user?.id || null}
        />
      </div>
    </div>
  );
}

function TestimonyCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  const isSw = locale === "sw";

  const fetchTestimonies = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("testimonies")
        .select("*")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        setTestimonies(
          data.map((row) => ({
            id: row.id,
            content: row.content,
            author_name: row.is_anonymous ? "" : "Believer",
            is_anonymous: row.is_anonymous,
            amen_count: row.amen_count,
            praying_count: row.praying_count,
            created_at: new Date(row.created_at).toLocaleDateString(),
            is_milestone: row.amen_count >= 50,
            user_id: row.user_id,
          }))
        );
      }
    } catch {
      setTestimonies([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTestimonies();
  }, [fetchTestimonies]);

  // Refresh when window regains focus (e.g., after sharing a testimony)
  useEffect(() => {
    const onFocus = () => fetchTestimonies();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchTestimonies]);

  return (
    <PageWrapper title={t("community.title")} showBell={!!user}>
      <div className="px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("community.title")}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t("community.subtitle")}
            </p>
          </div>
          {user && (
            <Link href={`${pathname}/share`}>
              <Button size="sm" className="gap-1.5">
                <Plus size={16} weight="bold" />
                {t("community.share_button")}
              </Button>
            </Link>
          )}
        </div>

        {/* Empty state */}
        {testimonies.length === 0 && !loading && (
          <div className="rounded-xl border-2 border-dashed border-border/50 p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <UsersThree size={28} className="text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold mb-1">
              {isSw ? "Hakuna ushuhuda bado" : "No testimonies yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {isSw
                ? "Kuwa wa kwanza kushiriki ushuhuda wako"
                : "Be the first to share your testimony"}
            </p>
            {user && (
              <Link href={`${pathname}/share`}>
                <Button className="gap-1.5">
                  <Plus size={16} weight="bold" />
                  {t("community.share_testimony")}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {loading ? (
            <>
              <TestimonyCardSkeleton />
              <TestimonyCardSkeleton />
              <TestimonyCardSkeleton />
            </>
          ) : (
            testimonies.map((testimony) => (
              <TestimonyCard
                key={testimony.id}
                testimony={testimony}
                user={user}
                isSw={isSw}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
