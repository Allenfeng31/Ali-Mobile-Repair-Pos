import type { BrandEntry } from './publicRepairCataloguePolicy';
import { IPHONE_HARDWARE_CONFIG } from './seo/content/iphone/config';
import { IPAD_MODEL_CONFIG_LIST } from './seo/content/ipad/config';
import { LENOVO_TABLET_MODEL_CONFIG_LIST } from './seo/content/lenovo-tablet/config';
import { SAMSUNG_TABLET_MODEL_CONFIG_LIST } from './seo/content/samsung-tablet/config';
import { APPLE_WATCH_MODELS, getAppleWatchModelDefinition } from './seo/content/apple-watch';
import { MACBOOK_MODELS, getMacBookModelDefinition } from './seo/content/macbook';

export const MOTHERBOARD_REPAIR_SLUG = 'logic-board-repair';
export const MOTHERBOARD_REPAIR_NAME = 'Motherboard & Logic Board Repair';
export const MOTHERBOARD_BOOKING_SERVICE_NAME = 'Logic Board Repair';

type MotherboardDeviceCategory = 'phone' | 'tablet' | 'laptop' | 'watch';

export type MotherboardEligibleDevice = Readonly<{
  category: MotherboardDeviceCategory;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}>;

type QueryValue = string | readonly string[] | undefined;

export type MotherboardModelHubOption = Readonly<{
  slug: string;
  name: string;
  price: number;
  variants?: readonly { quality_grade: string; price: number; is_recommended?: boolean }[];
  sourceType?: 'real' | 'virtual' | 'diagnostic';
  href?: string;
  priceLabel?: string;
}>;

const BOARD_FAMILY_REPAIR_SLUGS = new Set([
  'logic-board-repair',
  'logic-board-replacement',
  'logic-board',
  'motherboard-repair',
  'motherboard-replacement',
]);

function isSingleSlug(value: QueryValue): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isMotherboardDeviceCategory(value: string): value is MotherboardDeviceCategory {
  return ['phone', 'tablet', 'laptop', 'watch'].includes(value);
}

export function isMotherboardEligibleCategory(category: string, brandSlug: string) {
  return category === 'phone'
    || (category === 'tablet' && ['ipad', 'samsung', 'lenovo'].includes(brandSlug))
    || (category === 'laptop' && brandSlug === 'macbook')
    || (category === 'watch' && brandSlug === 'apple');
}

/**
 * The existing Phase D Model Hub card remains limited to its approved Phone
 * and MacBook surface. The broader assessment selector is intentionally
 * independent so tablet and watch eligibility does not change Model Hub
 * presentation before that work is explicitly approved.
 */
function isMotherboardModelHubEligibleCategory(category: string, brandSlug: string) {
  return category === 'phone' || (category === 'laptop' && brandSlug === 'macbook');
}

function staticMotherboardEligibleDevices(): MotherboardEligibleDevice[] {
  return [
    ...Object.values(IPHONE_HARDWARE_CONFIG).map(({ modelName, modelSlug }) => ({ category: 'phone' as const, brand: 'iPhone', brandSlug: 'iphone', model: modelName, modelSlug })),
    ...IPAD_MODEL_CONFIG_LIST.map(({ modelName, modelSlug }) => ({ category: 'tablet' as const, brand: 'iPad', brandSlug: 'ipad', model: modelName, modelSlug })),
    ...SAMSUNG_TABLET_MODEL_CONFIG_LIST.map(({ modelName, modelSlug }) => ({ category: 'tablet' as const, brand: 'Samsung', brandSlug: 'samsung', model: modelName, modelSlug })),
    ...LENOVO_TABLET_MODEL_CONFIG_LIST.map(({ modelName, modelSlug }) => ({ category: 'tablet' as const, brand: 'Lenovo', brandSlug: 'lenovo', model: modelName, modelSlug })),
    ...MACBOOK_MODELS.flatMap((modelSlug) => {
      const model = getMacBookModelDefinition(modelSlug);
      return model ? [{ category: 'laptop' as const, brand: 'MacBook', brandSlug: 'macbook', model: model.modelName, modelSlug: model.modelSlug }] : [];
    }),
    ...APPLE_WATCH_MODELS.flatMap((modelSlug) => {
      const model = getAppleWatchModelDefinition(modelSlug);
      return model ? [{ category: 'watch' as const, brand: 'Apple Watch', brandSlug: 'apple', model: model.modelName, modelSlug: model.modelSlug }] : [];
    }),
  ];
}

function canonicalMotherboardBrandSlug(category: string, brandSlug: string) {
  return category === 'watch' && brandSlug === 'apple-watch' ? 'apple' : brandSlug;
}

