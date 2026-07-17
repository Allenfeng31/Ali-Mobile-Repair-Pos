/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';

const { createSyncContactsAdminHandlers, toSafeTask } = require('./syncContactsAdmin.js');

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

describe('Google sync admin handlers', () => {
  it('only returns safe task fields and sanitises historic raw failures', () => {
    const task = toSafeTask({
      id: 'task-1',
      customer_id: 'customer-1',
      sync_payload: { name: 'Ada', phone: '0400', refresh_token: 'must-not-leak' },
      sync_operation: 'update',
      status: 'failed',
      attempts: 1,
      error_reason: 'google response: refresh_token=must-not-leak',
      created_at: '2026-07-17T00:00:00.000Z',
      updated_at: '2026-07-17T00:00:00.000Z',
      locked_at: null,
    });
    expect(task).toEqual(expect.objectContaining({ customer_name: 'Ada', operation: 'update', safe_error: 'Google sync failed.' }));
    expect(JSON.stringify(task)).not.toContain('must-not-leak');
    expect(task).not.toHaveProperty('sync_payload');
  });

  it('rejects a retry request without a task id before any database work', async () => {
    const supabase = { from: vi.fn() };
    const res = response();
    await createSyncContactsAdminHandlers({ supabase }).retry({ body: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('serves log history without the database payload or raw error text', async () => {
    const log = {
      id: 'task-1', customer_id: 'customer-1', sync_payload: { name: 'Ada', phone: '0400', oauth: 'private' },
      sync_operation: 'create', status: 'failed', attempts: 1, error_reason: 'oauth=private',
      created_at: '2026-07-17T00:00:00.000Z', updated_at: '2026-07-17T00:00:00.000Z', locked_at: null,
    };
    const supabase = {
      from: vi.fn(() => ({
        select: () => ({ order: () => ({ limit: async () => ({ data: [log], error: null }) }) }),
      })),
    };
    const res = response();
    await createSyncContactsAdminHandlers({ supabase }).getLogs({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([expect.objectContaining({ id: 'task-1', customer_name: 'Ada', safe_error: 'Google sync failed.' })]);
    expect(JSON.stringify(res.body)).not.toContain('private');
  });
});
