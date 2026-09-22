import { getSharedRepairBookingHref } from './sharedRepairBooking';
import { getSharedRepairCandidateModelLabel } from './sharedRepairPageV2';
import { resolveRepairDetailPricing } from './repairDetailPricing';
import { resolveSharedRepairContext, type SharedRepairModelCandidate } from './sharedRepairContext';
import type { RepairOption } from './publicRepairCataloguePolicy';
import type { SharedRepairHierarchyModel } from './sharedRepairHierarchy';

export type CameraModuleRepairSlug = 'front-camera-replacement' | 'back-camera-replacement';

export interface CameraModuleRepairHierarchyCandidate extends SharedRepairModelCandidate {
  repair: RepairOption;
}

interface CameraModuleRepairHierarchyInput {
  repairSlug: CameraModuleRepairSlug;
  bookingService: string;
  candidates: readonly CameraModuleRepairHierarchyCandidate[];
}

interface CameraModuleRepairHierarchySelectionInput extends CameraModuleRepairHierarchyInput {
  query: Readonly<{
    brand?: string | readonly string[];
    model?: string | readonly string[];
    service?: string | readonly string[];
  }>;
}

function priceLabel(repair: RepairOption, repairSlug: CameraModuleRepairSlug) {
  if (repair.slug !== repairSlug || repair.repairOrigin !== 'pos') return null;

  const pricing = resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants });
  if (pricing.resolvedPrice === null) return null;

  const amount = Number.isInteger(pricing.resolvedPrice)
    ? String(pricing.resolvedPrice)
    : pricing.resolvedPrice.toFixed(2);
  return pricing.validVariants.length > 1 ? `From $${amount}` : `$${amount}`;
}

export function buildCameraModuleRepairHierarchyModels({
  repairSlug,
  bookingService,
  candidates,
}: CameraModuleRepairHierarchyInput): SharedRepairHierarchyModel[] {
  return candidates.map((candidate) => ({
    brandSlug: candidate.canonicalBrandSlug,
    brandLabel: candidate.displayBrand,
    modelSlug: candidate.modelSlug,
    modelLabel: getSharedRepairCandidateModelLabel({
      brand: candidate.displayBrand,
      model: candidate.displayModel,
    }),
    repairLabel: bookingService,
    priceLabel: priceLabel(candidate.repair, repairSlug),
    bookingHref: getSharedRepairBookingHref({
      repairName: bookingService,
      repairSlug,
      selectedModel: {
        brand: candidate.displayBrand,
        brandSlug: candidate.canonicalBrandSlug,
        model: candidate.displayModel,
        modelSlug: candidate.modelSlug,
      },
    }),
  }));
}

export function resolveCameraModuleRepairHierarchySelection({
  repairSlug,
  bookingService,
  candidates,
  query,
}: CameraModuleRepairHierarchySelectionInput) {
  const context = resolveSharedRepairContext({
    route: { scope: 'global' },
    repairSlug,
    bookingService,
    query,
    candidates,
  });

  return context.isValid
    ? {
        selectedBrandSlug: context.canonicalBrandSlug,
        selectedModelSlug: context.modelSlug,
      }
    : { selectedBrandSlug: null, selectedModelSlug: null };
}