function uniqueMotherboardDevices(devices: readonly MotherboardEligibleDevice[]) {
  const byIdentity = new Map<string, MotherboardEligibleDevice>();
  for (const device of devices) {
    const key = `${device.category}:${device.brandSlug}:${device.modelSlug}`;
    if (!byIdentity.has(key)) byIdentity.set(key, device);
  }
  return [...byIdentity.values()].sort((left, right) => (
    `${left.category}/${left.brand}/${left.model}`.localeCompare(
      `${right.category}/${right.brand}/${right.model}`,
      undefined,
      { numeric: true, sensitivity: 'base' },
    )
  ));
}

export function getMotherboardMasterModelHubHref(category: string, brandSlug: string, modelSlug: string) {
  if (!isMotherboardEligibleCategory(category, brandSlug) || !isSingleSlug(brandSlug) || !isSingleSlug(modelSlug)) {
    return null;
  }

  return `/repairs/motherboard-repair?${new URLSearchParams({
    category,
    brand: brandSlug,
    model: modelSlug,
  }).toString()}`;
}

function isBoardFamilyRepair(option: MotherboardModelHubOption) {
  return BOARD_FAMILY_REPAIR_SLUGS.has(option.slug.trim().toLowerCase());
}

function motherboardMasterModelHubOption(category: string, brandSlug: string, modelSlug: string): MotherboardModelHubOption {
  return Object.freeze({
    slug: MOTHERBOARD_REPAIR_SLUG,
    name: MOTHERBOARD_REPAIR_NAME,
    price: 0,
    priceLabel: 'Quote on Request',
    href: getMotherboardMasterModelHubHref(category, brandSlug, modelSlug)!,
  });
}

/**
 * Gives every eligible public Model Hub exactly one quote-only Motherboard
 * Master card. Existing board-family cards are replaced in place; missing
 * rows are appended and then receive the established Model Hub display order.
 */
export function withMotherboardMasterModelHubOption<T extends MotherboardModelHubOption>(
  repairOptions: readonly T[],
  category: string,
  brandSlug: string,
  modelSlug: string,
): readonly (T | MotherboardModelHubOption)[] {
  if (!isMotherboardModelHubEligibleCategory(category, brandSlug) || !getMotherboardMasterModelHubHref(category, brandSlug, modelSlug)) return repairOptions;

  let addedMotherboard = false;
  const options = repairOptions.flatMap((option) => {
    if (!isBoardFamilyRepair(option)) return [option];
    if (addedMotherboard) return [];
    addedMotherboard = true;
    return [motherboardMasterModelHubOption(category, brandSlug, modelSlug)];
  });

  return addedMotherboard
    ? options
    : [...options, motherboardMasterModelHubOption(category, brandSlug, modelSlug)];
}

export function getMotherboardEligibleDevices(brands: readonly BrandEntry[]): MotherboardEligibleDevice[] {
  const catalogueDevices = brands.flatMap((brand) => {
    const brandSlug = canonicalMotherboardBrandSlug(brand.category, brand.slug);
    if (!isMotherboardEligibleCategory(brand.category, brandSlug)) return [];

    return brand.models.map((model) => ({
      category: brand.category as MotherboardEligibleDevice['category'],
      brand: brand.brand,
      brandSlug,
      model: model.model,
      modelSlug: model.slug,
    }));
  });

  return uniqueMotherboardDevices([...staticMotherboardEligibleDevices(), ...catalogueDevices]);
}

/** Validates the complete selected-device query against the assessment eligibility authority. */
export function resolveMotherboardSelection(
  brands: readonly BrandEntry[],
  query: Readonly<{ category?: QueryValue; brand?: QueryValue; model?: QueryValue }>,
): MotherboardEligibleDevice | null {
  const { category, brand, model } = query;
  if (!isSingleSlug(category) || !isSingleSlug(brand) || !isSingleSlug(model)) return null;
  if (!isMotherboardDeviceCategory(category)) return null;
  if (!isMotherboardEligibleCategory(category, brand)) return null;

  return getMotherboardEligibleDevices(brands).find((device) => (
    device.category === category && device.brandSlug === brand && device.modelSlug === model
  )) ?? null;
}

export function getMotherboardBookingHref(selection: MotherboardEligibleDevice) {
  const params = new URLSearchParams({
    category: selection.category,
    brand: selection.brand,
    model: selection.model,
    service: MOTHERBOARD_BOOKING_SERVICE_NAME,
    brandSlug: selection.brandSlug,
    modelSlug: selection.modelSlug,
    serviceSlug: MOTHERBOARD_REPAIR_SLUG,
  });

  return `/book-repair?${params.toString()}`;
}
