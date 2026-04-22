-- ==========================================
-- PHASE 1: SUPABASE DATABASE SCHEMA UPDATE
-- ==========================================

-- 1. Create employee_permissions table
-- This table stores granular access flags linked to Supabase Auth users.
CREATE TABLE IF NOT EXISTS public.employee_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    can_give_discount BOOLEAN DEFAULT FALSE,
    max_discount_limit NUMERIC DEFAULT 0,
    can_change_inventory_price BOOLEAN DEFAULT FALSE,
    can_view_full_sales_report BOOLEAN DEFAULT FALSE,
    can_delete_customers BOOLEAN DEFAULT FALSE,
    can_delete_chats BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Only super admins can read/write all permissions
-- Users can read their own permissions

DROP POLICY IF EXISTS "Users can view their own permissions" ON public.employee_permissions;
CREATE POLICY "Users can view their own permissions" 
ON public.employee_permissions FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.employee_permissions;
CREATE POLICY "Super admins can manage all permissions" 
ON public.employee_permissions FOR ALL 
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

-- 4. Trigger to automatically create permissions for new users
-- This ensures every new account created in Supabase Auth gets an entry here.
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.employee_permissions (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_permissions();

-- 5. INITIAL BOOTSTRAP (IMPORTANT)
-- Replace 'YOUR_USER_ID_HERE' with your real Supabase Auth ID to become the first Super Admin.
-- UPDATE public.employee_permissions SET is_super_admin = TRUE WHERE user_id = 'YOUR_USER_ID_HERE';
