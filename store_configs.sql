-- ═══════════════════════════════════════════════════════════
-- Storefront Global Configuration
-- Run this in Supabase SQL Editor to enable CMS-managed cart discounts.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.store_configs (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.store_configs (key, value) VALUES
('multi_discount_tier_2', '0.10'),
('multi_discount_tier_3', '0.15')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

ALTER TABLE public.store_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to store_configs" ON public.store_configs;
CREATE POLICY "Allow public read access to store_configs"
ON public.store_configs FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow authenticated update store_configs" ON public.store_configs;
CREATE POLICY "Allow authenticated update store_configs"
ON public.store_configs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
