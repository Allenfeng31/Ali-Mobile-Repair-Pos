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
  endpoint TEXT NOT NULL UNIQUE,   -- UNIQUE already creates an index
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Enable with ZERO policies.
-- The server uses the service_role key which bypasses RLS natively.
-- No anon/authenticated user should ever touch this table directly.
-- This means: RLS ON + no policies = fully locked to service_role only.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════
-- Done! Verify with:
--   SELECT column_name FROM information_schema.columns 
--   WHERE table_name = 'chat_sessions' AND column_name = 'last_sms_sent_at';
--
--   SELECT * FROM push_subscriptions LIMIT 1;
-- ══════════════════════════════════════════════════════════════════════
