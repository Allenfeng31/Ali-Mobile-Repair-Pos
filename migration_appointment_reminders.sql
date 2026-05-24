-- Adds persistent reminder tracking for appointment/customer reminder SMS.
-- The app also has a notes-based fallback, but these columns are the clean path.

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_sms_sid TEXT;

CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent_at
ON public.appointments (reminder_sent_at);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
  ) THEN
    EXECUTE 'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ';
    EXECUTE 'ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_sms_sid TEXT';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_bookings_reminder_sent_at ON public.bookings (reminder_sent_at)';
  END IF;
END $$;
