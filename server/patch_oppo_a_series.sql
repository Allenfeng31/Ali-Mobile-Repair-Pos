-- ============================================================================
-- OPPO A-Series Data Patch Script
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- ─── FIX 1: Normalize brand casing ──────────────────────────────────────────
-- The SQL seed used "P OPPO||..." but existing items use "P Oppo||..."
-- This mismatch causes the frontend to treat them as two separate brands.
-- The frontend's .find() only returns the first match, hiding the A-series.

UPDATE inventory
SET model = REPLACE(model, 'P OPPO||', 'P Oppo||')
WHERE model LIKE 'P OPPO||%';


-- ─── FIX 2: Patch in official CPH model codes ──────────────────────────────
-- Updates the device_model column for all 35 OPPO A-Series models.

-- A1k
UPDATE inventory SET device_model = 'CPH1923' WHERE model = 'P Oppo||A1k' AND device_model IS NULL;
-- A3s
UPDATE inventory SET device_model = 'CPH1803' WHERE model = 'P Oppo||A3s' AND device_model IS NULL;
-- A5
UPDATE inventory SET device_model = 'CPH1809' WHERE model = 'P Oppo||A5' AND device_model IS NULL;
-- A5s
UPDATE inventory SET device_model = 'CPH1909' WHERE model = 'P Oppo||A5s' AND device_model IS NULL;
-- A7
UPDATE inventory SET device_model = 'CPH1901' WHERE model = 'P Oppo||A7' AND device_model IS NULL;
-- A9
UPDATE inventory SET device_model = 'CPH1837' WHERE model = 'P Oppo||A9' AND device_model IS NULL;
-- A5 (2020)
UPDATE inventory SET device_model = 'CPH1931' WHERE model = 'P Oppo||A5 (2020)' AND device_model IS NULL;
-- A9 (2020)
UPDATE inventory SET device_model = 'CPH1941' WHERE model = 'P Oppo||A9 (2020)' AND device_model IS NULL;
-- A11
UPDATE inventory SET device_model = 'CPH2083' WHERE model = 'P Oppo||A11' AND device_model IS NULL;
-- A12
UPDATE inventory SET device_model = 'CPH2077' WHERE model = 'P Oppo||A12' AND device_model IS NULL;
-- A15
UPDATE inventory SET device_model = 'CPH2185' WHERE model = 'P Oppo||A15' AND device_model IS NULL;
-- A16
UPDATE inventory SET device_model = 'CPH2269' WHERE model = 'P Oppo||A16' AND device_model IS NULL;
-- A16s
UPDATE inventory SET device_model = 'CPH2271' WHERE model = 'P Oppo||A16s' AND device_model IS NULL;
-- A31
UPDATE inventory SET device_model = 'CPH2015' WHERE model = 'P Oppo||A31' AND device_model IS NULL;
-- A32
UPDATE inventory SET device_model = 'PDVM00' WHERE model = 'P Oppo||A32' AND device_model IS NULL;
-- A33
UPDATE inventory SET device_model = 'CPH2137' WHERE model = 'P Oppo||A33' AND device_model IS NULL;
-- A37
UPDATE inventory SET device_model = 'CPH1605' WHERE model = 'P Oppo||A37' AND device_model IS NULL;
-- A39
UPDATE inventory SET device_model = 'CPH1605' WHERE model = 'P Oppo||A39' AND device_model IS NULL;
-- A52
UPDATE inventory SET device_model = 'CPH2061' WHERE model = 'P Oppo||A52' AND device_model IS NULL;
-- A53
UPDATE inventory SET device_model = 'CPH2127' WHERE model = 'P Oppo||A53' AND device_model IS NULL;
-- A53s
UPDATE inventory SET device_model = 'CPH2321' WHERE model = 'P Oppo||A53s' AND device_model IS NULL;
-- A54
UPDATE inventory SET device_model = 'CPH2239' WHERE model = 'P Oppo||A54' AND device_model IS NULL;
-- A54 5G
UPDATE inventory SET device_model = 'CPH2195' WHERE model = 'P Oppo||A54 5G' AND device_model IS NULL;
-- A72
UPDATE inventory SET device_model = 'CPH2067' WHERE model = 'P Oppo||A72' AND device_model IS NULL;
-- A73
UPDATE inventory SET device_model = 'CPH2099' WHERE model = 'P Oppo||A73' AND device_model IS NULL;
-- A74
UPDATE inventory SET device_model = 'CPH2219' WHERE model = 'P Oppo||A74' AND device_model IS NULL;
-- A74 5G
UPDATE inventory SET device_model = 'CPH2197' WHERE model = 'P Oppo||A74 5G' AND device_model IS NULL;
-- A76
UPDATE inventory SET device_model = 'CPH2375' WHERE model = 'P Oppo||A76' AND device_model IS NULL;
-- A77
UPDATE inventory SET device_model = 'CPH2385' WHERE model = 'P Oppo||A77' AND device_model IS NULL;
-- A77 5G
UPDATE inventory SET device_model = 'CPH2339' WHERE model = 'P Oppo||A77 5G' AND device_model IS NULL;
-- A78 5G
UPDATE inventory SET device_model = 'CPH2483' WHERE model = 'P Oppo||A78 5G' AND device_model IS NULL;
-- A79
UPDATE inventory SET device_model = 'CPH2553' WHERE model = 'P Oppo||A79' AND device_model IS NULL;
-- A94
UPDATE inventory SET device_model = 'CPH2203' WHERE model = 'P Oppo||A94' AND device_model IS NULL;
-- A96
UPDATE inventory SET device_model = 'CPH2333' WHERE model = 'P Oppo||A96' AND device_model IS NULL;
-- A98
UPDATE inventory SET device_model = 'CPH2529' WHERE model = 'P Oppo||A98' AND device_model IS NULL;


-- ─── VERIFY ─────────────────────────────────────────────────────────────────
-- Run this after to confirm the fix:
SELECT model, device_model, COUNT(*) as item_count
FROM inventory
WHERE model LIKE 'P Oppo||A%'
GROUP BY model, device_model
ORDER BY model;
