-- Migration: Create quality_tiers table for dynamic dictionary
-- Date: 2026-05-01

CREATE TABLE IF NOT EXISTS public.quality_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with the 4 default tiers
INSERT INTO public.quality_tiers (name, description) VALUES
('Budget', 'High-quality aftermarket part. Best for quick, cost-effective fixes.'),
('Standard', 'Industry-standard replacement part with reliable performance.'),
('Premium', 'Top-tier aftermarket part matching original color and touch sensitivity perfectly.'),
('Genuine', '100% Genuine OEM Display. Uncompromised original factory quality, color accuracy, and performance.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Security hardening
ALTER TABLE public.quality_tiers ENABLE ROW LEVEL SECURITY;

-- Allow public/authenticated to read
CREATE POLICY "Allow public read access to quality_tiers" 
ON public.quality_tiers FOR SELECT 
TO public
USING (true);
