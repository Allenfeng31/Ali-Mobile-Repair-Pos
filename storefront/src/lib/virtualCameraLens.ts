import { displayBrand, slugify, type ParsedItem, type GroupedService } from './inventoryUtils';
import type { RepairOption } from './api';
import { formatScopedRepairPriceLabel } from './scopedRepairPriceLabel';

export const CAMERA_LENS_REPAIR_SLUG = 'camera-lens-replacement';
export const CAMERA_LENS_REPAIR_NAME = 'Camera Lens Replacement';

export type CameraLensBrandKind = 'samsung' | 'google' | 'oppo' | 'other';

export interface CameraLensModelOption {
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}

function normalizeBrandSlug(brand: string) {
  const slug = slugify(displayBrand(brand));

  if (slug === 'google-pixel' || slug === 'pixel') return 'google';
  return slug;
}

export function getCameraLensBrandKind(brand: string): CameraLensBrandKind | null {
  const slug = normalizeBrandSlug(brand);

  if (slug === 'iphone') return null;
  if (slug === 'samsung') return 'samsung';
  if (slug === 'google') return 'google';
  if (slug === 'oppo') return 'oppo';
  return 'other';
}

export function getCameraLensPrice(brand: string): number {
  const kind = getCameraLensBrandKind(brand);

  if (kind === 'google') return 65;
  if (kind === 'samsung' || kind === 'oppo') return 50;
  return 0;
}

export function getCameraLensPriceLabel(brand: string) {
  const price = getCameraLensPrice(brand);
  return formatScopedRepairPriceLabel(CAMERA_LENS_REPAIR_SLUG, price, price > 0 ? `From $${price}` : 'Quote on Request');
}

export function getVirtualCameraLensId(brand: string, model: string) {
  const kind = getCameraLensBrandKind(brand);
  const brandSlug = normalizeBrandSlug(brand);
  const modelSlug = slugify(model);

  if (kind === 'samsung') return `virtual-camera-lens-samsung-${modelSlug}`;
  if (kind === 'google') return `virtual-camera-lens-google-${modelSlug}`;
  if (kind === 'oppo') return `virtual-camera-lens-oppo-${modelSlug}`;
  return `virtual-camera-lens-${brandSlug}-${modelSlug}`;
}

export function getCameraLensLandingHref(categorySlug: string, brandSlug: string, modelSlug: string) {
  if (categorySlug !== 'phone' || brandSlug === 'iphone') return null;

  if (brandSlug === 'samsung') {
    return `/repairs/phone/samsung/${CAMERA_LENS_REPAIR_SLUG}?model=${encodeURIComponent(modelSlug)}`;
  }

  if (brandSlug === 'google' || brandSlug === 'google-pixel' || brandSlug === 'pixel') {
    return `/repairs/phone/google/${CAMERA_LENS_REPAIR_SLUG}?model=${encodeURIComponent(modelSlug)}`;
  }

  if (brandSlug === 'oppo') {
    return `/repairs/phone/oppo/${CAMERA_LENS_REPAIR_SLUG}?model=${encodeURIComponent(modelSlug)}`;
  }

  return `/repairs/phone/${CAMERA_LENS_REPAIR_SLUG}?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`;
}

export function getVirtualCameraLensRepairOption(categorySlug: string, brandSlug: string): RepairOption | null {
  if (categorySlug !== 'phone' || brandSlug === 'iphone') return null;
  const price = getCameraLensPrice(brandSlug);

  return {
    slug: CAMERA_LENS_REPAIR_SLUG,
    name: CAMERA_LENS_REPAIR_NAME,
    price,
    variants: [],
  };
}

export function withVirtualCameraLensRepairOption(
  repairTypes: RepairOption[],
  categorySlug: string,
  brandSlug: string
) {
  if (repairTypes.some((repair) => repair.slug === CAMERA_LENS_REPAIR_SLUG)) return repairTypes;

  const virtualOption = getVirtualCameraLensRepairOption(categorySlug, brandSlug);
  return virtualOption ? [...repairTypes, virtualOption] : repairTypes;
}

export function withVirtualCameraLensGroupedService(
  services: GroupedService[],
  brand: string,
  model: string,
  category: string
) {
  if (category !== 'phone' || getCameraLensBrandKind(brand) === null) return services;
  if (services.some((service) => slugify(service.service) === CAMERA_LENS_REPAIR_SLUG)) return services;

  const price = getCameraLensPrice(brand);
  const id = getVirtualCameraLensId(brand, model);

  return [
    ...services,
    {
      id: `grouped-${id}`,
      service: CAMERA_LENS_REPAIR_NAME,
      price,
      variants: [
        {
          id,
          quality_grade: price > 0 ? 'Fixed Price' : 'Quote',
          price,
          originalItem: {
            id,
            name: CAMERA_LENS_REPAIR_NAME,
            model,
            brand,
            deviceModel: model,
            service: CAMERA_LENS_REPAIR_NAME,
            price,
            category,
            deviceType: 'phone',
            quality_grade: price > 0 ? 'Fixed Price' : 'Quote',
            is_recommended: false,
          } as unknown as ParsedItem,
        },
      ],
    },
  ];
}

export function buildCameraLensModelOptions(models: CameraLensModelOption[]) {
  return models
    .filter((model) => model.brandSlug !== 'iphone')
    .sort((left, right) =>
      left.brand.localeCompare(right.brand, undefined, { sensitivity: 'base' }) ||
      left.model.localeCompare(right.model, undefined, { numeric: true, sensitivity: 'base' })
    );
}
