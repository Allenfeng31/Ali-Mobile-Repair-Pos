-- Migration: Add missing columns for mixed payments and order status
-- Run this in Supabase SQL Editor

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mixedCash NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS mixedEftpos NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS surcharge NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Verify columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';
