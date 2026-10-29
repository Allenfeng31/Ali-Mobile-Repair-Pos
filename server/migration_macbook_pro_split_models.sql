-- ==============================================================================
-- Ali Mobile — MacBook Pro 14" vs 16" Model Separation Migration
-- STATUS: PREPARED / DRY-RUN READY — PENDING OWNER APPROVAL BEFORE EXECUTION
-- ==============================================================================
-- Purpose:
-- Separates combined 14"/16" entries in POS inventory into dedicated 14" and 16"
-- records, allowing independent pricing and exact Apple regulatory A-number /
-- Apple Model Identifier mapping.
--
-- Authority: Apple Official Support (AU) https://support.apple.com/en-au/108052
--
-- Target records:
-- 1. MacBook Pro 14"/16" M4 Pro/Max (2024) (Existing IDs: 4228, 4229, 4230, 4231, 4232)
--    - Update existing IDs 4228-4232 to 14" (A3185, Mac16,6 / Mac16,8)
--    - Insert 5 new rows for 16" (A3186, Mac16,7 / Mac16,5)
--
-- 2. MacBook Pro 14"/16" M5 Pro/Max (2026) (Existing IDs: 4238, 4239, 4240, 4241, 4242)
--    - Update existing IDs 4238-4242 to 14" (Mac17,7, Mac17,9)
--    - Insert 5 new rows for 16" (Mac17,6, Mac17,8)
-- ==============================================================================

BEGIN;

-- STEP 1: Update existing IDs 4228-4232 to MacBook Pro 14" M4 Pro/Max (2024)
UPDATE public.inventory
SET
  name = REPLACE(name, '14"/16"', '14"'),
  model = 'MacBook||MacBook Pro 14" M4 Pro/Max (2024)',
  device_model = 'A3185'
WHERE id IN (4228, 4229, 4230, 4231, 4232);

-- STEP 2: Insert new rows for MacBook Pro 16" M4 Pro/Max (2024)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14"', '16"'),
  'MacBook||MacBook Pro 16" M4 Pro/Max (2024)',
  'A3186',
  category,
  price,
  costPrice,
  stock,
  minStock,
  status,
  iconName,
  quality_grade,
  is_recommended
FROM public.inventory
WHERE id IN (4228, 4229, 4230, 4231, 4232)
  AND NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE model = 'MacBook||MacBook Pro 16" M4 Pro/Max (2024)'
  );

-- STEP 3: Update existing IDs 4238-4242 to MacBook Pro 14" M5 Pro/Max (2026)
UPDATE public.inventory
SET
  name = REPLACE(name, '14"/16"', '14"'),
  model = 'MacBook||MacBook Pro 14" M5 Pro/Max (2026)',
  device_model = 'Mac17,7, Mac17,9'
WHERE id IN (4238, 4239, 4240, 4241, 4242);

-- STEP 4: Insert new rows for MacBook Pro 16" M5 Pro/Max (2026)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14"', '16"'),
  'MacBook||MacBook Pro 16" M5 Pro/Max (2026)',
  'Mac17,6, Mac17,8',
  category,
  price,
  costPrice,
  stock,
  minStock,
  status,
  iconName,
  quality_grade,
  is_recommended
FROM public.inventory
WHERE id IN (4238, 4239, 4240, 4241, 4242)
  AND NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE model = 'MacBook||MacBook Pro 16" M5 Pro/Max (2026)'
  );

COMMIT;
