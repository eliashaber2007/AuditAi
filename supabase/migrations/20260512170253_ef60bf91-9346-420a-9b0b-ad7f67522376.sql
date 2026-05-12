-- 1. Add user_id to audits
ALTER TABLE public.audits
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_audits_user_id_created_at
  ON public.audits (user_id, created_at DESC);

-- 2. Tighten RLS
DROP POLICY IF EXISTS "Anyone can create audits" ON public.audits;
DROP POLICY IF EXISTS "Audits are publicly readable" ON public.audits;

CREATE POLICY "Users can view their own audits"
  ON public.audits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Inserts happen server-side via service role, so no insert policy needed.

-- 3. Free credit on signup
CREATE OR REPLACE FUNCTION public.grant_signup_credit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_credit ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_credit
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_signup_credit();
