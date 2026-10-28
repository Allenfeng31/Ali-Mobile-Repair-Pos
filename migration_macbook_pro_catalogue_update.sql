-- Correct the MacBook Pro 14"/16" M3 Pro/Max year error from (2024) to (2023)
-- and add missing officially verified MacBook Pro models (2024–2026).
--
-- Official authority: Apple Support (AU) https://support.apple.com/en-au/108052
--
-- This file is intentionally committed but MUST NOT be executed without separate
-- production approval. It modifies public.inventory records with strict safety assertions.

BEGIN;

DO $$
DECLARE
  matched_m3_count integer;
  updated_m3_count integer;
BEGIN
  -- 1. Assert existing M3 Pro/Max rows in inventory before updating
  SELECT count(*)
  INTO matched_m3_count
  FROM public.inventory
  WHERE model ILIKE 'C MacBook||MacBook Pro 14"/16" M3 Pro/Max%'
     OR name ILIKE 'MacBook Pro 14"/16" M3 Pro/Max%';

  IF matched_m3_count < 5 THEN
    RAISE EXCEPTION
      'MacBook Pro M3 Pro/Max migration aborted: expected at least 5 rows, found %',
      matched_m3_count;
  END IF;

  -- 2. Correct year in model and name: (2024) -> (2023)
  UPDATE public.inventory
  SET
    model = replace(model, '(2024)', '(2023)'),
    name = replace(name, '(2024)', '(2023)')
  WHERE (model ILIKE 'C MacBook||MacBook Pro 14"/16" M3 Pro/Max (2024)%'
     OR name ILIKE 'MacBook Pro 14"/16" M3 Pro/Max (2024)%');

  GET DIAGNOSTICS updated_m3_count = ROW_COUNT;
  RAISE NOTICE 'Corrected % MacBook Pro M3 Pro/Max row(s) to (2023)', updated_m3_count;

  -- 3. Idempotently insert missing Water Damage Cleaning / Assessment for M3 Pro/Max
  INSERT INTO public.inventory (name, model, device_model, category, price, iconName, status)
  SELECT
    'MacBook Pro 14"/16" M3 Pro/Max (2023) Water Damage Cleaning / Assessment',
    'C MacBook||MacBook Pro 14"/16" M3 Pro/Max (2023)',
    'A2992, A2991',
    'Water Damage Cleaning / Assessment',
    0,
    'Wrench',
    'In Stock'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory
    WHERE name = 'MacBook Pro 14"/16" M3 Pro/Max (2023) Water Damage Cleaning / Assessment'
  );

  -- 4. Idempotently insert standard repair entries for missing officially verified models (5 services each)
  -- Prices are 0 (Quote on Request)

  -- MacBook Pro 14" M4 (2024) [A3112]
  INSERT INTO public.inventory (name, model, device_model, category, price, iconName, status)
  SELECT name, model, 'A3112', category, 0, iconName, 'In Stock'
  FROM (VALUES
    ('MacBook Pro 14" M4 (2024) Screen Replacement', 'C MacBook||MacBook Pro 14" M4 (2024)', 'Screen Replacement', 'Smartphone'),
    ('MacBook Pro 14" M4 (2024) Battery Replacement', 'C MacBook||MacBook Pro 14" M4 (2024)', 'Battery Replacement', 'Battery'),
    ('MacBook Pro 14" M4 (2024) Charging Port Replacement', 'C MacBook||MacBook Pro 14" M4 (2024)', 'Charging Port Replacement', 'Zap'),
    ('MacBook Pro 14" M4 (2024) Water Damage Cleaning / Assessment', 'C MacBook||MacBook Pro 14" M4 (2024)', 'Water Damage Cleaning / Assessment', 'Wrench'),
    ('MacBook Pro 14" M4 (2024) Motherboard & Logic Board Repair', 'C MacBook||MacBook Pro 14" M4 (2024)', 'Logic Board Repair', 'Cpu')
  ) AS v(name, model, category, iconName)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE inventory.name = v.name
  );

  -- MacBook Pro 14"/16" M4 Pro/Max (2024) [A3185, A3186]
  INSERT INTO public.inventory (name, model, device_model, category, price, iconName, status)
  SELECT name, model, 'A3185, A3186', category, 0, iconName, 'In Stock'
  FROM (VALUES
    ('MacBook Pro 14"/16" M4 Pro/Max (2024) Screen Replacement', 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', 'Screen Replacement', 'Smartphone'),
    ('MacBook Pro 14"/16" M4 Pro/Max (2024) Battery Replacement', 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', 'Battery Replacement', 'Battery'),
    ('MacBook Pro 14"/16" M4 Pro/Max (2024) Charging Port Replacement', 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', 'Charging Port Replacement', 'Zap'),
    ('MacBook Pro 14"/16" M4 Pro/Max (2024) Water Damage Cleaning / Assessment', 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', 'Water Damage Cleaning / Assessment', 'Wrench'),
    ('MacBook Pro 14"/16" M4 Pro/Max (2024) Motherboard & Logic Board Repair', 'C MacBook||MacBook Pro 14"/16" M4 Pro/Max (2024)', 'Logic Board Repair', 'Cpu')
  ) AS v(name, model, category, iconName)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE inventory.name = v.name
  );

  -- MacBook Pro 14" M5 (2025) [Mac17,2]
  INSERT INTO public.inventory (name, model, device_model, category, price, iconName, status)
  SELECT name, model, 'Mac17,2', category, 0, iconName, 'In Stock'
  FROM (VALUES
    ('MacBook Pro 14" M5 (2025) Screen Replacement', 'C MacBook||MacBook Pro 14" M5 (2025)', 'Screen Replacement', 'Smartphone'),
    ('MacBook Pro 14" M5 (2025) Battery Replacement', 'C MacBook||MacBook Pro 14" M5 (2025)', 'Battery Replacement', 'Battery'),
    ('MacBook Pro 14" M5 (2025) Charging Port Replacement', 'C MacBook||MacBook Pro 14" M5 (2025)', 'Charging Port Replacement', 'Zap'),
    ('MacBook Pro 14" M5 (2025) Water Damage Cleaning / Assessment', 'C MacBook||MacBook Pro 14" M5 (2025)', 'Water Damage Cleaning / Assessment', 'Wrench'),
    ('MacBook Pro 14" M5 (2025) Motherboard & Logic Board Repair', 'C MacBook||MacBook Pro 14" M5 (2025)', 'Logic Board Repair', 'Cpu')
  ) AS v(name, model, category, iconName)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE inventory.name = v.name
  );

  -- MacBook Pro 14"/16" M5 Pro/Max (2026) [Mac17,6, Mac17,7, Mac17,8, Mac17,9]
  INSERT INTO public.inventory (name, model, device_model, category, price, iconName, status)
  SELECT name, model, 'Mac17,6, Mac17,7, Mac17,8, Mac17,9', category, 0, iconName, 'In Stock'
  FROM (VALUES
    ('MacBook Pro 14"/16" M5 Pro/Max (2026) Screen Replacement', 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', 'Screen Replacement', 'Smartphone'),
    ('MacBook Pro 14"/16" M5 Pro/Max (2026) Battery Replacement', 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', 'Battery Replacement', 'Battery'),
    ('MacBook Pro 14"/16" M5 Pro/Max (2026) Charging Port Replacement', 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', 'Charging Port Replacement', 'Zap'),
    ('MacBook Pro 14"/16" M5 Pro/Max (2026) Water Damage Cleaning / Assessment', 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', 'Water Damage Cleaning / Assessment', 'Wrench'),
    ('MacBook Pro 14"/16" M5 Pro/Max (2026) Motherboard & Logic Board Repair', 'C MacBook||MacBook Pro 14"/16" M5 Pro/Max (2026)', 'Logic Board Repair', 'Cpu')
  ) AS v(name, model, category, iconName)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.inventory WHERE inventory.name = v.name
  );

  RAISE NOTICE 'MacBook Pro catalogue update script completed successfully.';
END
$$;

COMMIT;
