import { describe, expect, it } from 'vitest';
import {
  GRANDFATHERED_WATER_DAMAGE_PATHS,
  GRANDFATHERED_WATER_DAMAGE_PATH_SET,
} from '@/data/grandfatheredWaterDamagePaths';
import {
  buildCanonicalModelRepairPath,
  getCentralWaterDamageHref,
  getGrandfatheredWaterDamageStaticParams,
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
  it('sends real and synthetic Water Damage cards to the central hub', () => {
    expect(getModelHubRepairHref('water-damage-repair', '/repairs/phone/iphone/iphone-14/water-damage-repair')).toBe('/repairs/water-damage');
    expect(getModelHubRepairHref('water-damage', '/repairs/tablet/samsung/galaxy-tab-s9/water-damage-repair')).toBe('/repairs/water-damage');
  });

  it('preserves non-Water-Damage card links and canonical frozen paths', () => {
    const screenPath = '/repairs/phone/iphone/iphone-14/screen-replacement';
    const frozenPath = GRANDFATHERED_WATER_DAMAGE_PATHS[0];

    expect(getModelHubRepairHref('screen-replacement', screenPath)).toBe(screenPath);
    expect(isWaterDamageRepairSlug('water-damage-repair')).toBe(true);
    expect(isWaterDamageRepairSlug('logic-board-repair')).toBe(false);
    expect(isGrandfatheredWaterDamagePath(frozenPath)).toBe(true);
    expect(buildCanonicalModelRepairPath('phone', 'google', 'pixel-8-pro', 'water-damage-repair')).toBe('/repairs/phone/google-pixel/pixel-8-pro/water-damage-repair');
    expect(getCentralWaterDamageHref()).toBe('/repairs/water-damage');
    expect(getWaterDamageSitemapPaths()).toHaveLength(427);
    expect(new Set(getWaterDamageSitemapPaths())).toHaveLength(427);
    expect(getGrandfatheredWaterDamageStaticParams()).toHaveLength(426);
  });
});
