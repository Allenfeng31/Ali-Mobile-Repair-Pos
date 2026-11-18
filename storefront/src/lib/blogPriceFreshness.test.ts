import { describe, expect, it } from 'vitest';

import { MACBOOK_SCREEN_REPAIR_BLOG_SLUG } from '@/data/macbookScreenRepairBlog';
import { IPHONE_SCREEN_REPAIR_COST_SLUG } from '@/data/iphoneScreenRepairCost';
import { IPAD_SCREEN_REPAIR_COST_SLUG } from '@/data/ipadScreenRepairCost';
import { PHONE_SCREEN_BLACK_BLOG_SLUG } from '@/data/phoneScreenBlackArticle';
import { SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG } from '@/data/samsungGalaxySScreenRepairCost';
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
  { category: 'tablet', brand: 'iPad', slug: 'ipad', icon: '', models: [
    { model: 'iPad 11th Generation', slug: 'ipad-11th-generation', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 149, repairOrigin: 'pos', variants: [
        { quality_grade: 'Genuine', price: 149, is_recommended: true },
        { quality_grade: 'Premium', price: 199, is_recommended: false },
      ] },
    ] },
    { model: 'iPad Air 5th Generation', slug: 'ipad-air-5th-generation', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 429, repairOrigin: 'pos' },
    ] },
  ] },
  { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{
    model: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', repairTypes: [
      { name: 'Screen', slug: 'screen-replacement', price: 320, repairOrigin: 'pos', variants: [
        { quality_grade: 'Genuine', price: 399, is_recommended: true },
        { quality_grade: 'Premium', price: 320, is_recommended: false },
      ] },
    ],
  }] },
];
const clone = () => structuredClone(brands);

describe('verified displayed Blog price freshness', () => {
  it('initializes all fingerprints without inventing a price-change time', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    expect(initial[IPHONE_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBeNull();
    expect(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt).toBeNull();
    expect(initial[IPAD_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBeNull();
    expect(initial[PHONE_SCREEN_BLACK_BLOG_SLUG]?.priceChangedAt).toBeNull();
    expect(initial[SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBeNull();
  });

  it('keeps dates through a no-op refresh, input reordering and a restart', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const reordered = clone();
    reordered.reverse();
    reordered.find((brand) => brand.slug === 'iphone')!.models[0]!.repairTypes[0]!.variants!.reverse();
    const afterRestart = nextBlogPriceFreshness(reordered, JSON.parse(JSON.stringify(initial)), '2026-11-14T02:00:00Z');
    expect(afterRestart).toEqual(initial);
    expect(displayedBlogPriceFingerprints(reordered)).toEqual(displayedBlogPriceFingerprints(brands));
  });

  it('updates the iPhone and four-brand range dates for a displayed iPhone price change', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[0]!.models[0]!.repairTypes[0]!.variants![0]!.price = 309;
    const next = nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z');
    expect(next[IPHONE_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(next[PHONE_SCREEN_BLACK_BLOG_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(next[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]).toEqual(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]);
  });

  it('updates the four-brand and Samsung article dates for a displayed Samsung price change', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[3]!.models[0]!.repairTypes[0]!.price = 330;
    changed[3]!.models[0]!.repairTypes[0]!.variants![1]!.price = 330;
    const next = nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z');

    expect(next[PHONE_SCREEN_BLACK_BLOG_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(next[SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(next[IPHONE_SCREEN_REPAIR_COST_SLUG]).toEqual(initial[IPHONE_SCREEN_REPAIR_COST_SLUG]);
    expect(next[IPAD_SCREEN_REPAIR_COST_SLUG]).toEqual(initial[IPAD_SCREEN_REPAIR_COST_SLUG]);
    expect(next[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]).toEqual(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]);
  });

  it('updates Samsung freshness for a displayed Genuine price or canonical grade-label change', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const priceChanged = clone();
    priceChanged[3]!.models[0]!.repairTypes[0]!.variants![0]!.price = 409;
    const priced = nextBlogPriceFreshness(priceChanged, initial, '2026-11-14T03:00:00Z');
    expect(priced[SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');

    const labelChanged = clone();
    labelChanged[3]!.models[0]!.repairTypes[0]!.variants![1]!.quality_grade = 'Aftermarket';
    const renamed = nextBlogPriceFreshness(labelChanged, initial, '2026-11-15T03:00:00Z');
    expect(renamed[SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-15T03:00:00Z');
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

  it('updates only the iPad date for a displayed price or Quote Required transition', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[2]!.models[0]!.repairTypes[0]!.variants![0]!.price = 159;
    const priced = nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z');
    changed[2]!.models[0]!.repairTypes[0]!.variants![0]!.price = 0;
    const quote = nextBlogPriceFreshness(changed, priced, '2026-11-15T03:00:00Z');

    expect(priced[IPAD_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-14T03:00:00Z');
    expect(quote[IPAD_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt).toBe('2026-11-15T03:00:00Z');
    expect(quote[IPHONE_SCREEN_REPAIR_COST_SLUG]).toEqual(initial[IPHONE_SCREEN_REPAIR_COST_SLUG]);
    expect(quote[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]).toEqual(initial[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]);
  });

  it('does not update the iPad date when a hidden higher tier changes but the visible from-price does not', () => {
    const initial = nextBlogPriceFreshness(brands, undefined, confirmedAt);
    const changed = clone();
    changed[2]!.models[0]!.repairTypes[0]!.variants![1]!.price = 209;

    expect(nextBlogPriceFreshness(changed, initial, '2026-11-14T03:00:00Z')).toEqual(initial);
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
