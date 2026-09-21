import { getSharedRepairBookingHref } from './sharedRepairBooking';
import { getSharedRepairCandidateModelLabel } from './sharedRepairPageV2';
import { resolveRepairDetailPricing } from './repairDetailPricing';
import { resolveSharedRepairContext, type SharedRepairModelCandidate } from './sharedRepairContext';
import type { RepairOption } from './publicRepairCataloguePolicy';
import type { SharedRepairHierarchyModel } from './sharedRepairHierarchy';

export type GenericPeripheralRepairSlug =
  | 'loudspeaker-replacement'
  | 'earpiece-speaker-replacement'
  | 'power-button-replacement'
  | 'volume-button-replacement';

export interface GenericPeripheralRepairHierarchyCandidate extends SharedRepairModelCandidate {
  /** Optional because secondary-brand service visibility is independent of price availability. */
  repair?: RepairOption;
}

interface GenericPeripheralRepairHierarchyInput {
  repairSlug: GenericPeripheralRepairSlug;
  bookingService: string;
  candidates: readonly GenericPeripheralRepairHierarchyCandidate[];
}

interface GenericPeripheralRepairHierarchySelectionInput extends GenericPeripheralRepairHierarchyInput {
  query: Readonly<{
    brand?: string | readonly string[];
    model?: string | readonly string[];
    service?: string | readonly string[];
  }>;
}

function priceLabel(repair: RepairOption | undefined, repairSlug: GenericPeripheralRepairSlug) {
  if (!repair || repair.slug !== repairSlug || repair.repairOrigin !== 'pos') return null;

  const pricing = resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants });
  if (pricing.resolvedPrice === null) return null;

  const amount = Number.isInteger(pricing.resolvedPrice)
    ? String(pricing.resolvedPrice)
    : pricing.resolvedPrice.toFixed(2);
  return pricing.validVariants.length > 1 ? `From $${amount}` : `$${amount}`;
}

export function buildGenericPeripheralRepairHierarchyModels({
  repairSlug,
  bookingService,
  candidates,
}: GenericPeripheralRepairHierarchyInput): SharedRepairHierarchyModel[] {
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
      selectedModel: {
        brand: candidate.displayBrand,
        brandSlug: candidate.canonicalBrandSlug,
        model: candidate.displayModel,
        modelSlug: candidate.modelSlug,
      },
    }),
  }));
}

export function resolveGenericPeripheralRepairHierarchySelection({
  repairSlug,
  bookingService,
  candidates,
  query,
}: GenericPeripheralRepairHierarchySelectionInput) {
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
