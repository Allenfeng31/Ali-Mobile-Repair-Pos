import type { BrandEntry, RepairCatalog, RepairOption } from './publicRepairCataloguePolicy';
import { CAMERA_LENS_REPAIR_SLUG, getCameraLensLandingHref, withVirtualCameraLensRepairOption } from './virtualCameraLens';
import { getModelHubRepairHref } from './waterDamageRouting';
import { getVirtualPhoneRepair, getVirtualPhoneRepairLandingHref, withVirtualPhoneRepairOptions } from './virtualPhoneRepairs';

export type RepairResultDeviceCategory = 'phone' | 'tablet' | 'laptop' | 'watch';

export interface RepairResultTaxonomyRepair {
  name: string;
  slug: string;
  relatedRepairUrl: string;
}

export interface RepairResultTaxonomyModel {
  name: string;
  slug: string;
  repairTypes: RepairResultTaxonomyRepair[];
}

export interface RepairResultTaxonomyBrand {
  name: string;
  slug: string;
  models: RepairResultTaxonomyModel[];
}

export interface RepairResultTaxonomyCategory {
  value: RepairResultDeviceCategory;
  label: string;
  brands: RepairResultTaxonomyBrand[];
}

export interface RepairResultTaxonomy {
  categories: RepairResultTaxonomyCategory[];
}

export interface RepairResultTaxonomySelection {
  deviceCategory: string;
  brandSlug: string;
  modelSlug: string;
  repairTypeSlug: string;
}

export interface ResolvedRepairResultTaxonomy {
  deviceCategory: RepairResultDeviceCategory;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  repairType: string;
  repairTypeSlug: string;
  modelUrl: string;
  repairHubUrl: string;
  brandHubUrl: string;
  relatedRepairUrl: string;
}

const CATEGORY_LABELS: Record<RepairResultDeviceCategory, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  watch: 'Watch',
};

const CATEGORY_ORDER: RepairResultDeviceCategory[] = ['phone', 'tablet', 'laptop', 'watch'];

function isRepairResultDeviceCategory(value: string): value is RepairResultDeviceCategory {
  return value === 'phone' || value === 'tablet' || value === 'laptop' || value === 'watch';
}

function getModelRepairTypes(category: string, brand: string, repairs: RepairOption[]) {
  return withVirtualPhoneRepairOptions(
    withVirtualCameraLensRepairOption(repairs, category, brand),
    category,
    brand,
  );
}

function toTaxonomyBrand(brand: BrandEntry): RepairResultTaxonomyBrand {
  return {
    name: brand.brand,
    slug: brand.slug,
    models: brand.models.map((model) => ({
      name: model.model,
      slug: model.slug,
      repairTypes: getModelRepairTypes(brand.category, brand.slug, model.repairTypes).map((repair) => {
        const selection = {
          deviceCategory: brand.category as RepairResultDeviceCategory,
          brand: brand.brand,
          brandSlug: brand.slug,
          model: model.model,
          modelSlug: model.slug,
          repairType: repair.name,
          repairTypeSlug: repair.slug,
          modelUrl: `/repairs/${brand.category}/${brand.slug}/${model.slug}`,
          repairHubUrl: `/repairs/${brand.category}`,
          brandHubUrl: `/repairs/${brand.category}/${brand.slug}`,
          relatedRepairUrl: '',
        };

        return { name: repair.name, slug: repair.slug, relatedRepairUrl: getRelatedRepairUrl(selection) };
      }),
    })),
  };
}

export function buildRepairResultTaxonomy(catalog: Pick<RepairCatalog, 'brands'>): RepairResultTaxonomy {
  return {
    categories: CATEGORY_ORDER.flatMap((category) => {
      const brands = catalog.brands.filter((brand) => brand.category === category);
      return brands.length > 0
        ? [{ value: category, label: CATEGORY_LABELS[category], brands: brands.map(toTaxonomyBrand) }]
        : [];
    }),
  };
}

function getRelatedRepairUrl(selection: ResolvedRepairResultTaxonomy) {
  if (selection.repairTypeSlug === CAMERA_LENS_REPAIR_SLUG) {
    const cameraLensHref = getCameraLensLandingHref(selection.deviceCategory, selection.brandSlug, selection.modelSlug);
    if (cameraLensHref) return cameraLensHref;
  }

  if (selection.deviceCategory === 'phone' && getVirtualPhoneRepair(selection.repairTypeSlug)) {
    const virtualHref = getVirtualPhoneRepairLandingHref(
      selection.deviceCategory,
      selection.brandSlug,
      selection.modelSlug,
      selection.repairTypeSlug as Parameters<typeof getVirtualPhoneRepairLandingHref>[3],
    );
    if (virtualHref) return virtualHref;
  }

  return getModelHubRepairHref(
    selection.repairTypeSlug,
    `/repairs/${selection.deviceCategory}/${selection.brandSlug}/${selection.modelSlug}/${selection.repairTypeSlug}`,
  );
}

export function resolveRepairResultTaxonomy(
  catalog: Pick<RepairCatalog, 'brands'>,
  selection: RepairResultTaxonomySelection,
): ResolvedRepairResultTaxonomy | null {
  if (!isRepairResultDeviceCategory(selection.deviceCategory)) return null;

  const brand = catalog.brands.find(
    (candidate) => candidate.category === selection.deviceCategory && candidate.slug === selection.brandSlug,
  );
  if (!brand) return null;

  const model = brand.models.find((candidate) => candidate.slug === selection.modelSlug);
  if (!model) return null;

  const repair = getModelRepairTypes(brand.category, brand.slug, model.repairTypes).find(
    (candidate) => candidate.slug === selection.repairTypeSlug,
  );
  if (!repair) return null;

  const resolved: ResolvedRepairResultTaxonomy = {
    deviceCategory: selection.deviceCategory,
    brand: brand.brand,
    brandSlug: brand.slug,
    model: model.model,
    modelSlug: model.slug,
    repairType: repair.name,
    repairTypeSlug: repair.slug,
    modelUrl: `/repairs/${selection.deviceCategory}/${brand.slug}/${model.slug}`,
    repairHubUrl: `/repairs/${selection.deviceCategory}`,
    brandHubUrl: `/repairs/${selection.deviceCategory}/${brand.slug}`,
    relatedRepairUrl: '',
  };

  return { ...resolved, relatedRepairUrl: getRelatedRepairUrl(resolved) };
}
