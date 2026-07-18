const { google } = require('googleapis');
const crypto = require('crypto');

const DEFAULT_GOOGLE_CONTACTS_TIMEOUT_MS = 10000;
const MIN_GOOGLE_CONTACTS_TIMEOUT_MS = 3000;
const MAX_GOOGLE_CONTACTS_TIMEOUT_MS = 30000;
const MAX_SYNC_ATTEMPTS = 5;
const STALE_LOCK_MS = 5 * 60 * 1000;

function getGoogleContactsTimeoutMs(environment = process.env) {
  const value = Number.parseInt(environment.GOOGLE_CONTACTS_TIMEOUT_MS, 10);
  return Number.isFinite(value) && value >= MIN_GOOGLE_CONTACTS_TIMEOUT_MS && value <= MAX_GOOGLE_CONTACTS_TIMEOUT_MS
    ? value
    : DEFAULT_GOOGLE_CONTACTS_TIMEOUT_MS;
}

function syncResult(success, category, safeMessage, action, retryable, code = category) {
  return { success, category, safeMessage, action, retryable, code };
}

function taskCorrelation(taskId) {
  return taskId ? crypto.createHash('sha256').update(String(taskId)).digest('hex').slice(0, 12) : undefined;
}

function reportStage(report, { operation, stage, startedAt, category = 'success', createDispatched = false, correlation }) {
  report('[Google Contacts Sync]', {
    operation,
    stage,
    elapsed_ms: Math.max(0, Date.now() - startedAt),
    category,
    create_dispatched: createDispatched,
    ...(correlation ? { correlation } : {}),
  });
}

function safeFailure(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('timeout')) return syncResult(false, 'timeout', 'Google request timed out.', 'error', true);
  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') return syncResult(false, 'network', 'Google connection failed.', 'error', true);
  if (error?.response?.status === 401 || error?.response?.status === 403) return syncResult(false, 'authentication', 'Google authorization failed.', 'error', false);
  if (error?.response?.status === 429) return syncResult(false, 'rate_limit', 'Google rate limit reached.', 'error', true);
  if (error?.response?.status === 400) return syncResult(false, 'validation', 'Google rejected the contact data.', 'error', false);
  return syncResult(false, 'unknown', 'Google sync failed.', 'error', true);
}

function isAmbiguousCreateFailure(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  const status = Number(error?.response?.status || 0);
  return message.includes('timeout')
    || message.includes('no response')
    || message.includes('aborted')
    || code === 'ECONNRESET'
    || code === 'ECONNABORTED'
    || code === 'ETIMEDOUT'
    || error?.name === 'AbortError'
    || status >= 500;
}

function isDefinitiveCreateFailure(error) {
  const status = Number(error?.response?.status || 0);
  return status === 400 || status === 401 || status === 403 || status === 429
    || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED';
}

function ambiguousCreateResult() {
  return syncResult(false, 'verification_required', 'Google may have created the contact. Verification is required before any further create attempt.', 'verification_required', false);
}

function customerStatusWriteFailure() {
  return syncResult(false, 'customer_status_write_failed', 'Google contact status needs verification.', 'verification_required', false, 'customer_status_write_failed');
}

function queueFinalizeFailure() {
  return syncResult(false, 'queue_finalize_failed', 'Google sync status could not be saved. Verification is required.', 'verification_required', false, 'queue_finalize_failed');
}

function toSyncPayload(customer) {
  return { id: customer.id, name: customer.name || '', phone: customer.phone || '' };
}

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0061')) return `0${digits.slice(4)}`;
  if (digits.startsWith('61')) return `0${digits.slice(2)}`;
  return digits;
}

function findMatchingPerson(results, phone) {
  const normalizedPhone = normalizePhone(phone);
  return (results || []).map((result) => result?.person).find((person) =>
    person?.resourceName
    && (person.phoneNumbers || []).some((number) => normalizePhone(number?.value) === normalizedPhone)
  ) || null;
}

