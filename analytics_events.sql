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
    country TEXT,
    device_type TEXT -- 'Mobile', 'Desktop'
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting events (Public/Anon access)
-- Allows storefront users to log events without authentication
CREATE POLICY "Allow anonymous inserts for analytics" ON public.analytics_events
    FOR INSERT 
    WITH CHECK (true);

-- Create policy for viewing events (Super Admin only via employee_permissions table)
CREATE POLICY "Allow super admins to view analytics" ON public.analytics_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employee_permissions 
            WHERE user_id = auth.uid() 
            AND is_super_admin = true
        )
        OR auth.role() = 'service_role'
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
