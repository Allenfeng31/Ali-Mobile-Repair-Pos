-- Stores generated weekly analytics reports for the POS analytics dashboard.

CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  report_markdown TEXT NOT NULL,
  report_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reports_period
ON public.weekly_reports (period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_weekly_reports_period_end
ON public.weekly_reports (period_end DESC);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role weekly report access" ON public.weekly_reports;
CREATE POLICY "Allow service role weekly report access"
ON public.weekly_reports
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