async function searchGoogleContacts(client, normalizedPhone, { warmup = false, operation = 'create', report = console.info, correlation, timeoutMs = DEFAULT_GOOGLE_CONTACTS_TIMEOUT_MS, createDispatched = false } = {}) {
  if (warmup) {
    const startedAt = Date.now();
    try {
      await client.people.searchContacts(
        { query: '', readMask: 'names,phoneNumbers' },
        { timeout: timeoutMs }
      );
      reportStage(report, { operation, stage: 'warmup', startedAt, correlation, createDispatched });
    } catch (error) {
      reportStage(report, { operation, stage: 'warmup', startedAt, category: safeFailure(error).category, correlation, createDispatched });
      throw error;
    }
  }
  const startedAt = Date.now();
  try {
    const search = await client.people.searchContacts(
      { query: normalizedPhone, readMask: 'names,phoneNumbers' },
      { timeout: timeoutMs }
    );
    reportStage(report, { operation, stage: 'phone_search', startedAt, correlation, createDispatched });
    return findMatchingPerson(search.data?.results, normalizedPhone);
  } catch (error) {
    reportStage(report, { operation, stage: 'phone_search', startedAt, category: safeFailure(error).category, correlation, createDispatched });
    throw error;
  }
}

async function isGoogleContactsSyncEnabled(supabase) {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'google_contacts_sync_enabled').maybeSingle();
  return !error && Boolean(data) && (data.value === 'true' || data.value === true);
}

function getGoogleContactsClient(environment = process.env) {
  const clientId = environment.GOOGLE_CLIENT_ID;
  const clientSecret = environment.GOOGLE_CLIENT_SECRET;
  const refreshToken = environment.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const oauth = new google.auth.OAuth2(clientId, clientSecret);
  oauth.setCredentials({ refresh_token: refreshToken });
  return google.people({ version: 'v1', auth: oauth });
}

async function markCustomerSynced(customer, supabase) {
  if (!customer.id) return { ok: true };
  const { error } = await supabase.from('customers').update({ synced_to_google: true }).eq('id', customer.id);
  return error ? { ok: false, code: 'customer_status_write_failed' } : { ok: true };
}

async function syncCustomerToGoogleContacts(customer, supabase, googleClient = null, operation = 'create', environment = process.env, { beforeCreate, report = console.info, correlation } = {}) {
  try {
    if (!await isGoogleContactsSyncEnabled(supabase)) {
      return syncResult(false, 'disabled', 'Google Contacts sync is disabled.', 'skipped', false);
    }
    const client = googleClient || getGoogleContactsClient(environment);
    if (!client?.people) return syncResult(false, 'missing_configuration', 'Google Contacts is not configured.', 'skipped', false);

    const normalizedPhone = normalizePhone(customer.phone);
    const timeoutMs = getGoogleContactsTimeoutMs(environment);
    const person = await searchGoogleContacts(client, normalizedPhone, { warmup: operation === 'create', operation, report, correlation, timeoutMs });
    const requestBody = {
      names: [{ givenName: customer.name || 'Unknown' }],
      phoneNumbers: [{ value: customer.phone, type: 'mobile' }],
    };

    if (!person) {
      if (operation === 'create' && beforeCreate) {
        const barrierStartedAt = Date.now();
        const barrier = await beforeCreate();
        reportStage(report, { operation, stage: 'create_dispatch_barrier', startedAt: barrierStartedAt, category: barrier.ok ? 'success' : barrier.code, correlation });
        if (!barrier.ok) return syncResult(false, 'dispatch_barrier_failed', 'Google create was not dispatched because its safety barrier could not be saved.', 'error', true, 'dispatch_barrier_failed');
      }
      const createStartedAt = Date.now();
      try {
        reportStage(report, { operation, stage: 'create_dispatched', startedAt: createStartedAt, correlation, createDispatched: true });
        await client.people.createContact({ requestBody }, { timeout: timeoutMs });
        reportStage(report, { operation, stage: 'create_response', startedAt: createStartedAt, correlation, createDispatched: true });
      } catch (error) {
        reportStage(report, { operation, stage: 'create_response', startedAt: createStartedAt, category: safeFailure(error).category, correlation, createDispatched: true });
        if (operation === 'create' && (!isDefinitiveCreateFailure(error) || isAmbiguousCreateFailure(error))) return ambiguousCreateResult();
        throw error;
      }
      const startedAt = Date.now();
      const customerStatus = await markCustomerSynced(customer, supabase);
      reportStage(report, { operation, stage: 'customer_status_write', startedAt, category: customerStatus.ok ? 'success' : customerStatus.code, correlation, createDispatched: operation === 'create' });
      if (!customerStatus.ok) return customerStatusWriteFailure();
      return syncResult(true, 'success', 'Contact created.', 'created', false);
    }
    if (operation === 'update' && person.resourceName && typeof client.people.updateContact === 'function') {
      const startedAt = Date.now();
      reportStage(report, { operation, stage: 'update_dispatched', startedAt, correlation });
      await client.people.updateContact({ resourceName: person.resourceName, updatePersonFields: 'names,phoneNumbers', requestBody }, { timeout: timeoutMs });
      const customerStatus = await markCustomerSynced(customer, supabase);
      reportStage(report, { operation, stage: 'customer_status_write', startedAt, category: customerStatus.ok ? 'success' : customerStatus.code, correlation });
      if (!customerStatus.ok) return syncResult(false, 'customer_status_write_failed', 'Google contact status needs verification.', 'error', true, 'customer_status_write_failed');
      return syncResult(true, 'success', 'Contact updated.', 'updated', false);
    }

    const startedAt = Date.now();
    const customerStatus = await markCustomerSynced(customer, supabase);
    reportStage(report, { operation, stage: 'customer_status_write', startedAt, category: customerStatus.ok ? 'success' : customerStatus.code, correlation });
    if (!customerStatus.ok) return operation === 'create' ? customerStatusWriteFailure() : syncResult(false, 'customer_status_write_failed', 'Google contact status needs verification.', 'error', true, 'customer_status_write_failed');
    return syncResult(true, 'success', 'Existing contact confirmed.', 'duplicate', false);
  } catch (error) {
    return safeFailure(error);
  }
}

