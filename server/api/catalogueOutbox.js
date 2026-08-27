const MAX_CATALOGUE_OUTBOX_ATTEMPTS = 5;
const CATALOGUE_OUTBOX_LEASE_MS = 90_000;
const crypto = require('node:crypto');

function repairIdentity(item) {
  if (!item || item.category === 'Accessories') return null;
  const parts = String(item.model || '').split('||').map((value) => value.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const repairType = String(item.category || item.name || '').trim();
  if (!/screen|battery|charging|camera|housing|glass|logic board|speaker|microphone|power button|volume button|flex cable/i.test(`${repairType} ${item.name || ''}`)) return null;
  const rawBrand = parts[0].replace(/^[PTCW]\s+/i, '').trim();
  const model = parts.slice(1).join(' ').trim();
  if (!rawBrand || !model) return null;
  const raw = `${parts[0]} ${model}`.toLowerCase();
  const category = /^t\s|ipad|tablet|galaxy tab/.test(raw) ? 'tablet' : /^c\s|macbook|laptop/.test(raw) ? 'laptop' : /^w\s|watch/.test(raw) ? 'watch' : 'phone';
  return { category, brand: rawBrand, model, ...(item.device_model ? { modelCode: String(item.device_model).trim() } : {}), repairType };
}

function changedFields(before, after) {
  if (!before || !after) return ['topology'];
  const fields = ['name', 'model', 'device_model', 'category', 'price', 'costPrice', 'quality_grade', 'is_recommended', 'status', 'is_active', 'active', 'hidden', 'published', 'is_published', 'visibility'];
  return fields.filter((field) => String(before[field] ?? '') !== String(after[field] ?? ''));
}

function toMutation(operation, before, after) {
  const identity = repairIdentity(after || before);
  if (!identity) return null;
  const fields = operation === 'update' ? changedFields(before, after) : ['topology'];
  if (operation === 'update' && fields.length === 0) return null;
  const isRetired = operation === 'delete' || after?.is_active === false || after?.active === false || after?.hidden === true || after?.published === false || after?.is_published === false || ['inactive', 'hidden', 'unpublished', 'archived'].includes(String(after?.status || after?.visibility || '').toLowerCase());
  return { operation, ...identity, changedFields: fields, topologyChanged: operation !== 'update' || fields.some((field) => ['name', 'model', 'device_model', 'category', 'status', 'is_active', 'active', 'hidden', 'published', 'is_published', 'visibility'].includes(field)), ...(isRetired ? { retirement: true } : {}) };
}

function buildCatalogueOutboxDelivery(event) {
  const before = toMutation(event.operation, event.before_item, event.after_item);
  const after = event.operation === 'update' ? toMutation(event.operation, event.before_item, event.after_item) : null;
  const mutations = [];
  const previous = event.operation === 'update' ? toMutation('delete', event.before_item, null) : null;
  if (previous && after && ['category', 'brand', 'model', 'repairType'].some((field) => previous[field] !== after[field])) {
    mutations.push(previous);
  }
  if (after || before) mutations.push(after || before);
  return { eventId: event.id, eventVersion: Number(event.sequence), mutations };
}

function calculateRetry({ attempts, now = new Date(), random = Math.random }) {
  if (attempts >= MAX_CATALOGUE_OUTBOX_ATTEMPTS) return { status: 'needs_attention', attempts };
  const seconds = Math.min(60 * 60, 30 * (2 ** attempts));
  return { status: 'pending', attempts: attempts + 1, nextAttemptAt: new Date(now.getTime() + (seconds + Math.floor(random() * 15)) * 1000).toISOString() };
}

async function processCatalogueOutboxBatch({ claim, finalizeSuccess, finalizeFailure, deliver, now = () => new Date(), random = Math.random }) {
  const events = await claim();
  let delivered = 0;
  let failed = 0;
  for (const event of events || []) {
    const delivery = buildCatalogueOutboxDelivery(event);
    if (!delivery.mutations.length) { await finalizeSuccess(event.id); delivered += 1; continue; }
    const result = await deliver(delivery);
    if (result?.ok) { await finalizeSuccess(event.id); delivered += 1; }
    else { await finalizeFailure(event.id, calculateRetry({ attempts: Number(event.attempts || 0) + 1, now: now(), random }), result?.category || 'unknown'); failed += 1; }
  }
  return { claimed: (events || []).length, delivered, failed };
}

async function claimCatalogueOutboxRows({ supabase, now = new Date(), limit = 25 }) {
  const staleBefore = new Date(now.getTime() - CATALOGUE_OUTBOX_LEASE_MS).toISOString();
  const { data, error } = await supabase.from('catalogue_mutation_outbox').select('*')
    .or(`and(status.eq.pending,next_attempt_at.lte.${now.toISOString()}),and(status.eq.processing,locked_at.lte.${staleBefore})`)
    .order('sequence', { ascending: true }).limit(limit);
  if (error) throw new Error('Unable to claim catalogue outbox events.');
  const claimed = [];
  for (const event of data || []) {
    const lockToken = crypto.randomUUID();
    let query = supabase.from('catalogue_mutation_outbox').update({ status: 'processing', locked_at: now.toISOString(), lock_token: lockToken, updated_at: now.toISOString() }).eq('id', event.id);
    query = event.status === 'processing' ? query.eq('status', 'processing').eq('locked_at', event.locked_at) : query.eq('status', 'pending');
    const { data: updated, error: updateError } = await query.select();
    if (!updateError && updated?.[0]) claimed.push(updated[0]);
  }
  return claimed;
}

async function runCatalogueOutboxProcessor({ supabase, deliver, now = () => new Date(), random = Math.random, limit = 100, maxBatches = 20 }) {
  const total = { claimed: 0, delivered: 0, failed: 0 };
  for (let batch = 0; batch < maxBatches; batch += 1) {
    const result = await processCatalogueOutboxBatch({
    claim: () => claimCatalogueOutboxRows({ supabase, now: now(), limit }),
    finalizeSuccess: async (id) => { const { error } = await supabase.from('catalogue_mutation_outbox').update({ status: 'delivered', processed_at: now().toISOString(), locked_at: null, lock_token: null, last_error: null, updated_at: now().toISOString() }).eq('id', id).eq('status', 'processing'); if (error) throw new Error('Unable to finalize catalogue outbox event.'); },
    finalizeFailure: async (id, retry, category) => { const { error } = await supabase.from('catalogue_mutation_outbox').update({ status: retry.status, attempts: retry.attempts, ...(retry.nextAttemptAt ? { next_attempt_at: retry.nextAttemptAt } : {}), locked_at: null, lock_token: null, last_error: `[${category}] delivery failed`, updated_at: now().toISOString() }).eq('id', id).eq('status', 'processing'); if (error) throw new Error('Unable to reschedule catalogue outbox event.'); },
      deliver, now, random,
    });
    total.claimed += result.claimed;
    total.delivered += result.delivered;
    total.failed += result.failed;
    if (result.claimed < limit || result.failed > 0) break;
  }
  return total;
}

module.exports = { MAX_CATALOGUE_OUTBOX_ATTEMPTS, CATALOGUE_OUTBOX_LEASE_MS, repairIdentity, buildCatalogueOutboxDelivery, calculateRetry, processCatalogueOutboxBatch, claimCatalogueOutboxRows, runCatalogueOutboxProcessor };
