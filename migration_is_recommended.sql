-- Migration: Add is_recommended column to inventory table
-- Purpose: Highlight recommended variants on the storefront
-- Date: 2026-05-01

ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN NOT NULL DEFAULT false;

-- Index for storefront performance
CREATE INDEX IF NOT EXISTS idx_inventory_is_recommended
  ON public.inventory (is_recommended)
  WHERE is_recommended = true;
