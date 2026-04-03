"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Heart,
  BookOpen,
  Envelope,
  EnvelopeOpen,
  Sparkle,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-browser";

interface InboxMessage {
  id: string;
  from_name: string;
  message_type: "hug" | "verse";
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function InboxPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const isSw = locale === "sw";

  const fetchMessages = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("inbox_messages")
        .select("*")
        .eq("to_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setMessages(
          data.map((m) => ({
            id: m.id,
            from_name: "Believer",
            message_type: m.message_type,
            content: m.content,
            is_read: m.is_read,
            created_at: new Date(m.created_at).toLocaleDateString(),
          }))
        );
      }
    } catch {
      setMessages([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const markAsRead = async (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    );
    try {
      const supabase = createBrowserClient();
      await supabase.from("inbox_messages").update({ is_read: true }).eq("id", id);
    } catch {}
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
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {t("community.encouragement_inbox")}
            </h1>
          </div>
          {unreadCount > 0 && (
            <Badge>
              {unreadCount} {isSw ? "mpya" : "new"}
            </Badge>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-3 w-full bg-muted rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Sparkle size={48} className="text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              {isSw ? "Hakuna ujumbe bado" : "No messages yet"}
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              {isSw
                ? "Shiriki ushuhuda kupokea kutiwa moyo"
                : "Share testimonies to receive encouragement"}
            </p>
          </div>
        )}

        <div className="space-y-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              onClick={() => markAsRead(msg.id)}
              className={`cursor-pointer transition-colors ${
                !msg.is_read ? "border-primary/20" : "opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.message_type === "hug" ? "bg-red-500/10" : "bg-primary/10"
                    }`}
                  >
                    {msg.message_type === "hug" ? (
                      <Heart size={18} className="text-red-500" weight="fill" />
                    ) : (
                      <BookOpen size={18} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{msg.from_name}</span>
                      {!msg.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {msg.content}
                    </p>
                    <p className="text-muted-foreground/50 text-[11px] mt-1.5">
                      {msg.created_at}
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-0.5">
                    {msg.is_read ? (
                      <EnvelopeOpen size={16} className="text-muted-foreground/30" />
                    ) : (
                      <Envelope size={16} className="text-primary/50" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
