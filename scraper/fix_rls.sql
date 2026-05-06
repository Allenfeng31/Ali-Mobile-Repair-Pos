-- Grant basic table access to anon and authenticated roles
GRANT SELECT ON public.master_catalog TO anon, authenticated;
GRANT SELECT ON public.raw_supplier_items TO anon, authenticated;
GRANT SELECT ON public.item_mapping TO anon, authenticated;
GRANT SELECT ON public.suppliers TO anon, authenticated;
GRANT SELECT ON public.price_history TO anon, authenticated;

-- Disable RLS temporarily to guarantee they can be read (or you can add a public read policy)
ALTER TABLE public.master_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_supplier_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history DISABLE ROW LEVEL SECURITY;
