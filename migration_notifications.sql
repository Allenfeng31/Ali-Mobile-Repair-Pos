-- ══════════════════════════════════════════════════════════════════════
-- Migration: Serverless-safe notification infrastructure
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ══════════════════════════════════════════════════════════════════════

-- 1. Add DB-backed SMS debounce timestamp to chat_sessions
-- This replaces the in-memory Map that fails across Vercel cold starts.
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS last_sms_sent_at TIMESTAMPTZ;

-- 2. Create push_subscriptions table for persistent Web Push storage
-- Subscriptions must survive serverless cold starts — in-memory arrays won't.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique on endpoint for upsert deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
  ON push_subscriptions(endpoint);

-- RLS: Allow service_role full access (server-only table)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to make this migration idempotent
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role full access" ON push_subscriptions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Service role full access" 
  ON push_subscriptions FOR ALL 
  USING (true);

-- ══════════════════════════════════════════════════════════════════════
-- Done! Verify with:
--   SELECT column_name FROM information_schema.columns 
--   WHERE table_name = 'chat_sessions' AND column_name = 'last_sms_sent_at';
--
--   SELECT * FROM push_subscriptions LIMIT 1;
-- ══════════════════════════════════════════════════════════════════════
