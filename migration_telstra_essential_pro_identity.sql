-- Correct the seven approved Telstra Essential Pro repair rows after owner review.
-- Official identity: Telstra Essential Pro = ZTE A5 2019T.
-- This file is intentionally committed but MUST NOT be executed without separate
-- production approval. It changes only inventory.device_model; names, prices,
-- categories, SKUs, commercial model identity and URLs are not changed.

BEGIN;

DO $$
DECLARE
  matched_count integer;
  unexpected_count integer;
  updated_count integer;
BEGIN
  WITH expected(id, name, category) AS (
    VALUES
      (1537, 'Essential Pro Screen Replacement', 'Screen Replacement'),
      (1538, 'Essential Pro Battery Replacement', 'Battery Replacement'),
      (1539, 'Essential Pro Logic Board Repair', 'Logic Board Repair'),
      (1540, 'Essential Pro Charging Port Replacement', 'Charging Port Replacement'),
      (1541, 'Essential Pro Back Housing Replacement', 'Back Housing Replacement'),
      (1542, 'Essential Pro Front Camera Replacement', 'Front Camera Replacement'),
      (1543, 'Essential Pro Back Camera Replacement', 'Back Camera Replacement')
  )
  SELECT count(*)
  INTO matched_count
  FROM public.inventory AS inventory
  INNER JOIN expected
    ON expected.id = inventory.id
   AND expected.name = inventory.name
   AND expected.category = inventory.category
  WHERE inventory.model = 'P Telstra||Essential Pro'
    AND inventory.device_model IN ('ZTE Blade A5 2020', 'ZTE A5 2019T');

  IF matched_count <> 7 THEN
    RAISE EXCEPTION
      'Essential Pro identity migration aborted: expected 7 exact old/already-correct rows, found %',
      matched_count;
  END IF;

  SELECT count(*)
  INTO unexpected_count
  FROM public.inventory
  WHERE model = 'P Telstra||Essential Pro'
    AND (
      id NOT IN (1537, 1538, 1539, 1540, 1541, 1542, 1543)
      OR device_model NOT IN ('ZTE Blade A5 2020', 'ZTE A5 2019T')
      OR device_model IS NULL
    );

  IF unexpected_count <> 0 THEN
    RAISE EXCEPTION
      'Essential Pro identity migration aborted: found % unexpected Essential Pro row(s)',
      unexpected_count;
  END IF;

  UPDATE public.inventory
  SET device_model = 'ZTE A5 2019T'
  WHERE id IN (1537, 1538, 1539, 1540, 1541, 1542, 1543)
    AND model = 'P Telstra||Essential Pro'
    AND device_model = 'ZTE Blade A5 2020';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Essential Pro identity migration updated % row(s)', updated_count;
END
$$;

COMMIT;
