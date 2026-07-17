/**
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import https from 'node:https';
const axios = require('axios');

const {
  MAX_SYNC_ATTEMPTS,
  STALE_LOCK_MS,
  claimSyncTask,
  recheckVerificationRequiredSyncTask,
  enqueueGoogleContactSync,
  persistGoogleContactSyncTask,
  executeClaimedSyncTask,
  isRetryEligible,
  normalizePhone,
  processQueuedSyncTask,
  syncCustomerToGoogleContacts,
} = require('./googleContactsSync.js');

const customer = { id: 'customer-1', name: 'Ada Lovelace', phone: '0400000000' };

function createSettingsSupabase(enabled = true) {
  const customerUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  return {
    customerUpdate,
    from: vi.fn((table) => {
      if (table === 'settings') {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { value: enabled }, error: null }) }) }) };
      }
      if (table === 'customers') return { update: customerUpdate };
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
}

function createTaskStore(task) {
  const state = { ...task };
  const from = vi.fn(() => ({
    update(values) {
      const conditions = [];
      const builder = {
        eq(field, value) { conditions.push([field, value]); return builder; },
        is(field, value) { conditions.push([field, value]); return builder; },
        async select() {
          const matches = conditions.every(([field, value]) => state[field] === value);
          if (!matches) return { data: [], error: null };
          Object.assign(state, values);
          return { data: [{ ...state }], error: null };
        },
        then(resolve, reject) {
          return Promise.resolve({ data: [{ ...state }], error: null }).then(resolve, reject);
        },
      };
      return builder;
    },
  }));
  return { state, supabase: { from } };
}

describe('Google Contacts sync behaviour', () => {
  it('returns structured outcomes without contacting Google when disabled or unconfigured', async () => {
    const disabledClient = { people: { searchContacts: vi.fn(), createContact: vi.fn() } };
    const disabled = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(false), disabledClient);
    expect(disabled).toMatchObject({ success: false, category: 'disabled', retryable: false });
    expect(disabledClient.people.searchContacts).not.toHaveBeenCalled();

    const missing = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), null, 'create', {});
    expect(missing).toMatchObject({ success: false, category: 'missing_configuration', retryable: false });
  });

  it('creates or updates exactly as the persisted operation requests', async () => {
    const supabase = createSettingsSupabase(true);
    const createContact = vi.fn().mockResolvedValue({ data: {} });
    const createClient = { people: { searchContacts: vi.fn().mockResolvedValue({ data: { results: [] } }), createContact } };
    const created = await syncCustomerToGoogleContacts(customer, supabase, createClient, 'create');
    expect(created).toMatchObject({ success: true, action: 'created' });
    expect(createContact).toHaveBeenCalledOnce();

    const updateContact = vi.fn().mockResolvedValue({ data: {} });
    const updateClient = {
      people: {
        searchContacts: vi.fn().mockResolvedValue({ data: { results: [{ person: { resourceName: 'people/1', phoneNumbers: [{ value: '+61 400 000 000' }] } }] } }),
        updateContact,
      },
    };
    const updated = await syncCustomerToGoogleContacts(customer, supabase, updateClient, 'update');
    expect(updated).toMatchObject({ success: true, action: 'updated' });
    expect(updateContact).toHaveBeenCalledWith(expect.objectContaining({ resourceName: 'people/1', updatePersonFields: 'names,phoneNumbers' }), expect.any(Object));

    const duplicateClient = { people: { searchContacts: vi.fn().mockResolvedValue({ data: { results: [{ person: { resourceName: 'people/2', phoneNumbers: [{ value: '0400 000 000' }] } }] } }) } };
    const duplicate = await syncCustomerToGoogleContacts(customer, supabase, duplicateClient, 'create');
    expect(duplicate).toMatchObject({ success: true, action: 'duplicate' });
  });

  it('normalizes Australian phone formats and only treats an exact normalized number as an existing contact', async () => {
    expect(normalizePhone('+61 400 000 000')).toBe('0400000000');
    const createContact = vi.fn().mockResolvedValue({ data: {} });
    const client = {
      people: {
        searchContacts: vi.fn().mockResolvedValue({ data: { results: [
          { person: { resourceName: 'people/non-match', phoneNumbers: [{ value: '0400000001' }] } },
          { person: { resourceName: 'people/existing', phoneNumbers: [{ value: '+61 400 000 000' }] } },
        ] } }),
        createContact,
      },
    };
    const result = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), client, 'create');
    expect(client.people.searchContacts).toHaveBeenCalledWith(expect.objectContaining({ query: '0400000000' }), expect.any(Object));
    expect(result).toMatchObject({ success: true, action: 'duplicate' });
    expect(createContact).not.toHaveBeenCalled();
  });

  it('warms up with an empty query before phone search and permits one create only after no exact match', async () => {
    const searchContacts = vi.fn().mockResolvedValue({ data: { results: [] } });
    const createContact = vi.fn().mockResolvedValue({ data: {} });
    const result = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), { people: { searchContacts, createContact } }, 'create');
    expect(searchContacts).toHaveBeenNthCalledWith(1, expect.objectContaining({ query: '' }), expect.any(Object));
    expect(searchContacts).toHaveBeenNthCalledWith(2, expect.objectContaining({ query: '0400000000' }), expect.any(Object));
    expect(createContact).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ success: true, action: 'created' });
  });

  it('classifies ambiguous dispatched CREATE failures as verification-required and never as automatic retries', async () => {
    const failures = [
      new Error('request timeout'),
      Object.assign(new Error('connection reset'), { code: 'ECONNRESET' }),
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
      { response: { status: 503 } },
      new Error('unexpected create failure'),
    ];
    for (const failure of failures) {
      const createContact = vi.fn().mockRejectedValue(failure);
      const result = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), {
        people: { searchContacts: vi.fn().mockResolvedValue({ data: { results: [] } }), createContact },
      }, 'create');
      expect(result).toMatchObject({ success: false, category: 'verification_required', retryable: false });
      expect(result.safeMessage).toContain('may have created');
      expect(createContact).toHaveBeenCalledOnce();
    }
  });

  it('keeps definitive CREATE rejection under the existing bounded retry policy', async () => {
    const result = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), {
      people: {
        searchContacts: vi.fn().mockResolvedValue({ data: { results: [] } }),
        createContact: vi.fn().mockRejectedValue({ response: { status: 429 } }),
      },
    }, 'create');
    expect(result).toMatchObject({ category: 'rate_limit', retryable: true });
  });

  it('does not mark a timeout as local success and rechecks Google before a later create retry', async () => {
    const first = await syncCustomerToGoogleContacts(
      customer,
      createSettingsSupabase(true),
      { people: { searchContacts: vi.fn().mockRejectedValue(new Error('request timeout')) } },
      'create'
    );
    expect(first).toMatchObject({ success: false, category: 'timeout', retryable: true });

    const createContact = vi.fn();
    const retry = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), {
      people: {
        searchContacts: vi.fn().mockResolvedValue({ data: { results: [{ person: { resourceName: 'people/confirmed', phoneNumbers: [{ value: '+61 400 000 000' }] } }] } }),
        createContact,
      },
    }, 'create');
    expect(retry).toMatchObject({ success: true, action: 'duplicate' });
    expect(createContact).not.toHaveBeenCalled();
  });

  it('returns explicit structured failure categories', async () => {
    const cases = [
      ['timeout', new Error('request timeout')],
      ['network', Object.assign(new Error('offline'), { code: 'ENOTFOUND' })],
      ['authentication', { response: { status: 401 } }],
      ['rate_limit', { response: { status: 429 } }],
      ['validation', { response: { status: 400 } }],
      ['unknown', new Error('unexpected')],
    ];
    for (const [category, failure] of cases) {
      const client = { people: { searchContacts: vi.fn().mockRejectedValue(failure) } };
      const result = await syncCustomerToGoogleContacts(customer, createSettingsSupabase(true), client);
      expect(result).toMatchObject({ success: false, category });
    }
  });

  it('persists a pending task at zero attempts before any background work', async () => {
    const insert = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{ id: 'task-1' }], error: null }) });
    const supabase = { from: vi.fn(() => ({ insert })) };
    const result = await enqueueGoogleContactSync({ customer, operation: 'create', supabase, triggerBackground: false });
    expect(result).toEqual({ queued: true, deduplicated: false, taskId: 'task-1', backgroundScheduled: false });
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({ status: 'pending', attempts: 0, locked_at: null, sync_operation: 'create' })]);
  });

  it('waits for durable queue persistence, but lets the customer flow survive a persistence failure', async () => {
    let resolveEnqueue;
    const enqueue = vi.fn(() => new Promise((resolve) => { resolveEnqueue = resolve; }));
    const report = vi.fn();
    const persisted = persistGoogleContactSyncTask({ customer, operation: 'create', supabase: {} }, { enqueue, report });
    expect(enqueue).toHaveBeenCalledOnce();
    let settled = false;
    persisted.then(() => { settled = true; });
    await Promise.resolve();
    expect(settled).toBe(false);
    resolveEnqueue({ queued: true, deduplicated: false, taskId: 'task-1' });
    await expect(persisted).resolves.toMatchObject({ queued: true, taskId: 'task-1' });

    const failed = await persistGoogleContactSyncTask(
      { customer, operation: 'create', supabase: {} },
      { enqueue: async () => { throw new Error('database unavailable'); }, report }
    );
    expect(failed).toEqual({ queued: false, deduplicated: false, persistenceFailed: true });
    expect(report).toHaveBeenCalledWith('[Google Contacts Sync] Unable to enqueue sync task.');
  });

  it('refreshes a retryable failed task without resetting attempts or creating another actionable failure', async () => {
    const existing = { id: 'failed-1', status: 'failed', attempts: 2, locked_at: null, sync_payload: { name: 'Old' }, sync_operation: 'update' };
    const findBuilder = {
      eq: vi.fn().mockReturnThis(), or: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
      maybeSingle: async () => ({ data: existing, error: null }),
    };
    const refreshBuilder = {
      eq: vi.fn().mockReturnThis(),
      select: async () => ({ data: [{ ...existing, sync_payload: { id: customer.id, name: customer.name, phone: customer.phone } }], error: null }),
    };
    const supabase = {
      from: vi.fn()
        .mockReturnValueOnce({
        insert: () => ({ select: async () => ({ data: null, error: { code: '23505' } }) }),
        })
        .mockReturnValueOnce({ select: vi.fn(() => findBuilder) })
        .mockReturnValueOnce({ update: vi.fn(() => refreshBuilder) }),
    };
    const result = await enqueueGoogleContactSync({ customer, operation: 'update', supabase, triggerBackground: false });
    expect(result).toEqual({ queued: false, deduplicated: true, taskId: 'failed-1', backgroundScheduled: false });
    expect(refreshBuilder.eq).toHaveBeenCalledWith('attempts', 2);
  });

  it('keeps exhausted failures exhausted while a new later operation can queue independently', async () => {
    const insert = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{ id: 'new-task' }], error: null }) });
    const supabase = { from: vi.fn(() => ({ insert })) };
    const result = await enqueueGoogleContactSync({ customer, operation: 'update', supabase, triggerBackground: false });
    expect(result).toMatchObject({ queued: true, deduplicated: false, taskId: 'new-task' });
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({ attempts: 0, status: 'pending' })]);
  });

  it('keeps a durable task pending if background scheduling fails', async () => {
    const insert = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [{ id: 'task-1', status: 'pending', attempts: 0 }], error: null }) });
    const report = vi.fn();
    const result = await enqueueGoogleContactSync({ customer, operation: 'create', supabase: { from: vi.fn(() => ({ insert })) }, schedule: () => { throw new Error('scheduler unavailable'); }, report });
    expect(result).toMatchObject({ queued: true, taskId: 'task-1', backgroundScheduled: false });
    expect(report).toHaveBeenCalledWith('[Google Contacts Sync] Background scheduling failed; task remains pending.');
  });

  it('claims exactly one concurrent task and increments attempts once', async () => {
    const originalTask = { id: 'task-1', status: 'failed', attempts: 0, locked_at: null };
    const store = createTaskStore(originalTask);
    const now = new Date('2026-07-17T00:00:00.000Z');
    const [first, second] = await Promise.all([
      claimSyncTask({ supabase: store.supabase, task: originalTask, now }),
      claimSyncTask({ supabase: store.supabase, task: originalTask, now }),
    ]);
    expect([first, second].filter(Boolean)).toHaveLength(1);
    expect(store.state).toMatchObject({ status: 'processing', attempts: 1, locked_at: now.toISOString() });
  });

  it('allows exactly the fifth execution and blocks any later retry', async () => {
    const task = { id: 'task-5', status: 'failed', attempts: 4, locked_at: null };
    const store = createTaskStore(task);
    const now = new Date('2026-07-17T00:00:00.000Z');
    const claimed = await claimSyncTask({ supabase: store.supabase, task, now });
    expect(claimed).toMatchObject({ attempts: 5, status: 'processing' });
    expect(isRetryEligible({ ...claimed, status: 'failed', locked_at: null }, now)).toBe(false);
  });

  it('enforces the fifth execution limit and deterministic stale-lock threshold', () => {
    const now = new Date('2026-07-17T00:05:00.000Z');
    expect(isRetryEligible({ status: 'failed', attempts: MAX_SYNC_ATTEMPTS }, now)).toBe(false);
    expect(isRetryEligible({ status: 'processing', attempts: 1, locked_at: now.toISOString() }, now)).toBe(false);
    expect(isRetryEligible({ status: 'processing', attempts: 4, locked_at: new Date(now.getTime() - STALE_LOCK_MS).toISOString() }, now)).toBe(false);
    expect(isRetryEligible({ status: 'processing', attempts: 4, locked_at: new Date(now.getTime() - STALE_LOCK_MS - 1).toISOString() }, now)).toBe(true);
    expect(isRetryEligible({ status: 'verification_required', attempts: 1, locked_at: null }, now)).toBe(false);
  });

  it('finalizes an ambiguous CREATE as verification-required without resetting attempts', async () => {
    const now = new Date('2026-07-17T00:00:00.000Z');
    const task = { id: 'verify-1', status: 'processing', attempts: 1, locked_at: now.toISOString(), sync_operation: 'create' };
    const store = createTaskStore(task);
    const result = await executeClaimedSyncTask({
      supabase: store.supabase,
      task,
      customer,
      sync: async () => ({ success: false, category: 'verification_required', safeMessage: 'Google may have created the contact. Verification is required before any further create attempt.' }),
      now: () => now,
    });
    expect(result.success).toBe(false);
    expect(store.state).toMatchObject({ status: 'verification_required', attempts: 1, locked_at: null });
  });

  it('rechecks verification-required CREATE work with search only and marks only a confirmed match synced', async () => {
    const now = new Date('2026-07-17T00:00:00.000Z');
    const task = { id: 'verify-2', status: 'verification_required', attempts: 1, locked_at: null, sync_payload: customer, sync_operation: 'create' };
    const store = createTaskStore(task);
    const createContact = vi.fn();
    const result = await recheckVerificationRequiredSyncTask({
      supabase: store.supabase,
      task,
      googleClient: { people: { searchContacts: vi.fn().mockResolvedValueOnce({ data: { results: [] } }).mockResolvedValueOnce({ data: { results: [{ person: { resourceName: 'people/confirmed', phoneNumbers: [{ value: '+61 400 000 000' }] } }] } }), createContact } },
      now: () => now,
    });
    expect(result).toMatchObject({ claimed: true, found: true });
    expect(createContact).not.toHaveBeenCalled();
    expect(store.state).toMatchObject({ status: 'synced', attempts: 1, locked_at: null });
  });

  it('keeps no-match verification work blocked and guards concurrent Recheck calls', async () => {
    const now = new Date('2026-07-17T00:00:00.000Z');
    const task = { id: 'verify-3', status: 'verification_required', attempts: 2, locked_at: null, sync_payload: customer, sync_operation: 'create' };
    const store = createTaskStore(task);
    const searchContacts = vi.fn().mockResolvedValue({ data: { results: [] } });
    const client = { people: { searchContacts, createContact: vi.fn() } };
    const [first, second] = await Promise.all([
      recheckVerificationRequiredSyncTask({ supabase: store.supabase, task, googleClient: client, now: () => now }),
      recheckVerificationRequiredSyncTask({ supabase: store.supabase, task, googleClient: client, now: () => now }),
    ]);
    expect([first, second].filter((result) => result.claimed)).toHaveLength(1);
    expect(store.state).toMatchObject({ status: 'verification_required', attempts: 2, locked_at: null });
    expect(client.people.createContact).not.toHaveBeenCalled();
  });

  it('does not execute Google work when an atomic claim loses', async () => {
    const task = { id: 'task-1', status: 'processing', attempts: 1, locked_at: '2026-07-17T00:00:00.000Z', sync_payload: customer, sync_operation: 'create' };
    const store = createTaskStore({ ...task, status: 'failed', locked_at: null });
    const sync = vi.fn();
    const result = await processQueuedSyncTask({ supabase: store.supabase, task, sync, now: () => new Date('2026-07-17T00:01:00.000Z') });
    expect(result).toEqual({ claimed: false });
    expect(sync).not.toHaveBeenCalled();
  });

  it('clears the lock after both successful and failed executions', async () => {
    const now = new Date('2026-07-17T00:00:00.000Z');
    const successTask = { id: 'task-success', status: 'processing', attempts: 1, locked_at: now.toISOString(), sync_operation: 'create' };
    const successStore = createTaskStore(successTask);
    const success = await executeClaimedSyncTask({ supabase: successStore.supabase, task: successTask, customer, sync: async () => ({ success: true }), now: () => now });
    expect(success.success).toBe(true);
    expect(successStore.state).toMatchObject({ status: 'synced', locked_at: null, attempts: 1 });

    const failedTask = { id: 'task-failed', status: 'processing', attempts: 1, locked_at: now.toISOString(), sync_operation: 'create' };
    const failedStore = createTaskStore(failedTask);
    const failed = await executeClaimedSyncTask({ supabase: failedStore.supabase, task: failedTask, customer, sync: async () => ({ success: false, category: 'network', safeMessage: 'Google connection failed.' }), now: () => now });
    expect(failed.success).toBe(false);
    expect(failedStore.state).toMatchObject({ status: 'failed', locked_at: null, attempts: 1 });
  });
});

describe('offline network guard', () => {
  const originalFetch = global.fetch;
  const originalHttpRequest = http.request;
  const originalHttpsRequest = https.request;
  const originalAxiosAdapter = axios.defaults.adapter;

  afterEach(() => {
    global.fetch = originalFetch;
    http.request = originalHttpRequest;
    https.request = originalHttpsRequest;
    axios.defaults.adapter = originalAxiosAdapter;
  });

  it('blocks unmocked fetch, HTTP, HTTPS, Supabase, and Google network paths', async () => {
    global.fetch = vi.fn(() => { throw new Error('Network guard: fetch blocked'); });
    http.request = vi.fn(() => { throw new Error('Network guard: http blocked'); });
    https.request = vi.fn(() => { throw new Error('Network guard: https blocked'); });
    axios.defaults.adapter = () => Promise.reject(new Error('Network guard: axios blocked'));
    expect(() => global.fetch('https://example.invalid')).toThrow('Network guard');
    expect(() => http.request('http://example.invalid')).toThrow('Network guard');
    expect(() => https.request('https://example.invalid')).toThrow('Network guard');
    await expect(axios.get('https://example.invalid')).rejects.toThrow('Network guard');

    const supabase = createSettingsSupabase(false);
    const googleClient = { people: { searchContacts: vi.fn(), createContact: vi.fn() } };
    await syncCustomerToGoogleContacts(customer, supabase, googleClient);
    expect(googleClient.people.searchContacts).not.toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const guardedSupabase = { from: vi.fn(() => { throw new Error('Network guard: Supabase blocked'); }) };
    const guarded = await syncCustomerToGoogleContacts(customer, guardedSupabase, googleClient);
    expect(guarded).toMatchObject({ success: false, safeMessage: 'Google sync failed.' });
    expect(guardedSupabase.from).toHaveBeenCalledWith('settings');
    expect(googleClient.people.searchContacts).not.toHaveBeenCalled();
  });
});
