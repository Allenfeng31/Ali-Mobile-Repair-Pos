/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(path.resolve(__dirname, '../../migration_google_sync_dispatch_barrier.sql'), 'utf8');

describe('Google Sync dispatch-barrier migration structure', () => {
  it('is additive, transactional, and never repeats historical cleanup', () => {
    expect(migration).toContain('BEGIN;');
    expect(migration).toContain('ADD COLUMN IF NOT EXISTS create_dispatch_started_at timestamptz');
    expect(migration).toContain('CREATE INDEX IF NOT EXISTS idx_failed_sync_logs_verification_lock');
    expect(migration).toContain('COMMIT;');
    expect(migration).not.toMatch(/\bDELETE\b|\bTRUNCATE\b|\bUPDATE\b/i);
  });
});
