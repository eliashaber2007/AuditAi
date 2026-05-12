CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  report JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audits are publicly readable"
  ON public.audits FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create audits"
  ON public.audits FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_audits_created_at ON public.audits (created_at DESC);