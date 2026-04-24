-- ============================================================
-- FIX: STOREFRONT BLOGS RLS POLICIES
-- ============================================================

-- 1. Ensure Table Policies are robust for anon
-- (Allowing anon all for this specific CMS bypass, as requested)
DROP POLICY IF EXISTS "Allow public read on blogs" ON public.storefront_blogs;
DROP POLICY IF EXISTS "Allow anon all access on blogs" ON public.storefront_blogs;

-- Public can read published posts
CREATE POLICY "Allow public read on blogs"
ON public.storefront_blogs
FOR SELECT
TO public
USING (is_published = true);

-- Anon (the key used by the POS app) can do everything
CREATE POLICY "Allow anon all access on blogs"
ON public.storefront_blogs
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Also allow authenticated users just in case the session is active
CREATE POLICY "Allow authenticated all access on blogs"
ON public.storefront_blogs
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ============================================================
-- FIX: STORAGE RLS POLICIES (for blog-images bucket)
-- ============================================================

-- First, ensure the bucket exists (this part usually done via UI, 
-- but here consists of policies on storage.objects)

-- 2. Allow anon to INSERT (upload) to the 'blog-images' bucket
DROP POLICY IF EXISTS "Allow anon to upload blog images" ON storage.objects;
CREATE POLICY "Allow anon to upload blog images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'blog-images');

-- 3. Allow anon to SELECT (to see their own uploads/previews)
DROP POLICY IF EXISTS "Allow anon to select blog images" ON storage.objects;
CREATE POLICY "Allow anon to select blog images"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'blog-images');

-- 4. Allow public to SELECT (so the storefront can show the images)
DROP POLICY IF EXISTS "Allow public to select blog images" ON storage.objects;
CREATE POLICY "Allow public to select blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- 5. Allow anon to UPDATE (in case TipTap tries to update metadata)
DROP POLICY IF EXISTS "Allow anon to update blog images" ON storage.objects;
CREATE POLICY "Allow anon to update blog images"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'blog-images');

-- 6. Allow anon to DELETE (if user removes image from editor)
DROP POLICY IF EXISTS "Allow anon to delete blog images" ON storage.objects;
CREATE POLICY "Allow anon to delete blog images"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'blog-images');
