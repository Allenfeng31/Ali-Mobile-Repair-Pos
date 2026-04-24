-- ============================================================
-- STOREFRONT ANNOUNCEMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.storefront_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storefront_announcements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read on announcements" ON public.storefront_announcements;
DROP POLICY IF EXISTS "Allow authenticated all access on announcements" ON public.storefront_announcements;

-- Allow public read access for active messages
CREATE POLICY "Allow public read on announcements"
ON public.storefront_announcements
FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users (admins) full access
-- Note: In this project, we're using the anon key with RLS policies that allow access.
-- Following the existing pattern in supabase_rls_migration.sql
CREATE POLICY "Allow anon all access on announcements"
ON public.storefront_announcements
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Enable realtime (optional but good for CMS)
ALTER PUBLICATION supabase_realtime ADD TABLE public.storefront_announcements;
