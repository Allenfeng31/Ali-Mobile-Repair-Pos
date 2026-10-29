-- ==============================================================================
-- Ali Mobile — MacBook Pro M4/M5 Pro & Max Model Separation Migration
-- STATUS: PREPARED / IDEMPOTENT / DRY-RUN READY — PENDING OWNER APPROVAL BEFORE EXECUTION
-- ==============================================================================
-- Scope & Rules:
-- 1. PRESERVE ALL OLDER MACBOOK PRO MODELS (M1, M2, M3 Pro/Max, Intel).
--    - Do not alter IDs 1263-1266, 3902, 4222 (M3 Pro/Max).
--    - Keep established prices ($780 screen, $240 battery) and existing URLs.
-- 2. RETAIN EXISTING INDIVIDUAL NEW MODELS WITHOUT SPLITTING:
--    - MacBook Pro 14" M4 (2024) [IDs 4223-4227] -> A3112 (unchanged)
--    - MacBook Pro 14" M5 (2025) [IDs 4233-4237] -> Update device_model to A3434
-- 3. SPLIT ONLY THE 2 RECENTLY ADDED COMBINED GROUPS (10 rows -> 8 models, 40 rows):
--    - Group A: IDs 4228-4232 (M4 Pro/Max 2024) -> Split into 4 distinct models:
--        * MacBook Pro 14" M4 Pro (2024) — A3401 (updates IDs 4228-4232)
--        * MacBook Pro 14" M4 Max (2024) — A3185 (inserts 5 new rows)
--        * MacBook Pro 16" M4 Pro (2024) — A3403 (inserts 5 new rows)
--        * MacBook Pro 16" M4 Max (2024) — A3186 (inserts 5 new rows)
--    - Group B: IDs 4238-4242 (M5 Pro/Max 2026) -> Split into 4 distinct models:
--        * MacBook Pro 14" M5 Pro (2026) — A3426 (updates IDs 4238-4242)
--        * MacBook Pro 14" M5 Max (2026) — A3427 (inserts 5 new rows)
--        * MacBook Pro 16" M5 Pro (2026) — A3428 (inserts 5 new rows)
--        * MacBook Pro 16" M5 Max (2026) — A3429 (inserts 5 new rows)
-- 4. ALL UNPRICED SERVICES REMAIN price: 0 (Quote on Request).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- PART 1: Correct A-number for MacBook Pro 14" M5 (2025) [IDs 4233-4237]
-- ------------------------------------------------------------------------------
UPDATE public.inventory
SET device_model = 'A3434'
WHERE id IN (4233, 4234, 4235, 4236, 4237)
  AND device_model <> 'A3434';

-- ------------------------------------------------------------------------------
-- PART 2: Split MacBook Pro 14"/16" M4 Pro/Max (2024) [IDs 4228-4232]
-- ------------------------------------------------------------------------------

-- Step 2.1: Update existing IDs 4228-4232 to MacBook Pro 14" M4 Pro (2024) — A3401
UPDATE public.inventory
SET
  name = REPLACE(name, '14"/16" M4 Pro/Max', '14" M4 Pro'),
  model = 'C MacBook||MacBook Pro 14" M4 Pro (2024)',
  device_model = 'A3401'
WHERE id IN (4228, 4229, 4230, 4231, 4232);

-- Step 2.2: Insert MacBook Pro 14" M4 Max (2024) — A3185 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M4 Pro', '14" M4 Max'),
  'C MacBook||MacBook Pro 14" M4 Max (2024)',
  'A3185',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 14" M4 Max (2024)'
  );

-- Step 2.3: Insert MacBook Pro 16" M4 Pro (2024) — A3403 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M4 Pro', '16" M4 Pro'),
  'C MacBook||MacBook Pro 16" M4 Pro (2024)',
  'A3403',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 16" M4 Pro (2024)'
  );

-- Step 2.4: Insert MacBook Pro 16" M4 Max (2024) — A3186 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M4 Pro', '16" M4 Max'),
  'C MacBook||MacBook Pro 16" M4 Max (2024)',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 16" M4 Max (2024)'
  );

-- ------------------------------------------------------------------------------
-- PART 3: Split MacBook Pro 14"/16" M5 Pro/Max (2026) [IDs 4238-4242]
-- ------------------------------------------------------------------------------

-- Step 3.1: Update existing IDs 4238-4242 to MacBook Pro 14" M5 Pro (2026) — A3426
UPDATE public.inventory
SET
  name = REPLACE(name, '14"/16" M5 Pro/Max', '14" M5 Pro'),
  model = 'C MacBook||MacBook Pro 14" M5 Pro (2026)',
  device_model = 'A3426'
WHERE id IN (4238, 4239, 4240, 4241, 4242);

-- Step 3.2: Insert MacBook Pro 14" M5 Max (2026) — A3427 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M5 Pro', '14" M5 Max'),
  'C MacBook||MacBook Pro 14" M5 Max (2026)',
  'A3427',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 14" M5 Max (2026)'
  );

-- Step 3.3: Insert MacBook Pro 16" M5 Pro (2026) — A3428 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M5 Pro', '16" M5 Pro'),
  'C MacBook||MacBook Pro 16" M5 Pro (2026)',
  'A3428',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 16" M5 Pro (2026)'
  );

-- Step 3.4: Insert MacBook Pro 16" M5 Max (2026) — A3429 (5 repair services)
INSERT INTO public.inventory (name, model, device_model, category, price, costPrice, stock, minStock, status, iconName, quality_grade, is_recommended)
SELECT
  REPLACE(name, '14" M5 Pro', '16" M5 Max'),
  'C MacBook||MacBook Pro 16" M5 Max (2026)',
  'A3429',
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
    SELECT 1 FROM public.inventory WHERE model = 'C MacBook||MacBook Pro 16" M5 Max (2026)'
  );

COMMIT;
