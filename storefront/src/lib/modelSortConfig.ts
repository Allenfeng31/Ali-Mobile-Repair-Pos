// ─── Release-Date Sorting Engine ─────────────────────────────────────────────
// Config-driven sorting by release year (newest first) and intra-series tier.

type ModelItem = {
  model: string;
  slug: string;
  repairTypes: { slug: string; name: string; price: number }[];
};

// ─── Release Weight Map ──────────────────────────────────────────────────────
// Higher weight = newer / should appear first. Keyed on lowercase series base.

const RELEASE_WEIGHT_MAP: Record<string, number> = {
  // iPhone
  'iphone 17':  1700,
  'iphone 16':  1600,
  'iphone 15':  1500,
  'iphone se 4': 1580,  // placed between 15 and 16
  'iphone 14':  1400,
  'iphone se 3': 1350,  // between 13 and 14
  'iphone se (3rd gen)': 1350,
  'iphone se (4th gen)': 1580,
  'iphone 13':  1300,
  'iphone 12':  1200,
  'iphone se 2': 1150,  // between 11 and 12
  'iphone se (2nd gen)': 1150,
  'iphone 11':  1100,
  'iphone xr':  1050,
  'iphone xs':  1050,
  'iphone x':   1000,
  'iphone 8':    800,
  'iphone 7':    700,
  'iphone 6':    600,
  'iphone 6s':   650,

  // Samsung Galaxy S
  'galaxy s25':  2500,
  'galaxy s24':  2400,
  'galaxy s23':  2300,
  'galaxy s22':  2200,
  'galaxy s21':  2100,
  'galaxy s20':  2000,
  'galaxy s10':  1900,
  'galaxy s9':   1800,
  'galaxy s8':   1700,

  // Samsung Galaxy Z
  'galaxy z fold 6': 2600,
  'galaxy z fold 5': 2500,
  'galaxy z fold 4': 2400,
  'galaxy z fold 3': 2300,
  'galaxy z flip 6': 2550,
  'galaxy z flip 5': 2450,
  'galaxy z flip 4': 2350,
  'galaxy z flip 3': 2250,

  // Samsung Galaxy A
  'galaxy a55':  1550,
  'galaxy a54':  1450,
  'galaxy a53':  1350,
  'galaxy a35':  1340,
  'galaxy a34':  1240,
  'galaxy a25':  1230,
  'galaxy a15':  1130,

  // Google Pixel
  'pixel 9':     900,
  'pixel 8':     800,
  'pixel 7':     700,
  'pixel 6':     600,

  // Oppo
  'find x7':     700,
  'find x6':     600,
  'find x5':     500,
  'reno 11':     550,
  'reno 10':     450,
  'reno 8':      350,
  'a96':         300,
  'a78':         280,
  'a58':         260,

  // iPad
  'ipad pro 13-inch (m4)':       1340,
  'ipad pro 11-inch (m4)':       1330,
  'ipad pro 12.9-inch (m2)':     1220,
  'ipad pro 11-inch (gen 1-4)':  1200,
  'ipad pro 12.9-inch (gen 3-6)':1210,
  'ipad air m2':                  1250,
  'ipad air m2 (11-inch)':       1250,
  'ipad air m2 (13-inch)':       1245,
  'ipad air 5':                   1150,
  'ipad air 4':                   1100,
  'ipad 10th generation':        1050,
  'ipad 9th generation':         1040,
  'ipad 8th generation':         1030,
  'ipad 7th generation':         1020,
  'ipad 6th generation':         1010,
  'ipad 5th generation':         1000,
  'ipad mini 7 (a17 pro)':       1260,
  'ipad mini 6':                  1160,
  'ipad mini 5':                  1060,
  'ipad mini 4':                   960,

  // MacBook — M-chip hierarchy: M3 > M2 > M1 > Intel
  'macbook pro 14 (m3)':         1300,
  'macbook pro 16 (m3)':         1295,
  'macbook pro 14 (m1/m2/m3)':   1300,
  'macbook pro 16 (m1/m2/m3)':   1295,
  'macbook pro 13 (m1/m2)':      1200,
  'macbook air (m3)':            1290,
  'macbook air 13 (m1/m2/m3)':   1290,
  'macbook air 15 (m2/m3)':      1285,
  'macbook (12-inch retina)':     800,

  // Apple Watch
  'apple watch ultra 2':          1020,
  'apple watch series 10':        1010,
  'apple watch series 9':         1000,
  'apple watch se (2nd gen)':      995,
  'apple watch ultra':             980,
  'apple watch series 8':          970,
  'apple watch series 7':          960,
  'apple watch se (1st gen)':      945,
  'apple watch series 6':          940,
  'apple watch series 5':          930,
  'apple watch series 4':          920,
  'apple watch series 3':          910,
};

