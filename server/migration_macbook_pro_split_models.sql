-- ==============================================================================
-- Ali Mobile — MacBook Pro M4/M5 Pro & Max Model Separation Migration
-- STATUS: HARDENED / CONCURRENCY-SAFE / IDEMPOTENT / VERIFIED PRE & POST CONDITIONS
-- ==============================================================================
-- Rules & Protections:
-- 1. ADVISORY LOCK & ROW LOCKS:
--    Acquires an exclusive transaction advisory lock and row-level locks on IDs 4223-4242.
-- 2. STRICT PRECONDITIONS:
--    Verifies all 20 source records (IDs 4223-4242), expected model identities,
--    A-number state, zero-price state, cost/stock safety, and distinct service categories.
-- 3. TRUE IDEMPOTENCY:
--    Checks whether the database is already fully migrated (10 models, 50 records,
--    verified A-numbers). If already migrated, performs zero updates, zero inserts,
--    and exits cleanly with a notice.
-- 4. SERVICE-LEVEL DUPLICATE & PARTIAL TARGET PROTECTION:
--    Aborts if any target model is partially populated (>0 and <5 rows).
--    Uses service-level NOT EXISTS (model + category) for every insertion.
-- 5. PRICE & INVENTORY SAFETY:
--    Ensures zero price, zero costPrice, and zero stock are cloned. Clears cloned SKUs.
-- 6. POSTCONDITION ASSERTIONS:
--    Asserts exactly 10 models, 50 total records, 5 distinct approved services per model,
--    verified A-numbers for all models, and verifies older priced records remain intact.
-- ==============================================================================

BEGIN;

-- Concurrency-Safe Transaction Advisory Lock
SELECT pg_advisory_xact_lock(hashtext('ali_mobile_macbook_pro_m4_m5_split_models_migration'));

DO $$
DECLARE
  v_migrated_models_count INTEGER;
  v_migrated_rows_count INTEGER;
  v_source_rows_count INTEGER;
  v_source_non_zero_price INTEGER;
  v_source_duplicate_services INTEGER;
  v_partial_target_record RECORD;
  v_post_models_count INTEGER;
  v_post_total_rows INTEGER;
  v_post_non_zero INTEGER;
