/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';

const { resolveServerSupabaseKey } = require('./supabaseKeyResolver.js');

describe('resolveServerSupabaseKey', () => {
  it('prefers the current server secret key', () => {
    expect(resolveServerSupabaseKey({ SUPABASE_SECRET_KEY: 'preferred-test-value', SUPABASE_SERVICE_ROLE_KEY: 'legacy-test-value' })).toBe('preferred-test-value');
  });

  it('temporarily accepts the legacy server-only key', () => {
    expect(resolveServerSupabaseKey({ SUPABASE_SERVICE_ROLE_KEY: 'legacy-test-value' })).toBe('legacy-test-value');
  });

  it('fails closed without including fake values in the error', () => {
    expect(() => resolveServerSupabaseKey({})).toThrow('Server database credentials are not configured.');
    expect(() => resolveServerSupabaseKey({})).not.toThrow(/test-value/);
  });
});
