-- ============================================================
-- DEFINITIVE FIX: STOREFRONT UPSELLS RLS PERMISSIONS
-- ============================================================

-- 1. Ensure RLS is enabled (best practice before adding policies)
ALTER TABLE public.storefront_upsells ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow public read on upsells" ON public.storefront_upsells;
DROP POLICY IF EXISTS "Allow anon all access on upsells" ON public.storefront_upsells;
DROP POLICY IF EXISTS "Allow authenticated all access on upsells" ON public.storefront_upsells;

-- 3. Policy: Public can read active upsells (for the Storefront)
CREATE POLICY "Allow public read on upsells"
ON public.storefront_upsells
FOR SELECT
TO public
USING (true);

-- 4. Policy: Anon role (the key used by the POS app) can do everything
-- This is what allows the "Add Upsell" button in your POS CMS to work.
CREATE POLICY "Allow anon all access on upsells"
ON public.storefront_upsells
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- 5. Policy: Authenticated users can also do everything
CREATE POLICY "Allow authenticated all access on upsells"
ON public.storefront_upsells
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verification: List policies to confirm they took effect
-- SELECT * FROM pg_policies WHERE tablename = 'storefront_upsells';
