-- =============================================
-- Nuru PWA — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES (extends auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Believer',
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'sw')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. TESTIMONIES
-- =============================================
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  amen_count INTEGER NOT NULL DEFAULT 0,
  praying_count INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('approved', 'flagged', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonies_status ON public.testimonies(moderation_status);
CREATE INDEX idx_testimonies_created ON public.testimonies(created_at DESC);
CREATE INDEX idx_testimonies_user ON public.testimonies(user_id);

-- =============================================
-- 3. REACTIONS (Amen / Praying)
-- =============================================
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimony_id UUID NOT NULL REFERENCES public.testimonies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('amen', 'praying')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(testimony_id, user_id, type)
);

CREATE INDEX idx_reactions_testimony ON public.reactions(testimony_id);
CREATE INDEX idx_reactions_user ON public.reactions(user_id);

-- =============================================
-- 4. INBOX MESSAGES (Digital Hugs / Verses)
-- =============================================
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('hug', 'verse')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_to_user ON public.inbox_messages(to_user_id);
CREATE INDEX idx_inbox_unread ON public.inbox_messages(to_user_id, is_read) WHERE is_read = false;

-- =============================================
-- 5. STORIES (AI Generated Bedtime Stories)
-- =============================================
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hero TEXT NOT NULL,
  lesson TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'sw')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_user ON public.stories(user_id);
CREATE INDEX idx_stories_created ON public.stories(created_at DESC);

-- =============================================
-- 6. DEVOTIONS (Daily Devotional Log)
-- =============================================
CREATE TABLE public.devotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('struggling', 'neutral', 'peaceful', 'joyful', 'seeking')),
  content TEXT NOT NULL,
  scripture_ref TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_devotions_user_date ON public.devotions(user_id, date DESC);

-- =============================================
-- 7. STREAKS (Vine Streak Tracker)
-- =============================================
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_check_in DATE,
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_streaks_user ON public.streaks(user_id);

-- =============================================
-- 8. PRAYERS (Encrypted Prayer Journal)
-- =============================================
CREATE TABLE public.prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ
);

CREATE INDEX idx_prayers_user ON public.prayers(user_id);
CREATE INDEX idx_prayers_status ON public.prayers(user_id, status);

-- =============================================
-- 9. HERO CARDS (Unlockable Achievements)
-- =============================================
CREATE TABLE public.hero_cards (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_sw TEXT NOT NULL,
  unlock_day INTEGER NOT NULL,
  superpower_en TEXT NOT NULL,
  superpower_sw TEXT NOT NULL,
  fact_en TEXT NOT NULL,
  fact_sw TEXT NOT NULL,
  emoji TEXT NOT NULL
);

-- Seed hero cards
INSERT INTO public.hero_cards (id, name_en, name_sw, unlock_day, superpower_en, superpower_sw, fact_en, fact_sw, emoji) VALUES
('abraham', 'Abraham', 'Ibrahimu', 7, 'Trusted the impossible. Father of nations.', 'Alisikiliza lisilowezekana. Baba wa mataifa.', 'Left everything at age 75 on God''s promise alone.', 'Aliacha yote akiwa na umri wa miaka 75 kwa ahadi ya Mungu.', '⭐'),
('moses', 'Moses', 'Musa', 14, 'Parted seas. Led millions. Never gave up.', 'Aligawanya bahari. Aliongoza mamilioni. Hakukata tamaa.', 'Spoke with God face to face on Mount Sinai.', 'Alizungumza na Mungu uso kwa uso mlimani Sinai.', '🌊'),
('ruth', 'Ruth', 'Ruthu', 21, 'Unwavering loyalty. Chose love over comfort.', 'Uaminifu usiotikisika. Alipenda kuliko starehe.', 'Her story is one of only two books named after women.', 'Hadithi yake ni mojawapo ya vitabu viwili tu vinavyoitwa kwa majina ya wanawake.', '🌾'),
('esther', 'Esther', 'Esther', 30, 'Saved a nation with courage and grace.', 'Aliokoa taifa kwa ujasiri na neema.', 'Became queen at a time her people needed her most.', 'Alifana Malkia wakati watu wake walimhitaji zaidi.', '👑'),
('paul', 'Paul', 'Paulo', 60, 'Transformed persecutor. Wrote half the New Testament.', 'Mtesaji aliyebadilika. Aliandika nusu ya Agano Jipya.', 'Planted churches across the Roman Empire despite chains.', 'Alipanda makanisa katika Dola la Roma licha ya minyororo.', '⚔️'),
('mary', 'Mary', 'Mariamu', 100, 'Said yes to the impossible. Mother of hope.', 'Alisema ndiyo kwa lisilowezekana. Mama wa tumaini.', 'A teenager chosen to carry the Savior of the world.', 'Kijana aliyechaguliwa kubeba Mwokzi wa ulimwengu.', '🕊️');

