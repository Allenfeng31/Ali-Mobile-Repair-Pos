-- ==========================================
-- Supplier Price Monitor Schema
-- The Mapping Architecture
-- ==========================================

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    website TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Catalog
-- Our standardized catalog (e.g. Apple -> iPhone 13 Pro -> Screen -> Soft OLED)
CREATE TABLE IF NOT EXISTS public.master_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    device_model TEXT NOT NULL,
    part_type TEXT NOT NULL,
    quality_tier TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand, device_model, part_type, quality_tier)
);

-- 3. Raw Supplier Items
-- "生肉库": Items exactly as scraped from supplier websites
CREATE TABLE IF NOT EXISTS public.raw_supplier_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    raw_url TEXT NOT NULL,
    raw_title TEXT NOT NULL,
    current_price NUMERIC(10, 2) NOT NULL,
    stock_status TEXT, -- e.g., 'In Stock', 'Out of Stock', 'Low Stock'
    last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supplier_id, raw_url) -- Assuming URL is unique per item per supplier
);

-- 4. Item Mapping
-- Links raw supplier items to our master catalog
CREATE TABLE IF NOT EXISTS public.item_mapping (
    raw_item_id UUID PRIMARY KEY REFERENCES public.raw_supplier_items(id) ON DELETE CASCADE,
    master_catalog_id UUID NOT NULL REFERENCES public.master_catalog(id) ON DELETE CASCADE,
    mapped_at TIMESTAMPTZ DEFAULT NOW(),
    mapped_by UUID -- Reference to auth.users if manually mapped by an admin
);

-- 5. Price History
-- Tracks price changes over time for raw items
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_item_id UUID NOT NULL REFERENCES public.raw_supplier_items(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_raw_supplier_items_supplier_id ON public.raw_supplier_items(supplier_id);
CREATE INDEX idx_item_mapping_master_id ON public.item_mapping(master_catalog_id);
CREATE INDEX idx_price_history_raw_item_id ON public.price_history(raw_item_id);
CREATE INDEX idx_price_history_recorded_at ON public.price_history(recorded_at);

-- RLS Policies can be added here depending on requirements
