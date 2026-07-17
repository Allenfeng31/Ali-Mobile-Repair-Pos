/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';

const { STAFF_AUTH_CODES, createRequireStaffAuth, createStaffSessionValidator } = require('./staffAuth.js');

function response() {
  return { statusCode: 200, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

function client({ claims, claimsError, user, userError, permissions = { user_id: 'staff-1', is_super_admin: false }, permissionsError, getClaims = true } = {}) {
  return {
    auth: {
      ...(getClaims ? { getClaims: vi.fn().mockResolvedValue({ data: { claims }, error: claimsError || null }) } : {}),
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: userError || null }),
    },
    from: vi.fn(() => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: permissions, error: permissionsError || null }) }) }) })),
  };
}

describe('staff authorization boundary', () => {
  it('rejects missing, expired, and invalid sessions with the machine-readable 401 code', async () => {
    const missingRes = response();
    await createRequireStaffAuth(client())({ headers: {} }, missingRes, vi.fn());
    expect(missingRes).toMatchObject({ statusCode: 401, body: { code: STAFF_AUTH_CODES.invalid } });

    const expiredRes = response();
    await createRequireStaffAuth(client({ claimsError: { status: 401, message: 'JWT expired' } }))({ headers: { authorization: 'Bearer invalid' } }, expiredRes, vi.fn());
    expect(expiredRes).toMatchObject({ statusCode: 401, body: { code: STAFF_AUTH_CODES.invalid } });
  });

  it('keeps rate limits and upstream failures distinct from invalid sessions', async () => {
    const limitedRes = response();
    await createRequireStaffAuth(client({ claimsError: { status: 429, message: 'too many requests' } }))({ headers: { authorization: 'Bearer token' } }, limitedRes, vi.fn());
    expect(limitedRes).toMatchObject({ statusCode: 429, body: { code: STAFF_AUTH_CODES.rateLimited } });

    const unavailableRes = response();
    await createRequireStaffAuth(client({ claimsError: { message: 'network timeout' } }))({ headers: { authorization: 'Bearer token' } }, unavailableRes, vi.fn());
    expect(unavailableRes).toMatchObject({ statusCode: 503, body: { code: STAFF_AUTH_CODES.unavailable } });
  });

  it('uses verified claims and preserves a separate staff-permission check', async () => {
    const supabase = client({ claims: { sub: 'staff-1', exp: Math.floor(Date.now() / 1000) + 60 } });
    const req = { headers: { authorization: 'Bearer token' } };
    const next = vi.fn();
    await createRequireStaffAuth(supabase)(req, response(), next);
    expect(next).toHaveBeenCalledOnce();
    expect(req.staffUser).toEqual({ id: 'staff-1' });
    expect(supabase.auth.getUser).not.toHaveBeenCalled();

    const deniedRes = response();
    await createRequireStaffAuth(client({ claims: { sub: 'public-1', exp: Math.floor(Date.now() / 1000) + 60 }, permissions: null }))({ headers: { authorization: 'Bearer token' } }, deniedRes, vi.fn());
    expect(deniedRes).toMatchObject({ statusCode: 403, body: { code: STAFF_AUTH_CODES.denied } });
  });

  it('uses getUser only when getClaims is unavailable', async () => {
    const supabase = client({ getClaims: false, user: { id: 'staff-1' } });
    const validator = createStaffSessionValidator(supabase);
    await expect(validator.verify('fallback-token')).resolves.toMatchObject({ ok: true, user: { id: 'staff-1' } });
    expect(supabase.auth.getUser).toHaveBeenCalledOnce();
  });

  it('caches only successful staff verification by a bounded non-raw-token key', async () => {
    let time = 1_000;
    const supabase = client({ claims: { sub: 'staff-1', exp: 100 } });
    const validator = createStaffSessionValidator(supabase, { now: () => time, ttlMs: 60, maxEntries: 1 });
    await validator.verify('first-token');
    await validator.verify('first-token');
    expect(supabase.auth.getClaims).toHaveBeenCalledOnce();
    expect(validator.cacheSize()).toBe(1);
    time += 61;
    await validator.verify('first-token');
    expect(supabase.auth.getClaims).toHaveBeenCalledTimes(2);
  });

  it('does not cache errors and shares concurrent verification work', async () => {
    const limited = client({ claimsError: { status: 429, message: 'busy' } });
    const validator = createStaffSessionValidator(limited);
    await validator.verify('token');
    await validator.verify('token');
    expect(limited.auth.getClaims).toHaveBeenCalledTimes(2);

    let resolveClaims;
    const shared = client({ claims: undefined });
    shared.auth.getClaims.mockImplementation(() => new Promise((resolve) => { resolveClaims = resolve; }));
    const concurrent = createStaffSessionValidator(shared);
    const first = concurrent.verify('same-token');
    const second = concurrent.verify('same-token');
    resolveClaims({ data: { claims: { sub: 'staff-1', exp: Math.floor(Date.now() / 1000) + 60 } }, error: null });
    await Promise.all([first, second]);
    expect(shared.auth.getClaims).toHaveBeenCalledOnce();
  });
});
