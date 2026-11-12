import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const MACBOOK_SCREEN_REPAIR_BLOG_SLUG = "macbook-screen-repair-ringwood";

type CatalogueVariant = {
  quality_grade: string;
  price: number;
};

type CatalogueRepair = {
  slug: string;
  price?: number;
  variants?: CatalogueVariant[];
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: string;
};

export type MacbookAirScreenRepairPriceTable = {
  columns: string[];
  fetchedAt: string | null;
  rows: Array<{
    model: string;
    modelSlug: string;
    prices: Record<string, number>;
    quoteTiers: string[];
  }>;
};

const KNOWN_TIER_ORDER = ["Standard", "Premium", "Genuine", "Current price"];
const collator = new Intl.Collator("en-AU", { numeric: true, sensitivity: "base" });

function tierLabel(value: string | undefined) {
  return value?.trim() || "Current price";
}

function modelYear(model: string) {
  const years = [...model.matchAll(/\b(20\d{2})\b/g)].map((match) => Number(match[1]));
  return years.length > 0 ? Math.max(...years) : 0;
}

function compareModelsNewestFirst(left: string, right: string) {
  return modelYear(right) - modelYear(left) || collator.compare(right, left);
}

function compareTierLabels(left: string, right: string) {
  const leftIndex = KNOWN_TIER_ORDER.indexOf(left);
  const rightIndex = KNOWN_TIER_ORDER.indexOf(right);

  if (leftIndex !== -1 || rightIndex !== -1) {
    return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex)
      - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
  }

  return collator.compare(left, right);
}

/**
 * Builds the article table from the same public POS catalogue used by repair
 * pages. Only POS-origin MacBook Air screen records are eligible. Invalid
 * amounts remain quote states, never $0 or a made-up fallback price.
 */
export function buildMacbookAirScreenRepairPriceTable(catalogue: {
  fetchedAt?: string | null;
  brands: Array<{
    category: string;
    slug: string;
    models: Array<{
      model: string;
      slug: string;
      repairTypes: CatalogueRepair[];
    }>;
  }>;
}): MacbookAirScreenRepairPriceTable {
  const macbook = catalogue.brands.find(
    (brand) => brand.category === "laptop" && brand.slug === "macbook",
  );
  const columns = new Set<string>();

  const rows = (macbook?.models ?? []).flatMap(({ model, slug: modelSlug, repairTypes }) => {
    if (!/^MacBook Air\b/i.test(model)) return [];

    const repair = repairTypes.find(({ slug }) => slug === "screen-replacement");
    if (
      !repair
      || repair.repairOrigin !== "pos"
      || repair.sourceType === "virtual"
      || repair.sourceType === "diagnostic"
    ) {
      return [];
    }

    const rawTiers = new Set((repair.variants ?? []).map((variant) => tierLabel(variant.quality_grade)));
    const pricing = resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants });
    const prices: Record<string, number> = {};

    for (const variant of pricing.validVariants) {
      const label = tierLabel(variant.quality_grade);
      columns.add(label);
      prices[label] = Math.min(prices[label] ?? Infinity, variant.price);
    }

    if (rawTiers.size === 0) {
      rawTiers.add("Current price");
      columns.add("Current price");
      if (pricing.resolvedPrice !== null) prices["Current price"] = pricing.resolvedPrice;
    }

    for (const label of rawTiers) columns.add(label);

    return [{
      model,
      modelSlug,
      prices,
      quoteTiers: [...rawTiers].filter((label) => prices[label] === undefined),
    }];
  }).sort((left, right) => compareModelsNewestFirst(left.model, right.model));

  return {
    columns: [...columns].sort(compareTierLabels),
    fetchedAt: catalogue.fetchedAt || null,
    rows,
  };
}
