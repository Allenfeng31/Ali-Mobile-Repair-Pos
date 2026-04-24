-- ═══════════════════════════════════════════════════════════
-- Storefront Upsells & Accessories Table
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.storefront_upsells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  bundle_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS to allow full anon CRUD (matches storefront_announcements pattern)
ALTER TABLE public.storefront_upsells DISABLE ROW LEVEL SECURITY;
