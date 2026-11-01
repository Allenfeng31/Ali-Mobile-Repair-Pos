import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { bearerGetUser, cookieGetUser, createClient, createServiceRoleClient } = vi.hoisted(() => ({
  bearerGetUser: vi.fn(),
  cookieGetUser: vi.fn(),
  createClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => new Map()) }));
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn(() => ({ auth: { getUser: cookieGetUser } })),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient }));
vi.mock('@/utils/supabase/service-role', () => ({ createServiceRoleClient }));

import { authorizeRepairResultsAdminRequest } from './repairResultsAdminAuth.server';

function mockPermission(isSuperAdmin: boolean | null) {
  const maybeSingle = vi.fn(async () => ({
    data: isSuperAdmin === null ? null : { is_super_admin: isSuperAdmin },
    error: null,
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  createServiceRoleClient.mockReturnValue({ from: vi.fn(() => ({ select })) });
}

describe('Repair Results admin authorization', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key');
    createClient.mockReturnValue({ auth: { getUser: bearerGetUser } });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns 401 when a bearer token does not resolve to an authenticated user', async () => {
    bearerGetUser.mockResolvedValue({ data: { user: null }, error: new Error('invalid token') });

    await expect(authorizeRepairResultsAdminRequest(new Request('https://example.test', {
      headers: { Authorization: 'Bearer invalid-token' },
    }))).resolves.toEqual({ authorized: false, status: 401, error: 'Unauthorized' });
    expect(createServiceRoleClient).not.toHaveBeenCalled();
  });

  it.each([false, null])('returns 403 when the authenticated user has no super-admin permission', async (permission) => {
    bearerGetUser.mockResolvedValue({ data: { user: { id: 'staff-user' } }, error: null });
    mockPermission(permission);

    await expect(authorizeRepairResultsAdminRequest(new Request('https://example.test', {
      headers: { Authorization: 'Bearer staff-token' },
    }))).resolves.toEqual({ authorized: false, status: 403, error: 'Forbidden' });
  });

  it('authorizes a bearer-authenticated super admin', async () => {
    bearerGetUser.mockResolvedValue({ data: { user: { id: 'super-admin' } }, error: null });
    mockPermission(true);

    await expect(authorizeRepairResultsAdminRequest(new Request('https://example.test', {
      headers: { Authorization: 'Bearer admin-token' },
    }))).resolves.toEqual({ authorized: true, userId: 'super-admin' });
  });

  it('preserves cookie authentication for a super admin', async () => {
    cookieGetUser.mockResolvedValue({ data: { user: { id: 'cookie-admin' } }, error: null });
    mockPermission(true);

    await expect(authorizeRepairResultsAdminRequest(new Request('https://example.test')))
      .resolves.toEqual({ authorized: true, userId: 'cookie-admin' });
  });
});
