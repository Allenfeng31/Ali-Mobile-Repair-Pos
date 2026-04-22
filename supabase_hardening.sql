-- ============================================================
-- SECURITY UPDATE: ENABLE RLS AND CLEANUP DEPRECATED DATA
-- ============================================================
-- Scope: 1. Drop sensitive deprecated table 'pos_users'
--        2. Enable RLS on ALL public tables
--        3. Create baseline "Authenticated Only" policies
-- Execution: Run this in the Supabase Dashboard SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Delete Deprecated Sensitive Data
-- ────────────────────────────────────────────────────────────
-- Use CASCADE to ensure any dependent views/constraints are also handled
DROP TABLE IF EXISTS public.pos_users CASCADE;


-- ────────────────────────────────────────────────────────────
-- STEP 2: Enable RLS Globally on ALL Active Tables
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages       ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- STEP 3: Clear Existing Public/Anon Policies
-- ────────────────────────────────────────────────────────────
-- This ensures no legacy "allow all" policies remain active.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND roles @> ARRAY['anon'::name]
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;


-- ────────────────────────────────────────────────────────────
-- STEP 4: Establish Baseline Policies (Authenticated Only)
-- ────────────────────────────────────────────────────────────

-- 4.1. Core Business Tables: Full access for Authenticated users (Employees)
-- Tables: inventory, customers, orders, order_items, repairs, settings, appointments
DO $$ 
DECLARE 
    t TEXT;
    target_tables TEXT[] := ARRAY['inventory', 'customers', 'orders', 'order_items', 'repairs', 'settings', 'appointments'];
BEGIN
    FOREACH t IN ARRAY target_tables LOOP
        EXECUTE format('
            CREATE POLICY "authenticated_full_access" 
            ON public.%I 
            FOR ALL 
            TO authenticated 
            USING (true) 
            WITH CHECK (true)', t);
    END LOOP;
END $$;

-- 4.2. Chat Tables: Full access for Authenticated users
-- (Note: Customer chat session logic is proxied via the server using service_role)
CREATE POLICY "authenticated_chat_access" ON public.chat_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_message_access" ON public.chat_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4.3. Employee Permissions: Preserve RBAC logic
-- (These policies are already secure as they link to auth.uid())
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.employee_permissions;
CREATE POLICY "Users can view their own permissions" 
ON public.employee_permissions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.employee_permissions;
CREATE POLICY "Super admins can manage all permissions" 
ON public.employee_permissions FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.employee_permissions 
        WHERE user_id = auth.uid() AND is_super_admin = TRUE
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.employee_permissions 
        WHERE user_id = auth.uid() AND is_super_admin = TRUE
    )
);


-- ────────────────────────────────────────────────────────────
-- VERIFICATION: Check RLS status and Policy count
-- ────────────────────────────────────────────────────────────
SELECT 
    p.tablename,
    t.rowsecurity AS rls_enabled,
    count(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
GROUP BY p.tablename, t.rowsecurity
ORDER BY p.tablename;
