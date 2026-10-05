import { describe, expect, it } from 'vitest';
import { orderRepairVariantsForDisplay } from './repairTierDisplayOrder';

describe('orderRepairVariantsForDisplay', () => {
  it('orders known screen tiers without changing their attached prices', () => {
    const variants = [
      { quality_grade: 'Premium', price: 190 },
      { quality_grade: 'Standard', price: 170 },
      { quality_grade: 'Genuine', price: 320 },
    ];

    expect(orderRepairVariantsForDisplay('Screen Replacement', variants)).toEqual([
      { quality_grade: 'Standard', price: 170 },
      { quality_grade: 'Premium', price: 190 },
      { quality_grade: 'Genuine', price: 320 },
    ]);
  });

  it('orders every approved known screen tier', () => {
    const variants = [
      { quality_grade: 'Genuine', price: 320 },
      { quality_grade: 'Budget', price: 120 },
      { quality_grade: 'Premium', price: 190 },
      { quality_grade: 'Standard', price: 170 },
    ];

    expect(orderRepairVariantsForDisplay('Screen Replacement', variants).map((variant) => variant.quality_grade)).toEqual([
      'Budget', 'Standard', 'Premium', 'Genuine',
    ]);
  });

  it('keeps unknown screen tiers after known tiers in their original relative order', () => {
    const variants = [
      { quality_grade: 'Service Pack', price: 510 },
      { quality_grade: 'Genuine', price: 320 },
      { quality_grade: 'Premium OLED', price: 240 },
      { quality_grade: 'Standard', price: 170 },
      { quality_grade: 'Refurbished', price: 280 },
    ];

    expect(orderRepairVariantsForDisplay('Screen Replacement', variants).map((variant) => variant.quality_grade)).toEqual([
      'Standard', 'Genuine', 'Service Pack', 'Premium OLED', 'Refurbished',
    ]);
  });

  it('preserves non-screen source order exactly', () => {
    const variants = [
      { quality_grade: 'Genuine', price: 120 },
      { quality_grade: 'Standard', price: 80 },
      { quality_grade: 'Service Pack', price: 140 },
    ];

    expect(orderRepairVariantsForDisplay('Battery Replacement', variants)).toEqual(variants);
  });
});
