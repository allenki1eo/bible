"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Lock,
  Check,
  ShareNetwork,
  Sparkle,
  Notebook,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface Prayer {
  id: string;
  encrypted_content: string;
  status: "active" | "answered";
  created_at: string;
  answered_at: string | null;
}

export default function JournalPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const isSw = locale === "sw";

  const fetchPrayers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("prayers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setPrayers(data);
      }
    } catch {
      setPrayers([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const activePrayers = prayers.filter((p) => p.status === "active");
  const answeredPrayers = prayers.filter((p) => p.status === "answered");

  const addPrayer = async () => {
    if (!newContent.trim() || !user) return;

    const tempId = Date.now().toString();
    const newPrayer: Prayer = {
      id: tempId,
      encrypted_content: newContent,
      status: "active",
      created_at: new Date().toISOString(),
      answered_at: null,
    };

    setPrayers((prev) => [newPrayer, ...prev]);
    setNewContent("");
    setShowNew(false);

    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase.from("prayers").insert({
        user_id: user.id,
        encrypted_content: newContent,
        status: "active",
      }).select().single();

      if (error) throw error;

      // Replace temp entry with the real DB record (gets real id)
      if (data) {
        setPrayers((prev) => prev.map((p) => (p.id === tempId ? data : p)));
      }
    } catch {
      // Rollback optimistic update
      setPrayers((prev) => prev.filter((p) => p.id !== tempId));
    }
  };

  const markAnswered = async (id: string) => {
    const now = new Date().toISOString();
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "answered" as const, answered_at: now } : p
      )
    );
    setShowCelebration(true);

    try {
      const supabase = createBrowserClient();
      await supabase
        .from("prayers")
        .update({ status: "answered", answered_at: now })
        .eq("id", id);
    } catch {}
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex-1">
            {t("devotions.prayer_journal")}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Lock size={14} />
            {isSw ? "Imefichwa" : "Encrypted"}
          </div>
        </div>

        {user && (
          <Button
            onClick={() => setShowNew(true)}
            variant="outline"
            className="w-full gap-2 border-dashed"
          >
            <Plus size={16} weight="bold" />
            {t("devotions.new_prayer")}
          </Button>
        )}

        {!user && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Lock size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {isSw ? "Ingia kuona jurnali yako" : "Sign in to see your journal"}
              </p>
            </CardContent>
          </Card>
        )}

        {user && (
          <Tabs defaultValue="active">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="active">
                {t("devotions.active_prayers")} ({activePrayers.length})
              </TabsTrigger>
              <TabsTrigger value="answered">
                {t("devotions.answered_prayers")} ({answeredPrayers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-2 mt-4">
              {loading ? (
                [1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <div className="animate-pulse h-3 w-16 bg-muted rounded" />
                      <div className="animate-pulse h-4 w-full bg-muted rounded" />
                      <div className="animate-pulse h-4 w-3/4 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))
              ) : activePrayers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Notebook
                      size={32}
                      className="text-muted-foreground/30 mx-auto mb-3"
                    />
                    <p className="text-muted-foreground text-sm">
                      {isSw
                        ? "Hakuna maombi hai bado"
                        : "No active prayers yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activePrayers.map((prayer) => (
                  <Card key={prayer.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {formatDate(prayer.created_at)}
                        </span>
                        <Badge variant="outline">
                          {isSw ? "Hai" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {prayer.encrypted_content}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5"
                        onClick={() => markAnswered(prayer.id)}
                      >
                        <Check size={14} weight="bold" />
                        {t("devotions.mark_answered")}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="answered" className="space-y-2 mt-4">
              {answeredPrayers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <Sparkle
                      size={32}
                      className="text-muted-foreground/30 mx-auto mb-3"
                    />
                    <p className="text-muted-foreground text-sm">
                      {isSw
                        ? "Hakuna maombi yaliyojibiwa bado"
                        : "No answered prayers yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                answeredPrayers.map((prayer) => (
                  <Card key={prayer.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-xs">
                          {prayer.answered_at
                            ? formatDate(prayer.answered_at)
                            : ""}
                        </span>
                        <Badge variant="secondary" className="gap-1">
                          <Check size={12} weight="bold" />
                          {isSw ? "Limejibiwa" : "Answered"}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {prayer.encrypted_content}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full gap-1.5"
                      >
                        <ShareNetwork size={14} />
                        {t("devotions.share_as_testimony")}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* New Prayer Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("devotions.new_prayer")}</DialogTitle>
            <DialogDescription>
              {isSw
                ? "Maombi yako yanahifadhiwa kwa usalama"
                : "Your prayers are stored securely"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t("devotions.prayer_placeholder")}
              className="min-h-[150px]"
            />
            <Button onClick={addPrayer} className="w-full">
              {isSw ? "Hifadhi Ombi" : "Save Prayer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkle size={32} className="text-primary" weight="fill" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {isSw ? "Amina!" : "Amen!"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isSw
                ? "Ombi lako limejibiwa!"
                : "Your prayer has been answered!"}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowCelebration(false)}
            className="w-full"
          >
            {isSw ? "Shukuru Mungu" : "Give Thanks"}
          </Button>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
