-- Adds durable, additive authority for online repair bookings.
-- Historical appointments retain NULLs in these fields and continue to use datetime.

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS booking_date DATE,
ADD COLUMN IF NOT EXISTS booking_time TIME WITHOUT TIME ZONE,
ADD COLUMN IF NOT EXISTS booking_total NUMERIC,
ADD COLUMN IF NOT EXISTS has_custom_quote BOOLEAN,
ADD COLUMN IF NOT EXISTS booking_items JSONB;
