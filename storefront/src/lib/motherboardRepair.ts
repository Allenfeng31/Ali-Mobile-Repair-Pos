import type { BrandEntry } from './publicRepairCataloguePolicy';

export const MOTHERBOARD_REPAIR_SLUG = 'logic-board-repair';
export const MOTHERBOARD_REPAIR_NAME = 'Motherboard & Logic Board Repair';
export const MOTHERBOARD_BOOKING_SERVICE_NAME = 'Logic Board Repair';

export type MotherboardEligibleDevice = Readonly<{
  category: 'phone' | 'laptop';
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}>;

type QueryValue = string | readonly string[] | undefined;

function isSingleSlug(value: QueryValue): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isMotherboardEligibleCategory(category: string, brandSlug: string) {
  return category === 'phone' || (category === 'laptop' && brandSlug === 'macbook');
}

export function getMotherboardEligibleDevices(brands: readonly BrandEntry[]): MotherboardEligibleDevice[] {
  return brands.flatMap((brand) => {
    if (!isMotherboardEligibleCategory(brand.category, brand.slug)) return [];

    return brand.models.map((model) => ({
      category: brand.category as MotherboardEligibleDevice['category'],
      brand: brand.brand,
      brandSlug: brand.slug,
      model: model.model,
      modelSlug: model.slug,
    }));
  }).sort((left, right) => (
    `${left.category}/${left.brand}/${left.model}`.localeCompare(
      `${right.category}/${right.brand}/${right.model}`,
      undefined,
      { numeric: true, sensitivity: 'base' },
    )
  ));
}

/** Validates the complete selected-device query against the public catalogue. */
export function resolveMotherboardSelection(
  brands: readonly BrandEntry[],
  query: Readonly<{ category?: QueryValue; brand?: QueryValue; model?: QueryValue }>,
): MotherboardEligibleDevice | null {
  const { category, brand, model } = query;
  if (!isSingleSlug(category) || !isSingleSlug(brand) || !isSingleSlug(model)) return null;
  if (category !== 'phone' && category !== 'laptop') return null;
  if (!isMotherboardEligibleCategory(category, brand)) return null;

  const brandEntry = brands.find((entry) => entry.category === category && entry.slug === brand);
  const modelEntry = brandEntry?.models.find((entry) => entry.slug === model);
  if (!brandEntry || !modelEntry) return null;

  return {
    category,
    brand: brandEntry.brand,
    brandSlug: brandEntry.slug,
    model: modelEntry.model,
    modelSlug: modelEntry.slug,
  };
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
