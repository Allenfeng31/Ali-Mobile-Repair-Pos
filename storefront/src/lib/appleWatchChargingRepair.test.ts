import { describe, expect, it } from 'vitest';

import { transformPOSToCatalog } from './api';
import type { RawItem } from './inventoryUtils';
import {
  APPLE_WATCH_CHARGING_REPAIR_NAME,
  APPLE_WATCH_CHARGING_REPAIR_SLUG,
  APPLE_WATCH_MODELS,
  getAliMobileEnhancedAppleWatchSeoPocket,
  getAppleWatchSameModelRepairLinks,
  isConfiguredAppleWatchModel,
  withAppleWatchChargingRepairOption,
} from './seo/content/apple-watch';

const fixtureItem = (id: number, model: string, service: string): RawItem => ({
  id,
  name: service,
  model: `Apple Watch||${model}`,
  price: 0,
  category: 'watch',
});

describe('Apple Watch charging repair catalogue policy', () => {
  it('keeps one configured diagnostic Charging Repair route per Apple Watch model and no legacy page content', () => {
    expect(APPLE_WATCH_MODELS).toHaveLength(22);

    for (const model of APPLE_WATCH_MODELS) {
      expect(isConfiguredAppleWatchModel(model)).toBe(true);
      const pocket = getAliMobileEnhancedAppleWatchSeoPocket({ modelSlug: model, repairSlug: APPLE_WATCH_CHARGING_REPAIR_SLUG });
      expect(pocket).toEqual(expect.objectContaining({ repairSlug: APPLE_WATCH_CHARGING_REPAIR_SLUG }));
      expect(pocket?.faq.some((entry) => /magnetic charging/i.test(entry.answer))).toBe(true);
      expect(getAppleWatchSameModelRepairLinks(model, 'screen-replacement').map((link) => link.href))
        .toContain(`/repairs/watch/apple/${model}/charging-repair`);
    }

    expect(isConfiguredAppleWatchModel('apple-watch-unconfigured')).toBe(false);
    expect(getAliMobileEnhancedAppleWatchSeoPocket({
      modelSlug: 'apple-watch-unconfigured',
      repairSlug: APPLE_WATCH_CHARGING_REPAIR_SLUG,
    })).toBeNull();
  });

  it('replaces any Apple Watch physical-port row with one zero-price diagnostic service only for configured models', () => {
    const catalogue = transformPOSToCatalog([
      fixtureItem(1, 'Apple Watch Series 3 38mm', 'Screen Replacement'),
      fixtureItem(2, 'Apple Watch Series 3 38mm', 'Charging Port Replacement'),
      fixtureItem(3, 'Apple Watch Unconfigured', 'Screen Replacement'),
      { id: 4, name: 'Charging Port Replacement', model: 'Samsung||Galaxy S24', price: 99, category: 'phone' },
    ]);
    const apple = catalogue.find((brand) => brand.category === 'watch' && brand.slug === 'apple');
    const configured = apple?.models.find((model) => model.slug === 'apple-watch-series-3-38mm');
    const unconfigured = apple?.models.find((model) => model.slug === 'apple-watch-unconfigured');
    const samsung = catalogue.find((brand) => brand.category === 'phone' && brand.slug === 'samsung');

    expect(configured?.repairTypes.filter((repair) => repair.slug === APPLE_WATCH_CHARGING_REPAIR_SLUG)).toEqual([
      expect.objectContaining({ name: APPLE_WATCH_CHARGING_REPAIR_NAME, price: 0, sourceType: 'diagnostic' }),
    ]);
    expect(configured?.repairTypes.some((repair) => repair.slug === 'charging-port-replacement')).toBe(false);
    expect(unconfigured?.repairTypes.some((repair) => repair.slug === APPLE_WATCH_CHARGING_REPAIR_SLUG)).toBe(false);
    expect(unconfigured?.repairTypes.some((repair) => repair.slug === 'charging-port-replacement')).toBe(false);
    expect(samsung?.models[0].repairTypes).toContainEqual(expect.objectContaining({ slug: 'charging-port-replacement', price: 99 }));
  });

  it('does not create a Watch diagnostic option outside the configured Apple Watch boundary', () => {
    const realRepair = { slug: 'screen-replacement', name: 'Screen Replacement', price: 0 };

    expect(withAppleWatchChargingRepairOption([realRepair], 'phone', 'apple', 'apple-watch-series-3-38mm'))
      .toEqual([realRepair]);
    expect(withAppleWatchChargingRepairOption([realRepair], 'watch', 'apple', 'apple-watch-unconfigured'))
      .toEqual([realRepair]);
  });
});
