import { describe, expect, it } from 'vitest';

import {
  APPLE_WATCH_MODELS,
  APPLE_WATCH_REPAIRS,
  APPLE_WATCH_STANDARD_TURNAROUND_MINUTES,
  getAliMobileEnhancedAppleWatchSeoPocket,
  getAppleWatchStandardTurnaroundMinutes,
} from '@/lib/seo/content/apple-watch';
import { getAppleWatchCatalogueStartingPrice } from '@/lib/repairStartingPrices';

describe('Apple Watch commercial contract', () => {
  it('derives the brand minimum from positive standard POS prices only', () => {
    const models = [{
      repairTypes: [
        { slug: 'screen-replacement', price: 140, repairOrigin: 'synthetic-backfill' },
        { slug: 'screen-replacement', price: 120, repairOrigin: 'pos' },
        { slug: 'battery-replacement', price: 95, repairOrigin: 'pos' },
        { slug: 'charging-repair', price: 0, repairOrigin: 'pos' },
        { slug: 'water-damage-repair', price: 40, repairOrigin: 'pos' },
      ],
    }];

    expect(getAppleWatchCatalogueStartingPrice(models)).toBe(95);
    models[0].repairTypes[2].price = 105;
    expect(getAppleWatchCatalogueStartingPrice(models)).toBe(105);
  });

  it('falls back to quote-first when no exact standard POS price exists', () => {
    expect(getAppleWatchCatalogueStartingPrice([{
      repairTypes: [
        { slug: 'screen-replacement', price: 150, repairOrigin: 'synthetic-core' },
        { slug: 'battery-replacement', price: 0, repairOrigin: 'pos' },
        { slug: 'water-damage-repair', price: 85, repairOrigin: 'pos' },
      ],
    }])).toBeNull();
  });

  it('assigns 45 minutes to all 66 standard routes and excludes diagnostic families', () => {
    const routes = APPLE_WATCH_MODELS.flatMap((model) =>
      APPLE_WATCH_REPAIRS.map((repairType) => ({ model, repairType })),
    );

    expect(routes).toHaveLength(66);
    for (const route of routes) {
      expect(getAppleWatchStandardTurnaroundMinutes({
        category: 'watch',
        brand: 'apple',
        ...route,
      })).toBe(APPLE_WATCH_STANDARD_TURNAROUND_MINUTES);
    }

    expect(getAppleWatchStandardTurnaroundMinutes({
      category: 'watch',
      brand: 'apple',
      model: APPLE_WATCH_MODELS[0],
      repairType: 'water-damage-repair',
    })).toBeUndefined();
    expect(getAppleWatchStandardTurnaroundMinutes({
      category: 'watch',
      brand: 'apple',
      model: APPLE_WATCH_MODELS[0],
      repairType: 'logic-board-repair',
    })).toBeUndefined();
  });

  it('keeps internal implementation language out of all public meta descriptions', () => {
    for (const model of APPLE_WATCH_MODELS) {
      for (const repairType of APPLE_WATCH_REPAIRS) {
        const pocket = getAliMobileEnhancedAppleWatchSeoPocket({
          modelSlug: model,
          repairSlug: repairType,
        });

        expect(pocket?.metaDescription).not.toMatch(/live pricing kept unchanged|implementation|debug/i);
      }
    }
  });
});
