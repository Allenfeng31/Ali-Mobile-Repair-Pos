import type { RepairCatalog, RepairOption } from './publicRepairCataloguePolicy';
import { withVirtualCameraLensRepairOption } from './virtualCameraLens';
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
}

function repairOptions(category: string, brandSlug: string, repairs: RepairOption[]) {
  return withVirtualPhoneRepairOptions(
    withVirtualCameraLensRepairOption(repairs, category, brandSlug),
    category,
    brandSlug,
  );
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
    price: repair.price,
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
    if (!repair) return null;

    const selection = resolvedSelection(brand.category, brand, model, repair);
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
