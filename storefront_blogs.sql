-- ============================================================
-- STOREFRONT BLOGS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.storefront_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,              -- HTML from TipTap editor
  description TEXT,          -- Meta description / excerpt
  cover_image TEXT,          -- URL to cover image
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storefront_blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on blogs" ON public.storefront_blogs;
DROP POLICY IF EXISTS "Allow anon all access on blogs" ON public.storefront_blogs;

-- Allow public read access for published posts only
CREATE POLICY "Allow public read on blogs"
ON public.storefront_blogs
FOR SELECT
TO public
USING (is_published = true);

-- Allow anon full access (admin uses anon key with RLS, matching existing pattern)
CREATE POLICY "Allow anon all access on blogs"
ON public.storefront_blogs
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Enable realtime (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.storefront_blogs;
