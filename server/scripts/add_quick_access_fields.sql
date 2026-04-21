-- Migration to add Quick Access fields to inventory table
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS pin_order INTEGER DEFAULT 0;

-- Optional: Create an index for faster lookups on pinned items
CREATE INDEX IF NOT EXISTS idx_inventory_is_pinned ON public.inventory(is_pinned) WHERE is_pinned = true;
