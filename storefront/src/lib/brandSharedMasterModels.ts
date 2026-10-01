import type { SharedRepairHierarchyModel } from './sharedRepairHierarchy';
import {
  getSharedRepairCandidateModelLabel,
  getSharedRepairCandidatePriceLabel,
  type SharedRepairPageCandidate,
  type SharedRepairPageSupportedModel,
} from './sharedRepairPageV2';

export function buildBrandSharedMasterModels({
  supportedModels,
  priceCandidates,
  repairName,
  fixedPrice,
}: {
  supportedModels: readonly SharedRepairPageSupportedModel[];
  priceCandidates: readonly SharedRepairPageCandidate[];
  repairName: string;
  fixedPrice?: number;
}): SharedRepairHierarchyModel[] {
  return supportedModels.map((model) => {
    const candidate = priceCandidates.find((item) => item.modelSlug === model.modelSlug);
    return {
      brandSlug: model.canonicalBrandSlug,
      brandLabel: model.brand,
      modelSlug: model.modelSlug,
      modelLabel: getSharedRepairCandidateModelLabel(model),
      repairLabel: repairName,
      bookingHref: `?model=${encodeURIComponent(model.modelSlug)}`,
      priceLabel: fixedPrice !== undefined
        ? `$${fixedPrice}`
        : candidate ? getSharedRepairCandidatePriceLabel(candidate) : null,
    };
  });
}
