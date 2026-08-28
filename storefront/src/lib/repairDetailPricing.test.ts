import { describe, expect, it } from 'vitest';
import { resolveRepairDetailPricing } from './repairDetailPricing';

describe('resolveRepairDetailPricing', () => {
  it.each([
    [250, [{ quality_grade: 'Genuine', price: 250 }], 250, 'variant'],
    [250, [], 250, 'base'],
    [250, undefined, 250, 'base'],
    [250, [{ quality_grade: 'Genuine', price: 0 }], 250, 'base'],
    [250, [{ quality_grade: 'Quote', price: 0 }, { quality_grade: 'Genuine', price: 275 }], 275, 'variant'],
    [250, [{ quality_grade: 'Premium', price: 275 }, { quality_grade: 'Standard', price: 320 }], 275, 'variant'],
    [0, [{ quality_grade: 'Genuine', price: 275 }], 275, 'variant'],
  ])('uses a valid variant before the base price (%s, %j)', (basePrice, variants, resolvedPrice, source) => {
    const result = resolveRepairDetailPricing({ basePrice, variants });

    expect(result.resolvedPrice).toBe(resolvedPrice);
    expect(result.source).toBe(source);
    expect(result.isQuoteOnly).toBe(false);
    expect(result.canEmitOffer).toBe(true);
  });

  it.each([0, undefined, -1, Number.NaN])('fails closed for an invalid base price (%s)', (basePrice) => {
    const result = resolveRepairDetailPricing({ basePrice, variants: [] });

    expect(result).toMatchObject({
      resolvedPrice: null,
      source: 'none',
      isQuoteOnly: true,
      canEmitOffer: false,
    });
  });

  it('normalizes a numeric string only at the runtime boundary', () => {
    const result = resolveRepairDetailPricing({ basePrice: '250', variants: [] });

    expect(result).toMatchObject({
      resolvedPrice: 250,
      source: 'base',
      isQuoteOnly: false,
      canEmitOffer: true,
    });
  });

  it('filters invalid variants without reordering valid quality tiers', () => {
    const result = resolveRepairDetailPricing({
      basePrice: 250,
      variants: [
        { quality_grade: 'Unavailable', price: 0 },
        { quality_grade: 'Premium', price: 320 },
        { quality_grade: 'Standard', price: 275 },
        { quality_grade: 'Invalid', price: -1 },
      ],
    });

    expect(result.resolvedPrice).toBe(275);
    expect(result.validVariants.map((variant) => variant.quality_grade)).toEqual(['Premium', 'Standard']);
  });

  it.each([
    ['Screen Replacement', 250, []],
    ['Battery Replacement', 85, []],
    ['Front Camera Replacement', 85, [{ quality_grade: 'Unavailable', price: 0 }]],
  ])('uses the OPPO Find X8 Pro %s base price when no valid tier is available', (_repair, basePrice, variants) => {
    expect(resolveRepairDetailPricing({ basePrice, variants })).toMatchObject({
      resolvedPrice: basePrice,
      validVariants: [],
      source: 'base',
      isQuoteOnly: false,
      canEmitOffer: true,
    });
  });
});
