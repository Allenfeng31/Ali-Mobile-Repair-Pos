import { describe, expect, it } from 'vitest';
import { getQuickQuoteModelLabel, searchQuickQuoteItems } from './quickQuoteSearch';

const inventory = [
  { id: 1, brand: 'Google', model: 'Pixel 7', device_model: 'GVU6C', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'GOO-P7-SCR-P', price: 289, stock: 2 },
  { id: 2, brand: 'Google', model: 'Pixel 7 Pro', device_model: 'GP4BC', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Genuine', sku: 'GOO-P7P-SCR-G', price: 449, stock: 1 },
  { id: 3, brand: 'Google', model: 'Pixel 7a', device_model: 'GWKK3', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'GOO-P7A-SCR-P', price: 239, stock: 0 },
  { id: 4, brand: 'Google', model: 'Pixel 8', device_model: 'GKWS6', name: 'Battery Replacement', category: 'Phone Repair', quality_grade: 'Genuine', sku: 'GOO-P8-BAT-G', price: 189, stock: 2 },
  { id: 5, brand: 'Apple', model: 'iPhone 16', device_model: 'A3287', name: 'Back Housing Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'APP-IP16-HOUS-P', price: 329, stock: 1 },
  { id: 6, brand: 'Apple', model: 'iPhone 16 Pro', device_model: 'A3294', name: 'Back Housing Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'APP-IP16P-HOUS-P', price: 449, stock: 1 },
  { id: 7, brand: 'Samsung', model: 'Galaxy S24', device_model: 'SM-S921B', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Genuine', sku: 'SAM-S24-SCR-G', price: 399, stock: 1 },
  { id: 8, brand: 'Motorola', model: 'Edge 50', device_model: 'XT2407-1', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'MOT-E50-SCR-P', price: 249, stock: 3 },
  { id: 9, brand: 'Motorola', model: 'Moto G85 5G', device_model: 'XT2427-3', name: 'Screen Replacement', category: 'Phone Repair', quality_grade: 'Premium', sku: 'MOT-G85-SCR-P', price: 229, stock: 2 },
];

describe('searchQuickQuoteItems', () => {
  it('turns internal category-prefixed model values into a customer-safe label', () => {
    expect(getQuickQuoteModelLabel({ id: 10, model: 'P iPhone||iPhone 16', brand: 'P iPhone' })).toBe('iPhone 16');
    expect(getQuickQuoteModelLabel({ id: 11, model: 'P Google||Pixel 7', brand: 'P Google' })).toBe('Google Pixel 7');
  });

  it.each([
    ['google pixel', [1, 2, 3, 4]],
    ['google pixel screen', [1, 2, 3]],
    ['pixel 7 screen', [1, 2, 3]],
    ['pixel screen', [1, 2, 3]],
    ['iphone 16 back', [5, 6]],
    ['16 back', [5, 6]],
    ['iphone 16 back housing', [5, 6]],
    ['samsung s24 screen', [7]],
    ['motorola screen', [8, 9]],
    ['sm-s921', [7]],
  ])('matches multi-token and prefix query %s', (query, ids) => {
    expect(searchQuickQuoteItems(inventory, query).map((item) => item.id)).toEqual(ids);
  });

  it('ranks the exact base model ahead of similarly named variants', () => {
    expect(searchQuickQuoteItems(inventory, 'pixel 7 screen').map((item) => item.id)).toEqual([1, 2, 3]);
    expect(searchQuickQuoteItems(inventory, 'iphone 16 back').map((item) => item.id)).toEqual([5, 6]);
  });

  it('uses a conservative typo fallback only when direct token matches fail', () => {
    expect(searchQuickQuoteItems(inventory, 'motrola screen').map((item) => item.id)).toEqual([8, 9]);
    expect(searchQuickQuoteItems(inventory, 'pixel 7 scren').map((item) => item.id)).toEqual([1, 2, 3]);
    expect(searchQuickQuoteItems(inventory, 'pixie screen')).toEqual([]);
  });

  it('searches a large inventory within an interactive budget', () => {
    const largeInventory = Array.from({ length: 5_000 }, (_, index) => ({
      ...inventory[index % inventory.length],
      id: index + 100,
      sku: `PERF-${index}`,
    }));
    const startedAt = performance.now();
    const results = searchQuickQuoteItems(largeInventory, 'google pixel screen', 40);
    const duration = performance.now() - startedAt;

    expect(results).toHaveLength(40);
    expect(duration).toBeLessThan(250);
  });
});
