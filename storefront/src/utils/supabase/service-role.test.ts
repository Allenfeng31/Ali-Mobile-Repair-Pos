import { afterEach, describe, expect, it, vi } from 'vitest';
import { createServiceRoleClient, resolveServerSupabaseKey } from './service-role';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('server Supabase key resolution', () => {
  it('prefers SUPABASE_SECRET_KEY over the legacy service-role key', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_dummy_preferred');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'legacy-dummy');
    expect(resolveServerSupabaseKey()).toBe('sb_secret_dummy_preferred');
  });

  it('retains the legacy service-role fallback', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'legacy-dummy');
    expect(resolveServerSupabaseKey()).toBe('legacy-dummy');
  });

  it('accepts an sb_secret-shaped value opaquely', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_dummy_not_a_jwt');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect(resolveServerSupabaseKey()).toBe('sb_secret_dummy_not_a_jwt');
  });

  it('preserves safe failure when neither key exists', () => {
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
    expect(() => createServiceRoleClient()).toThrow('Missing server-only Supabase service role configuration.');
  });
});
