export const IPAD_BRAND_HUB_SERIES_ORDER = ['ipad', 'air', 'mini', 'pro', 'other'] as const;
export const IPAD_REPAIR_TYPE_HUB_SERIES_ORDER = ['ipad', 'air', 'mini', 'pro'] as const;

export const SAMSUNG_TABLET_BRAND_HUB_SERIES_ORDER = ['tab-s', 'tab-a', 'tab-active', 'other'] as const;
export const SAMSUNG_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER = ['tab-s', 'tab-a'] as const;
export const LENOVO_TABLET_BRAND_HUB_SERIES_ORDER = ['tab-p', 'tab-m', 'tab-e', 'yoga', 'other'] as const;
export const LENOVO_TABLET_REPAIR_TYPE_HUB_SERIES_ORDER = ['tab-p', 'tab-m', 'tab-e', 'yoga', 'other'] as const;

const IPAD_BASE_MODEL_SLUGS = new Set([
  'ipad-5th-generation',
  'ipad-6th-generation',
  'ipad-7th-generation',
  'ipad-8th-generation',
  'ipad-9th-generation',
  'ipad-10th-generation',
  'ipad-11th-generation',
]);

export const IPAD_SERIES_LABELS: Record<string, string> = {
  ipad: 'iPad',
  air: 'iPad Air',
  mini: 'iPad mini',
  pro: 'iPad Pro',
  other: 'Other iPad Models',
};

export const SAMSUNG_TABLET_SERIES_LABELS: Record<string, string> = {
  'tab-s': 'Galaxy Tab S Series',
  'tab-a': 'Galaxy Tab A Series',
  'tab-active': 'Galaxy Tab Active Series',
  other: 'Other Samsung Tablets',
};

export const LENOVO_TABLET_SERIES_LABELS: Record<string, string> = {
  'tab-p': 'Lenovo Tab P Series',
  'tab-m': 'Lenovo Tab M Series',
  'tab-e': 'Lenovo Tab E Series',
  yoga: 'Lenovo Yoga Tab Series',
  other: 'Other Lenovo Tablets',
};

export function getIPadSeriesKey(modelName: string, modelSlug: string) {
  const name = modelName.toLowerCase();
  const slug = modelSlug.toLowerCase();

  if (
    IPAD_BASE_MODEL_SLUGS.has(slug) ||
    (name.startsWith('ipad ') &&
      !name.includes('ipad air') &&
      !name.includes('ipad mini') &&
      !name.includes('ipad pro'))
  ) {
    return 'ipad';
  }

  if (name.includes('ipad air') || slug.includes('ipad-air')) return 'air';
  if (name.includes('ipad mini') || slug.includes('ipad-mini')) return 'mini';
  if (name.includes('ipad pro') || slug.includes('ipad-pro')) return 'pro';
  return 'other';
}

export function getSamsungTabletSeriesKey(modelName: string, modelSlug: string) {
  const name = modelName.toLowerCase();
  const slug = modelSlug.toLowerCase();

  if (name.includes('active') || slug.includes('active')) return 'tab-active';
  if (/\btab\s+s/i.test(name) || slug.startsWith('galaxy-tab-s')) return 'tab-s';
  if (/\btab\s+a/i.test(name) || slug.startsWith('galaxy-tab-a')) return 'tab-a';
  return 'other';
}

export function getLenovoTabletSeriesKey(modelName: string, modelSlug: string) {
  const name = modelName.toLowerCase();
  const slug = modelSlug.toLowerCase();

  if (/\btab\s+p/i.test(name) || slug.includes('tab-p')) return 'tab-p';
  if (/\btab\s+m/i.test(name) || slug.includes('tab-m')) return 'tab-m';
  if (/\btab\s+e/i.test(name) || slug.includes('tab-e')) return 'tab-e';
  if (name.includes('yoga') || slug.includes('yoga')) return 'yoga';
  return 'other';
}
