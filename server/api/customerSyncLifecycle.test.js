/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';

const { persistGoogleContactSyncTask } = require('./googleContactsSync.js');

const flows = [
  ['customer creation', 'create'],
  ['booking conversion', 'create'],
  ['customer update', 'update'],
];

describe('customer sync lifecycle handoff', () => {
  it.each(flows)('%s waits for durable task persistence, not Google execution', async (_label, operation) => {
    let resolveInsert;
    const enqueue = vi.fn(() => new Promise((resolve) => { resolveInsert = resolve; }));
    const handoff = persistGoogleContactSyncTask(
      { customer: { id: 'customer-1', name: 'Ada', phone: '0400' }, operation, supabase: {} },
      { enqueue, report: vi.fn() }
    );

    let endpointMayRespond = false;
    handoff.then(() => { endpointMayRespond = true; });
    await Promise.resolve();
    expect(enqueue).toHaveBeenCalledWith(expect.objectContaining({ operation }));
    expect(endpointMayRespond).toBe(false);

    resolveInsert({ queued: true, taskId: `${operation}-task`, backgroundScheduled: true });
    await expect(handoff).resolves.toMatchObject({ queued: true, backgroundScheduled: true });
    expect(endpointMayRespond).toBe(true);
  });

  it.each(flows)('%s still completes its customer operation when persistence fails', async (_label, operation) => {
    const report = vi.fn();
    const result = await persistGoogleContactSyncTask(
      { customer: { id: 'customer-1', name: 'Ada', phone: '0400' }, operation, supabase: {} },
      { enqueue: async () => { throw new Error('database unavailable'); }, report }
    );
    expect(result).toEqual({ queued: false, deduplicated: false, persistenceFailed: true });
    expect(report).toHaveBeenCalledWith('[Google Contacts Sync] Unable to enqueue sync task.');
  });
});
