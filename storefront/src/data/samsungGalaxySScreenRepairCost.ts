import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG =
  "how-much-does-samsung-galaxy-s-screen-replacement-cost-australia";

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA = {
  slug: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG,
  title: "How Much Does Samsung Galaxy S Screen Replacement Cost in Australia?",
  seoTitle: "How Much Does Samsung Galaxy S Screen Replacement Cost in Australia? | Ali Mobile",
  description:
    "Compare current Ali Mobile Samsung Galaxy S screen replacement prices across Genuine and Premium repair tiers, subject to model and parts availability.",
  heroIntro:
    "This guide compares current Ali Mobile Samsung Galaxy S screen replacement prices and explains how the Genuine and Premium catalogue tiers may differ for your phone.",
  image: "/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp",
  coverImageAlt:
    "Samsung Galaxy S phones on a repair bench showing a damaged display, working display and screen assembly",
} as const;

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_TIERS = ["Genuine", "Premium"] as const;
export type SamsungGalaxySScreenRepairTier = typeof SAMSUNG_GALAXY_S_SCREEN_REPAIR_TIERS[number];

const PUBLISHED_MODELS = [
  { model: "Galaxy S26 Ultra", slug: "galaxy-s26-ultra" },
  { model: "Galaxy S26+", slug: "galaxy-s26-plus" },
  { model: "Galaxy S26", slug: "galaxy-s26" },
  { model: "Galaxy S25 Ultra", slug: "galaxy-s25-ultra" },
  { model: "Galaxy S25+", slug: "galaxy-s25-plus" },
  { model: "Galaxy S25", slug: "galaxy-s25" },
  { model: "Galaxy S24 Ultra", slug: "galaxy-s24-ultra" },
  { model: "Galaxy S24+", slug: "galaxy-s24-plus" },
  { model: "Galaxy S24", slug: "galaxy-s24" },
  { model: "Galaxy S24 FE", slug: "galaxy-s24-fe" },
  { model: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra" },
  { model: "Galaxy S23+", slug: "galaxy-s23-plus" },
  { model: "Galaxy S23", slug: "galaxy-s23" },
  { model: "Galaxy S23 FE", slug: "galaxy-s23-fe" },
  { model: "Galaxy S22 Ultra", slug: "galaxy-s22-ultra" },
  { model: "Galaxy S22+", slug: "galaxy-s22-plus" },
  { model: "Galaxy S22", slug: "galaxy-s22" },
  { model: "Galaxy S21 Ultra", slug: "galaxy-s21-ultra" },
  { model: "Galaxy S21+", slug: "galaxy-s21-plus" },
  { model: "Galaxy S21", slug: "galaxy-s21" },
  { model: "Galaxy S21 FE", slug: "galaxy-s21-fe" },
  { model: "Galaxy S20 Ultra", slug: "galaxy-s20-ultra" },
  { model: "Galaxy S20+", slug: "galaxy-s20-plus" },
  { model: "Galaxy S20", slug: "galaxy-s20" },
  { model: "Galaxy S20 FE", slug: "galaxy-s20-fe" },
] as const;

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

export type SamsungGalaxySScreenRepairPriceTable = {
  columns: SamsungGalaxySScreenRepairTier[];
  fetchedAt: string | null;
  rows: Array<{
    model: string;
    prices: Partial<Record<SamsungGalaxySScreenRepairTier, number>>;
    quoteTiers: SamsungGalaxySScreenRepairTier[];
  }>;
};

/**
 * Builds the Samsung Blog table from the same POS-backed public catalogue used
 * by repair details. Model slugs and canonical tier labels are matched exactly;
 * legacy tier names are never guessed into a current tier.
 */
export function buildSamsungGalaxySScreenRepairPriceTable(catalogue: {
  fetchedAt?: string | null;
  brands: Array<{
    category: string;
    slug: string;
    models: Array<{ model: string; slug: string; repairTypes: CatalogueRepair[] }>;
  }>;
}): SamsungGalaxySScreenRepairPriceTable {
  const samsung = catalogue.brands.find((brand) => brand.category === "phone" && brand.slug === "samsung");

  const rows = PUBLISHED_MODELS.map((published) => {
    const model = samsung?.models.find((candidate) => candidate.slug === published.slug);
    const repair = model?.repairTypes.find((candidate) => candidate.slug === "screen-replacement");
    const prices: Partial<Record<SamsungGalaxySScreenRepairTier, number>> = {};
    const quoteTiers: SamsungGalaxySScreenRepairTier[] = [];

    for (const tier of SAMSUNG_GALAXY_S_SCREEN_REPAIR_TIERS) {
      const matchingVariants = (repair?.variants ?? []).filter((variant) => variant.quality_grade.trim() === tier);
      if (matchingVariants.length === 0) continue;

      const pricing = resolveRepairDetailPricing({ variants: matchingVariants });
      if (pricing.validVariants.length === 0) {
        quoteTiers.push(tier);
        continue;
      }

      prices[tier] = Math.min(...pricing.validVariants.map((variant) => variant.price));
    }

    return { model: published.model, prices, quoteTiers };
  });

  return {
    columns: [...SAMSUNG_GALAXY_S_SCREEN_REPAIR_TIERS],
    fetchedAt: catalogue.fetchedAt || null,
    rows,
  };
}
