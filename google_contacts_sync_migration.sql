-- Add synced_to_google tracking column to the customers table
ALTER TABLE public.customers
ADD COLUMN synced_to_google BOOLEAN DEFAULT FALSE;

-- Insert the default setting for Google Contacts sync
INSERT INTO public.settings (key, value)
VALUES ('google_contacts_sync_enabled', 'false'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = 'false'::jsonb;
