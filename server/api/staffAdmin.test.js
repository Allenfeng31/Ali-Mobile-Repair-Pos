/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import express from 'express';

const { createStaffAdminRouter } = require('./staffAdmin.js');

async function withServer(supabase, run) {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', createStaffAdminRouter(supabase));

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });

  try {
    const address = server.address();
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function emptySupabase() {
  return {
    auth: {
      getClaims: vi.fn(),
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
        listUsers: vi.fn(),
      },
    },
    from: vi.fn(),
  };
}

function authenticatedSupabase({ isSuperAdmin, employees = [], permissionRead, permissionUpdate }) {
  const permissionsQuery = {
    select: vi.fn(() => permissionsQuery),
    eq: vi.fn(() => permissionsQuery),
    maybeSingle: vi.fn(async () => ({
      data: { user_id: '00000000-0000-4000-8000-000000000001', is_super_admin: isSuperAdmin },
      error: null,
    })),
  };
  const supabase = emptySupabase();
  supabase.auth.getClaims.mockResolvedValue({
    data: {
      claims: {
        sub: '00000000-0000-4000-8000-000000000001',
        exp: Math.floor(Date.now() / 1000) + 300,
      },
    },
    error: null,
  });
  const updateQuery = {
    eq: vi.fn(() => updateQuery),
    select: vi.fn(() => updateQuery),
    maybeSingle: vi.fn(async () => permissionUpdate || { data: null, error: null }),
  };
  const readQuery = {
    eq: vi.fn(() => readQuery),
    maybeSingle: vi.fn(async () => permissionRead || { data: null, error: null }),
  };
  supabase.from.mockReturnValue({
    select: vi.fn((columns) => {
      if (columns === 'user_id, is_super_admin') return permissionsQuery;
      if (String(columns).includes('can_give_discount')) return readQuery;
      return Promise.resolve({ data: employees, error: null });
    }),
    update: vi.fn(() => updateQuery),
  });
  return supabase;
}

const leastPrivilegePermissions = {
  is_super_admin: false,
  can_give_discount: false,
  max_discount_limit: 0,
  can_change_inventory_price: false,
  can_view_full_sales_report: false,
  can_delete_customers: false,
  can_delete_chats: false,
};

