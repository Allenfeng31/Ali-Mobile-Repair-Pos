const crypto = require('crypto');

const STAFF_AUTH_CODES = {
  invalid: 'STAFF_SESSION_INVALID',
  denied: 'STAFF_PERMISSION_DENIED',
  rateLimited: 'AUTH_RATE_LIMITED',
  unavailable: 'AUTH_UPSTREAM_UNAVAILABLE',
  internal: 'STAFF_AUTH_INTERNAL_ERROR',
};

function authFailure(error) {
  const status = Number(error?.status || error?.statusCode || error?.response?.status || 0);
  const message = String(error?.message || '').toLowerCase();
  if (status === 429) return { status: 429, code: STAFF_AUTH_CODES.rateLimited, error: 'Authentication service is temporarily busy.' };
  if (status >= 500 || /timeout|network|econn|enotfound|unavailable/.test(message)) {
    return { status: 503, code: STAFF_AUTH_CODES.unavailable, error: 'Authentication service is temporarily unavailable.' };
  }
  if (status === 401 || /expired|invalid|revoked|signature|jwt/.test(message)) {
    return { status: 401, code: STAFF_AUTH_CODES.invalid, error: 'Staff session is invalid.' };
  }
  return { status: 500, code: STAFF_AUTH_CODES.internal, error: 'Unable to verify staff session.' };
}

function createStaffSessionValidator(supabase, { now = () => Date.now(), ttlMs = 60_000, maxEntries = 250 } = {}) {
  const cache = new Map();
  const inFlight = new Map();
  const cacheKey = (token) => crypto.createHash('sha256').update(token).digest('hex');

  const evictExpired = () => {
    const time = now();
    for (const [key, value] of cache) if (value.expiresAt <= time) cache.delete(key);
    while (cache.size >= maxEntries) cache.delete(cache.keys().next().value);
  };

  const verify = async (token) => {
    const key = cacheKey(token);
    const time = now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > time) return { ok: true, user: cached.user, permissions: cached.permissions, cached: true };
    if (inFlight.has(key)) return inFlight.get(key);

    const work = (async () => {
      let user;
      if (typeof supabase.auth.getClaims === 'function') {
        const { data, error } = await supabase.auth.getClaims(token);
        if (error || !data?.claims?.sub) return { ok: false, ...authFailure(error || new Error('Invalid JWT claims')) };
        user = { id: data.claims.sub, exp: Number(data.claims.exp || 0) };
      } else {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) return { ok: false, ...authFailure(error || new Error('Invalid JWT')) };
        user = { id: data.user.id, exp: 0 };
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('employee_permissions')
        .select('user_id, is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();
      if (permissionsError) return { ok: false, status: 500, code: STAFF_AUTH_CODES.internal, error: 'Unable to verify staff permissions.' };
      if (!permissions) return { ok: false, status: 403, code: STAFF_AUTH_CODES.denied, error: 'Staff permission is required.' };

      const jwtExpiry = user.exp > 0 ? user.exp * 1000 : Number.POSITIVE_INFINITY;
      const expiresAt = Math.min(now() + ttlMs, jwtExpiry);
      if (expiresAt <= now()) return { ok: false, status: 401, code: STAFF_AUTH_CODES.invalid, error: 'Staff session is invalid.' };
      evictExpired();
      cache.set(key, { user: { id: user.id }, permissions, expiresAt });
      return { ok: true, user: { id: user.id }, permissions, cached: false };
    })();
    inFlight.set(key, work);
    try { return await work; } finally { inFlight.delete(key); }
  };

  return { verify, cacheSize: () => cache.size };
}

function createRequireStaffAuth(supabase, options) {
  const validator = createStaffSessionValidator(supabase, options);
  return async (req, res, next) => {
    const match = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Staff session is required.', code: STAFF_AUTH_CODES.invalid });
    try {
      const result = await validator.verify(match[1]);
      if (!result.ok) return res.status(result.status).json({ error: result.error, code: result.code });
      req.staffUser = result.user;
      req.staffPermissions = result.permissions;
      return next();
    } catch {
      return res.status(500).json({ error: 'Unable to verify staff session.', code: STAFF_AUTH_CODES.internal });
    }
  };
}

module.exports = { STAFF_AUTH_CODES, authFailure, createStaffSessionValidator, createRequireStaffAuth };
