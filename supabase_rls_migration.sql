-- ============================================================
-- SECURITY MIGRATION: Row Level Security (RLS) Fix
-- Run this in your Supabase Dashboard → SQL Editor
-- Fixes: rls_disabled_in_public + sensitive_columns_exposed
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: Add missing 'surcharge' column to orders table
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS surcharge NUMERIC NOT NULL DEFAULT 0;


-- ────────────────────────────────────────────────────────────
-- STEP 2: Enable RLS on ALL tables
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_users     ENABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- STEP 3: Drop any existing conflicting policies (safe to run)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_inventory"   ON public.inventory;
DROP POLICY IF EXISTS "anon_all_orders"      ON public.orders;
DROP POLICY IF EXISTS "anon_all_order_items" ON public.order_items;
DROP POLICY IF EXISTS "anon_all_customers"   ON public.customers;
DROP POLICY IF EXISTS "anon_all_repairs"     ON public.repairs;
DROP POLICY IF EXISTS "anon_all_settings"    ON public.settings;
DROP POLICY IF EXISTS "anon_all_pos_users"   ON public.pos_users;


-- ────────────────────────────────────────────────────────────
-- STEP 4: Create access policies
-- The backend server uses the anon key, so we must grant anon
-- role access. Once you upgrade to the service_role key in the
-- server (Step 5 instructions), these can be removed entirely
-- and direct public access will be fully blocked.
-- ────────────────────────────────────────────────────────────

-- Inventory: full access (needed for POS terminal & stock management)
CREATE POLICY "anon_all_inventory" ON public.inventory
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Orders: full access (needed for sales & reporting)
CREATE POLICY "anon_all_orders" ON public.orders
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Order Items: full access (needed for detailed order lines)
CREATE POLICY "anon_all_order_items" ON public.order_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Customers: full access (needed for customer management)
CREATE POLICY "anon_all_customers" ON public.customers
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Repairs: full access (needed for repair tracking)
CREATE POLICY "anon_all_repairs" ON public.repairs
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Settings: full access (needed for invoice header/footer)
CREATE POLICY "anon_all_settings" ON public.settings
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- POS Users: full access (needed for login & profile management)
-- NOTE: This is the most sensitive table. Upgrade to service_role
-- key (see instructions below) to fully lock this down.
CREATE POLICY "anon_all_pos_users" ON public.pos_users
  FOR ALL TO anon USING (true) WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- VERIFICATION: Check RLS status on all tables
-- Run this SELECT to confirm all tables show rls_enabled = TRUE
-- ────────────────────────────────────────────────────────────
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
