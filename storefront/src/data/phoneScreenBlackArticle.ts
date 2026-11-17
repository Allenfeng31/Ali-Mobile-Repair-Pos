import { resolveRepairDetailPricing } from "@/lib/repairDetailPricing";

export const PHONE_SCREEN_BLACK_BLOG_SLUG = "phone-screen-black-but-still-on";

type CatalogueRepair = {
  slug: string;
  price?: number;
  variants?: Array<{ quality_grade: string; price: number; is_recommended?: boolean }>;
  sourceType?: "real" | "virtual" | "diagnostic";
  repairOrigin?: string;
};

export type PhoneScreenBrandPriceTable = {
  fetchedAt: string | null;
  rows: Array<{
    brand: string;
    href: string;
    range: { min: number; max: number };
  }>;
};

const BRAND_CONFIG = [
  { slug: "iphone", brand: "Apple iPhone", href: "/repairs/phone/iphone" },
  { slug: "samsung", brand: "Samsung Galaxy", href: "/repairs/phone/samsung" },
  { slug: "google-pixel", brand: "Google Pixel", href: "/repairs/phone/google" },
  { slug: "oppo", brand: "OPPO", href: "/repairs/phone/oppo" },
] as const;

/**
 * Builds the four compact ranges from published POS screen-replacement rows.
 * Variant prices take precedence over a base price, matching repair-detail
 * pricing. Quote-only, synthetic, virtual and diagnostic rows are excluded.
 */
export function buildPhoneScreenBrandPriceTable(catalogue: {
  fetchedAt?: string | null;
  brands: Array<{
    category: string;
    slug: string;
    models: Array<{ repairTypes: CatalogueRepair[] }>;
  }>;
}): PhoneScreenBrandPriceTable {
  const rows = BRAND_CONFIG.flatMap(({ slug, brand, href }) => {
    const catalogueBrand = catalogue.brands.find(
      (entry) => entry.category === "phone" && entry.slug === slug,
    );

    const modelPrices = (catalogueBrand?.models ?? []).flatMap(({ repairTypes }) => {
      const repair = repairTypes.find((entry) => entry.slug === "screen-replacement");
      if (
        !repair
        || repair.repairOrigin !== "pos"
        || repair.sourceType === "virtual"
        || repair.sourceType === "diagnostic"
      ) return [];

      const pricing = resolveRepairDetailPricing({
        basePrice: repair.price,
        variants: repair.variants,
      });
      const prices = pricing.validVariants.length > 0
        ? pricing.validVariants.map((variant) => variant.price)
        : pricing.resolvedPrice === null ? [] : [pricing.resolvedPrice];

      return prices.length > 0 ? [{ prices }] : [];
    });

    const prices = modelPrices.flatMap((entry) => entry.prices);
    if (prices.length === 0) return [];

    return [{
      brand,
      href,
      range: { min: Math.min(...prices), max: Math.max(...prices) },
    }];
  });

  return { fetchedAt: catalogue.fetchedAt || null, rows };
}
