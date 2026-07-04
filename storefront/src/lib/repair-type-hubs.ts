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
  price: number;
  href: string;
}

export interface RepairTypeHubBrandGroup {
  brand: string;
  brandSlug: string;
  brandHubHref?: string;
  fallbackMessage?: string;
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

const PHONE_BRAND_ORDER = [
  'iphone',
  'samsung',
  'google-pixel',
  'oppo',
  'huawei',
  'xiaomi',
  'htc',
  'lg',
  'nokia',
  'sony',
  'telstra',
  'vivo',
  'motorola',
  'microsoft',
  'oneplus',
  'realme',
  'asus',
  'tcl',
  'nothing',
];

const CATEGORY_BRAND_FALLBACKS: Partial<Record<RepairTypeHubCategory, Array<{
  brand: string;
  brandSlug: string;
  brandHubHref: string;
}>>> = {
  tablet: [
    { brand: 'iPad', brandSlug: 'ipad', brandHubHref: '/repairs/tablet/ipad' },
    { brand: 'Samsung Tablet', brandSlug: 'samsung', brandHubHref: '/repairs/tablet/samsung' },
    { brand: 'Lenovo Tablet', brandSlug: 'lenovo', brandHubHref: '/repairs/tablet/lenovo' },
  ],
  laptop: [
    { brand: 'MacBook', brandSlug: 'macbook', brandHubHref: '/repairs/laptop/macbook' },
  ],
  watch: [
    { brand: 'Apple Watch', brandSlug: 'apple', brandHubHref: '/repairs/watch/apple' },
  ],
};

export const REPAIR_TYPE_HUBS: Record<RepairTypeHubSlug, RepairTypeHubDefinition> = {
  'screen-replacement': {
    slug: 'screen-replacement',
    label: 'Screen Replacement',
    aliases: ['screen-replacement', 'screen-repair'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: DEVICE_CATEGORY_ORDER,
  },
  'battery-replacement': {
    slug: 'battery-replacement',
    label: 'Battery Replacement',
    aliases: ['battery-replacement', 'battery-service', 'battery-repair'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: DEVICE_CATEGORY_ORDER,
  },
  'charging-port-replacement': {
    slug: 'charging-port-replacement',
    label: 'Charging Port Replacement',
    aliases: ['charging-port-replacement', 'charging-port-repair', 'charging-port'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: DEVICE_CATEGORY_ORDER,
  },
  'back-glass-replacement': {
    slug: 'back-glass-replacement',
    label: 'Back Glass Replacement',
    aliases: ['back-glass-replacement', 'back-housing-replacement', 'back-glass', 'back-housing'],
    supportedCategories: DEVICE_CATEGORY_ORDER,
    enabledCategories: DEVICE_CATEGORY_ORDER,
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

function normalizeBrowserBrandSlug(category: RepairTypeHubCategory, brandSlug: string) {
  if (category === 'tablet' && (brandSlug === 'apple' || brandSlug === 'ipad')) return 'ipad';
  if (category === 'watch' && (brandSlug === 'apple-watch' || brandSlug === 'watch')) return 'apple';
  return brandSlug;
}

function normalizeBrowserBrandName(
  category: RepairTypeHubCategory,
  brand: string,
  brandSlug: string
) {
  if (category === 'tablet' && brandSlug === 'ipad') return 'iPad';
  if (category === 'tablet' && brandSlug === 'samsung') return 'Samsung Tablet';
  if (category === 'tablet' && brandSlug === 'lenovo') return 'Lenovo Tablet';
  if (category === 'laptop' && brandSlug === 'macbook') return 'MacBook';
  if (category === 'watch' && brandSlug === 'apple') return 'Apple Watch';
  return brand;
}

function getBrandHubHref(category: RepairTypeHubCategory, brandSlug: string) {
  return CATEGORY_BRAND_FALLBACKS[category]?.find((brand) => brand.brandSlug === brandSlug)?.brandHubHref;
}

function getFallbackMessage(brand: string, hubLabel: string) {
  return `${brand} ${hubLabel.toLowerCase()} availability depends on the exact model and current parts support. Check the brand hub before choosing a repair path.`;
}

function sortBrandGroups(category: RepairTypeHubCategory, brands: RepairTypeHubBrandGroup[]) {
  const configuredOrder =
    category === 'phone'
      ? PHONE_BRAND_ORDER
      : CATEGORY_BRAND_FALLBACKS[category]?.map((brand) => brand.brandSlug) ?? [];

  const orderMap = new Map(configuredOrder.map((brandSlug, index) => [brandSlug, index] as const));

  return [...brands].sort((a, b) => {
    const aOrder = orderMap.get(a.brandSlug) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = orderMap.get(b.brandSlug) ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.brand.localeCompare(b.brand);
  });
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

    const browserBrandSlug = normalizeBrowserBrandSlug(category, brandEntry.slug);
    const browserBrandName = normalizeBrowserBrandName(category, brandEntry.brand, browserBrandSlug);
    const models: RepairTypeHubModelLink[] = [];

    for (const modelEntry of brandEntry.models) {
      if (!modelEntry.model || !modelEntry.slug || !Array.isArray(modelEntry.repairTypes) || modelEntry.repairTypes.length === 0) {
        continue;
      }

      if (category === 'tablet' && browserBrandSlug === 'ipad' && hub.slug === 'back-glass-replacement') {
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
        brand: browserBrandName,
        brandSlug: browserBrandSlug,
        model: modelEntry.model,
        modelSlug: modelEntry.slug,
        modelCode: modelEntry.modelCode,
        repairName: matchingRepair.name,
        repairSlug: matchingRepair.slug,
        price: matchingRepair.price,
        href: `/repairs/${category}/${browserBrandSlug}/${modelEntry.slug}/${matchingRepair.slug}`,
      });
    }

    if (models.length === 0) {
      continue;
    }

    if (!categoryGroups.has(category)) {
      categoryGroups.set(category, []);
    }

    categoryGroups.get(category)!.push({
      brand: browserBrandName,
      brandSlug: browserBrandSlug,
      brandHubHref: getBrandHubHref(category, browserBrandSlug),
      fallbackMessage: getFallbackMessage(browserBrandName, hub.label),
      models,
    });

    totalBrands += 1;
    totalModels += models.length;
  }

  const categories: RepairTypeHubCategoryGroup[] = DEVICE_CATEGORY_ORDER
    .map((category) => {
      const brandsBySlug = new Map(
        (categoryGroups.get(category) ?? []).map((brand) => [brand.brandSlug, brand] as const)
      );
      const fallbackBrands = CATEGORY_BRAND_FALLBACKS[category] ?? [];

      for (const fallbackBrand of fallbackBrands) {
        const existingBrand = brandsBySlug.get(fallbackBrand.brandSlug);

        if (existingBrand) {
          brandsBySlug.set(fallbackBrand.brandSlug, {
            ...existingBrand,
            brand: fallbackBrand.brand,
            brandHubHref: fallbackBrand.brandHubHref,
            fallbackMessage: getFallbackMessage(fallbackBrand.brand, hub.label),
          });
          continue;
        }

        brandsBySlug.set(fallbackBrand.brandSlug, {
          brand: fallbackBrand.brand,
          brandSlug: fallbackBrand.brandSlug,
          brandHubHref: fallbackBrand.brandHubHref,
          fallbackMessage: getFallbackMessage(fallbackBrand.brand, hub.label),
          models: [],
        });
      }

      const brands = sortBrandGroups(category, Array.from(brandsBySlug.values()));
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
