import {
  resolveRepairDetailPricing,
  type RepairDetailPricing,
} from './repairDetailPricing';
import type { BrandEntry, RepairOption } from './publicRepairCataloguePolicy';
import { evaluateNonIphonePublicRepairPageMode } from './publicRepairPageModePolicy';

export type SharedRepairPageV2PricingStrategy =
  | Readonly<{ mode: 'pos-derived' }>
  | Readonly<{ mode: 'fixed'; fixedPrice: number }>;

const SHARED_REPAIR_PAGE_V2_ACTIVATIONS = Object.freeze([
  { category: 'phone', brandSlug: 'google-pixel', repairSlug: 'loudspeaker-replacement' },
  { category: 'phone', brandSlug: 'google-pixel', repairSlug: 'earpiece-speaker-replacement' },
  { category: 'phone', brandSlug: 'google-pixel', repairSlug: 'power-button-replacement' },
  { category: 'phone', brandSlug: 'google-pixel', repairSlug: 'volume-button-replacement' },
  { category: 'phone', brandSlug: 'google-pixel', repairSlug: 'camera-lens-replacement' },
] as const);

export interface SharedRepairPageSupportedModel {
  category: 'phone';
  canonicalBrandSlug: string;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}

export interface SharedRepairPageCandidate {
  category: SharedRepairPageSupportedModel['category'];
  canonicalBrandSlug: SharedRepairPageSupportedModel['canonicalBrandSlug'];
  brand: SharedRepairPageSupportedModel['brand'];
  brandSlug: SharedRepairPageSupportedModel['brandSlug'];
  model: SharedRepairPageSupportedModel['model'];
  modelSlug: SharedRepairPageSupportedModel['modelSlug'];
  repairSlug: string;
  repairName: string;
  repair: RepairOption;
  pricing: RepairDetailPricing;
}

function getSharedRepairBrand(brands: readonly BrandEntry[], canonicalBrandSlug: string) {
  return brands.find((entry) => entry.category === 'phone' && entry.slug === canonicalBrandSlug) ?? null;
}

/**
 * Shared Page V2 model context is catalogue-and-service based. Hardware/SEO
 * configuration can enrich an eligible model, but cannot determine its visibility.
 */
export function isSharedRepairPageModelEligible({
  category,
  brandSlug,
  modelSlug,
  repairSlug,
}: {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
}) {
  const activation = SHARED_REPAIR_PAGE_V2_ACTIVATIONS.find((entry) => (
    entry.category === category
    && entry.brandSlug === brandSlug
    && entry.repairSlug === repairSlug
  ));
  if (!activation) return false;

  const decision = evaluateNonIphonePublicRepairPageMode({
    category,
    brandSlug,
    modelSlug,
    repairSlug,
    repairOrigin: 'virtual',
    eligibilityEvidence: 'none',
    legacyStatus: 'none',
  });

  return decision.mode === 'shared'
    && decision.routeAvailable
    && decision.target?.scope === 'brand';
}

export function buildSharedRepairPageSupportedModels({
  brands,
  canonicalBrandSlug,
  repairSlug,
}: {
  brands: readonly BrandEntry[];
  canonicalBrandSlug: string;
  repairSlug: string;
}): SharedRepairPageSupportedModel[] {
  const brand = getSharedRepairBrand(brands, canonicalBrandSlug);
  if (!brand) return [];

  return brand.models
    .filter((model) => isSharedRepairPageModelEligible({
      category: brand.category,
      brandSlug: canonicalBrandSlug,
      modelSlug: model.slug,
      repairSlug,
    }))
    .map((model) => ({
      category: 'phone' as const,
      canonicalBrandSlug,
      brand: brand.brand,
      brandSlug: canonicalBrandSlug,
      model: model.model,
      modelSlug: model.slug,
    }))
    .sort((left, right) => left.model.localeCompare(right.model, undefined, { numeric: true, sensitivity: 'base' }));
}

export function buildSharedRepairPageCandidates({
  brands,
  canonicalBrandSlug,
  repairSlug,
  supportedModel,
}: {
  brands: readonly BrandEntry[];
  canonicalBrandSlug: string;
  repairSlug: string;
  supportedModel?: (modelSlug: string) => boolean;
}): SharedRepairPageCandidate[] {
  const brand = getSharedRepairBrand(brands, canonicalBrandSlug);
  if (!brand) return [];

  return brand.models
    .filter((model) => !supportedModel || supportedModel(model.slug))
    .flatMap((model) => {
      const repair = model.repairTypes.find((option) => option.slug === repairSlug);
      if (!repair || repair.repairOrigin !== 'pos') return [];

      return [{
        category: 'phone' as const,
        canonicalBrandSlug,
        brand: brand.brand,
        brandSlug: canonicalBrandSlug,
        model: model.model,
        modelSlug: model.slug,
        repairSlug,
        repairName: repair.name,
        repair,
        pricing: resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants }),
      }];
    })
    .sort((left, right) => left.model.localeCompare(right.model, undefined, { numeric: true, sensitivity: 'base' }));
}

export function getSharedRepairCandidatePriceLabel(candidate: SharedRepairPageCandidate) {
  const price = candidate.pricing.resolvedPrice;
  if (price === null) return 'Quote on Request';

  const amount = Number.isInteger(price) ? String(price) : price.toFixed(2);
  return candidate.pricing.validVariants.length > 1 ? `From $${amount}` : `$${amount}`;
}

export function getSharedRepairCandidateModelLabel(candidate: Pick<SharedRepairPageSupportedModel, 'brand' | 'model'>) {
  const brandParts = candidate.brand.trim().split(/\s+/);
  const modelParts = candidate.model.trim().split(/\s+/);
  const normalizedBrand = brandParts.map((part) => part.toLocaleLowerCase());
  const normalizedModel = modelParts.map((part) => part.toLocaleLowerCase());

  if (normalizedModel.slice(0, normalizedBrand.length).join(' ') === normalizedBrand.join(' ')) {
    return candidate.model;
  }

  for (let overlap = Math.min(brandParts.length, modelParts.length); overlap > 0; overlap -= 1) {
    if (normalizedBrand.slice(-overlap).join(' ') === normalizedModel.slice(0, overlap).join(' ')) {
      return [...brandParts, ...modelParts.slice(overlap)].join(' ');
    }
  }

  return `${candidate.brand} ${candidate.model}`;
}
