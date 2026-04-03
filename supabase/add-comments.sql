-- =============================================
-- COMMENTS TABLE (for testimony encouragement)
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimony_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_testimony ON public.testimony_comments(testimony_id);
CREATE INDEX idx_comments_user ON public.testimony_comments(user_id);

-- Add comment_count to testimonies
ALTER TABLE public.testimonies ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

-- RLS for comments
ALTER TABLE public.testimony_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON public.testimony_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add comments"
  ON public.testimony_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.testimony_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update comment count
CREATE OR REPLACE FUNCTION public.update_testimony_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.testimonies SET comment_count = comment_count + 1 WHERE id = NEW.testimony_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.testimonies SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.testimony_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.testimony_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_testimony_comment_count();
