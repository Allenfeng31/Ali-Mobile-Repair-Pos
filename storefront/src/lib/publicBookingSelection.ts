import type { RepairCatalog, RepairOption } from './publicRepairCataloguePolicy';
import { CAMERA_LENS_REPAIR_SLUG, getCameraLensPrice, withVirtualCameraLensRepairOption } from './virtualCameraLens';
import { withVirtualPhoneRepairOptions } from './virtualPhoneRepairs';

export interface PublicBookingSelectionInput {
  category?: string | null;
  brandSlug?: string | null;
  modelSlug?: string | null;
  serviceSlug?: string | null;
  brand?: string | null;
  model?: string | null;
  service?: string | null;
}

export interface PublicBookingSelection {
  category: string;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  service: string;
  serviceSlug: string;
  price: number;
  priceAuthority: PublicBookingPriceAuthority;
}

export type PublicBookingPriceAuthority =
  | 'exact-pos'
  | 'exact-pos-variant'
  | 'fixed-camera-lens'
  | 'quote-only';

const GENERIC_CAMERA_MODULE_SERVICES = {
  'front-camera-replacement': 'Front Camera Replacement',
  'back-camera-replacement': 'Back Camera Replacement',
} as const;

const GENERIC_CAMERA_MODULE_EXCLUDED_BRANDS = new Set([
  'iphone',
  'apple',
  'samsung',
  'google-pixel',
  'google',
  'pixel',
  'oppo',
]);

export function isGenericCameraModuleBookingEligible(category: string, brandSlug: string) {
  return category === 'phone' && !GENERIC_CAMERA_MODULE_EXCLUDED_BRANDS.has(brandSlug);
}

function repairOptions(category: string, brandSlug: string, repairs: RepairOption[]) {
  return withVirtualPhoneRepairOptions(
    withVirtualCameraLensRepairOption(repairs, category, brandSlug),
    category,
    brandSlug,
  );
}

function positivePrice(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function resolvePriceAuthority(repair: RepairOption, brandSlug: string): Pick<PublicBookingSelection, 'price' | 'priceAuthority'> {
  const cameraLensPrice = repair.slug === CAMERA_LENS_REPAIR_SLUG ? getCameraLensPrice(brandSlug) : 0;
  if (cameraLensPrice > 0) {
    return { price: cameraLensPrice, priceAuthority: 'fixed-camera-lens' };
  }

  if (repair.repairOrigin !== 'pos') {
    return { price: repair.price, priceAuthority: 'quote-only' };
  }

  const validVariants = (repair.variants ?? []).flatMap((variant) => {
    const price = positivePrice(variant.price);
    return price === null ? [] : [price];
  });

  if (validVariants.length === 1) {
    return { price: validVariants[0], priceAuthority: 'exact-pos-variant' };
  }

  if (validVariants.length > 1) {
    return { price: repair.price, priceAuthority: 'quote-only' };
  }

  const price = positivePrice(repair.price);
  return price === null
    ? { price: repair.price, priceAuthority: 'quote-only' }
    : { price, priceAuthority: 'exact-pos' };
}

function resolvedSelection(
  category: string,
  brand: { brand: string; slug: string },
  model: { model: string; slug: string; repairTypes: RepairOption[] },
  repair: RepairOption,
): PublicBookingSelection {
  return {
    category,
    brand: brand.brand,
    brandSlug: brand.slug,
    model: model.model,
    modelSlug: model.slug,
    service: repair.name,
    serviceSlug: repair.slug,
    ...resolvePriceAuthority(repair, brand.slug),
  };
}

function resolveGenericCameraModuleQuote(
  category: string,
  brand: { brand: string; slug: string },
  model: { model: string; slug: string },
  serviceSlug: string,
): PublicBookingSelection | null {
  if (!isGenericCameraModuleBookingEligible(category, brand.slug)) return null;

  const service = GENERIC_CAMERA_MODULE_SERVICES[serviceSlug as keyof typeof GENERIC_CAMERA_MODULE_SERVICES];
  if (!service) return null;

  return {
    category,
    brand: brand.brand,
    brandSlug: brand.slug,
    model: model.model,
    modelSlug: model.slug,
    service,
    serviceSlug,
    price: 0,
    priceAuthority: 'quote-only',
  };
}

function hasAny(values: Array<string | null | undefined>) {
  return values.some((value) => value !== null && value !== undefined);
}

function hasAll(values: Array<string | null | undefined>) {
  return values.every((value) => typeof value === 'string' && value.length > 0);
}

/**
 * Resolves a booking query against the public repair catalogue only. Canonical
 * identity is authoritative; display-only links are accepted only when they
 * describe exactly one public catalogue repair.
 */
export function resolvePublicBookingSelection(
  catalog: Pick<RepairCatalog, 'brands'>,
  input: PublicBookingSelectionInput,
): PublicBookingSelection | null {
  const canonical = [input.brandSlug, input.modelSlug, input.serviceSlug];
  const hasCanonical = hasAny(canonical);

  if (hasCanonical) {
    if (!hasAll([input.category, ...canonical])) return null;

    const brand = catalog.brands.find((candidate) =>
      candidate.category === input.category && candidate.slug === input.brandSlug,
    );
    if (!brand) return null;

    const model = brand.models.find((candidate) => candidate.slug === input.modelSlug);
    if (!model) return null;

    const repair = repairOptions(brand.category, brand.slug, model.repairTypes).find(
      (candidate) => candidate.slug === input.serviceSlug,
    );
    const selection = repair
      ? resolvedSelection(brand.category, brand, model, repair)
      : resolveGenericCameraModuleQuote(brand.category, brand, model, input.serviceSlug!);
    if (!selection) return null;
    if (
      (input.brand !== null && input.brand !== undefined && input.brand !== selection.brand) ||
      (input.model !== null && input.model !== undefined && input.model !== selection.model) ||
      (input.service !== null && input.service !== undefined && input.service !== selection.service)
    ) return null;

    return selection;
  }

  if (!hasAll([input.brand, input.model, input.service])) return null;

  const matches: PublicBookingSelection[] = [];
  for (const brand of catalog.brands) {
    if (input.category && brand.category !== input.category) continue;
    if (brand.brand !== input.brand) continue;

    for (const model of brand.models) {
      if (model.model !== input.model) continue;
      const repair = repairOptions(brand.category, brand.slug, model.repairTypes).find(
        (candidate) => candidate.name === input.service,
      );
      if (repair) matches.push(resolvedSelection(brand.category, brand, model, repair));
    }
  }

  return matches.length === 1 ? matches[0] : null;
}

export function getPublicBookingServiceKey(selection: Pick<PublicBookingSelection, 'category' | 'brandSlug' | 'modelSlug' | 'serviceSlug'>) {
  return `public-booking:${selection.category}:${selection.brandSlug}:${selection.modelSlug}:${selection.serviceSlug}`;
}
