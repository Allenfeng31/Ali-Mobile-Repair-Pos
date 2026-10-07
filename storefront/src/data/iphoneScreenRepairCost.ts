import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const IPHONE_SCREEN_REPAIR_COST_SLUG = "how-much-does-iphone-screen-repair-cost-australia";

export const IPHONE_SCREEN_REPAIR_COST_EDITORIAL_METADATA = {
  datePublished: "2026-07-29",
  dateModified: "2026-10-08",
} as const;

// Retained for sitemap consumers; these are editorial dates, not price freshness.
export const IPHONE_SCREEN_REPAIR_COST_STATIC_METADATA = IPHONE_SCREEN_REPAIR_COST_EDITORIAL_METADATA;

type CatalogueVariant = {
  quality_grade: string;
  price: number;
  is_recommended?: boolean;
};

type CatalogueRepair = {
  slug: string;
  price?: number;
  variants?: CatalogueVariant[];
};

export type IphoneScreenRepairPriceTable = {
  columns: string[];
  fetchedAt: string | null;
  range: { min: number; max: number } | null;
  rows: Array<{
    model: string;
    prices: Record<string, number>;
    quoteTiers: string[];
  }>;
};

const KNOWN_TIER_ORDER = ["Standard", "Premium", "Genuine"];
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function tierLabel(value: string | undefined) {
  return value?.trim() || "Current price";
}

function modelGeneration(model: string) {
  const match = model.match(/^iPhone\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function compareModelsNewestFirst(left: string, right: string) {
  const generationDifference = modelGeneration(right) - modelGeneration(left);
  return generationDifference || collator.compare(right, left);
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
 * Converts the public iPhone Screen Replacement catalogue into SSR-safe blog
 * table data. Positive prices use the same detail-page resolver; unavailable
 * tier prices remain an explicit quote state rather than becoming $0.
 */
export function buildIphoneScreenRepairPriceTable(catalogue: {
  fetchedAt?: string | null;
  brands: Array<{
    category: string;
    slug: string;
    models: Array<{ model: string; repairTypes: CatalogueRepair[] }>;
  }>;
}): IphoneScreenRepairPriceTable {
  const iphone = catalogue.brands.find((brand) => brand.category === "phone" && brand.slug === "iphone");
  const columns = new Set<string>();
  const rows = (iphone?.models ?? []).flatMap(({ model, repairTypes }) => {
    const repair = repairTypes.find(({ slug }) => slug === "screen-replacement");
    if (!repair) return [];

    const rawTiers = new Set((repair.variants ?? []).map((variant) => tierLabel(variant.quality_grade)));
    const pricing = resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants });
    const prices: Record<string, number> = {};

    for (const variant of pricing.validVariants) {
      const label = tierLabel(variant.quality_grade);
      columns.add(label);
      prices[label] = Math.min(prices[label] ?? Infinity, variant.price);
    }

    if (rawTiers.size === 0) {
      columns.add("Current price");
      rawTiers.add("Current price");
      if (pricing.resolvedPrice !== null) prices["Current price"] = pricing.resolvedPrice;
    }

    for (const label of rawTiers) columns.add(label);

    return [{
      model,
      prices,
      quoteTiers: [...rawTiers].filter((label) => prices[label] === undefined),
    }];
  }).sort((left, right) => compareModelsNewestFirst(left.model, right.model));

  const allPrices = rows.flatMap((row) => Object.values(row.prices));

  return {
    columns: [...columns].sort(compareTierLabels),
    fetchedAt: catalogue.fetchedAt || null,
    range: allPrices.length > 0
      ? { min: Math.min(...allPrices), max: Math.max(...allPrices) }
      : null,
    rows,
  };
}

export const SCREEN_OPTION_SAMPLE = [
  { name: "Soft OLED", customers: 74, colour: "#2563eb", summary: "Most frequently selected balance of display quality and price." },
  { name: "LCD / In-cell", customers: 19, colour: "#0891b2", summary: "Selected mainly where keeping the repair cost lower was the priority." },
  { name: "Original Screen", customers: 7, colour: "#a16207", summary: "Selected by customers prioritising the original screen option." },
] as const;

export const SCREEN_OPTION_SAMPLE_TOTAL = SCREEN_OPTION_SAMPLE.reduce(
  (total, option) => total + option.customers,
  0,
);

export const IPHONE_SCREEN_PHOTOS = {
  comparison: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg",
    alt: "Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens",
    width: 5000,
    height: 2812,
  },
  lcdInCell: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-lcd-in-cell.jpg",
    alt: "LCD in-cell replacement screen fitted to an iPhone",
    width: 1997,
    height: 4029,
  },
  softOled: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-soft-oled.jpg",
    alt: "Soft OLED replacement screen fitted to an iPhone",
    width: 1954,
    height: 4029,
  },
  originalScreen: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-original.jpg",
    alt: "Original iPhone screen used for display comparison",
    width: 2811,
    height: 5708,
  },
} as const;
