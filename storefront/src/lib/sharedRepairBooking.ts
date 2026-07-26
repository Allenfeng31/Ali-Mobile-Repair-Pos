export interface SharedRepairModelOption {
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
}

export function getValidatedSharedRepairModel(
  models: SharedRepairModelOption[],
  modelSlug: string | null,
  fixedBrandSlug?: string
) {
  if (!modelSlug) return null;

  return models.find((model) =>
    (!fixedBrandSlug || model.brandSlug === fixedBrandSlug) && model.modelSlug === modelSlug
  ) ?? null;
}

export function getSharedRepairBookingHref({
  repairName,
  selectedModel,
  fallbackBrandName,
}: {
  repairName: string;
  selectedModel?: SharedRepairModelOption | null;
  fallbackBrandName?: string;
}) {
  const params = new URLSearchParams({ category: 'phone', service: repairName });

  if (selectedModel) {
    params.set('brand', selectedModel.brand);
    params.set('model', selectedModel.model);
  } else if (fallbackBrandName) {
    params.set('brand', fallbackBrandName);
  }

  return `/book-repair?${params.toString()}`;
}
