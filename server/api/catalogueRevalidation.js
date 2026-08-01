const REPAIR_CATALOGUE_REVALIDATION_TIMEOUT_MS = 3_000;
const REPAIR_CATALOGUE_REVALIDATION_ATTEMPTS = 2;
const STOREFRONT_REVALIDATION_PATH = 'https://www.alimobile.com.au/api/internal/revalidate-repair-catalogue';
const STOCK_ONLY_FIELDS = new Set(['stock', 'minStock', 'status', 'quantity']);
const PUBLIC_MUTATION_FIELDS = new Set([
  'name', 'model', 'device_model', 'category', 'price', 'costPrice', 'quality_grade', 'is_recommended',
]);
const REPAIR_SERVICE_PATTERN = /screen|battery|charging|camera|housing|glass|logic board|speaker|microphone|power button|volume button|flex cable/i;

function canonicalDeviceCategory(brand, model) {
  const value = `${brand || ''} ${model || ''}`.toLowerCase();
  if (/^t\s|ipad|tablet|galaxy tab/.test(value)) return 'tablet';
  if (/^c\s|macbook|laptop/.test(value)) return 'laptop';
  if (/^w\s|watch/.test(value)) return 'watch';
  return 'phone';
}

function cleanBrand(value) {
  return String(value || '').trim().replace(/^[PTCW]\s+/i, '').trim();
}

function extractRepairIdentity(item) {
  if (!item || item.category === 'Accessories') return null;
  const modelParts = String(item.model || '').split('||').map((part) => part.trim()).filter(Boolean);
  const repairType = String(item.category || item.name || '').trim();
  if (modelParts.length < 2 || !REPAIR_SERVICE_PATTERN.test(`${repairType} ${item.name || ''}`)) return null;

  let brand = modelParts[0];
  let model = modelParts.slice(1).join(' ').trim();
  if (/^other$/i.test(brand) && /^[PTCW]\s+/i.test(model)) {
    const match = model.match(/^([PTCW]\s+[^\s]+(?:\s+Pixel|\s+Watch)?)(?:\s+)(.+)$/i);
    if (match) {
      brand = match[1];
      model = match[2];
    }
  }

  const cleanedBrand = cleanBrand(brand);
  if (!cleanedBrand || !model) return null;
  return {
    category: canonicalDeviceCategory(brand, model),
    brand: cleanedBrand,
    model,
    ...(item.device_model ? { modelCode: String(item.device_model).trim() } : {}),
    repairType,
  };
}

function changedPublicFields(before, after) {
  if (!before) return ['topology'];
  const changed = [];
  for (const field of PUBLIC_MUTATION_FIELDS) {
    if (String(before[field] ?? '') !== String(after[field] ?? '')) changed.push(field);
  }
  return changed;
}

function sanitizeCatalogueMutation({ operation, item, before }) {
  const identity = extractRepairIdentity(item || before);
  if (!identity) return null;
  const changedFields = operation === 'update' ? changedPublicFields(before, item) : ['topology'];
  if (operation === 'update' && changedFields.length === 0) return null;
  if (operation === 'update' && changedFields.every((field) => STOCK_ONLY_FIELDS.has(field))) return null;

  const topologyChanged = operation !== 'update' || changedFields.some((field) =>
    field === 'name' || field === 'model' || field === 'category' || field === 'device_model',
  );
  return { operation, ...identity, changedFields, topologyChanged };
}

function sanitizeCatalogueMutations({ operation, items, beforeById = {} }) {
  return (items || [])
    .map((item) => sanitizeCatalogueMutation({ operation, item, before: beforeById[item.id] }))
    .filter(Boolean)
    .slice(0, 50);
}

function isFixedStorefrontDestination(url) {
  return url === STOREFRONT_REVALIDATION_PATH;
}

async function notifyStorefrontRepairCatalogueMutation({
  operation,
  items,
  beforeById,
  fetchImpl = fetch,
  url = process.env.STOREFRONT_CATALOGUE_REVALIDATION_URL,
  secret = process.env.CATALOGUE_REVALIDATION_SECRET,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  const mutations = sanitizeCatalogueMutations({ operation, items, beforeById });
  if (!mutations.length) return false;
  if (!secret || !isFixedStorefrontDestination(url)) {
    console.warn('[Repair catalogue] Storefront revalidation is not configured with the fixed destination.');
    return false;
  }

  for (let attempt = 0; attempt < REPAIR_CATALOGUE_REVALIDATION_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeoutImpl(() => controller.abort(), REPAIR_CATALOGUE_REVALIDATION_TIMEOUT_MS);
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-catalogue-revalidation-secret': secret,
        },
        body: JSON.stringify({ mutations }),
        signal: controller.signal,
      });
      if (response.ok) return true;
    } catch {
      // The inventory mutation already succeeded. Retry once without exposing details or secrets.
    } finally {
      clearTimeoutImpl(timeout);
    }
  }

  console.warn('[Repair catalogue] Storefront revalidation failed after bounded retries.');
  return false;
}

module.exports = {
  REPAIR_CATALOGUE_REVALIDATION_ATTEMPTS,
  REPAIR_CATALOGUE_REVALIDATION_TIMEOUT_MS,
  STOREFRONT_REVALIDATION_PATH,
  extractRepairIdentity,
  sanitizeCatalogueMutation,
  sanitizeCatalogueMutations,
  notifyStorefrontRepairCatalogueMutation,
};
