const express = require('express');
const { createRequireStaffAuth, createRequireSuperAdmin } = require('./staffAuth.js');

const BOOLEAN_PERMISSION_FIELDS = [
  'is_super_admin',
  'can_give_discount',
  'can_change_inventory_price',
  'can_view_full_sales_report',
  'can_delete_customers',
  'can_delete_chats',
];
const PERMISSION_FIELDS = [...BOOLEAN_PERMISSION_FIELDS, 'max_discount_limit'];
const PERMISSION_SELECT = ['user_id', ...PERMISSION_FIELDS].join(', ');
const DEFAULT_PERMISSIONS = Object.freeze({
  is_super_admin: false,
  can_give_discount: false,
  max_discount_limit: 0,
  can_change_inventory_price: false,
  can_view_full_sales_report: false,
  can_delete_customers: false,
  can_delete_chats: false,
});

class StaffInputError extends Error {
  constructor(message, code = 'STAFF_INPUT_INVALID') {
    super(message);
    this.code = code;
  }
}

function normaliseUsername(value) {
  if (typeof value !== 'string') throw new StaffInputError('Username is required.');
  const username = value.trim().toLowerCase();
  if (username.length < 3 || username.length > 64) {
    throw new StaffInputError('Username must be between 3 and 64 characters.');
  }
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(username)) {
    throw new StaffInputError('Username may only contain letters, numbers, dots, underscores and hyphens.');
  }
  const email = `${username}@pos.local`;
  if (email.length > 254) throw new StaffInputError('Username is too long.');
  return { username, email };
}

function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 6) {
    throw new StaffInputError('Password must be at least 6 characters.', 'WEAK_PASSWORD');
  }
  return value;
}

function validateUserId(value) {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new StaffInputError('Target employee is invalid.');
  }
  return value;
}

function validatePermissions(value, { partial = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new StaffInputError('Permissions must be an object.');
  }
  const keys = Object.keys(value);
  if (partial && keys.length === 0) throw new StaffInputError('At least one permission is required.');
  const unknown = keys.find((key) => !PERMISSION_FIELDS.includes(key));
  if (unknown) throw new StaffInputError('One or more permission fields are not supported.');

  const permissions = partial ? {} : { ...DEFAULT_PERMISSIONS };
  for (const field of BOOLEAN_PERMISSION_FIELDS) {
    if (field in value) {
      if (typeof value[field] !== 'boolean') throw new StaffInputError(`${field} must be true or false.`);
      permissions[field] = value[field];
    }
  }
  if ('max_discount_limit' in value) {
    const limit = value.max_discount_limit;
    if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 0 || limit > 100000) {
      throw new StaffInputError('max_discount_limit must be between 0 and 100000.');
    }
    permissions.max_discount_limit = limit;
  }
  return permissions;
}

function permissionRowMatches(row, expected) {
  return Boolean(row) && Object.entries(expected).every(([field, value]) => row[field] === value);
}

function authCreateFailure(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();
  if (code === 'weak_password' || Number(error?.status) === 422 && message.includes('password')) {
    return { status: 422, code: 'WEAK_PASSWORD', error: 'Password must be at least 6 characters.' };
  }
  if (code === 'email_exists' || code === 'user_already_exists' || /already (registered|exists)|email.*exists/.test(message)) {
    return { status: 409, code: 'USERNAME_TAKEN', error: 'That username is already in use.' };
  }
  return { status: 500, code: 'STAFF_ACCOUNT_CREATE_FAILED', error: 'Unable to create the staff account.' };
}

async function cleanupCreatedAuthUser(supabase, userId) {
  try {
    const result = await supabase.auth.admin.deleteUser(userId);
    return result?.error || null;
  } catch (error) {
    return error;
  }
}

