"use client";

import { useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatCircle, PaperPlaneTilt, Trash } from "@phosphor-icons/react";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  is_anonymous: boolean;
}

export function TestimonyComments({
  testimonyId,
  userId,
}: {
  testimonyId: string;
  userId: string | null;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchComments = useCallback(async () => {
    if (fetching) return;
    setFetching(true);
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("testimony_comments")
        .select("id, content, created_at, profiles(display_name)")
        .eq("testimony_id", testimonyId)
        .order("created_at", { ascending: true });

      if (data) {
        setComments(
          data.map((c: any) => ({
            id: c.id,
            content: c.content,
            created_at: new Date(c.created_at).toLocaleDateString(),
            user_name: c.profiles?.display_name || "Believer",
            is_anonymous: false,
          }))
        );
      }
    } catch {}
    setFetching(false);
  }, [testimonyId, fetching]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !userId) return;
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("testimony_comments")
        .insert({
          testimony_id: testimonyId,
          user_id: userId,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (data) {
        setComments((prev) => [
          ...prev,
          {
            id: data.id,
            content: data.content,
            created_at: new Date(data.created_at).toLocaleDateString(),
            user_name: "You",
            is_anonymous: false,
          },
        ]);
        setNewComment("");
      }
    } catch {}
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    try {
      const supabase = createBrowserClient();
      await supabase.from("testimony_comments").delete().eq("id", id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  if (!userId) return null;

  return (
    <div className="mt-3 pt-3 border-t">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && comments.length === 0) fetchComments();
        }}
        className="flex items-center gap-1.5 text-muted-foreground text-xs hover:text-foreground transition-colors"
      >
        <ChatCircle size={14} />
        <span>
          {open ? "Hide" : "Show"} encouragement ({comments.length})
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {/* Comments list */}
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarFallback className="text-[8px]">
                  {comment.user_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {comment.user_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {comment.created_at}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {comment.content}
                </p>
              </div>
              {comment.user_name === "You" && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-muted-foreground/30 hover:text-destructive transition-colors self-start"
                >
                  <Trash size={12} />
                </button>
              )}
            </div>
          ))}

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Send encouragement..."
              className="min-h-[40px] text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!newComment.trim() || loading}
              className="h-10 w-10 flex-shrink-0"
            >
              <PaperPlaneTilt size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
