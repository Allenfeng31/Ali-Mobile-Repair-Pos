import { describe, expect, it } from 'vitest';
import {
  GRANDFATHERED_WATER_DAMAGE_PATHS,
  GRANDFATHERED_WATER_DAMAGE_PATH_SET,
} from '@/data/grandfatheredWaterDamagePaths';
import { getPhase1DniConsolidationDestination } from '@/data/phase1DniConsolidationPaths';
import {
  buildCanonicalModelRepairPath,
  getCentralWaterDamageHref,
  getGrandfatheredWaterDamageStaticParams,
  getModelHubWaterDamageHref,
  getModelHubRepairHref,
  getWaterDamageSitemapPaths,
  isGrandfatheredWaterDamagePath,
  isWaterDamageRepairSlug,
} from './waterDamageRouting';

describe('grandfathered Water Damage paths', () => {
  it('keeps the approved 426-path set valid and alias-free', () => {
    expect(GRANDFATHERED_WATER_DAMAGE_PATHS).toHaveLength(426);
    expect(GRANDFATHERED_WATER_DAMAGE_PATH_SET.size).toBe(426);

    for (const path of GRANDFATHERED_WATER_DAMAGE_PATHS) {
      expect(path).toMatch(/^\/repairs\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/water-damage-repair$/);
      expect(path).not.toBe('/repairs/water-damage');
      expect(path).not.toMatch(/[?#]|localhost|tel:|https?:\/\//);
      expect(path).not.toMatch(/^\/repairs\/phone\/(google|pixel)\//);
    }
  });
});

describe('Water Damage routing helpers', () => {
  it.each([
    ['Galaxy A16', { category: 'phone', brand: 'samsung', model: 'galaxy-a16', repairSlug: 'water-damage-repair' }, '/repairs/phone/samsung/galaxy-a16/water-damage-repair'],
    ['Galaxy S24 Ultra', { category: 'phone', brand: 'samsung', model: 'galaxy-s24-ultra', repairSlug: 'water-damage-repair' }, '/repairs/water-damage'],
    ['iPhone 17 Pro Max', { category: 'phone', brand: 'iphone', model: 'iphone-17-pro-max', repairSlug: 'water-damage-repair' }, '/repairs/phone/iphone/iphone-17-pro-max/water-damage-repair'],
    ['Galaxy Tab S6 Lite', { category: 'tablet', brand: 'samsung', model: 'galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619', repairSlug: 'water-damage-repair' }, '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619/water-damage-repair'],
    ['Apple Watch Series 7 45mm', { category: 'watch', brand: 'apple', model: 'apple-watch-series-7-45mm', repairSlug: 'water-damage-repair' }, '/repairs/watch/apple/apple-watch-series-7-45mm/water-damage-repair'],
    ['Pixel 8 Pro', { category: 'phone', brand: 'google', model: 'pixel-8-pro', repairSlug: 'water-damage-repair' }, '/repairs/phone/google-pixel/pixel-8-pro/water-damage-repair'],
    ['Pixel 9', { category: 'phone', brand: 'google-pixel', model: 'pixel-9', repairSlug: 'water-damage-repair' }, '/repairs/water-damage'],
    ['MacBook Air M2 13', { category: 'laptop', brand: 'macbook', model: 'macbook-air-m2-13-2022', repairSlug: 'water-damage-repair' }, '/repairs/laptop/macbook/macbook-air-m2-13-2022/water-damage-repair'],
    ['OPPO Find X8', { category: 'phone', brand: 'oppo', model: 'find-x8', repairSlug: 'water-damage-repair' }, '/repairs/water-damage'],
  ])('resolves the final model-hub target for %s', (_label, input, expected) => {
    expect(getModelHubWaterDamageHref(input)).toBe(expected);
  });

  it('resolves every policy-listed model Water Damage path directly to its retained page or the central page', () => {
    for (const path of GRANDFATHERED_WATER_DAMAGE_PATHS) {
      const [, , category, brand, model, repairSlug] = path.split('/');

      expect(getModelHubWaterDamageHref({ category, brand, model, repairSlug }))
        .toBe(getPhase1DniConsolidationDestination(path) ? '/repairs/water-damage' : path);
    }
  });

  it('sends real and synthetic Water Damage cards to the central hub', () => {
    expect(getModelHubRepairHref('water-damage-repair', '/repairs/phone/iphone/iphone-14/water-damage-repair')).toBe('/repairs/water-damage');
    expect(getModelHubRepairHref('water-damage', '/repairs/tablet/samsung/galaxy-tab-s9/water-damage-repair')).toBe('/repairs/water-damage');
  });

  it('preserves non-Water-Damage card links and canonical frozen paths', () => {
    const screenPath = '/repairs/phone/iphone/iphone-14/screen-replacement';
    const frozenPath = GRANDFATHERED_WATER_DAMAGE_PATHS[0];

    expect(getModelHubRepairHref('screen-replacement', screenPath)).toBe(screenPath);
    expect(isWaterDamageRepairSlug('water-damage-repair')).toBe(true);
    expect(isWaterDamageRepairSlug('water-damage')).toBe(true);
    expect(isWaterDamageRepairSlug('water-damage-cleaning')).toBe(false);
    expect(isWaterDamageRepairSlug('logic-board-repair')).toBe(false);
    expect(isGrandfatheredWaterDamagePath(frozenPath)).toBe(true);
    expect(buildCanonicalModelRepairPath('phone', 'google', 'pixel-8-pro', 'water-damage-repair')).toBe('/repairs/phone/google-pixel/pixel-8-pro/water-damage-repair');
    expect(getCentralWaterDamageHref()).toBe('/repairs/water-damage');
    expect(getWaterDamageSitemapPaths()).toHaveLength(427);
    expect(new Set(getWaterDamageSitemapPaths())).toHaveLength(427);
    expect(getGrandfatheredWaterDamageStaticParams()).toHaveLength(426);
  });
});
