-- Apply before deploying Blog price-date code. Existing row remains valid; the next
-- accepted live refresh initializes fingerprints with null priceChangedAt.
ALTER TABLE public.public_repair_catalogue_snapshots
  ADD COLUMN IF NOT EXISTS blog_price_freshness JSONB;

-- Rollback (after reverting the application code):
-- ALTER TABLE public.public_repair_catalogue_snapshots
--   DROP COLUMN IF EXISTS blog_price_freshness;
