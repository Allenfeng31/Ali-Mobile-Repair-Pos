// ─── Release-Date Sorting Engine ─────────────────────────────────────────────
// Config-driven sorting by generation (regex-extracted) and intra-series tier.

type ModelItem = {
  model: string;
  slug: string;
  repairTypes: { slug: string; name: string; price: number }[];
};

// ─── Intra-Series Tier ───────────────────────────────────────────────────────
// Within the same series, sort by tier: Ultra/Pro Max first, standard last.

// (INTRA_SERIES_TIER map is no longer required due to explicit rules in getTierWeight)

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract generation number from model name (e.g. "S25 Ultra" -> 25) */
export function extractGenerationNumber(model: string): number {
  // Strip AU model codes in parentheses to avoid numerical noise (e.g. "SM-X930" -> ignored)
  const cleanModel = model.replace(/\s*\([^)]*\)/g, '').trim();
  const lower = cleanModel.toLowerCase();

  // Special catch for M-chips in Macs/iPads to act as generation (M4 = 40)
  const mChip = lower.match(/\bm(\d)\b/);
  if (mChip) return parseInt(mChip[1], 10) * 10;

  // Apple Special Models Hardcoded Generation overrides
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

  // Generic extraction logic: find the highest numerical sequence.
  // Instead of requiring \b boundaries which fail on "S20", we extract all numbers.
  const nums = lower.match(/\d+(\.\d+)?/g);
  if (nums) {
    return Math.max(...nums.map(Number));
  }
  return 0;
}

/** Get intra-series tier weight (Ultra > Pro Max, etc). */
function getTierWeight(model: string): number {
  const lower = ` ${model.toLowerCase()} `;
  
  // Weight 4: 'ultra', 'pro max'
  if (lower.includes(' ultra ') || lower.includes(' pro max ')) return 4;
  
  // Weight 3: 'plus', 'pro'
  if (lower.includes(' plus ') || lower.includes(' pro ')) return 3;
  
  // Weight 1: 'fe', 'air', 'e', 'mini', 'lite', 's'
  if (
    lower.includes(' fe ') || 
    lower.includes(' air ') || 
    lower.includes(' mini ') || 
    lower.includes(' lite ') ||
    /\be\b/.test(model.toLowerCase()) || // Safely handle single "e"
    /\bs\b/.test(model.toLowerCase())    // Safely handle single "s"
  ) {
    return 1;
  }

  // Weight 2: Base Model (no specific lower/higher tier suffix)
  return 2;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Sort models by generation number (highest first), then by tier (highest first). */
export function smartSortModels(models: ModelItem[]): ModelItem[] {
  // Pre-calculate generation and suffixWeight to ensure stability and efficiency
  const mappedModels = models.map(m => ({
    ...m,
    generation: extractGenerationNumber(m.model),
    suffixWeight: getTierWeight(m.model)
  }));

  mappedModels.sort((a, b) => {
    // 1. Primary condition: Sort by generation descending (larger numbers first)
    if (b.generation !== a.generation) {
      return b.generation - a.generation;
    }
    // 2. Secondary condition: If generations match, sort by suffix weight descending
    return b.suffixWeight - a.suffixWeight;
  });

  return mappedModels;
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

    // Samsung Tablets (Higher priority than phone S/A series)
    const isSamsungBrand = brand.includes('samsung');
    if (isSamsungBrand && lower.includes('galaxy tab')) {
      if (/\btab\s+s/i.test(lower)) seriesKey = 'Galaxy Tab S Series';
      else if (/\btab\s+a/i.test(lower)) seriesKey = 'Galaxy Tab A Series';
      else seriesKey = 'Galaxy Tab Series';
    }
    // Lenovo grouping
    else if (brand.includes('lenovo') || lower.includes('lenovo')) {
      if (/\btab\s+p/i.test(lower)) seriesKey = 'Lenovo Tab P Series';
      else if (/\btab\s+m/i.test(lower)) seriesKey = 'Lenovo Tab M Series';
      else if (lower.includes('yoga')) seriesKey = 'Lenovo Yoga Tab Series';
      else seriesKey = 'Lenovo Other Series';
    }
    // Generic Samsung phone series
    else if (lower.includes('galaxy z') || lower.includes('fold') || lower.includes('flip')) seriesKey = 'Galaxy Z Series';
    else if (/galaxy s\d+/.test(lower) || (isSamsungBrand && /\bs\d+/.test(lower))) seriesKey = 'Galaxy S Series';
    else if (/galaxy a\d+/.test(lower) || (isSamsungBrand && /\ba\d+/.test(lower))) seriesKey = 'Galaxy A Series';
    else if (lower.includes('note')) seriesKey = 'Galaxy Note Series';
    else if (isSamsungBrand && (lower.includes('galaxy j') || /\bj\d+/.test(lower))) seriesKey = 'Galaxy J Series';

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