function isStaleProcessing(task, now) {
  if (task.status !== 'processing' || !task.locked_at) return false;
  return now.getTime() - new Date(task.locked_at).getTime() > STALE_LOCK_MS;
}

function isStaleVerificationLock(task, now) {
  return task.status === 'verification_required' && task.locked_at
    && now.getTime() - new Date(task.locked_at).getTime() > STALE_LOCK_MS;
}

function isRetryEligible(task, now) {
  if (Number(task.attempts || 0) >= MAX_SYNC_ATTEMPTS) return false;
  return task.status === 'pending' || task.status === 'failed' || isStaleProcessing(task, now);
}

async function claimSyncTask({ supabase, task, now }) {
  if (!isRetryEligible(task, now)) return null;

  let query = supabase
    .from('failed_sync_logs')
    .update({ status: 'processing', attempts: Number(task.attempts || 0) + 1, locked_at: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', task.id)
    .eq('status', task.status);
  query = task.locked_at ? query.eq('locked_at', task.locked_at) : query.is('locked_at', null);
  const { data, error } = await query.select();
  if (error || !data?.[0]) return null;
  return data[0];
}

async function establishCreateDispatchBarrier({ supabase, task, now }) {
  const { data, error } = await supabase
    .from('failed_sync_logs')
    .update({ status: 'verification_required', create_dispatch_started_at: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', task.id)
    .eq('status', task.status)
    .eq('locked_at', task.locked_at)
    .select();
  return error || !data?.[0]
    ? { ok: false, code: 'dispatch_barrier_failed' }
    : { ok: true, task: data[0] };
}

async function finalizeSyncTask({ supabase, task, result, now }) {
  const update = result.success
    ? { status: 'synced', error_reason: null, locked_at: null, updated_at: now.toISOString() }
    : result.category === 'verification_required'
      ? { status: 'verification_required', error_reason: `[verification_required] ${result.safeMessage}`, locked_at: null, updated_at: now.toISOString() }
    : { status: 'failed', error_reason: `[${result.category}] ${result.safeMessage}`, locked_at: null, updated_at: now.toISOString() };
  const { data, error } = await supabase
    .from('failed_sync_logs')
    .update(update)
    .eq('id', task.id)
    .eq('status', 'processing')
    .eq('locked_at', task.locked_at)
    .select();
  return error || !data?.[0]
    ? { ok: false, code: 'queue_finalize_failed' }
    : { ok: true, task: data[0] };
}

async function claimVerificationRequiredTask({ supabase, task, now }) {
  if (task.status !== 'verification_required' || (task.locked_at && !isStaleVerificationLock(task, now))) return null;
  let query = supabase
    .from('failed_sync_logs')
    .update({ locked_at: now.toISOString(), updated_at: now.toISOString() })
    .eq('id', task.id)
    .eq('status', 'verification_required');
  query = task.locked_at ? query.eq('locked_at', task.locked_at) : query.is('locked_at', null);
  const { data, error } = await query.select();
  if (error || !data?.[0]) return null;
  return data[0];
}

async function finalizeVerificationRequiredTask({ supabase, task, found, now }) {
  const update = found
    ? { status: 'synced', error_reason: null, locked_at: null, updated_at: now.toISOString() }
    : { status: 'verification_required', error_reason: `[verification_required] ${ambiguousCreateResult().safeMessage}`, locked_at: null, updated_at: now.toISOString() };
  const { data, error } = await supabase
    .from('failed_sync_logs')
    .update(update)
    .eq('id', task.id)
    .eq('status', 'verification_required')
    .eq('locked_at', task.locked_at)
    .select();
  return error || !data?.[0]
    ? { ok: false, code: 'queue_finalize_failed' }
    : { ok: true, task: data[0] };
}

async function recheckVerificationRequiredSyncTask({ supabase, task, googleClient = null, now = () => new Date(), environment = process.env, report = console.info }) {
  const correlation = taskCorrelation(task.id);
  const claimedTask = await claimVerificationRequiredTask({ supabase, task, now: now() });
  if (!claimedTask) return { claimed: false };
  const client = googleClient || getGoogleContactsClient(environment);
  let found = false;
  try {
    if (client?.people) {
      const startedAt = Date.now();
      found = Boolean(await searchGoogleContacts(client, normalizePhone(claimedTask.sync_payload?.phone), { warmup: true, operation: 'create', correlation, report, timeoutMs: getGoogleContactsTimeoutMs(environment), createDispatched: true }));
      reportStage(report, { operation: 'create', stage: 'recheck_search', startedAt, correlation, createDispatched: true });
      if (found) {
        const customerStatus = await markCustomerSynced(claimedTask.sync_payload, supabase);
        if (!customerStatus.ok) {
          const finalTask = await finalizeVerificationRequiredTask({ supabase, task: claimedTask, found: false, now: now() });
          return finalTask.ok ? { claimed: true, found: true, code: customerStatus.code, task: finalTask.task } : { claimed: true, found: true, code: finalTask.code };
        }
      }
    }
  } catch (err) {
    console.error('RECHECK ERROR:', err);
    found = false;
  }
  const finalStartedAt = Date.now();
  const finalTask = await finalizeVerificationRequiredTask({ supabase, task: claimedTask, found, now: now() });
  reportStage(report, { operation: 'create', stage: 'recheck_finalize', startedAt: finalStartedAt, category: finalTask.ok ? 'success' : finalTask.code, correlation, createDispatched: true });
  return finalTask.ok ? { claimed: true, found, task: finalTask.task } : { claimed: true, found, code: finalTask.code };
}

async function executeClaimedSyncTask({ supabase, task, customer, sync = syncCustomerToGoogleContacts, now = () => new Date() }) {
  let activeTask = task;
  const correlation = taskCorrelation(task.id);
  try {
    const result = await sync(customer, supabase, null, task.sync_operation || 'create', process.env, {
      correlation,
      beforeCreate: async () => {
        const barrier = await establishCreateDispatchBarrier({ supabase, task: activeTask, now: now() });
        if (barrier.ok) activeTask = barrier.task;
        return barrier;
      },
    });
    const finalStartedAt = Date.now();
    const finalTask = await finalizeSyncTask({ supabase, task: activeTask, result, now: now() });
    reportStage(console.info, { operation: task.sync_operation || 'create', stage: 'queue_finalize', startedAt: finalStartedAt, category: finalTask.ok ? 'success' : finalTask.code, correlation, createDispatched: Boolean(activeTask.create_dispatch_started_at) });
    return finalTask.ok
      ? { success: result.success, result, task: finalTask.task }
      : { success: false, result: queueFinalizeFailure(), code: finalTask.code };
  } catch {
    const result = syncResult(false, 'unknown', 'Google sync failed.', 'error', true);
    const finalTask = await finalizeSyncTask({ supabase, task: activeTask, result, now: now() });
    return finalTask.ok ? { success: false, result, task: finalTask.task } : { success: false, result: queueFinalizeFailure(), code: finalTask.code };
  }
}

async function processQueuedSyncTask({ supabase, task, sync, now = () => new Date() }) {
  const claimedTask = await claimSyncTask({ supabase, task, now: now() });
  if (!claimedTask) return { claimed: false };
  return executeClaimedSyncTask({ supabase, task: claimedTask, customer: claimedTask.sync_payload, sync, now });
}

function scheduleGoogleContactTask({ supabase, task, sync, schedule, report }) {
  try {
    schedule(() => {
      processQueuedSyncTask({ supabase, task, sync }).catch(() => {
        report('[Google Contacts Sync] Background task failed.');
      });
    });
    return true;
  } catch {
    report('[Google Contacts Sync] Background scheduling failed; task remains pending.');
    return false;
  }
}

async function enqueueGoogleContactSync({ customer, operation, supabase, triggerBackground = true, schedule = queueMicrotask, sync, report = console.warn }) {
  if (!customer?.id || (operation !== 'create' && operation !== 'update')) {
    return { queued: false, deduplicated: false };
  }
  const payload = toSyncPayload(customer);
  const { data, error } = await supabase
    .from('failed_sync_logs')
    .insert([{ customer_id: customer.id, sync_operation: operation, sync_payload: payload, status: 'pending', attempts: 0, locked_at: null }])
    .select();

  if (error?.code === '23505') {
    const { data: existing, error: existingError } = await supabase
      .from('failed_sync_logs')
      .select('id, status, attempts, locked_at, sync_payload, sync_operation')
      .eq('customer_id', customer.id)
      .eq('sync_operation', operation)
      .or(`status.in.(pending,processing,verification_required),and(status.eq.failed,attempts.lt.${MAX_SYNC_ATTEMPTS})`)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingError || !existing) throw new Error('Unable to refresh Google sync task.');

    const { data: refreshed, error: refreshError } = await supabase
      .from('failed_sync_logs')
      .update({ sync_payload: payload, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .eq('status', existing.status)
      .eq('attempts', existing.attempts)
      .select();
    if (refreshError || !refreshed?.[0]) throw new Error('Unable to refresh Google sync task.');

    const backgroundScheduled = triggerBackground && existing.status !== 'verification_required'
      ? scheduleGoogleContactTask({ supabase, task: refreshed[0], sync, schedule, report })
      : false;
    return { queued: false, deduplicated: true, taskId: refreshed[0].id, backgroundScheduled };
  }
  if (error || !data?.[0]) throw new Error('Unable to persist Google sync task.');

  const task = data[0];
  const backgroundScheduled = triggerBackground
    ? scheduleGoogleContactTask({ supabase, task, sync, schedule, report })
    : false;
  return { queued: true, deduplicated: false, taskId: task.id, backgroundScheduled };
}

async function persistGoogleContactSyncTask(args, { enqueue = enqueueGoogleContactSync, report = console.warn } = {}) {
  try {
    return await enqueue(args);
  } catch {
    report('[Google Contacts Sync] Unable to enqueue sync task.');
    return { queued: false, deduplicated: false, persistenceFailed: true };
  }
}

module.exports = {
  DEFAULT_GOOGLE_CONTACTS_TIMEOUT_MS,
  MIN_GOOGLE_CONTACTS_TIMEOUT_MS,
  MAX_GOOGLE_CONTACTS_TIMEOUT_MS,
  getGoogleContactsTimeoutMs,
  reportStage,
  MAX_SYNC_ATTEMPTS,
  STALE_LOCK_MS,
  normalizePhone,
  searchGoogleContacts,
  isGoogleContactsSyncEnabled,
  getGoogleContactsClient,
  syncCustomerToGoogleContacts,
  isStaleProcessing,
  isStaleVerificationLock,
  isRetryEligible,
  claimSyncTask,
  establishCreateDispatchBarrier,
  finalizeSyncTask,
  finalizeVerificationRequiredTask,
  claimVerificationRequiredTask,
  executeClaimedSyncTask,
  processQueuedSyncTask,
  recheckVerificationRequiredSyncTask,
  enqueueGoogleContactSync,
  persistGoogleContactSyncTask,
};
