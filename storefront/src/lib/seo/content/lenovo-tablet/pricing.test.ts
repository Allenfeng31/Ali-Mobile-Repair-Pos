import { describe, expect, it } from 'vitest';

import {
  getLenovoTabletIndicativePriceGuidance,
  resolveLenovoTabletModelHubPricing,
  resolveLenovoTabletRepairOptionPricing,
} from './pricing';

const p12QuoteOnlyRepairs = [
  { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' },
  { slug: 'battery-replacement', name: 'Battery Replacement', price: 0, repairOrigin: 'pos' },
  { slug: 'charging-port-replacement', name: 'Charging Port Repair', price: 0, repairOrigin: 'pos' },
  { slug: 'front-camera-replacement', name: 'Front Camera', price: 0, repairOrigin: 'pos' },
  { slug: 'back-camera-replacement', name: 'Back Camera', price: 0, repairOrigin: 'pos' },
] as const;

describe('Lenovo Tablet pricing', () => {
  it('uses the owner-approved ranges only for screen, battery, and charging repairs', () => {
    expect(getLenovoTabletIndicativePriceGuidance('lenovo-tab-p12-tb-370fu', 'screen-replacement')?.amountLabel)
      .toBe('AUD $120–$240');
    expect(getLenovoTabletIndicativePriceGuidance('lenovo-tab-p12-tb-370fu', 'battery-replacement')?.amountLabel)
      .toBe('AUD $89–$149');
    expect(getLenovoTabletIndicativePriceGuidance('lenovo-tab-p12-tb-370fu', 'charging-port-replacement')?.amountLabel)
      .toBe('AUD $79–$150');
    expect(getLenovoTabletIndicativePriceGuidance('lenovo-tab-p12-tb-370fu', 'front-camera-replacement')).toBeNull();
    expect(getLenovoTabletIndicativePriceGuidance('lenovo-tab-p12-tb-370fu', 'back-camera-replacement')).toBeNull();
  });

  it('uses published POS prices before indicative guidance for Lenovo Tab M11', () => {
    const repairs = [
      { slug: 'screen-replacement', name: 'Screen Replacement', price: 170, repairOrigin: 'pos' },
      { slug: 'battery-replacement', name: 'Battery Replacement', price: 100, repairOrigin: 'pos' },
      { slug: 'charging-port-replacement', name: 'Charging Port Repair', price: 100, repairOrigin: 'pos' },
    ] as const;

    expect(resolveLenovoTabletModelHubPricing({ modelSlug: 'lenovo-tab-m11', repairTypes: repairs }))
      .toEqual({ kind: 'published', price: 100, repairName: 'Battery Replacement' });
    expect(resolveLenovoTabletRepairOptionPricing({ modelSlug: 'lenovo-tab-m11', repair: repairs[0] }))
      .toEqual({ kind: 'published', price: 170, label: 'From $170' });
  });

  it('uses approved P12 indicative guidance and never static camera prices for zero, null, unpublished, or removed prices', () => {
    expect(resolveLenovoTabletModelHubPricing({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      repairTypes: p12QuoteOnlyRepairs,
    })).toEqual({
      kind: 'indicative',
      rows: [
        { service: 'Screen Replacement', range: 'AUD $120–$240' },
        { service: 'Battery Replacement', range: 'AUD $89–$149' },
      ],
    });

    expect(resolveLenovoTabletRepairOptionPricing({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      repair: p12QuoteOnlyRepairs[2],
    })).toEqual({ kind: 'indicative', label: 'Indicative AUD $79–$150 · Quote on Request', range: 'AUD $79–$150' });
    expect(resolveLenovoTabletRepairOptionPricing({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      repair: p12QuoteOnlyRepairs[3],
    })).toEqual({ kind: 'quote', label: 'Quote on Request' });
    expect(resolveLenovoTabletRepairOptionPricing({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      repair: { slug: 'screen-replacement', name: 'Screen Replacement', price: null, repairOrigin: 'pos' },
    })).toEqual({ kind: 'indicative', label: 'Indicative AUD $120–$240 · Quote on Request', range: 'AUD $120–$240' });
    expect(resolveLenovoTabletRepairOptionPricing({
      modelSlug: 'lenovo-tab-p12-tb-370fu',
      repair: { slug: 'screen-replacement', name: 'Screen Replacement', price: 240, repairOrigin: 'synthetic-backfill' },
    })).toEqual({ kind: 'indicative', label: 'Indicative AUD $120–$240 · Quote on Request', range: 'AUD $120–$240' });
  });
});
