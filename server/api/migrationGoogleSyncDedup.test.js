/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(path.resolve(__dirname, '../../migration_google_sync_dedup.sql'), 'utf8');

function position(fragment) {
  const value = migration.indexOf(fragment);
  expect(value).toBeGreaterThanOrEqual(0);
  return value;
}

describe('Google Contacts dedup migration structure', () => {
  it('discards every pre-cutover queue or history row before normalizing the new queue', () => {
    const discard = position('DELETE FROM public.failed_sync_logs;');
    const addColumns = position('ADD COLUMN IF NOT EXISTS sync_operation text,');
    expect(migration.slice(addColumns, addColumns + 160)).toContain('ADD COLUMN IF NOT EXISTS locked_at timestamptz');
    expect(discard).toBeLessThan(addColumns);
    expect(migration).not.toContain("SET sync_operation = 'create'");
    expect(migration).not.toContain('ranked_actionable_tasks');

    const markerCheck = position("SELECT 1 FROM public._migration_history");
    expect(discard).toBeGreaterThan(markerCheck);
  });

  it('enforces the post-cutover operation contract without a legacy backfill', () => {
    const notNull = position('ALTER COLUMN sync_operation SET DEFAULT \'create\',');
    expect(migration.slice(notNull, notNull + 120)).toContain('ALTER COLUMN sync_operation SET NOT NULL');
    expect(migration).toContain("CHECK (sync_operation IN ('create', 'update'))");
  });

  it('creates operation-specific actionable-task uniqueness for new work and verification-required CREATEs', () => {
    const actionableScope = position("WHERE status IN ('pending', 'processing')");
    expect(migration.slice(actionableScope, actionableScope + 180)).toContain("status = 'failed' AND attempts < 5");
    const index = position('CREATE UNIQUE INDEX IF NOT EXISTS idx_failed_sync_logs_actionable_customer_operation');
    expect(migration.slice(index, index + 280)).toContain('(customer_id, sync_operation)');
    expect(migration.slice(index, index + 360)).toContain("status = 'failed' AND attempts < 5");
    expect(migration.slice(index, index + 420)).toContain("status = 'verification_required'");
    expect(migration).toContain("CHECK (status IN ('pending', 'processing', 'failed', 'verification_required', 'synced'))");
  });

  it('leaves the first post-cutover monitor empty until a later application event inserts work', () => {
    const discard = position('DELETE FROM public.failed_sync_logs;');
    const commit = position('COMMIT;');
    expect(migration.slice(discard, commit)).not.toMatch(/\bINSERT\s+INTO\s+public\.failed_sync_logs\b/i);
  });

  it('is transactional, rerunnable where practical, and documents complete rollback', () => {
    const begin = position('BEGIN;');
    const commit = position('COMMIT;');
    expect(begin).toBeLessThan(position('DELETE FROM public.failed_sync_logs;'));
    expect(begin).toBeLessThan(commit);
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public._migration_history');
    expect(migration).toContain('DROP COLUMN IF EXISTS locked_at');
    expect(migration).toContain('DROP COLUMN IF EXISTS sync_operation');
    expect(migration).toContain('DROP CONSTRAINT IF EXISTS failed_sync_logs_operation_check');
    expect(migration).toContain('DROP CONSTRAINT IF EXISTS failed_sync_logs_status_check');
    expect(migration).toContain('DROP INDEX IF EXISTS public.idx_failed_sync_logs_actionable_customer_operation');
  });

  it('does not modify customer, order, or repair data', () => {
    expect(migration).not.toMatch(/\b(?:ALTER|UPDATE|DELETE|INSERT)\s+(?:TABLE\s+)?public\.(?:customers|orders|repairs)\b/i);
  });
});
