-- Migration: Add quality_grade column to inventory table
-- Purpose: Support tiered variant pricing (Budget / Standard / Premium / Genuine)
-- Backward-compatible: Defaults all existing rows to 'Standard'
-- Date: 2026-04-30

-- 1. Add the column with a default so existing rows get 'Standard' automatically
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS quality_grade TEXT NOT NULL DEFAULT 'Standard';

-- 2. Add a CHECK constraint to enforce valid tier names
ALTER TABLE public.inventory
  ADD CONSTRAINT chk_quality_grade
  CHECK (quality_grade IN ('Budget', 'Standard', 'Premium', 'Genuine'));

-- 3. Create an index for fast lookups when grouping by model + grade
CREATE INDEX IF NOT EXISTS idx_inventory_quality_grade
  ON public.inventory (quality_grade);

-- Verification query (run manually after migration):
-- SELECT quality_grade, COUNT(*) FROM public.inventory GROUP BY quality_grade;
