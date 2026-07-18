const express = require('express');
const {
  executeClaimedSyncTask,
  isRetryEligible,
  claimSyncTask,
  recheckVerificationRequiredSyncTask,
} = require('./googleContactsSync.js');

const TASK_FIELDS = 'id, customer_id, sync_payload, sync_operation, status, attempts, error_reason, created_at, updated_at, locked_at';

function toSafeError(errorReason) {
  if (!errorReason) return null;
  if (errorReason.includes('Superseded by a newer active Google Contacts sync task.')) {
    return 'Superseded by a newer sync task.';
  }
  const category = /^\[(timeout|network|authentication|rate_limit|validation|unknown)\]/.exec(errorReason)?.[1];
  if (errorReason.startsWith('[verification_required]')) {
    return 'Google creation outcome needs verification. Automatic recreation is blocked to prevent duplicates.';
  }
  const messages = {
    timeout: 'Google request timed out.',
    network: 'Google connection failed.',
    authentication: 'Google authorization failed.',
    rate_limit: 'Google rate limit reached.',
    validation: 'Google rejected the contact data.',
    unknown: 'Google sync failed.',
  };
  return messages[category] || 'Google sync failed.';
}

function toSafeTask(log) {
  return {
    id: log.id,
    customer_id: log.customer_id,
    customer_name: log.sync_payload?.name || 'Unknown',
    customer_phone: log.sync_payload?.phone || 'Unknown',
    operation: log.sync_operation,
    status: log.status,
    attempts: Number(log.attempts || 0),
    safe_error: toSafeError(log.error_reason),
    created_at: log.created_at,
    updated_at: log.updated_at,
    locked_at: log.locked_at,
  };
}

function createSyncContactsAdminHandlers({ supabase, now = () => new Date() }) {
  return {
    getLogs: async (_req, res) => {
    try {
      const { data: logs, error } = await supabase
        .from('failed_sync_logs')
        .select(TASK_FIELDS)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) return res.status(500).json({ error: 'Unable to load sync tasks.' });
      return res.json((logs || []).map(toSafeTask));
    } catch {
      return res.status(500).json({ error: 'Unable to load sync tasks.' });
    }
    },

    retry: async (req, res) => {
    const taskId = typeof req.body?.taskId === 'string' ? req.body.taskId : '';
    if (!taskId) return res.status(400).json({ error: 'A sync task is required.' });

    try {
      const { data: task, error } = await supabase
        .from('failed_sync_logs')
        .select(TASK_FIELDS)
        .eq('id', taskId)
        .single();

      if (error || !task) return res.status(404).json({ error: 'Sync task not found.' });
      const currentTime = now();
      if (!isRetryEligible(task, currentTime)) {
        return res.status(409).json({ error: 'This sync task is not eligible for retry.' });
      }

      const claimedTask = await claimSyncTask({ supabase, task, now: currentTime });
      if (!claimedTask) return res.status(409).json({ error: 'This sync task was already claimed.' });

      const result = await executeClaimedSyncTask({
        supabase,
        task: claimedTask,
        customer: claimedTask.sync_payload,
      });

      if (result.code) return res.status(502).json({ success: false, code: result.code, error: 'Google sync status could not be saved.' });
      return res.status(result.success ? 200 : 502).json({
        success: result.success,
        task: toSafeTask({ ...claimedTask, ...result.task }),
      });
    } catch {
      return res.status(500).json({ error: 'Unable to retry sync task.' });
    }
    },

    recheck: async (req, res) => {
    const taskId = typeof req.body?.taskId === 'string' ? req.body.taskId : '';
    if (!taskId) return res.status(400).json({ error: 'A sync task is required.' });

    try {
      const { data: task, error } = await supabase
        .from('failed_sync_logs')
        .select(TASK_FIELDS)
        .eq('id', taskId)
        .single();
      if (error || !task) return res.status(404).json({ error: 'Sync task not found.' });
      if (task.status !== 'verification_required' || task.sync_operation !== 'create') {
        return res.status(409).json({ error: 'This sync task does not require Google verification.' });
      }

      const result = await recheckVerificationRequiredSyncTask({ supabase, task, now });
      if (!result.claimed) return res.status(409).json({ error: 'This verification is already in progress.' });
      if (result.code) return res.status(502).json({ success: false, found: result.found, code: result.code, error: 'Google verification status could not be saved.' });
      return res.status(200).json({ success: result.found, task: toSafeTask({ ...task, ...result.task }) });
    } catch {
      return res.status(500).json({ error: 'Unable to recheck Google Contacts.' });
    }
    },
  };
}

function createSyncContactsAdminRouter({ supabase, requireStaffAuth, now = () => new Date() }) {
  const router = express.Router();
  const handlers = createSyncContactsAdminHandlers({ supabase, now });
  router.get('/logs', requireStaffAuth, handlers.getLogs);
  router.post('/retry', requireStaffAuth, handlers.retry);
  router.post('/recheck', requireStaffAuth, handlers.recheck);

  return router;
}

module.exports = { createSyncContactsAdminRouter, createSyncContactsAdminHandlers, toSafeTask };
