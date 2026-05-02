-- ══════════════════════════════════════════════════════════════════════
-- Migration: Add Independent SMS Toggle Setting
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ══════════════════════════════════════════════════════════════════════

-- Insert the default value for sms_alerts_enabled if it doesn't exist.
-- Defaults to 'true' to preserve existing functionality.
INSERT INTO settings (key, value)
VALUES ('sms_alerts_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
-- Done! Verify with:
--   SELECT * FROM settings WHERE key = 'sms_alerts_enabled';
-- ══════════════════════════════════════════════════════════════════════