-- =============================================
-- 10. USER ACHIEVEMENTS
-- =============================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hero_id TEXT NOT NULL REFERENCES public.hero_cards(id),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, hero_id)
);

CREATE INDEX idx_achievements_user ON public.user_achievements(user_id);

-- =============================================
-- 11. PUSH SUBSCRIPTIONS
-- =============================================
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_push_user ON public.push_subscriptions(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- TESTIMONIES
CREATE POLICY "Anyone can view approved testimonies"
  ON public.testimonies FOR SELECT
  USING (moderation_status = 'approved');

CREATE POLICY "Users can view own testimonies"
  ON public.testimonies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert testimonies"
  ON public.testimonies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own testimonies"
  ON public.testimonies FOR UPDATE
  USING (auth.uid() = user_id);

-- REACTIONS
CREATE POLICY "Anyone can view reactions"
  ON public.reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- INBOX MESSAGES
CREATE POLICY "Users can view own inbox"
  ON public.inbox_messages FOR SELECT
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "Authenticated users can send messages"
  ON public.inbox_messages FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update own received messages"
  ON public.inbox_messages FOR UPDATE
  USING (auth.uid() = to_user_id);

-- STORIES
CREATE POLICY "Users can view own stories"
  ON public.stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- DEVOTIONS
CREATE POLICY "Users can manage own devotions"
  ON public.devotions FOR ALL
  USING (auth.uid() = user_id);

-- STREAKS
CREATE POLICY "Users can view own streak"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streak"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- PRAYERS (strictly private)
CREATE POLICY "Users can only access own prayers"
  ON public.prayers FOR ALL
  USING (auth.uid() = user_id);

-- USER ACHIEVEMENTS
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- PUSH SUBSCRIPTIONS
CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- HERO CARDS (public read)
ALTER TABLE public.hero_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hero cards"
  ON public.hero_cards FOR SELECT
  USING (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update reaction counts on testimonies
CREATE OR REPLACE FUNCTION public.update_testimony_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'amen' THEN
      UPDATE public.testimonies SET amen_count = amen_count + 1 WHERE id = NEW.testimony_id;
    ELSE
      UPDATE public.testimonies SET praying_count = praying_count + 1 WHERE id = NEW.testimony_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'amen' THEN
      UPDATE public.testimonies SET amen_count = GREATEST(0, amen_count - 1) WHERE id = OLD.testimony_id;
    ELSE
      UPDATE public.testimonies SET praying_count = GREATEST(0, praying_count - 1) WHERE id = OLD.testimony_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change
  AFTER INSERT OR DELETE ON public.reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_testimony_reaction_count();

-- Function to update streaks
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_streak RECORD;
BEGIN
  SELECT * INTO v_streak FROM public.streaks WHERE user_id = p_user_id;

  IF v_streak IS NULL THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_check_in)
    VALUES (p_user_id, 1, 1, v_today);
  ELSIF v_streak.last_check_in = v_today THEN
    -- Already checked in today, do nothing
    RETURN;
  ELSIF v_streak.last_check_in = v_yesterday THEN
    -- Continue streak
    UPDATE public.streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_check_in = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset
    UPDATE public.streaks
    SET current_streak = 1,
        last_check_in = v_today,
        grace_days_used = 0,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and unlock hero cards
CREATE OR REPLACE FUNCTION public.check_hero_unlocks(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_streak INTEGER;
  v_hero RECORD;
BEGIN
  SELECT current_streak INTO v_streak
  FROM public.streaks WHERE user_id = p_user_id;

  IF v_streak IS NULL THEN RETURN; END IF;

  FOR v_hero IN
    SELECT id FROM public.hero_cards
    WHERE unlock_day <= v_streak
    AND id NOT IN (SELECT hero_id FROM public.user_achievements WHERE user_id = p_user_id)
  LOOP
    INSERT INTO public.user_achievements (user_id, hero_id)
    VALUES (p_user_id, v_hero.id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