BEGIN
  -- ----------------------------------------------------------------------------
  -- 0. Lock source rows to prevent concurrent modification
  -- ----------------------------------------------------------------------------
  PERFORM 1 FROM public.inventory WHERE id BETWEEN 4223 AND 4242 FOR UPDATE;

  -- ----------------------------------------------------------------------------
  -- 1. Check if database is already in the fully migrated state (True Idempotency)
  -- ----------------------------------------------------------------------------
  SELECT COUNT(DISTINCT model), COUNT(*)
  INTO v_migrated_models_count, v_migrated_rows_count
  FROM public.inventory
  WHERE model IN (
    'C MacBook||MacBook Pro 14" M4 (2024)',
    'C MacBook||MacBook Pro 14" M4 Pro (2024)',
    'C MacBook||MacBook Pro 14" M4 Max (2024)',
    'C MacBook||MacBook Pro 16" M4 Pro (2024)',
    'C MacBook||MacBook Pro 16" M4 Max (2024)',
    'C MacBook||MacBook Pro 14" M5 (2025)',
    'C MacBook||MacBook Pro 14" M5 Pro (2026)',
    'C MacBook||MacBook Pro 14" M5 Max (2026)',
    'C MacBook||MacBook Pro 16" M5 Pro (2026)',
    'C MacBook||MacBook Pro 16" M5 Max (2026)'
  );

  IF v_migrated_models_count = 10 AND v_migrated_rows_count = 50 THEN
    -- Check 1.1: Verify each model has all 5 exact authorised repair services and no duplicate records
    IF EXISTS (
      WITH expected_catalogue AS (
        SELECT m.model, c.category
        FROM (
          VALUES
            ('C MacBook||MacBook Pro 14" M4 (2024)'),
            ('C MacBook||MacBook Pro 14" M4 Pro (2024)'),
            ('C MacBook||MacBook Pro 14" M4 Max (2024)'),
            ('C MacBook||MacBook Pro 16" M4 Pro (2024)'),
            ('C MacBook||MacBook Pro 16" M4 Max (2024)'),
            ('C MacBook||MacBook Pro 14" M5 (2025)'),
            ('C MacBook||MacBook Pro 14" M5 Pro (2026)'),
            ('C MacBook||MacBook Pro 14" M5 Max (2026)'),
            ('C MacBook||MacBook Pro 16" M5 Pro (2026)'),
            ('C MacBook||MacBook Pro 16" M5 Max (2026)')
        ) AS m(model)
        CROSS JOIN (
          VALUES
            ('Screen Replacement'),
            ('Battery Replacement'),
            ('Charging Port Replacement'),
            ('Water Damage Cleaning / Assessment'),
            ('Motherboard & Logic Board Repair')
        ) AS c(category)
      )
      SELECT exp.model, exp.category
      FROM expected_catalogue exp
      LEFT JOIN public.inventory i
        ON i.model = exp.model
       AND i.category = exp.category
      GROUP BY exp.model, exp.category
      HAVING COUNT(i.id) <> 1
    ) THEN
      RAISE EXCEPTION 'Idempotency check failed: Migrated state is missing required services or contains duplicates.';
    END IF;

    -- Check 1.2: Verify verified A-numbers and expected commercial names match with null-safe comparison
    IF EXISTS (
      WITH expected_catalogue AS (
        SELECT m.model, m.device_model, (m.comm_name || ' ' || c.category) AS expected_name, c.category
        FROM (
          VALUES
            ('C MacBook||MacBook Pro 14" M4 (2024)', 'A3112', 'MacBook Pro 14" M4 (2024)'),
            ('C MacBook||MacBook Pro 14" M4 Pro (2024)', 'A3401', 'MacBook Pro 14" M4 Pro (2024)'),
            ('C MacBook||MacBook Pro 14" M4 Max (2024)', 'A3185', 'MacBook Pro 14" M4 Max (2024)'),
            ('C MacBook||MacBook Pro 16" M4 Pro (2024)', 'A3403', 'MacBook Pro 16" M4 Pro (2024)'),
            ('C MacBook||MacBook Pro 16" M4 Max (2024)', 'A3186', 'MacBook Pro 16" M4 Max (2024)'),
            ('C MacBook||MacBook Pro 14" M5 (2025)', 'A3434', 'MacBook Pro 14" M5 (2025)'),
            ('C MacBook||MacBook Pro 14" M5 Pro (2026)', 'A3426', 'MacBook Pro 14" M5 Pro (2026)'),
            ('C MacBook||MacBook Pro 14" M5 Max (2026)', 'A3427', 'MacBook Pro 14" M5 Max (2026)'),
            ('C MacBook||MacBook Pro 16" M5 Pro (2026)', 'A3428', 'MacBook Pro 16" M5 Pro (2026)'),
            ('C MacBook||MacBook Pro 16" M5 Max (2026)', 'A3429', 'MacBook Pro 16" M5 Max (2026)')
        ) AS m(model, device_model, comm_name)
        CROSS JOIN (
          VALUES
            ('Screen Replacement'),
            ('Battery Replacement'),
            ('Charging Port Replacement'),
            ('Water Damage Cleaning / Assessment'),
            ('Motherboard & Logic Board Repair')
        ) AS c(category)
      )
      SELECT 1
      FROM expected_catalogue exp
      JOIN public.inventory i
        ON i.model = exp.model
       AND i.category = exp.category
      WHERE i.device_model IS DISTINCT FROM exp.device_model
         OR i.name IS DISTINCT FROM exp.expected_name
    ) THEN
      RAISE EXCEPTION 'Idempotency check failed: Migrated records have incorrect A-numbers or service item names.';
    END IF;

    -- Check 1.3: Verify quote-only prices (null-safe: price, costPrice, stock must be 0)
    IF EXISTS (
      SELECT 1
      FROM public.inventory
      WHERE model IN (
        'C MacBook||MacBook Pro 14" M4 (2024)',
        'C MacBook||MacBook Pro 14" M4 Pro (2024)',
        'C MacBook||MacBook Pro 14" M4 Max (2024)',
        'C MacBook||MacBook Pro 16" M4 Pro (2024)',
        'C MacBook||MacBook Pro 16" M4 Max (2024)',
        'C MacBook||MacBook Pro 14" M5 (2025)',
        'C MacBook||MacBook Pro 14" M5 Pro (2026)',
        'C MacBook||MacBook Pro 14" M5 Max (2026)',
        'C MacBook||MacBook Pro 16" M5 Pro (2026)',
        'C MacBook||MacBook Pro 16" M5 Max (2026)'
      ) AND (COALESCE(price, 0) <> 0 OR COALESCE("costPrice", 0) <> 0 OR COALESCE(stock, 0) <> 0)
    ) THEN
      RAISE EXCEPTION 'Idempotency check failed: Migrated records contain non-zero price, costPrice, or stock.';
    END IF;

    -- Check 1.4: Verify legacy records strictly exist and preserve established prices ($780, $240, $750)
    IF (SELECT COUNT(*) FROM public.inventory WHERE id = 1263 AND price = 780) <> 1
       OR (SELECT COUNT(*) FROM public.inventory WHERE id = 1264 AND price = 240) <> 1
       OR (SELECT COUNT(*) FROM public.inventory WHERE id = 3902 AND price = 750) <> 1 THEN
      RAISE EXCEPTION 'Idempotency check failed: Legacy MacBook Pro records (IDs 1263, 1264, 3902) are missing or their prices drifted from $780, $240, $750.';
    END IF;

    RAISE NOTICE 'Migration is already fully applied (10 models, 50 rows, verified A-numbers, quote-only, legacy prices intact). Skipping all operations.';
    RETURN;
  END IF;

  -- ----------------------------------------------------------------------------
  -- 2. Strict Preconditions on Source Rows 4223–4242
  -- ----------------------------------------------------------------------------
  SELECT COUNT(*) INTO v_source_rows_count
  FROM public.inventory
  WHERE id BETWEEN 4223 AND 4242;

  IF v_source_rows_count <> 20 THEN
    RAISE EXCEPTION 'Precondition failed: Expected exactly 20 original records for IDs 4223-4242, found %', v_source_rows_count;
  END IF;

  -- Price, cost, and stock safety check
  SELECT COUNT(*) INTO v_source_non_zero_price
  FROM public.inventory
  WHERE id BETWEEN 4223 AND 4242
    AND (COALESCE(price, 0) <> 0 OR COALESCE("costPrice", 0) <> 0 OR COALESCE(stock, 0) <> 0);

  IF v_source_non_zero_price > 0 THEN
    RAISE EXCEPTION 'Precondition failed: % source rows in IDs 4223-4242 have unexpected non-zero price, costPrice, or stock.', v_source_non_zero_price;
  END IF;

  -- Verify expected source models, IDs, and initial A-numbers:
  -- IDs 4223-4227: MacBook Pro 14" M4 (2024) / A3112
  IF (SELECT COUNT(*) FROM public.inventory WHERE id BETWEEN 4223 AND 4227 AND model = 'C MacBook||MacBook Pro 14" M4 (2024)' AND device_model = 'A3112') <> 5 THEN
    RAISE EXCEPTION 'Precondition failed: IDs 4223-4227 do not match MacBook Pro 14" M4 (2024) / A3112';
  END IF;

  -- IDs 4228-4232: MacBook Pro 14"/16" M4 Pro/Max (2024) / A3185, A3186
  IF (SELECT COUNT(*) FROM public.inventory WHERE id BETWEEN 4228 AND 4232 AND model = 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)' AND device_model = 'A3185, A3186') <> 5 THEN
    RAISE EXCEPTION 'Precondition failed: IDs 4228-4232 do not match MacBook Pro 14"/16" M4 Pro/Max (2024) / A3185, A3186';
  END IF;

  -- IDs 4233-4237: MacBook Pro 14" M5 (2025) / Mac17,2 or A3434
  IF (SELECT COUNT(*) FROM public.inventory WHERE id BETWEEN 4233 AND 4237 AND model = 'C MacBook||MacBook Pro 14" M5 (2025)' AND device_model IN ('Mac17,2', 'A3434')) <> 5 THEN
    RAISE EXCEPTION 'Precondition failed: IDs 4233-4237 do not match MacBook Pro 14" M5 (2025)';
  END IF;

  -- IDs 4238-4242: MacBook Pro 14"/16" M5 Pro/Max (2026) / Mac17,6, Mac17,7, Mac17,8, Mac17,9
  IF (SELECT COUNT(*) FROM public.inventory WHERE id BETWEEN 4238 AND 4242 AND model = 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)' AND device_model = 'Mac17,6, Mac17,7, Mac17,8, Mac17,9') <> 5 THEN
    RAISE EXCEPTION 'Precondition failed: IDs 4238-4242 do not match MacBook Pro 14"/16" M5 Pro/Max (2026)';
  END IF;

  -- Verify all 20 source rows have authorised categories and matching service item names
  IF EXISTS (
    SELECT 1 FROM public.inventory
    WHERE id BETWEEN 4223 AND 4242
      AND (
        category NOT IN (
          'Screen Replacement',
          'Battery Replacement',
          'Charging Port Replacement',
          'Water Damage Cleaning / Assessment',
          'Motherboard & Logic Board Repair'
        )
        OR name IS DISTINCT FROM (REPLACE(model, 'C MacBook||', '') || ' ' || category)
      )
  ) THEN
    RAISE EXCEPTION 'Precondition failed: Source records (IDs 4223-4242) contain unauthorised service categories or mismatched service item names.';
  END IF;

  -- Verify each source model group has exactly 5 distinct approved services
  SELECT COUNT(*) INTO v_source_duplicate_services
  FROM (
    SELECT (id - 4223) / 5 AS grp, category, COUNT(*) AS cnt
    FROM public.inventory
    WHERE id BETWEEN 4223 AND 4242
    GROUP BY (id - 4223) / 5, category
    HAVING COUNT(*) > 1
  ) dups;

  IF v_source_duplicate_services > 0 THEN
    RAISE EXCEPTION 'Precondition failed: Detected duplicate service categories in source records (IDs 4223-4242).';
  END IF;

  -- ----------------------------------------------------------------------------
  -- 3. Service-Level & Partial Target Model Duplicate Protection
  -- ----------------------------------------------------------------------------
  -- Check for partial target models (models with > 0 and < 5 rows)
  FOR v_partial_target_record IN
    SELECT model, COUNT(*) AS cnt
    FROM public.inventory
    WHERE model IN (
      'C MacBook||MacBook Pro 14" M4 Max (2024)',
      'C MacBook||MacBook Pro 16" M4 Pro (2024)',
      'C MacBook||MacBook Pro 16" M4 Max (2024)',
      'C MacBook||MacBook Pro 14" M5 Max (2026)',
      'C MacBook||MacBook Pro 16" M5 Pro (2026)',
      'C MacBook||MacBook Pro 16" M5 Max (2026)'
    )
    GROUP BY model
  LOOP
    IF v_partial_target_record.cnt <> 0 AND v_partial_target_record.cnt <> 5 THEN
      RAISE EXCEPTION 'Safety check failed: Detected partially populated target model % with % rows (expected 0 or 5).',
        v_partial_target_record.model, v_partial_target_record.cnt;
    END IF;
  END LOOP;

  -- Verify older priced records strictly exist and preserve established prices ($780, $240, $750)
  IF (SELECT COUNT(*) FROM public.inventory WHERE id = 1263 AND price = 780) <> 1
     OR (SELECT COUNT(*) FROM public.inventory WHERE id = 1264 AND price = 240) <> 1
     OR (SELECT COUNT(*) FROM public.inventory WHERE id = 3902 AND price = 750) <> 1 THEN
    RAISE EXCEPTION 'Precondition failed: Legacy MacBook Pro records (IDs 1263, 1264, 3902) are missing or their prices drifted from $780, $240, $750.';
  END IF;

  -- ----------------------------------------------------------------------------
  -- 4. Execute Updates & Insertions with Service-Level Duplicate Protection
  -- ----------------------------------------------------------------------------

  -- Part 1: Correct A-number for MacBook Pro 14" M5 (2025) [IDs 4233-4237]
  UPDATE public.inventory
  SET device_model = 'A3434'
  WHERE id IN (4233, 4234, 4235, 4236, 4237)
    AND device_model <> 'A3434';

  -- Part 2: Split M4 Pro/Max (2024) [IDs 4228-4232]
  -- Step 2.1: Update existing IDs 4228-4232 to 14" M4 Pro — A3401
  UPDATE public.inventory
  SET
    name = REPLACE(name, '14"/16" M4 Pro/Max', '14" M4 Pro'),
    model = 'C MacBook||MacBook Pro 14" M4 Pro (2024)',
    device_model = 'A3401'
  WHERE id IN (4228, 4229, 4230, 4231, 4232);

  -- Step 2.2: Insert 14" M4 Max (2024) — A3185 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M4 Pro', '14" M4 Max'),
    'C MacBook||MacBook Pro 14" M4 Max (2024)',
    'A3185',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4228, 4229, 4230, 4231, 4232)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 14" M4 Max (2024)'
        AND tgt.category = src.category
    );

  -- Step 2.3: Insert 16" M4 Pro (2024) — A3403 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M4 Pro', '16" M4 Pro'),
    'C MacBook||MacBook Pro 16" M4 Pro (2024)',
    'A3403',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4228, 4229, 4230, 4231, 4232)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 16" M4 Pro (2024)'
        AND tgt.category = src.category
    );

  -- Step 2.4: Insert 16" M4 Max (2024) — A3186 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M4 Pro', '16" M4 Max'),
    'C MacBook||MacBook Pro 16" M4 Max (2024)',
    'A3186',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4228, 4229, 4230, 4231, 4232)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 16" M4 Max (2024)'
        AND tgt.category = src.category
    );

  -- Part 3: Split M5 Pro/Max (2026) [IDs 4238-4242]
  -- Step 3.1: Update existing IDs 4238-4242 to 14" M5 Pro — A3426
  UPDATE public.inventory
  SET
    name = REPLACE(name, '14"/16" M5 Pro/Max', '14" M5 Pro'),
    model = 'C MacBook||MacBook Pro 14" M5 Pro (2026)',
    device_model = 'A3426'
  WHERE id IN (4238, 4239, 4240, 4241, 4242);

  -- Step 3.2: Insert 14" M5 Max (2026) — A3427 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M5 Pro', '14" M5 Max'),
    'C MacBook||MacBook Pro 14" M5 Max (2026)',
    'A3427',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4238, 4239, 4240, 4241, 4242)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 14" M5 Max (2026)'
        AND tgt.category = src.category
    );

  -- Step 3.3: Insert 16" M5 Pro (2026) — A3428 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M5 Pro', '16" M5 Pro'),
    'C MacBook||MacBook Pro 16" M5 Pro (2026)',
    'A3428',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4238, 4239, 4240, 4241, 4242)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 16" M5 Pro (2026)'
        AND tgt.category = src.category
    );

  -- Step 3.4: Insert 16" M5 Max (2026) — A3429 (5 services)
  INSERT INTO public.inventory (name, model, device_model, category, price, "costPrice", stock, "minStock", margin, status, "iconName", quality_grade, is_recommended, is_pinned, pin_order, sku)
  SELECT
    REPLACE(src.name, '14" M5 Pro', '16" M5 Max'),
    'C MacBook||MacBook Pro 16" M5 Max (2026)',
    'A3429',
    src.category,
    0, 0, 0, 0, 0,
    'In Stock',
    src."iconName",
    'Standard',
    false, false, 0,
    NULL
  FROM public.inventory src
  WHERE src.id IN (4238, 4239, 4240, 4241, 4242)
    AND NOT EXISTS (
      SELECT 1 FROM public.inventory tgt
      WHERE tgt.model = 'C MacBook||MacBook Pro 16" M5 Max (2026)'
        AND tgt.category = src.category
    );

  -- ----------------------------------------------------------------------------
  -- 5. Postcondition Assertions Before Commit
  -- ----------------------------------------------------------------------------

  -- Assertion 5.1: Exactly 10 target models
  SELECT COUNT(DISTINCT model), COUNT(*)
  INTO v_post_models_count, v_post_total_rows
  FROM public.inventory
  WHERE model IN (
    'C MacBook||MacBook Pro 14" M4 (2024)',
    'C MacBook||MacBook Pro 14" M4 Pro (2024)',
    'C MacBook||MacBook Pro 14" M4 Max (2024)',
    'C MacBook||MacBook Pro 16" M4 Pro (2024)',
    'C MacBook||MacBook Pro 16" M4 Max (2024)',
    'C MacBook||MacBook Pro 14" M5 (2025)',
    'C MacBook||MacBook Pro 14" M5 Pro (2026)',
    'C MacBook||MacBook Pro 14" M5 Max (2026)',
    'C MacBook||MacBook Pro 16" M5 Pro (2026)',
    'C MacBook||MacBook Pro 16" M5 Max (2026)'
  );

  IF v_post_models_count <> 10 THEN
    RAISE EXCEPTION 'Postcondition failed: Expected 10 models, found %', v_post_models_count;
  END IF;

  -- Assertion 5.2: Exactly 50 total records
  IF v_post_total_rows <> 50 THEN
    RAISE EXCEPTION 'Postcondition failed: Expected 50 total records across 10 models, found %', v_post_total_rows;
  END IF;

  -- Assertion 5.3: Exact 5 authorised repair services and duplicate prevention across all 10 models
  IF EXISTS (
    WITH expected_catalogue AS (
      SELECT m.model, c.category
      FROM (
        VALUES
          ('C MacBook||MacBook Pro 14" M4 (2024)'),
          ('C MacBook||MacBook Pro 14" M4 Pro (2024)'),
          ('C MacBook||MacBook Pro 14" M4 Max (2024)'),
          ('C MacBook||MacBook Pro 16" M4 Pro (2024)'),
          ('C MacBook||MacBook Pro 16" M4 Max (2024)'),
          ('C MacBook||MacBook Pro 14" M5 (2025)'),
          ('C MacBook||MacBook Pro 14" M5 Pro (2026)'),
          ('C MacBook||MacBook Pro 14" M5 Max (2026)'),
          ('C MacBook||MacBook Pro 16" M5 Pro (2026)'),
          ('C MacBook||MacBook Pro 16" M5 Max (2026)')
      ) AS m(model)
      CROSS JOIN (
        VALUES
          ('Screen Replacement'),
          ('Battery Replacement'),
          ('Charging Port Replacement'),
          ('Water Damage Cleaning / Assessment'),
          ('Motherboard & Logic Board Repair')
      ) AS c(category)
    )
    SELECT exp.model, exp.category
    FROM expected_catalogue exp
    LEFT JOIN public.inventory i
      ON i.model = exp.model
     AND i.category = exp.category
    GROUP BY exp.model, exp.category
    HAVING COUNT(i.id) <> 1
  ) THEN
    RAISE EXCEPTION 'Postcondition failed: Target models do not have all 5 authorised repair services or contain duplicate service rows.';
  END IF;

  -- Assertion 5.4: Verify each model has its verified A-number and service item name matches model identity
  IF EXISTS (
    WITH expected_catalogue AS (
      SELECT m.model, m.device_model, (m.comm_name || ' ' || c.category) AS expected_name, c.category
      FROM (
        VALUES
          ('C MacBook||MacBook Pro 14" M4 (2024)', 'A3112', 'MacBook Pro 14" M4 (2024)'),
          ('C MacBook||MacBook Pro 14" M4 Pro (2024)', 'A3401', 'MacBook Pro 14" M4 Pro (2024)'),
          ('C MacBook||MacBook Pro 14" M4 Max (2024)', 'A3185', 'MacBook Pro 14" M4 Max (2024)'),
          ('C MacBook||MacBook Pro 16" M4 Pro (2024)', 'A3403', 'MacBook Pro 16" M4 Pro (2024)'),
          ('C MacBook||MacBook Pro 16" M4 Max (2024)', 'A3186', 'MacBook Pro 16" M4 Max (2024)'),
          ('C MacBook||MacBook Pro 14" M5 (2025)', 'A3434', 'MacBook Pro 14" M5 (2025)'),
          ('C MacBook||MacBook Pro 14" M5 Pro (2026)', 'A3426', 'MacBook Pro 14" M5 Pro (2026)'),
          ('C MacBook||MacBook Pro 14" M5 Max (2026)', 'A3427', 'MacBook Pro 14" M5 Max (2026)'),
          ('C MacBook||MacBook Pro 16" M5 Pro (2026)', 'A3428', 'MacBook Pro 16" M5 Pro (2026)'),
          ('C MacBook||MacBook Pro 16" M5 Max (2026)', 'A3429', 'MacBook Pro 16" M5 Max (2026)')
      ) AS m(model, device_model, comm_name)
      CROSS JOIN (
        VALUES
          ('Screen Replacement'),
          ('Battery Replacement'),
          ('Charging Port Replacement'),
          ('Water Damage Cleaning / Assessment'),
          ('Motherboard & Logic Board Repair')
      ) AS c(category)
    )
    SELECT 1
    FROM expected_catalogue exp
    JOIN public.inventory i
      ON i.model = exp.model
     AND i.category = exp.category
    WHERE i.device_model IS DISTINCT FROM exp.device_model
       OR i.name IS DISTINCT FROM exp.expected_name
  ) THEN
    RAISE EXCEPTION 'Postcondition failed: One or more models have incorrect device_model A-numbers or mismatched service item names.';
  END IF;

  -- Assertion 5.5: All records remain quote-only ($0 price, $0 cost, 0 stock)
  SELECT COUNT(*) INTO v_post_non_zero
  FROM public.inventory
  WHERE model IN (
    'C MacBook||MacBook Pro 14" M4 (2024)',
    'C MacBook||MacBook Pro 14" M4 Pro (2024)',
    'C MacBook||MacBook Pro 14" M4 Max (2024)',
    'C MacBook||MacBook Pro 16" M4 Pro (2024)',
    'C MacBook||MacBook Pro 16" M4 Max (2024)',
    'C MacBook||MacBook Pro 14" M5 (2025)',
    'C MacBook||MacBook Pro 14" M5 Pro (2026)',
    'C MacBook||MacBook Pro 14" M5 Max (2026)',
    'C MacBook||MacBook Pro 16" M5 Pro (2026)',
    'C MacBook||MacBook Pro 16" M5 Max (2026)'
  ) AND (COALESCE(price, 0) <> 0 OR COALESCE("costPrice", 0) <> 0 OR COALESCE(stock, 0) <> 0);

  IF v_post_non_zero > 0 THEN
    RAISE EXCEPTION 'Postcondition failed: % records have non-zero price, cost, or stock.', v_post_non_zero;
  END IF;

  -- Assertion 5.6: Older MacBook records strictly exist and preserve established prices ($780, $240, $750)
  IF (SELECT COUNT(*) FROM public.inventory WHERE id = 1263 AND price = 780) <> 1
     OR (SELECT COUNT(*) FROM public.inventory WHERE id = 1264 AND price = 240) <> 1
     OR (SELECT COUNT(*) FROM public.inventory WHERE id = 3902 AND price = 750) <> 1 THEN
    RAISE EXCEPTION 'Postcondition failed: Legacy MacBook Pro records (IDs 1263, 1264, 3902) are missing or their prices drifted from $780, $240, $750.';
  END IF;

  RAISE NOTICE 'Migration successfully completed and verified: 10 models, 50 services, all verified A-numbers.';
END $$;

COMMIT;
