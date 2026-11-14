import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const IPAD_SCREEN_REPAIR_COST_SLUG = "how-much-does-ipad-screen-repair-cost-australia";

type CatalogueVariant = {
  quality_grade: string;
  price: number;
};

type CatalogueRepair = {
  slug: string;
  name: string;
  price?: number;
  variants?: CatalogueVariant[];
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: string;
};

export type IpadScreenRepairScope = "glass-digitiser" | "full-display";

export type IpadScreenRepairPriceTable = {
  fetchedAt: string | null;
  rows: Array<{
    model: string;
    modelSlug: string;
    scope: IpadScreenRepairScope;
    price: number | null;
    isQuote: boolean;
  }>;
};

const collator = new Intl.Collator("en-AU", { numeric: true, sensitivity: "base" });

function repairScope(model: string): IpadScreenRepairScope | null {
  if (/^iPad\s+(?:5th|6th|7th|8th|9th|10th|11th)\s+Generation\b/i.test(model)) {
    return "glass-digitiser";
  }
  if (/^iPad\s+(?:Air|mini|Pro)\b/i.test(model)) return "full-display";
  return null;
}

function familyOrder(model: string) {
  if (/^iPad\s+\d+(?:st|nd|rd|th)\s+Generation\b/i.test(model)) return 0;
  if (/^iPad\s+Air\b/i.test(model)) return 1;
  if (/^iPad\s+mini\b/i.test(model)) return 2;
  return 3;
}

function compareModels(left: string, right: string) {
  return familyOrder(left) - familyOrder(right) || collator.compare(right, left);
}

/**
 * Builds the iPad article tables from the same public POS catalogue as the
 * repair pages. Synthetic, virtual and diagnostic rows are never presented as
 * public prices. Invalid amounts remain explicit Quote states rather than $0.
 */
export function buildIpadScreenRepairPriceTable(catalogue: {
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
}): IpadScreenRepairPriceTable {
  const ipad = catalogue.brands.find(
    (brand) => brand.category === "tablet" && brand.slug === "ipad",
  );
  const rows = (ipad?.models ?? []).flatMap(({ model, slug: modelSlug, repairTypes }) => {
    const scope = repairScope(model);
    const repair = repairTypes.find(({ slug }) => slug === "screen-replacement");
    if (
      !scope
      || !repair
      || repair.repairOrigin !== "pos"
      || repair.sourceType === "virtual"
      || repair.sourceType === "diagnostic"
    ) {
      return [];
    }

    const pricing = resolveRepairDetailPricing({ basePrice: repair.price, variants: repair.variants });

    return [{
      model,
      modelSlug,
      scope,
      price: pricing.resolvedPrice,
      isQuote: pricing.isQuoteOnly,
    }];
  }).sort((left, right) => compareModels(left.model, right.model));

  return {
    fetchedAt: catalogue.fetchedAt || null,
    rows,
  };
}