function createStaffAdminRouter(supabase) {
  const router = express.Router();
  const requireCurrentStaffAuth = createRequireStaffAuth(supabase, { ttlMs: 0 });
  const requireSuperAdmin = createRequireSuperAdmin();

  router.use(['/employees', '/permissions'], requireCurrentStaffAuth, requireSuperAdmin);

  router.get('/employees', async (_req, res) => {
    try {
      const { data: permissions, error: permissionsError } = await supabase
        .from('employee_permissions')
        .select('*');
      if (permissionsError) throw permissionsError;

      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const authUsers = authData?.users || [];
      return res.json((permissions || []).map((row) => ({
        ...row,
        email: authUsers.find((user) => user.id === row.user_id)?.email || 'Unknown User',
      })));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({
        error: 'Unable to load employees.',
        code: 'STAFF_ADMIN_READ_FAILED',
      });
    }
  });

  router.post('/employees', async (req, res) => {
    let createdUserId = null;
    try {
      const { email } = normaliseUsername(req.body?.username);
      const password = validatePassword(req.body?.password);
      const permissions = validatePermissions(req.body?.permissions);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (authError) {
        const failure = authCreateFailure(authError);
        return res.status(failure.status).json({ code: failure.code, error: failure.error });
      }
      if (!authData?.user?.id) throw new Error('Auth user was not returned.');
      createdUserId = authData.user.id;

      const { data: permissionRow, error: permissionError } = await supabase
        .from('employee_permissions')
        .update(permissions)
        .eq('user_id', createdUserId)
        .select(PERMISSION_SELECT)
        .maybeSingle();
      if (permissionError || !permissionRowMatches(permissionRow, permissions)) {
        throw new Error('Permission initialization failed.');
      }

      return res.status(201).json({
        success: true,
        user: { id: createdUserId, email },
      });
    } catch (error) {
      if (error instanceof StaffInputError) {
        return res.status(error.code === 'WEAK_PASSWORD' ? 422 : 400).json({
          error: error.message,
          code: error.code,
        });
      }

      if (createdUserId) {
        const cleanupError = await cleanupCreatedAuthUser(supabase, createdUserId);
        if (cleanupError) {
          console.error('Staff initialization cleanup failed:', {
            code: cleanupError.code || null,
            status: cleanupError.status || null,
          });
          return res.status(500).json({
            error: 'Staff initialization failed and requires administrator review.',
            code: 'STAFF_INITIALIZATION_CLEANUP_FAILED',
          });
        }
      }

      console.error('Error creating employee:', {
        code: error?.code || null,
        status: error?.status || null,
      });
      return res.status(500).json({
        error: 'Unable to initialize the staff account.',
        code: 'STAFF_INITIALIZATION_FAILED',
      });
    }
  });

  router.put('/employees/:userId', async (req, res) => {
    try {
      const userId = validateUserId(req.params.userId);
      const permissions = validatePermissions(req.body?.permissions, { partial: true });
      if (userId === req.staffUser.id && permissions.is_super_admin === false) {
        return res.status(409).json({
          error: 'You cannot remove your own Super Admin permission.',
          code: 'SUPER_ADMIN_SELF_DEMOTION_DENIED',
        });
      }

      const { data, error } = await supabase
        .from('employee_permissions')
        .update(permissions)
        .eq('user_id', userId)
        .select(PERMISSION_SELECT)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return res.status(404).json({
          error: 'Employee was not found.',
          code: 'STAFF_NOT_FOUND',
        });
      }
      if (!permissionRowMatches(data, permissions)) throw new Error('Permission update was not verified.');
      return res.json(data);
    } catch (error) {
      if (error instanceof StaffInputError) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      console.error('Error updating employee permissions:', {
        code: error?.code || null,
        status: error?.status || null,
      });
      return res.status(500).json({
        error: 'Unable to update employee permissions.',
        code: 'STAFF_PERMISSION_UPDATE_FAILED',
      });
    }
  });

  router.get('/permissions/:userId', async (req, res) => {
    try {
      const userId = validateUserId(req.params.userId);
      const { data, error } = await supabase
        .from('employee_permissions')
        .select(PERMISSION_SELECT)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Employee was not found.', code: 'STAFF_NOT_FOUND' });
      }
      return res.json(data);
    } catch (error) {
      if (error instanceof StaffInputError) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      console.error('Error fetching employee permissions:', {
        code: error?.code || null,
        status: error?.status || null,
      });
      return res.status(500).json({
        error: 'Unable to load employee permissions.',
        code: 'STAFF_PERMISSION_READ_FAILED',
      });
    }
  });

  return router;
}

module.exports = { createStaffAdminRouter };
