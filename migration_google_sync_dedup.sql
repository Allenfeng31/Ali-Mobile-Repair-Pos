-- Google Contacts sync outbox: operation-specific actionable-task uniqueness.
-- Cutover policy: every existing row is legacy/unreliable and is deliberately
-- discarded. Only events created after this migration may appear in the monitor.
-- Run this migration before deploying the accompanying queue code.

BEGIN;

-- Approved cutover discard. DELETE is transactional, does not touch customers
-- or Google Contacts, and avoids converting legacy rows into create work.
-- Safe one-time cutover marker. Ensures DELETE runs exactly once.
-- A simple tracking table provides an atomic, durable, idempotent guard.
CREATE TABLE IF NOT EXISTS public._migration_history (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

-- Secure marker table from anon/authenticated clients.
REVOKE ALL ON public._migration_history FROM public, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public._migration_history
    WHERE id = 'google_sync_dedup_cutover_001'
  ) THEN
    DELETE FROM public.failed_sync_logs;
    INSERT INTO public._migration_history (id) VALUES ('google_sync_dedup_cutover_001');
  END IF;
END $$;

ALTER TABLE public.failed_sync_logs
  ADD COLUMN IF NOT EXISTS sync_operation text,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

ALTER TABLE public.failed_sync_logs
  ALTER COLUMN sync_operation SET DEFAULT 'create',
  ALTER COLUMN sync_operation SET NOT NULL;

ALTER TABLE public.failed_sync_logs DROP CONSTRAINT IF EXISTS failed_sync_logs_operation_check;
ALTER TABLE public.failed_sync_logs
  ADD CONSTRAINT failed_sync_logs_operation_check
  CHECK (sync_operation IN ('create', 'update'));

ALTER TABLE public.failed_sync_logs DROP CONSTRAINT IF EXISTS failed_sync_logs_status_check;
ALTER TABLE public.failed_sync_logs
  ADD CONSTRAINT failed_sync_logs_status_check
  CHECK (status IN ('pending', 'processing', 'failed', 'verification_required', 'synced'));

-- A previous same-customer-only index would reject valid create/update intents.
DROP INDEX IF EXISTS public.idx_failed_sync_logs_active_job;
DROP INDEX IF EXISTS public.idx_failed_sync_logs_active_customer_operation;
DROP INDEX IF EXISTS public.idx_failed_sync_logs_actionable_customer_operation;

CREATE UNIQUE INDEX IF NOT EXISTS idx_failed_sync_logs_actionable_customer_operation
  ON public.failed_sync_logs (customer_id, sync_operation)
  WHERE status IN ('pending', 'processing')
     OR (status = 'failed' AND attempts < 5)
     OR status = 'verification_required';

COMMIT;

-- Read-only post-cutover verification (do not run from the application):
-- SELECT customer_id, sync_operation, count(*)
-- FROM public.failed_sync_logs
-- WHERE status IN ('pending', 'processing')
--    OR (status = 'failed' AND attempts < 5)
--    OR status = 'verification_required'
-- GROUP BY customer_id, sync_operation HAVING count(*) > 1;
-- Rollback:
-- DROP INDEX IF EXISTS public.idx_failed_sync_logs_actionable_customer_operation;
-- ALTER TABLE public.failed_sync_logs DROP CONSTRAINT IF EXISTS failed_sync_logs_operation_check;
-- ALTER TABLE public.failed_sync_logs DROP CONSTRAINT IF EXISTS failed_sync_logs_status_check;
-- ALTER TABLE public.failed_sync_logs DROP COLUMN IF EXISTS locked_at;
-- ALTER TABLE public.failed_sync_logs DROP COLUMN IF EXISTS sync_operation;
