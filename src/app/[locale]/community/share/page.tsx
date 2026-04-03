"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/components/toast";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, PaperPlaneTilt, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function ShareTestimonyPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  const localePrefix = pathname.split("/")[1];
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSw = locale === "sw";

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    if (user.isGuest) {
      setError(isSw ? "Tafadhali ingia ili kushiriki ushuhuda" : "Please sign in to share a testimony");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createBrowserClient();

      console.log("Submitting testimony for user:", user.id);

      // Step 1: Run moderation check
      const modRes = await fetch("/api/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      let moderationStatus = "approved";
      if (modRes.ok) {
        const modData = await modRes.json();
        moderationStatus = modData.status || "approved";
        console.log("Moderation result:", moderationStatus);
      }

      // Step 2: Save to Supabase
      console.log("Inserting testimony with user_id:", user.id);
      const { data, error: dbError } = await supabase
        .from("testimonies")
        .insert({
          user_id: user.id,
          content: content.trim(),
          is_anonymous: isAnonymous,
          amen_count: 0,
          praying_count: 0,
          moderation_status: moderationStatus,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Supabase DB error:", JSON.stringify(dbError, null, 2));
        // Show more helpful error
        if (dbError.message?.includes("does not exist")) {
          throw new Error("Database tables not set up. Run the SQL schema in Supabase SQL Editor.");
        }
        if (dbError.message?.includes("violates row-level security")) {
          throw new Error("Permission denied. Check your Supabase RLS policies.");
        }
        throw dbError;
      }

      console.log("Testimony saved:", data);
      toast(isSw ? "Ushuhuda umeshirikiwa!" : "Testimony shared!", "success");
      router.push(`/${localePrefix}/community`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit testimony";
      console.error("Submit error:", err);
      toast(msg, "error");
      setError(msg);
    }

    setSubmitting(false);
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">{t("community.share_testimony")}</h1>
        </div>

        {/* Guest warning */}
        {user?.isGuest && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5 flex items-center gap-4">
              <ShieldCheck size={24} className="text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {isSw ? "Ingia ili kushiriki" : "Sign in to share"}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isSw
                    ? "Unahitaji akaunti ili kushiriki ushuhuda kwenye jamii"
                    : "You need an account to share testimonies with the community"}
                </p>
              </div>
              <Button size="sm" onClick={() => router.push(`/${localePrefix}/auth`)}>
                {isSw ? "Ingia" : "Sign In"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5 space-y-5">
            <div>
              <Label className="text-muted-foreground text-sm mb-2 block">
                {isSw ? "Ushuhuda wako" : "Your Testimony"}
              </Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("community.write_testimony")}
                className="min-h-[200px]"
              />
              <p className="text-muted-foreground text-xs mt-2 text-right">
                {content.length} / 2000
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-muted-foreground" />
                <div>
                  <Label className="text-sm">{t("community.remain_anonymous")}</Label>
                  <p className="text-muted-foreground text-xs">
                    {isSw ? "Jina lako halitaonekana" : "Your name will not be shown"}
                  </p>
                </div>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting || !user}
              className="w-full gap-2"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t("community.submitting")}
                </>
              ) : (
                <>
                  <PaperPlaneTilt size={18} weight="bold" />
                  {t("community.submit")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
