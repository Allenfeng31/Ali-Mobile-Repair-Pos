// ─── Release-Date Sorting Engine ─────────────────────────────────────────────
// Config-driven sorting by generation (regex-extracted) and intra-series tier.

type ModelItem = {
  model: string;
  slug: string;
  repairTypes: { slug: string; name: string; price: number }[];
};

// ─── Intra-Series Tier ───────────────────────────────────────────────────────
// Within the same series, sort by tier: Ultra/Pro Max first, standard last.

const INTRA_SERIES_TIER: Record<string, number> = {
  'ultra':    5,
  'pro max':  4,
  'pro':      3,
  'fold':     2,
  'plus':     2,
  'flip':     1,
  'standard': 0,
  'mini':    -1,
  'air':     -1,
  'se':      -2,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract generation number from model name (e.g. "S25 Ultra" -> 25) */
export function extractGenerationNumber(model: string): number {
  const lower = model.toLowerCase();

  // Special catch for M-chips in Macs/iPads to act as generation (M4 = 40)
  const mChip = lower.match(/\bm(\d)\b/);
  if (mChip) return parseInt(mChip[1], 10) * 10;

  const nums = lower.match(/\b\d{1,3}\b/g);
  if (nums) {
    return Math.max(...nums.map(Number));
  }
  return 0;
}

/** Get intra-series tier weight (Ultra > Pro Max, etc). */
function getTierWeight(model: string): number {
  const lower = model.toLowerCase();
  for (const [tier, weight] of Object.entries(INTRA_SERIES_TIER)) {
    if (tier === 'standard') continue;
    if (lower.includes(tier)) return weight;
  }
  return INTRA_SERIES_TIER['standard']; // base/standard model
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Sort models by generation number (highest first), then by tier (highest first). */
export function smartSortModels(models: ModelItem[]): ModelItem[] {
  return [...models].sort((a, b) => {
    const genA = extractGenerationNumber(a.model);
    const genB = extractGenerationNumber(b.model);
    if (genA !== genB) return genB - genA;
    return getTierWeight(b.model) - getTierWeight(a.model);
  });
}

/** Group models into Macro-Series (e.g. "Galaxy S Series", "iPhone Series"). */
export function groupModelsBySeries(
  models: ModelItem[],
  brandName?: string
): { series: string; models: ModelItem[] }[] {
  const groupOrder: string[] = [];
  const groups: Record<string, ModelItem[]> = {};

  for (const entry of models) {
    const lower = entry.model.toLowerCase();
    let seriesKey = 'Other Series';

    // Apple grouping
    if (lower.includes('iphone')) seriesKey = 'iPhone Series';
    else if (lower.includes('ipad')) seriesKey = 'iPad Series';
    else if (lower.includes('watch')) seriesKey = 'Apple Watch Series';
    else if (lower.includes('macbook') || lower.includes('mac')) seriesKey = 'MacBook Series';

    // Samsung grouping
    else if (lower.includes('galaxy z') || lower.includes('fold') || lower.includes('flip')) seriesKey = 'Galaxy Z Series';
    else if (/galaxy s\d+/.test(lower) || /\bs\d+/.test(lower)) seriesKey = 'Galaxy S Series';
    else if (/galaxy a\d+/.test(lower) || /\ba\d+/.test(lower)) seriesKey = 'Galaxy A Series';
    else if (lower.includes('note')) seriesKey = 'Galaxy Note Series';
    else if (lower.includes('galaxy j') || /\bj\d+/.test(lower)) seriesKey = 'Galaxy J Series';
    else if (lower.includes('galaxy tab')) seriesKey = 'Galaxy Tab Series';

    // Google grouping
    else if (lower.includes('pixel')) seriesKey = 'Pixel Series';

    // Huawei grouping
    else if (lower.includes('mate')) seriesKey = 'Mate Series';
    else if (/p\d+/.test(lower) || lower.match(/\bp\s*(pro|plus|lite|smart)\b/)) seriesKey = 'P Series';
    else if (lower.includes('nova')) seriesKey = 'Nova Series';
    else if (lower.includes('y\d+')) seriesKey = 'Y Series';

    // Oppo grouping
    else if (lower.includes('find')) seriesKey = 'Find Series';
    else if (lower.includes('reno')) seriesKey = 'Reno Series';
    else if (/^a\d+/.test(lower) || /\ba\d+/.test(lower)) seriesKey = 'A Series';

    // Xiaomi / Redmi / Poco
    else if (lower.includes('redmi')) seriesKey = 'Redmi Series';
    else if (lower.includes('poco')) seriesKey = 'Poco Series';
    else if (lower.includes('mi ')) seriesKey = 'Mi Series';

    // Fallback
    else if (brandName) {
      seriesKey = `${brandName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Series`;
    }

    if (!groups[seriesKey]) {
      groups[seriesKey] = [];
      groupOrder.push(seriesKey);
    }
    groups[seriesKey].push(entry);
  }

  return groupOrder.map((series) => ({ series, models: groups[series] }));
}
