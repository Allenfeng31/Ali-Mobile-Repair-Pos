-- ============================================================
-- SEO GENERATED CAMPAIGNS STAGING SCHEMA
-- ============================================================
-- Run this in Supabase SQL Editor.
-- It upgrades the existing minimal pending_seo_campaigns table so the
-- SEO worker can store Gemini drafts, Claude audit trails, and JSON-LD.

ALTER TABLE public.pending_seo_campaigns
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'seo-worker',
  ADD COLUMN IF NOT EXISTS payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS pending_seo_campaigns_keyword_idx
  ON public.pending_seo_campaigns (keyword);

CREATE INDEX IF NOT EXISTS pending_seo_campaigns_status_idx
  ON public.pending_seo_campaigns (status);

CREATE INDEX IF NOT EXISTS pending_seo_campaigns_payload_slug_idx
  ON public.pending_seo_campaigns ((payload #>> '{draft,slug}'));

CREATE OR REPLACE FUNCTION public.set_pending_seo_campaigns_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pending_seo_campaigns_updated_at ON public.pending_seo_campaigns;

CREATE TRIGGER trg_pending_seo_campaigns_updated_at
BEFORE UPDATE ON public.pending_seo_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.set_pending_seo_campaigns_updated_at();
