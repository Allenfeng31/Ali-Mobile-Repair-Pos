-- Additive follow-up to the Google Sync cutover migration.
-- It never deletes or reclassifies existing post-cutover queue rows.
BEGIN;

ALTER TABLE public.failed_sync_logs
  ADD COLUMN IF NOT EXISTS create_dispatch_started_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_failed_sync_logs_verification_lock
  ON public.failed_sync_logs (locked_at)
  WHERE status = 'verification_required';

COMMIT;
