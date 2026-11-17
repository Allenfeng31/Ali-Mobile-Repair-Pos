import { createHash } from 'node:crypto';

import { buildIphoneScreenRepairPriceTable, IPHONE_SCREEN_REPAIR_COST_SLUG } from '@/data/iphoneScreenRepairCost';
import { buildIpadScreenRepairPriceTable, IPAD_SCREEN_REPAIR_COST_SLUG } from '@/data/ipadScreenRepairCost';
import { buildMacbookAirScreenRepairPriceTable, MACBOOK_SCREEN_REPAIR_BLOG_SLUG } from '@/data/macbookScreenRepairBlog';
import { buildPhoneScreenBrandPriceTable, PHONE_SCREEN_BLACK_BLOG_SLUG } from '@/data/phoneScreenBlackArticle';
import type { BrandEntry } from './publicRepairCataloguePolicy';
import { applyMacBookCataloguePresentation } from './macbookCataloguePresentation';
import type { RepairCatalog } from './publicRepairCataloguePolicy';

export const PRICE_BLOG_SLUGS = [
  IPHONE_SCREEN_REPAIR_COST_SLUG,
  MACBOOK_SCREEN_REPAIR_BLOG_SLUG,
  IPAD_SCREEN_REPAIR_COST_SLUG,
  PHONE_SCREEN_BLACK_BLOG_SLUG,
] as const;
export type PriceBlogSlug = typeof PRICE_BLOG_SLUGS[number];
export type BlogPriceFreshness = Partial<Record<PriceBlogSlug, { fingerprint: string; priceChangedAt: string | null }>>;

export function isPriceBlogSlug(slug: string): slug is PriceBlogSlug {
  return (PRICE_BLOG_SLUGS as readonly string[]).includes(slug);
}

/** Use the same public table builders as the rendered articles, excluding fetch time and input order. */
export function displayedBlogPriceFingerprints(brands: BrandEntry[]): Record<PriceBlogSlug, string> {
  const displayedBrands = applyMacBookCataloguePresentation({ brands } as RepairCatalog).brands;
  const tables = {
    [IPHONE_SCREEN_REPAIR_COST_SLUG]: buildIphoneScreenRepairPriceTable({ brands: displayedBrands }),
    [MACBOOK_SCREEN_REPAIR_BLOG_SLUG]: buildMacbookAirScreenRepairPriceTable({ brands: displayedBrands }),
    [IPAD_SCREEN_REPAIR_COST_SLUG]: buildIpadScreenRepairPriceTable({ brands: displayedBrands }),
    [PHONE_SCREEN_BLACK_BLOG_SLUG]: buildPhoneScreenBrandPriceTable({ brands: displayedBrands }),
  };
  return Object.fromEntries(PRICE_BLOG_SLUGS.map((slug) => {
    const table = tables[slug];
    const normalized = table.rows.map((row) => {
      if ('range' in row) {
        return {
          brand: row.brand,
          min: row.range.min,
          max: row.range.max,
        };
      }
      if ('price' in row) {
        return { model: row.model, scope: row.scope, price: row.price, isQuote: row.isQuote };
      }
      return {
        model: row.model,
        prices: Object.entries(row.prices).sort(([left], [right]) => left.localeCompare(right)),
        quoteTiers: [...row.quoteTiers].sort(),
      };
    }).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    return [slug, createHash('sha256').update(JSON.stringify(normalized)).digest('hex')];
  })) as Record<PriceBlogSlug, string>;
}

export function nextBlogPriceFreshness(
  brands: BrandEntry[], previous: BlogPriceFreshness | undefined, confirmedAt: string,
): BlogPriceFreshness {
  const fingerprints = displayedBlogPriceFingerprints(brands);
  return Object.fromEntries(PRICE_BLOG_SLUGS.map((slug) => {
    const prior = previous?.[slug];
    return [slug, {
      fingerprint: fingerprints[slug],
      // A missing fingerprint is an initial baseline, not evidence of a price change.
      priceChangedAt: prior?.fingerprint && prior.fingerprint !== fingerprints[slug]
        ? confirmedAt : prior?.priceChangedAt ?? null,
    }];
  })) as BlogPriceFreshness;
}

export function effectiveBlogDateModified(editorialDate: string, priceChangedAt?: string | null): string {
  if (!priceChangedAt || !Number.isFinite(Date.parse(priceChangedAt))) return editorialDate;
  return Date.parse(priceChangedAt) > Date.parse(editorialDate) ? priceChangedAt : editorialDate;
}
