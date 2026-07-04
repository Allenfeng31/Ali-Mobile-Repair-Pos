-- Blog content cleanup for existing Supabase CMS articles.
-- Prepared from the Antigravity Blog audit P0/P1 notes.
--
-- Scope:
-- - Updates only public.storefront_blogs.content article body HTML.
-- - Does not change canonical metadata, social URLs, redirects, sitemap,
--   route availability, or local Markdown content.
-- - Converts Ali Mobile absolute body links to relative links.
-- - Adds one concise parent hub link to selected existing articles when absent.
--
-- Review before running:
-- SELECT slug, title
-- FROM public.storefront_blogs
-- WHERE slug IN (
--   'the-hidden-reality-of-macbook-pro-keyboard-repairs-in-melbourne-why-saving-70-mi',
--   'google-pixel-10-pro-xl-screen-replacement-the-hidden-fingerprint-trap-and-how-we',
--   'how-to-fix-face-id-on-iphone-15-and-newer-models-after-camera-replacement',
--   'why-we-recommend-a-full-back-housing-replacement-for-a-cracked-iphone-14-pro-max'
-- )
-- ORDER BY slug;

BEGIN;

UPDATE public.storefront_blogs
SET
  content = replace(
    replace(
      replace(
        replace(
          content,
          'https://www.alimobile.com.au/repairs/',
          '/repairs/'
        ),
        'https://alimobile.com.au/repairs/',
        '/repairs/'
      ),
      'https://www.alimobile.com.au/book-repair',
      '/book-repair'
    ),
    'https://alimobile.com.au/book-repair',
    '/book-repair'
  ),
  updated_at = now()
WHERE content IS NOT NULL
  AND (
    content LIKE '%https://www.alimobile.com.au/repairs/%'
    OR content LIKE '%https://alimobile.com.au/repairs/%'
    OR content LIKE '%https://www.alimobile.com.au/book-repair%'
    OR content LIKE '%https://alimobile.com.au/book-repair%'
  );

WITH parent_hub_links(slug, required_href, paragraph_html) AS (
  VALUES
    (
      'the-hidden-reality-of-macbook-pro-keyboard-repairs-in-melbourne-why-saving-70-mi',
      '/repairs/laptop/macbook',
      '<p>For broader model guidance, see our <a href="/repairs/laptop/macbook">MacBook repair options</a>.</p>'
    ),
    (
      'google-pixel-10-pro-xl-screen-replacement-the-hidden-fingerprint-trap-and-how-we',
      '/repairs/phone/google-pixel',
      '<p>For more Pixel model guidance, see our <a href="/repairs/phone/google-pixel">Google Pixel repair options</a>.</p>'
    ),
    (
      'how-to-fix-face-id-on-iphone-15-and-newer-models-after-camera-replacement',
      '/repairs/phone/iphone',
      '<p>For broader model guidance, see our <a href="/repairs/phone/iphone">iPhone repair options</a>.</p>'
    ),
    (
      'why-we-recommend-a-full-back-housing-replacement-for-a-cracked-iphone-14-pro-max',
      '/repairs/phone/iphone',
      '<p>For broader model guidance, see our <a href="/repairs/phone/iphone">iPhone repair options</a>.</p>'
    )
)
UPDATE public.storefront_blogs AS blog
SET
  content = btrim(coalesce(blog.content, '')) || E'\n\n' || parent_hub_links.paragraph_html,
  updated_at = now()
FROM parent_hub_links
WHERE blog.slug = parent_hub_links.slug
  AND blog.is_published = true
  AND blog.content IS NOT NULL
  AND blog.content NOT ILIKE '%' || parent_hub_links.required_href || '%';

COMMIT;
