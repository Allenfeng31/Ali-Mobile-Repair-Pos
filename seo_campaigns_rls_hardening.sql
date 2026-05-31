-- ============================================================
-- P0 SEO CAMPAIGNS RLS HARDENING (REVIEW ONLY - DO NOT AUTO-RUN)
-- ============================================================
-- Purpose:
-- 1) Prevent direct anon/authenticated reads of pending SEO campaigns and keyword strategy data.
-- 2) Keep access limited to trusted server-side/service-role paths.
--
-- Apply manually in Supabase SQL Editor after review.

BEGIN;

-- 1) Ensure RLS is enforced on sensitive SEO tables.
ALTER TABLE IF EXISTS public.pending_seo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_seo_campaigns FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.seo_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seo_keywords FORCE ROW LEVEL SECURITY;

-- 2) Remove broad table grants from client-facing roles.
REVOKE ALL ON TABLE public.pending_seo_campaigns FROM anon;
REVOKE ALL ON TABLE public.pending_seo_campaigns FROM authenticated;

REVOKE ALL ON TABLE public.seo_keywords FROM anon;
REVOKE ALL ON TABLE public.seo_keywords FROM authenticated;

-- 3) Drop existing policies to avoid accidental public/client access.
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pending_seo_campaigns'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.pending_seo_campaigns', p.policyname);
  END LOOP;
END $$;

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'seo_keywords'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.seo_keywords', p.policyname);
  END LOOP;
END $$;

-- NOTE:
-- No anon/authenticated RLS policies are created here on purpose.
-- This enforces deny-by-default for client roles.
-- Service-role/server jobs remain available via trusted backend credentials.

COMMIT;
