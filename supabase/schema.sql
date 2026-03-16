-- ============================================================
-- GameMagicKit Database Schema
-- ============================================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  total_credits INTEGER NOT NULL DEFAULT 1000,
  win_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  predictions_count INTEGER NOT NULL DEFAULT 0,
  wins_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Markets
CREATE TABLE IF NOT EXISTS public.markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('GAMES', 'ESPORTS', 'TECH', 'POP_CULTURE')),
  type TEXT NOT NULL CHECK (type IN ('YES_NO', 'MULTI')) DEFAULT 'YES_NO',
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'SETTLED')) DEFAULT 'OPEN',
  closes_at TIMESTAMPTZ NOT NULL,
  resolved_outcome TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Market options
CREATE TABLE IF NOT EXISTS public.market_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES public.markets(id),
  option_id UUID NOT NULL REFERENCES public.market_options(id),
  credits_staked INTEGER NOT NULL CHECK (credits_staked > 0),
  result TEXT NOT NULL CHECK (result IN ('PENDING', 'WON', 'LOST')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, market_id)
);

-- Credit transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('STARTING_GRANT', 'STAKE', 'WIN_REWARD', 'BONUS', 'ADJUSTMENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT
);

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only self can update
CREATE POLICY "users_select_all" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_self" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_self" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles: anyone can read, only self can update
CREATE POLICY "user_profiles_select_all" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "user_profiles_update_self" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_self" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Markets: anyone can read, authenticated users can see all
CREATE POLICY "markets_select_all" ON public.markets FOR SELECT USING (true);
CREATE POLICY "markets_insert_admin" ON public.markets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "markets_update_admin" ON public.markets FOR UPDATE USING (auth.role() = 'authenticated');

-- Market options: anyone can read
CREATE POLICY "market_options_select_all" ON public.market_options FOR SELECT USING (true);
CREATE POLICY "market_options_insert_admin" ON public.market_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "market_options_update_admin" ON public.market_options FOR UPDATE USING (auth.role() = 'authenticated');

-- Predictions: users see own, authenticated can insert
CREATE POLICY "predictions_select_own" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_service" ON public.predictions FOR UPDATE USING (true);

-- Credit transactions: users see own
CREATE POLICY "credit_tx_select_own" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "credit_tx_insert_own" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges: anyone can read
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (true);
CREATE POLICY "badges_insert_admin" ON public.badges FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User badges: users see own
CREATE POLICY "user_badges_select_own" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_badges_insert_service" ON public.user_badges FOR INSERT WITH CHECK (true);

-- ============================================================
-- New User Signup Handler
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT;
  v_base     TEXT;
  v_suffix   INTEGER := 0;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1)
  );
  v_base := v_username;

  -- Make username unique using an incrementing suffix
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = v_username) LOOP
    v_suffix   := v_suffix + 1;
    v_username := v_base || v_suffix::TEXT;
  END LOOP;

  INSERT INTO public.users (id, email, username, created_at)
  VALUES (NEW.id, NEW.email, v_username, NOW())
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_profiles (user_id, display_name, total_credits, level, xp)
  VALUES (NEW.id, v_username, 1000, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, amount, type, note)
  VALUES (NEW.id, 1000, 'STARTING_GRANT', 'Welcome to GameMagicKit! Starting credits.');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_market_id ON public.predictions(market_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON public.markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON public.markets(category);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON public.user_profiles(xp DESC);