// ─── Intra-Series Tier ───────────────────────────────────────────────────────
// Within the same series, sort by tier: Pro Max / Ultra first, standard last.

const INTRA_SERIES_TIER: Record<string, number> = {
  'pro max':  4,
  'ultra':    4,
  'pro':      3,
  'plus':     2,
  'standard': 1,
  'mini':     0,
  'air':      1,
  'se':       0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract a series base name from a model string (e.g. "iPhone 15 Pro Max" → "iphone 15") */
export function extractSeriesBase(model: string): string {
  const lower = model.toLowerCase();

  // Apple Watch — keep full name minus "ultra/se" suffix
  if (lower.startsWith('apple watch')) {
    const m = lower.match(/^(apple watch (?:series \d+|ultra(?: \d+)?|se(?: \(.*?\))?))/);
    return m ? m[1].replace(/\s+(ultra( \d+)?|se( \(.*?\))?)$/, '').trim() : lower;
  }

  // Strip tier suffixes and parenthetical specs
  let base = lower
    .replace(/\s+(pro\s+max|ultra|pro|plus|mini|air)\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .trim();

  // If base is just the brand without numbers and original had numbers, keep original
  if (base === lower.replace(/\s*\(.*?\)/g, '').trim()) {
    return base;
  }

  return base;
}

/** Get release weight for a model. Tries exact match first, then series base. */
function getReleaseWeight(model: string): number {
  const lower = model.toLowerCase();

  // Exact match
  if (RELEASE_WEIGHT_MAP[lower] !== undefined) return RELEASE_WEIGHT_MAP[lower];

  // Try series base match (e.g. "iPhone 15 Pro Max" → lookup "iphone 15")
  const base = extractSeriesBase(model);
  if (RELEASE_WEIGHT_MAP[base] !== undefined) return RELEASE_WEIGHT_MAP[base];

  // Fallback: extract largest number from the name
  const nums = model.match(/\b(\d{1,3})\b/g);
  if (nums) return Math.max(...nums.map(Number));

  return 0;
}

/** Get intra-series tier weight (Pro Max > Pro > Plus > standard). */
function getTierWeight(model: string): number {
  const lower = model.toLowerCase();
  for (const [tier, weight] of Object.entries(INTRA_SERIES_TIER)) {
    if (tier === 'standard') continue;
    if (lower.includes(tier)) return weight;
  }
  return INTRA_SERIES_TIER['standard']; // base/standard model
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Sort models by release date (newest first), then by tier (highest first). */
export function smartSortModels(models: ModelItem[]): ModelItem[] {
  return [...models].sort((a, b) => {
    const weightDiff = getReleaseWeight(b.model) - getReleaseWeight(a.model);
    if (weightDiff !== 0) return weightDiff;
    return getTierWeight(b.model) - getTierWeight(a.model);
  });
}

/** Group models into series blocks (e.g. "iPhone 15 Series"). */
export function groupModelsBySeries(
  models: ModelItem[]
): { series: string; models: ModelItem[] }[] {
  const groupOrder: string[] = [];
  const groups: Record<string, ModelItem[]> = {};

  for (const entry of models) {
    const base = extractSeriesBase(entry.model);

    // Build a display series name: capitalize first letter of each word + " Series"
    const displayBase = base
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const seriesKey = `${displayBase} Series`;

    if (!groups[seriesKey]) {
      groups[seriesKey] = [];
      groupOrder.push(seriesKey);
    }
    groups[seriesKey].push(entry);
  }

  return groupOrder.map(series => ({ series, models: groups[series] }));
}
