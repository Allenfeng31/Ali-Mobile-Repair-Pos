import { describe, expect, it } from 'vitest';

import { SAMSUNG_TABLET_MODEL_CONFIG_LIST } from './config';
import {
  getSamsungTabletBrandHubPricingRows,
  getSamsungTabletIndicativePriceGuidance,
  resolveSamsungTabletModelHubPricing,
} from './pricing';

describe('Samsung Tablet pricing', () => {
  it('maps all 39 canonical models to their Tab A or Tab S approved ranges', () => {
    expect(SAMSUNG_TABLET_MODEL_CONFIG_LIST).toHaveLength(39);

    for (const model of SAMSUNG_TABLET_MODEL_CONFIG_LIST) {
      const screen = getSamsungTabletIndicativePriceGuidance(model.modelSlug, 'screen-replacement');
      const battery = getSamsungTabletIndicativePriceGuidance(model.modelSlug, 'battery-replacement');

      expect(screen?.familyLabel).toBe(model.familyLabel);
      expect(battery?.familyLabel).toBe(model.familyLabel);
      expect(screen?.amountLabel).toBe(model.family === 'galaxy-tab-a' ? 'AUD $139–$220' : 'AUD $180–$550');
      expect(battery?.amountLabel).toBe(model.family === 'galaxy-tab-a' ? 'AUD $90–$179' : 'AUD $90–$220');
    }
  });

  it.each([
    ['galaxy-tab-a8-sm-x200-sm-x205', 'screen-replacement', 'AUD $139–$220'],
    ['galaxy-tab-a8-sm-x200-sm-x205', 'battery-replacement', 'AUD $90–$179'],
    ['galaxy-tab-a8-sm-x200-sm-x205', 'charging-port-replacement', 'AUD $85–$150'],
    ['galaxy-tab-a8-sm-x200-sm-x205', 'front-camera-replacement', 'AUD $99–$130'],
    ['galaxy-tab-a8-sm-x200-sm-x205', 'back-camera-replacement', 'AUD $99–$130'],
    ['galaxy-tab-s8-sm-x700-sm-x706', 'screen-replacement', 'AUD $180–$550'],
    ['galaxy-tab-s8-sm-x700-sm-x706', 'battery-replacement', 'AUD $90–$220'],
    ['galaxy-tab-s8-sm-x700-sm-x706', 'charging-port-replacement', 'AUD $90–$150'],
    ['galaxy-tab-s8-sm-x700-sm-x706', 'front-camera-replacement', 'AUD $109–$130'],
    ['galaxy-tab-s8-sm-x700-sm-x706', 'back-camera-replacement', 'AUD $109–$130'],
  ] as const)('uses the approved %s %s range', (modelSlug, repairSlug, amountLabel) => {
    expect(getSamsungTabletIndicativePriceGuidance(modelSlug, repairSlug)?.amountLabel).toBe(amountLabel);
  });

  it('limits Brand Hub presentation to the approved Screen and Battery rows while retaining all ten ranges', () => {
    expect(getSamsungTabletBrandHubPricingRows()).toEqual([
      { service: 'Galaxy Tab A Screen Replacement', range: '$139–$220' },
      { service: 'Galaxy Tab A Battery Replacement', range: '$90–$179' },
      { service: 'Galaxy Tab S Screen Replacement', range: '$180–$550' },
      { service: 'Galaxy Tab S Battery Replacement', range: '$90–$220' },
    ]);
  });

  it('uses the lowest positive POS service price for the Model Hub Hero', () => {
    expect(resolveSamsungTabletModelHubPricing({
      modelSlug: 'galaxy-tab-a8-sm-x200-sm-x205',
      repairTypes: [
        { slug: 'screen-replacement', name: 'Screen Replacement', price: 180, repairOrigin: 'pos' },
        { slug: 'battery-replacement', name: 'Battery Replacement', price: 120, repairOrigin: 'pos' },
      ],
    })).toEqual(expect.objectContaining({ kind: 'published', price: 120, repairName: 'Battery Replacement' }));
  });

  it('uses the lowest eligible positive POS quality tier and ignores invalid values', () => {
    expect(resolveSamsungTabletModelHubPricing({
      modelSlug: 'galaxy-tab-s8-sm-x700-sm-x706',
      repairTypes: [{
        slug: 'screen-replacement',
        name: 'Screen Replacement',
        price: 0,
        repairOrigin: 'pos',
        variants: [
          { quality_grade: 'Quote', price: 0, is_recommended: false },
          { quality_grade: 'Standard', price: 420, is_recommended: false },
          { quality_grade: 'Premium', price: 350, is_recommended: true },
        ],
      }],
    })).toEqual(expect.objectContaining({ kind: 'published', price: 350, repairName: 'Screen Replacement' }));
  });

  it('uses Screen and Battery indicative guidance when no eligible POS price exists', () => {
    expect(resolveSamsungTabletModelHubPricing({
      modelSlug: 'galaxy-tab-a8-sm-x200-sm-x205',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' }],
    })).toEqual(expect.objectContaining({
      kind: 'indicative',
      rows: [
        { service: 'Screen Replacement', range: 'AUD $139–$220' },
        { service: 'Battery Replacement', range: 'AUD $90–$179' },
      ],
    }));
  });

  it('does not treat a non-POS value as a published price', () => {
    expect(resolveSamsungTabletModelHubPricing({
      modelSlug: 'galaxy-tab-a8-sm-x200-sm-x205',
      repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 65, repairOrigin: 'synthetic-backfill' }],
    }).kind).toBe('indicative');
  });
});
