-- ============================================================
-- REPAIR RESULTS MODULE
-- ============================================================
-- Creates an isolated public showcase table for approved before/after
-- repair result images. Admin writes must go through trusted service-role
-- server code only.

BEGIN;

CREATE TABLE IF NOT EXISTS public.repair_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_category TEXT NOT NULL,
  brand TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  model TEXT NOT NULL,
  model_slug TEXT NOT NULL,
  repair_type TEXT NOT NULL,
  repair_type_slug TEXT NOT NULL,
  before_image_path TEXT NOT NULL,
  after_image_path TEXT NOT NULL,
  image_pair_alt_text TEXT,
  image_aspect_ratio TEXT DEFAULT '4:3',
  before_image_width INTEGER,
  before_image_height INTEGER,
  after_image_width INTEGER,
  after_image_height INTEGER,
  title TEXT NOT NULL,
  short_description TEXT,
  status TEXT DEFAULT 'draft',
  privacy_checked BOOLEAN DEFAULT false,
  featured_on_homepage BOOLEAN DEFAULT false,
  featured_on_repair_hub BOOLEAN NOT NULL DEFAULT false,
  featured_on_brand_hub BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  related_repair_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  CONSTRAINT repair_results_device_category_check
    CHECK (device_category IN ('phone', 'tablet', 'laptop', 'watch')),
  CONSTRAINT repair_results_status_check
    CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  CONSTRAINT repair_results_before_image_width_check
    CHECK (before_image_width IS NULL OR before_image_width > 0),
  CONSTRAINT repair_results_before_image_height_check
    CHECK (before_image_height IS NULL OR before_image_height > 0),
  CONSTRAINT repair_results_after_image_width_check
    CHECK (after_image_width IS NULL OR after_image_width > 0),
  CONSTRAINT repair_results_after_image_height_check
    CHECK (after_image_height IS NULL OR after_image_height > 0)
);

CREATE INDEX IF NOT EXISTS repair_results_public_homepage_idx
  ON public.repair_results (
    device_category,
    featured_on_homepage,
    sort_order,
    published_at DESC
  )
  WHERE status = 'published'
    AND privacy_checked = true
    AND before_image_path <> ''
    AND after_image_path <> '';

CREATE INDEX IF NOT EXISTS repair_results_exact_match_idx
  ON public.repair_results (
    model_slug,
    repair_type_slug,
    sort_order,
    published_at DESC
  )
  WHERE status = 'published'
    AND privacy_checked = true
    AND before_image_path <> ''
    AND after_image_path <> '';

CREATE INDEX IF NOT EXISTS repair_results_brand_match_idx
  ON public.repair_results (
    brand_slug,
    repair_type_slug,
    sort_order,
    published_at DESC
  )
  WHERE status = 'published'
    AND privacy_checked = true
    AND before_image_path <> ''
    AND after_image_path <> '';

CREATE INDEX IF NOT EXISTS repair_results_category_match_idx
  ON public.repair_results (
    device_category,
    repair_type_slug,
    sort_order,
    published_at DESC
  )
  WHERE status = 'published'
    AND privacy_checked = true
    AND before_image_path <> ''
    AND after_image_path <> '';

CREATE OR REPLACE FUNCTION public.set_repair_results_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_results_updated_at ON public.repair_results;

CREATE TRIGGER trg_repair_results_updated_at
BEFORE UPDATE ON public.repair_results
FOR EACH ROW
EXECUTE FUNCTION public.set_repair_results_updated_at();

ALTER TABLE public.repair_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_results FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.repair_results FROM anon;
REVOKE ALL ON TABLE public.repair_results FROM authenticated;

GRANT SELECT ON TABLE public.repair_results TO anon;
GRANT SELECT ON TABLE public.repair_results TO authenticated;

DROP POLICY IF EXISTS "Public can read published privacy checked repair results"
  ON public.repair_results;

CREATE POLICY "Public can read published privacy checked repair results"
ON public.repair_results
FOR SELECT
TO public
USING (
  status = 'published'
  AND privacy_checked = true
  AND nullif(trim(before_image_path), '') IS NOT NULL
  AND nullif(trim(after_image_path), '') IS NOT NULL
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('repair-results', 'repair-results', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

COMMIT;
