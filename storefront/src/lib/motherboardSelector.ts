import { groupModelsBySeries, smartSortModels } from './modelSortConfig';
import type { MotherboardEligibleDevice } from './motherboardRepair';

export type MotherboardSelectorModel = MotherboardEligibleDevice & Readonly<{ href: string }>;

export type MotherboardSelectorSeries = Readonly<{
  label: string;
  models: readonly MotherboardSelectorModel[];
}>;

export type MotherboardSelectorBrand = Readonly<{
  brand: string;
  brandSlug: string;
  series: readonly MotherboardSelectorSeries[];
}>;

export type MotherboardSelectorGroup = Readonly<{
  key: string;
  label: string;
  modelCount: number;
  brands: readonly MotherboardSelectorBrand[];
}>;

type GroupDefinition = Readonly<{
  key: string;
  label: string;
  matches: (device: MotherboardEligibleDevice) => boolean;
}>;

const GROUPS: readonly GroupDefinition[] = [
  { key: 'iphone', label: 'iPhone', matches: (device) => device.category === 'phone' && device.brandSlug === 'iphone' },
  { key: 'samsung', label: 'Samsung', matches: (device) => device.category === 'phone' && device.brandSlug === 'samsung' },
  { key: 'google-pixel', label: 'Google Pixel', matches: (device) => device.category === 'phone' && device.brandSlug === 'google-pixel' },
  { key: 'oppo', label: 'OPPO', matches: (device) => device.category === 'phone' && device.brandSlug === 'oppo' },
  { key: 'other-phone', label: 'Other Phone', matches: (device) => device.category === 'phone' && !['iphone', 'samsung', 'google-pixel', 'oppo'].includes(device.brandSlug) },
  { key: 'ipad', label: 'iPad', matches: (device) => device.category === 'tablet' && device.brandSlug === 'ipad' },
  { key: 'samsung-tab', label: 'Samsung Tab', matches: (device) => device.category === 'tablet' && device.brandSlug === 'samsung' },
  { key: 'lenovo', label: 'Lenovo', matches: (device) => device.category === 'tablet' && device.brandSlug === 'lenovo' },
  { key: 'macbook', label: 'MacBook', matches: (device) => device.category === 'laptop' && device.brandSlug === 'macbook' },
  { key: 'apple-watch', label: 'Apple Watch', matches: (device) => device.category === 'watch' && device.brandSlug === 'apple' },
];

function selectionHref(canonicalPath: string, device: MotherboardEligibleDevice) {
  return `${canonicalPath}?${new URLSearchParams({
    category: device.category,
    brand: device.brandSlug,
    model: device.modelSlug,
  }).toString()}`;
}

function buildBrand(deviceList: readonly MotherboardEligibleDevice[], canonicalPath: string): MotherboardSelectorBrand {
  const first = deviceList[0]!;
  const modelsBySlug = new Map(deviceList.map((device) => [device.modelSlug, {
    ...device,
    href: selectionHref(canonicalPath, device),
  }]));
  const sorted = smartSortModels(deviceList.map((device) => ({
    model: device.model,
    slug: device.modelSlug,
    repairTypes: [],
  })));
  const series = groupModelsBySeries(sorted, first.brand).map((group) => ({
    label: group.series,
    models: group.models.map((model) => modelsBySlug.get(model.slug)!).filter(Boolean),
  }));

  return { brand: first.brand, brandSlug: first.brandSlug, series };
}

/** Builds the approved compact Motherboard selector directly from eligible public catalogue devices. */
export function buildMotherboardSelectorGroups(
  devices: readonly MotherboardEligibleDevice[],
  canonicalPath: string,
): readonly MotherboardSelectorGroup[] {
  return GROUPS.map((group) => {
    const groupedByBrand = new Map<string, MotherboardEligibleDevice[]>();
    for (const device of devices.filter(group.matches)) {
      const brandDevices = groupedByBrand.get(device.brandSlug) ?? [];
      brandDevices.push(device);
      groupedByBrand.set(device.brandSlug, brandDevices);
    }
    const brands = [...groupedByBrand.values()]
      .sort((left, right) => left[0]!.brand.localeCompare(right[0]!.brand))
      .map((brandDevices) => buildBrand(brandDevices, canonicalPath));

    return {
      key: group.key,
      label: group.label,
      modelCount: brands.reduce((count, brand) => count + brand.series.reduce((sum, series) => sum + series.models.length, 0), 0),
      brands,
    };
  });
}