describe('staff management API security boundary', () => {
  it('does not intercept unrelated admin routes', async () => {
    const supabase = emptySupabase();

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/unrelated`);
      expect(response.status).toBe(404);
    });

    expect(supabase.auth.getClaims).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('rejects anonymous requests before any Supabase read or admin operation', async () => {
    const supabase = emptySupabase();

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`);
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({ code: 'STAFF_SESSION_INVALID' });
    });

    expect(supabase.auth.getClaims).not.toHaveBeenCalled();
    expect(supabase.auth.admin.listUsers).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('forbids ordinary staff from every employee and permission operation before writes', async () => {
    const supabase = authenticatedSupabase({ isSuperAdmin: false });
    const target = '00000000-0000-4000-8000-000000000002';
    const requests = [
      ['GET', '/api/admin/employees'],
      ['POST', '/api/admin/employees'],
      ['PUT', `/api/admin/employees/${target}`],
      ['GET', `/api/admin/permissions/${target}`],
    ];

    await withServer(supabase, async (baseUrl) => {
      for (const [method, path] of requests) {
        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            Authorization: 'Bearer staff-token',
            'Content-Type': 'application/json',
          },
          body: method === 'GET' ? undefined : JSON.stringify({ permissions: { is_super_admin: true } }),
        });
        expect(response.status).toBe(403);
      }
    });

    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
    expect(supabase.auth.admin.listUsers).not.toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledTimes(requests.length);
  });

  it('allows a verified Super Admin to read the employee list', async () => {
    const employee = {
      user_id: '00000000-0000-4000-8000-000000000002',
      is_super_admin: false,
    };
    const supabase = authenticatedSupabase({ isSuperAdmin: true, employees: [employee] });
    supabase.auth.admin.listUsers.mockResolvedValue({
      data: { users: [{ id: employee.user_id, email: 'staff@pos.local' }] },
      error: null,
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        headers: { Authorization: 'Bearer admin-token' },
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual([
        expect.objectContaining({ user_id: employee.user_id, email: 'staff@pos.local' }),
      ]);
    });
  });

  it('allows a verified Super Admin to create a least-privilege staff account', async () => {
    const userId = '00000000-0000-4000-8000-000000000002';
    const permissionRow = { user_id: userId, ...leastPrivilegePermissions };
    const supabase = authenticatedSupabase({
      isSuperAdmin: true,
      permissionUpdate: { data: permissionRow, error: null },
    });
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: userId, email: 'muse@pos.local' } },
      error: null,
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'muse',
          password: 'secure-password',
          permissions: leastPrivilegePermissions,
        }),
      });
      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toEqual({
        success: true,
        user: { id: userId, email: 'muse@pos.local' },
      });
    });

    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'muse@pos.local',
      password: 'secure-password',
      email_confirm: true,
    });
    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('allows a verified Super Admin to update whitelisted permissions on an existing employee', async () => {
    const userId = '00000000-0000-4000-8000-000000000002';
    const supabase = authenticatedSupabase({
      isSuperAdmin: true,
      permissionUpdate: {
        data: { user_id: userId, can_give_discount: true },
        error: null,
      },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: { can_give_discount: true } }),
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        user_id: userId,
        can_give_discount: true,
      });
    });
  });

  it('allows a verified Super Admin to read one employee permission record', async () => {
    const userId = '00000000-0000-4000-8000-000000000002';
    const permissionRow = { user_id: userId, ...leastPrivilegePermissions };
    const supabase = authenticatedSupabase({
      isSuperAdmin: true,
      permissionRead: { data: permissionRow, error: null },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/permissions/${userId}`, {
        headers: { Authorization: 'Bearer admin-token' },
      });
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual(permissionRow);
    });
  });

  it('rejects a password shorter than six characters before Auth user creation', async () => {
    const supabase = authenticatedSupabase({ isSuperAdmin: true });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'muse', password: 'short', permissions: {} }),
      });
      expect(response.status).toBe(422);
      await expect(response.json()).resolves.toMatchObject({ code: 'WEAK_PASSWORD' });
    });

    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('returns a conflict for a duplicate username without deleting the existing user', async () => {
    const supabase = authenticatedSupabase({ isSuperAdmin: true });
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: null },
      error: { status: 422, code: 'email_exists', message: 'A user with this email already exists' },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'muse', password: 'secure-password', permissions: {} }),
      });
      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toMatchObject({ code: 'USERNAME_TAKEN' });
    });

    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects unknown permission fields and invalid permission types before writes', async () => {
    const supabase = authenticatedSupabase({ isSuperAdmin: true });
    const invalidPermissions = [
      { is_super_admin: false, role: 'super-admin' },
      { is_super_admin: 'true' },
      { max_discount_limit: -1 },
    ];

    await withServer(supabase, async (baseUrl) => {
      for (const permissions of invalidPermissions) {
        const response = await fetch(`${baseUrl}/api/admin/employees`, {
          method: 'POST',
          headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'muse', password: 'secure-password', permissions }),
        });
        expect(response.status).toBe(400);
      }
    });

    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it.each([
    ['permission write fails', { data: null, error: { code: 'database_error' } }],
    ['permission update affects zero rows', { data: null, error: null }],
  ])('removes only the newly created Auth user when %s', async (_label, permissionUpdate) => {
    const userId = '00000000-0000-4000-8000-000000000002';
    const supabase = authenticatedSupabase({ isSuperAdmin: true, permissionUpdate });
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: userId, email: 'muse@pos.local' } },
      error: null,
    });
    supabase.auth.admin.deleteUser.mockResolvedValue({ data: {}, error: null });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'muse',
          password: 'secure-password',
          permissions: leastPrivilegePermissions,
        }),
      });
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({ code: 'STAFF_INITIALIZATION_FAILED' });
    });

    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledOnce();
    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith(userId);
  });

  it('reports a zero-row permission update as not found without deleting any Auth user', async () => {
    const userId = '00000000-0000-4000-8000-000000000002';
    const supabase = authenticatedSupabase({
      isSuperAdmin: true,
      permissionUpdate: { data: null, error: null },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees/${userId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: { can_give_discount: true } }),
      });
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({ code: 'STAFF_NOT_FOUND' });
    });

    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('rejects an invalid session before employee reads or writes', async () => {
    const supabase = emptySupabase();
    supabase.auth.getClaims.mockResolvedValue({
      data: { claims: null },
      error: { status: 401, message: 'JWT expired' },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        headers: { Authorization: 'Bearer expired-token' },
      });
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({ code: 'STAFF_SESSION_INVALID' });
    });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(supabase.auth.admin.listUsers).not.toHaveBeenCalled();
  });

  it('prevents a Super Admin from removing their own Super Admin permission', async () => {
    const adminId = '00000000-0000-4000-8000-000000000001';
    const supabase = authenticatedSupabase({ isSuperAdmin: true });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees/${adminId}`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: { is_super_admin: false } }),
      });
      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toMatchObject({ code: 'SUPER_ADMIN_SELF_DEMOTION_DENIED' });
    });

    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it('returns a safe server error when Supabase Auth creation fails unexpectedly', async () => {
    const supabase = authenticatedSupabase({ isSuperAdmin: true });
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: null },
      error: { status: 503, code: 'service_unavailable', message: 'upstream details' },
    });

    await withServer(supabase, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/admin/employees`, {
        method: 'POST',
        headers: { Authorization: 'Bearer admin-token', 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'muse', password: 'secure-password', permissions: {} }),
      });
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({
        code: 'STAFF_ACCOUNT_CREATE_FAILED',
        error: 'Unable to create the staff account.',
      });
      expect(JSON.stringify(body)).not.toContain('upstream details');
    });

    expect(supabase.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
});
