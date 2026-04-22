-- Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL, -- 'click', 'conversion', 'page_view'
    event_name TEXT NOT NULL, -- 'model_click', 'call_now', 'get_quote', 'navigate'
    model_name TEXT,          -- iPhone 15 Pro, etc.
    url TEXT,                 -- Page where event happened
    session_id TEXT,          -- To track unique sessions
    metadata JSONB DEFAULT '{}'::jsonb, -- Extra data
    user_agent TEXT,
    city TEXT,
    region TEXT,
    country TEXT
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting events (Public/Anon access)
-- Note: We want storefront users to be able to log events without being logged in
CREATE POLICY "Allow anonymous inserts for analytics" ON public.analytics_events
    FOR INSERT 
    WITH CHECK (true);

-- Create policy for viewing events (Super Admin only)
-- Assuming we have a service_role or super_admin check
CREATE POLICY "Allow super admins to view analytics" ON public.analytics_events
    FOR SELECT
    USING (
        auth.jwt() ->> 'email' IN (SELECT email FROM public.employees WHERE is_super_admin = true)
        OR auth.role() = 'service_role'
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
