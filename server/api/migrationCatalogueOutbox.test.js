/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(path.resolve(__dirname, '../../migration_catalogue_outbox.sql'), 'utf8');

describe('catalogue outbox migration contract', () => {
  it('maps PostgreSQL trigger operations to the public create/update/delete contract', () => {
    expect(migration).toContain("operation text NOT NULL CHECK (operation IN ('create', 'update', 'delete'))");
    expect(migration).toMatch(/CASE\s+TG_OP\s+WHEN 'INSERT' THEN 'create'\s+WHEN 'UPDATE' THEN 'update'\s+WHEN 'DELETE' THEN 'delete'\s+END/is);
    expect(migration).not.toMatch(/VALUES\s*\(\s*lower\(TG_OP\)/i);
  });

  it('is additive, transactional, and records inventory mutations in the same Postgres transaction', () => {
    expect(migration).toContain('BEGIN;');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS public.catalogue_mutation_outbox');
    expect(migration).toContain('AFTER INSERT OR UPDATE OR DELETE ON public.inventory');
    expect(migration).toContain('FOR EACH ROW EXECUTE FUNCTION public.enqueue_catalogue_mutation_outbox()');
    expect(migration).toContain('before_item');
    expect(migration).toContain('after_item');
    expect(migration).toContain('next_attempt_at');
    expect(migration).toContain('locked_at');
    expect(migration).toContain("ILIKE '%accessor%'");
    expect(migration).toContain("TG_OP = 'UPDATE'");
    expect(migration).toContain("'price', previous_row -> 'price'");
    expect(migration).toContain("'hidden', previous_row -> 'hidden'");
    expect(migration).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migration).toContain('REVOKE ALL ON TABLE public.catalogue_mutation_outbox FROM PUBLIC, anon, authenticated');
    expect(migration).toContain('GRANT SELECT, INSERT, UPDATE ON TABLE public.catalogue_mutation_outbox TO service_role');
    expect(migration).toContain('SECURITY INVOKER');
    expect(migration).toContain('COMMIT;');
    expect(migration).not.toMatch(/\bDELETE\s+FROM\b|\bTRUNCATE\b/i);
  });
});
