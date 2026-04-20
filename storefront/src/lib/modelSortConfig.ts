// ─── Release-Date Sorting Engine ─────────────────────────────────────────────
// Config-driven sorting by generation (regex-extracted) and intra-series tier.

type ModelItem = {
  model: string;
  slug: string;
  repairTypes: { slug: string; name: string; price: number }[];
};

// ─── Intra-Series Tier ───────────────────────────────────────────────────────
// Within the same series, sort by tier: Ultra/Pro Max first, standard last.

const INTRA_SERIES_TIER = [
  { keywords: ['ultra', 'pro max'], weight: 0.5 },
  { keywords: ['plus', 'pro'], weight: 0.4 },
  { keywords: ['air'], weight: 0.3 },
  { keywords: ['fe', 'mini', 'lite'], weight: 0.1 }
];
// Base weight explicitly handled below is 0.2
// "e" suffix handled conditionally below.

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract generation number from model name (e.g. "S25 Ultra" -> 25) */
export function extractGenerationNumber(model: string): number {
  const lower = model.toLowerCase();

  // Special catch for M-chips in Macs/iPads to act as generation (M4 = 40)
  const mChip = lower.match(/\bm(\d)\b/);
  if (mChip) return parseInt(mChip[1], 10) * 10;

  // Apple Special Models Hardcoded Generation overrides
  // Suffixes logic handles SE generations accurately
  if (/\bse 3\b/.test(lower) || /\bse \(3/.test(lower) || /\bse 2022\b/.test(lower)) return 13.5;
  if (/\bse 2\b/.test(lower) || /\bse \(2/.test(lower) || /\bse 2020\b/.test(lower)) return 11.5;
  if (/\bse\b/.test(lower) && !/\bse \d\b/.test(lower)) return 6.5; // SE 1st Gen
  
  if (/\bxs max\b/.test(lower)) return 10.3;
  if (/\bxs\b/.test(lower)) return 10.2;
  if (/\bx\b/.test(lower) && !/\bxr\b/.test(lower)) return 10.1;
  if (/\bxr\b/.test(lower)) return 10.0;
  
  if (/\b8 plus\b/.test(lower)) return 8.5;
  if (/\b8\b/.test(lower)) return 8.0;

  if (/\b11\b/.test(lower)) return 11.0;

  const nums = lower.match(/\b\d{1,3}\b/g);
  if (nums) {
    return Math.max(...nums.map(Number));
  }
  return 0;
}

/** Get intra-series tier weight (Ultra > Pro Max, etc). */
function getTierWeight(model: string): number {
  const lower = ` ${model.toLowerCase()} `;
  
  for (const tier of INTRA_SERIES_TIER) {
    for (const kw of tier.keywords) {
      if (lower.includes(` ${kw}`)) return tier.weight;
    }
  }

  // Handle single character 'e' models (like 17e) safely
  if (/\be\b/.test(model.toLowerCase())) return 0.1;

  return 0.2; // Base model
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

    const brand = brandName?.toLowerCase() || '';

    // Apple grouping
    if (lower.includes('iphone')) {
      seriesKey = 'iPhone Series';
    }
    else if (lower.includes('ipad')) {
      if (lower.includes('pro')) seriesKey = 'iPad Pro';
      else if (lower.includes('air')) seriesKey = 'iPad Air';
      else if (lower.includes('mini')) seriesKey = 'iPad Mini';
      else seriesKey = 'iPad';
    }
    else if (lower.includes('watch')) seriesKey = 'Apple Watch Series';
    else if (lower.includes('macbook') || lower.includes('mac')) seriesKey = 'MacBook Series';

    // Nokia grouping
    else if (brand === 'nokia' || lower.includes('nokia')) {
      if (lower.includes('lumia') || /\b(1520|1320|1020|950|930|935|925|920|900|830|825|820|800|735|730|720|650|640)\b/.test(lower)) {
        seriesKey = 'Lumia Series';
      } else if (/\bxr?\d+\b/.test(lower) && !lower.includes('7')) {
        if (/\bx7\b/.test(lower)) seriesKey = 'N Series';
        else seriesKey = 'X Series';
      } else if (/\bc\d+\b/.test(lower)) {
        seriesKey = 'C Series';
      } else if (/\bg\d+\b/.test(lower)) {
        seriesKey = 'G Series';
      } else if (/\b(9 pureview|\d\.\d|\d plus|\b[3-9]\b)\b/.test(lower) || /\bx7\b/.test(lower)) {
        seriesKey = 'N Series';
      } else {
        seriesKey = 'Nokia Other Series';
      }
    }

    // LG grouping
    else if (brand === 'lg' || lower.includes('lg ')) {
      if (/\bg\d+\b/.test(lower)) seriesKey = 'G Series';
      else if (/\bk\d+\b/.test(lower)) seriesKey = 'K Series';
      else seriesKey = 'Other Models';
    }

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
