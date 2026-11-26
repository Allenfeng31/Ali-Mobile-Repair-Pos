import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const GOOGLE_PIXEL_SCREEN_REPAIR_COST_SLUG = "google-pixel-screen-repair-cost-australia";

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

export type GooglePixelScreenRepairPriceRow = {
  model: string;
  slug: string;
  prices: Record<string, number>;
  quoteTiers: string[];
};

export type GooglePixelScreenRepairPriceTable = {
  fetchedAt: string | null;
  range: { min: number; max: number } | null;
  rows: GooglePixelScreenRepairPriceRow[];
  foldModels: Array<{ model: string; slug: string }>;
};

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function modelGeneration(model: string) {
  const match = model.match(/Pixel\s+(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function modelVariantRank(slug: string) {
  if (slug.endsWith("-pro-xl")) return 4;
  if (slug.endsWith("-pro")) return 3;
  if (/-\d+$/.test(slug)) return 2;
  if (slug.endsWith("a")) return 1;
  return 0;
}

function compareModelsNewestFirst(
  left: { model: string; slug: string },
  right: { model: string; slug: string },
) {
  const generationDifference = modelGeneration(right.model) - modelGeneration(left.model);
  const variantDifference = modelVariantRank(right.slug) - modelVariantRank(left.slug);
  return generationDifference || variantDifference || collator.compare(right.model, left.model);
}

function gradeLabel(value: string | undefined) {
  return value?.trim() || "Current price";
}

function isFoldModel(slug: string) {
  return slug.endsWith("-fold");
}

/**
 * Builds Pixel Blog pricing from the same public catalogue and positive-price
 * resolver used by repair details. Fold prices stay outside the comparison
 * table until the affected display component can be confirmed.
 */
export function buildGooglePixelScreenRepairPriceTable(catalogue: {
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
}): GooglePixelScreenRepairPriceTable {
  const pixel = catalogue.brands.find(
    (brand) => brand.category === "phone" && brand.slug === "google-pixel",
  );

  const screenModels = (pixel?.models ?? []).flatMap((model) => {
    const repair = model.repairTypes.find((candidate) => candidate.slug === "screen-replacement");
    return repair ? [{ ...model, repair }] : [];
  });

  const foldModels = screenModels
    .filter((model) => isFoldModel(model.slug))
    .map(({ model, slug }) => ({ model, slug }))
    .sort(compareModelsNewestFirst);

  const rows = screenModels
    .filter((model) => !isFoldModel(model.slug))
    .map(({ model, slug, repair }) => {
      const prices: Record<string, number> = {};
      const quoteTiers: string[] = [];
      const variantsByGrade = new Map<string, CatalogueVariant[]>();

      for (const variant of repair.variants ?? []) {
        const label = gradeLabel(variant.quality_grade);
        const existing = variantsByGrade.get(label) ?? [];
        existing.push(variant);
        variantsByGrade.set(label, existing);
      }

      if (variantsByGrade.size === 0) {
        const pricing = resolveRepairDetailPricing({ basePrice: repair.price });
        if (pricing.resolvedPrice === null) quoteTiers.push("Current price");
        else prices["Current price"] = pricing.resolvedPrice;
      } else {
        for (const [label, variants] of variantsByGrade) {
          const pricing = resolveRepairDetailPricing({ variants });
          if (pricing.validVariants.length === 0) quoteTiers.push(label);
          else prices[label] = Math.min(...pricing.validVariants.map((variant) => variant.price));
        }
      }

      return {
        model,
        slug,
        prices,
        quoteTiers: quoteTiers.sort(collator.compare),
      };
    })
    .sort(compareModelsNewestFirst);

  const validPrices = rows.flatMap((row) => Object.values(row.prices));

  return {
    fetchedAt: catalogue.fetchedAt || null,
    range: validPrices.length > 0
      ? { min: Math.min(...validPrices), max: Math.max(...validPrices) }
      : null,
    rows,
    foldModels,
  };
}
