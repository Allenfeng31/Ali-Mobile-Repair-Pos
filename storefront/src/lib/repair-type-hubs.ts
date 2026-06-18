import type { RepairCatalog } from '@/lib/api';

export type RepairTypeHubSlug =
  | 'screen-replacement'
  | 'battery-replacement'
  | 'charging-port-replacement'
  | 'back-glass-replacement';

export type RepairTypeHubCategory = 'phone' | 'tablet' | 'laptop' | 'watch';

export interface RepairTypeHubDefinition {
  slug: RepairTypeHubSlug;
  label: string;
  aliases: string[];
  supportedCategories: RepairTypeHubCategory[];
  enabledCategories: RepairTypeHubCategory[];
}

export interface RepairTypeHubModelLink {
  category: RepairTypeHubCategory;
  categoryLabel: string;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  modelCode?: string;
  repairName: string;
  repairSlug: string;
  href: string;
}

export interface RepairTypeHubBrandGroup {
  brand: string;
  brandSlug: string;
  models: RepairTypeHubModelLink[];
}

export interface RepairTypeHubCategoryGroup {
  category: RepairTypeHubCategory;
  categoryLabel: string;
  brands: RepairTypeHubBrandGroup[];
}

export interface RepairTypeHubCatalogResult {
  hub: RepairTypeHubDefinition;
  categories: RepairTypeHubCategoryGroup[];
  totalBrands: number;
  totalModels: number;
}

const DEVICE_CATEGORY_ORDER: RepairTypeHubCategory[] = ['phone', 'tablet', 'laptop', 'watch'];

const DEVICE_CATEGORY_LABELS: Record<RepairTypeHubCategory, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  watch: 'Watch',
};

export const REPAIR_TYPE_HUBS: Record<RepairTypeHubSlug, RepairTypeHubDefinition> = {
  'screen-replacement': {
    slug: 'screen-replacement',
    label: 'Screen Replacement',
    aliases: ['screen-replacement', 'screen-repair'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: ['phone'],
  },
  'battery-replacement': {
    slug: 'battery-replacement',
    label: 'Battery Replacement',
    aliases: ['battery-replacement', 'battery-service', 'battery-repair'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: ['phone'],
  },
  'charging-port-replacement': {
    slug: 'charging-port-replacement',
    label: 'Charging Port Replacement',
    aliases: ['charging-port-replacement', 'charging-port-repair', 'charging-port'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: ['phone'],
  },
  'back-glass-replacement': {
    slug: 'back-glass-replacement',
    label: 'Back Glass Replacement',
    aliases: ['back-glass-replacement', 'back-housing-replacement', 'back-glass', 'back-housing'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: ['phone'],
  },
};

const ALIAS_TO_CANONICAL = Object.values(REPAIR_TYPE_HUBS).reduce<Record<string, RepairTypeHubSlug>>(
  (acc, hub) => {
    for (const alias of hub.aliases) {
      acc[alias] = hub.slug;
    }
    return acc;
  },
  {}
);

export function getRepairTypeHubDefinition(slug: string): RepairTypeHubDefinition | null {
  const canonicalSlug = ALIAS_TO_CANONICAL[slug];
  return canonicalSlug ? REPAIR_TYPE_HUBS[canonicalSlug] : null;
}

export function buildRepairTypeHubCatalog(
  catalog: RepairCatalog,
  slug: string
): RepairTypeHubCatalogResult | null {
  const hub = getRepairTypeHubDefinition(slug);

  if (!hub) {
    return null;
  }

  const enabledCategories = new Set<RepairTypeHubCategory>(hub.enabledCategories);
  const categoryGroups = new Map<RepairTypeHubCategory, RepairTypeHubBrandGroup[]>();
  let totalBrands = 0;
  let totalModels = 0;

  for (const brandEntry of catalog.brands) {
    const category = brandEntry.category as RepairTypeHubCategory;

    if (!enabledCategories.has(category)) {
      continue;
    }

    if (!brandEntry.brand || !brandEntry.slug || !Array.isArray(brandEntry.models) || brandEntry.models.length === 0) {
      continue;
    }

    const models: RepairTypeHubModelLink[] = [];

    for (const modelEntry of brandEntry.models) {
      if (!modelEntry.model || !modelEntry.slug || !Array.isArray(modelEntry.repairTypes) || modelEntry.repairTypes.length === 0) {
        continue;
      }

      const matchingRepair = modelEntry.repairTypes.find(
        (repair) => repair.slug && ALIAS_TO_CANONICAL[repair.slug] === hub.slug
      );

      if (!matchingRepair || !matchingRepair.name || !matchingRepair.slug) {
        continue;
      }

      models.push({
        category,
        categoryLabel: DEVICE_CATEGORY_LABELS[category],
        brand: brandEntry.brand,
        brandSlug: brandEntry.slug,
        model: modelEntry.model,
        modelSlug: modelEntry.slug,
        modelCode: modelEntry.modelCode,
        repairName: matchingRepair.name,
        repairSlug: matchingRepair.slug,
        href: `/repairs/${category}/${brandEntry.slug}/${modelEntry.slug}/${matchingRepair.slug}`,
      });
    }

    if (models.length === 0) {
      continue;
    }

    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }

    categoryGroups.get(category)!.push({
      brand: brandEntry.brand,
      brandSlug: brandEntry.slug,
      models,
    });

    totalBrands += 1;
    totalModels += models.length;
  }

  const categories: RepairTypeHubCategoryGroup[] = DEVICE_CATEGORY_ORDER
    .map((category) => {
      const brands = categoryGroups.get(category);
      if (!brands || brands.length === 0) {
        return null;
      }

      return {
        category,
        categoryLabel: DEVICE_CATEGORY_LABELS[category],
        brands,
      };
    })
    .filter((group): group is RepairTypeHubCategoryGroup => group !== null);

  return {
    hub,
    categories,
    totalBrands,
    totalModels,
  };
}
