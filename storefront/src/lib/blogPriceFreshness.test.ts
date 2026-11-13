import { describe, expect, it } from 'vitest';

import { MACBOOK_SCREEN_REPAIR_BLOG_SLUG } from '@/data/macbookScreenRepairBlog';
import { IPHONE_SCREEN_REPAIR_COST_SLUG } from '@/data/iphoneScreenRepairCost';
import { displayedBlogPriceFingerprints, effectiveBlogDateModified, nextBlogPriceFreshness } from './blogPriceFreshness';
import type { BrandEntry } from './publicRepairCataloguePolicy';

const confirmedAt = '2026-11-13T02:00:00.000Z';
const brands: BrandEntry[] = [
  { category: 'phone', brand: 'iPhone', slug: 'iphone', icon: '', models: [{
    model: 'iPhone 17', slug: 'iphone-17', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 0, repairOrigin: 'pos', variants: [
        { quality_grade: 'Premium', price: 299, is_recommended: false },
        { quality_grade: 'Standard', price: 199, is_recommended: true },
      ] },
      { name: 'Battery', slug: 'battery-replacement', price: 99, repairOrigin: 'pos' },
    ],
  }] },
  { category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: '', models: [
    { model: 'MacBook Air M2 2022', slug: 'macbook-air-m2', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 549, repairOrigin: 'pos' },
    ] },
    { model: 'MacBook Pro 2022', slug: 'macbook-pro', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 999, repairOrigin: 'pos' },
    ] },
  ] },
];
const clone = () => structuredClone(brands);

describe('verified displayed Blog price freshness', () => {
  it('initializes both fingerprints without inventing a price-change time', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    expect(initial[IPHONE_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBeNull();
    expect(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt).toBeNull();
  });

  it('keeps dates through a no-op refresh, input reordering and a restart', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const reordered = clone();
    reordered.reverse();
    reordered[1]!.models[0]!.repairTypes[0]!.variants!.reverse();
    const afterRestart = nextBlogPriceFreshness(reordered, JSON.parse(JSON.stringify(initial)), '2026-11-14T02:00:00Z');
    expect(afterRestart).toEqual(initial);
    expect(displayedBlogPriceFingerprints(reordered)).toEqual(displayedBlogPriceFingerprints(brands));
  });

  it('updates only the iPhone date for an iPhone displayed tier price change', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[0]!.models[0]!.repairTypes[0]!.variants![0]!.price = 309;
    const next = nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z');
    expect(next[IPHONE_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(next[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]).toEqual(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]);
  });

  it('updates only the MacBook date for an Air price or Quote Required transition', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[1]!.models[0]!.repairTypes[0]!.price = 579;
    const priced = nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z');
    changed[1]!.models[0]!.repairTypes[0]!.price = 0;
    const quote = nextBlogPriceFreshness(changed, priced, '2026-11-15T03:00:00Z');
    changed[1]!.models[0]!.repairTypes[0]!.price = 599;
    const restored = nextBlogPriceFreshness(changed, quote, '2026-11-16T03:00:00Z');
    expect(priced[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(quote[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt).toBe('2026-11-15T03:00:00Z');
    expect(restored[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt).toBe('2026-11-16T03:00:00Z');
    expect(quote[IPHONE_SCREEN_REPAIR_COST_SLUG]).toEqual(initial[IPHONE_SCREEN_REPAIR_COST_SLUG]);
  });

  it('ignores Pro and battery price changes', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[0]!.models[0]!.repairTypes[1]!.price = 109;
    changed[1]!.models[1]!.repairTypes[0]!.price = 1109;
    expect(nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z')).toEqual(initial);
  });

  it('takes the later of editorial and confirmed price dates', () => {
    expect(effectiveBlogDateModified('2026-11-15', '2026-11-14T03:00:00Z')).toBe('2026-11-15');
    expect(effectiveBlogDateModified('2026-11-12', '2026-11-14T03:00:00Z')).toBe('2026-11-14T03:00:00Z');
  });
});
