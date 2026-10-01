import { describe, expect, it } from 'vitest';

import {
  MOTHERBOARD_REPAIR_NAME,
  MOTHERBOARD_REPAIR_SLUG,
  getMotherboardBookingHref,
  resolveMotherboardSelection,
} from './motherboardRepair';
import type { BrandEntry } from './publicRepairCataloguePolicy';

const brands: BrandEntry[] = [
  { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '📱', models: [{ model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [] }] },
  { category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '📱', models: [{ model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [] }] },
  { category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '📱', models: [{ model: 'Find X5 Pro', slug: 'find-x5-pro', repairTypes: [] }] },
  { category: 'phone', brand: 'Asus', slug: 'asus', icon: '📱', models: [{ model: 'ROG Phone 5', slug: 'rog-phone-5', repairTypes: [] }] },
  { category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: '💻', models: [{ model: 'MacBook Air (M3)', slug: 'macbook-air-m3', repairTypes: [] }] },
  { category: 'laptop', brand: 'Dell', slug: 'dell', icon: '💻', models: [{ model: 'XPS 13', slug: 'xps-13', repairTypes: [] }] },
  { category: 'tablet', brand: 'iPad', slug: 'ipad', icon: '📟', models: [{ model: 'iPad Pro', slug: 'ipad-pro', repairTypes: [] }] },
  { category: 'watch', brand: 'Apple Watch', slug: 'apple-watch', icon: '⌚', models: [{ model: 'Series 9', slug: 'series-9', repairTypes: [] }] },
];

describe('Motherboard Repair selection', () => {
  it.each([
    ['phone', 'samsung', 'galaxy-s21', 'Samsung', 'Galaxy S21'],
    ['phone', 'google-pixel', 'pixel-8-pro', 'Google Pixel', 'Pixel 8 Pro'],
    ['phone', 'oppo', 'find-x5-pro', 'OPPO', 'Find X5 Pro'],
    ['phone', 'asus', 'rog-phone-5', 'Asus', 'ROG Phone 5'],
    ['laptop', 'macbook', 'macbook-air-m3', 'MacBook', 'MacBook Air (M3)'],
  ])('accepts the eligible %s identity %s/%s', (category, brandSlug, modelSlug, brand, model) => {
    expect(resolveMotherboardSelection(brands, { category, brand: brandSlug, model: modelSlug })).toMatchObject({
      category,
      brandSlug,
      modelSlug,
      brand,
      model,
    });
  });

  it.each([
    { category: 'phone', brand: 'macbook', model: 'macbook-air-m3' },
    { category: 'laptop', brand: 'samsung', model: 'galaxy-s21' },
    { category: 'laptop', brand: 'dell', model: 'xps-13' },
    { category: 'tablet', brand: 'ipad', model: 'ipad-pro' },
    { category: 'watch', brand: 'apple-watch', model: 'series-9' },
    { category: 'phone', brand: 'samsung', model: 'unknown-model' },
    { category: 'phone', brand: 'samsung' },
  ])('fails closed to the generic state for invalid or incomplete input', (query) => {
    expect(resolveMotherboardSelection(brands, query)).toBeNull();
  });

  it('builds a category-aware quote-only booking handoff without requiring a Logic Board POS row', () => {
    const selection = resolveMotherboardSelection(brands, {
      category: 'laptop', brand: 'macbook', model: 'macbook-air-m3',
    });

    expect(selection).not.toBeNull();
    expect(MOTHERBOARD_REPAIR_SLUG).toBe('logic-board-repair');
    expect(MOTHERBOARD_REPAIR_NAME).toBe('Motherboard & Logic Board Repair');
    expect(getMotherboardBookingHref(selection!)).toContain('category=laptop');
    expect(getMotherboardBookingHref(selection!)).toContain('brandSlug=macbook');
    expect(getMotherboardBookingHref(selection!)).toContain('modelSlug=macbook-air-m3');
    expect(getMotherboardBookingHref(selection!)).toContain('serviceSlug=logic-board-repair');
  });
});
