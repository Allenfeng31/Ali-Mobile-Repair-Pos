import { describe, expect, it } from 'vitest';
import {
  MACBOOK_REPAIRS,
  MACBOOK_MODELS,
  MACBOOK_STANDARD_REPAIR_TURNAROUND_MINUTES,
  getAliMobileEnhancedMacBookSeoPocket,
  getMacBookCategoryHubLinks,
  isAliMobileEnhancedMacBookRepairPage,
} from './index';

describe('getMacBookCategoryHubLinks', () => {
  it('uses the canonical Apple Watch hub while preserving the other category destinations', () => {
    const hrefs = getMacBookCategoryHubLinks().map((link) => link.href);

    expect(hrefs).toContain('/repairs/watch/apple');
    expect(hrefs).not.toContain('/repairs/watch/apple-watch');
    expect(hrefs.filter((href) => href !== '/repairs/watch/apple')).toEqual([
      '/repairs/laptop/macbook',
      '/repairs/laptop',
      '/repairs/phone/iphone',
      '/repairs/tablet/ipad',
      '/repairs/phone/samsung',
    ]);
  });
});

describe('MacBook standard repair timing', () => {
  it.each(MACBOOK_REPAIRS)('uses the shared 60-minute semantic source for %s', (repairSlug) => {
    const pocket = getAliMobileEnhancedMacBookSeoPocket({
      modelSlug: 'macbook-air-m2-13-2022',
      repairSlug,
    });

    expect(MACBOOK_STANDARD_REPAIR_TURNAROUND_MINUTES[repairSlug]).toBe(60);
    expect(pocket?.turnaroundMinutes).toBe(60);
  });

  it('applies the same approved 60-minute source to all 60 configured standard routes', () => {
    const pockets = MACBOOK_MODELS.flatMap((modelSlug) =>
      MACBOOK_REPAIRS.map((repairSlug) =>
        getAliMobileEnhancedMacBookSeoPocket({ modelSlug, repairSlug })
      )
    );

    expect(pockets).toHaveLength(60);
    expect(pockets.every((pocket) => pocket?.turnaroundMinutes === 60)).toBe(true);
  });

  it.each([
    'macbook-pro-1416-m1-promax-2021',
    'macbook-pro-1416-m2-promax-2023',
    'macbook-pro-1416-m3-promax-2024',
  ])('resolves the live Apple-silicon 14/16 public model slug %s', (modelSlug) => {
    for (const repairSlug of MACBOOK_REPAIRS) {
      expect(isAliMobileEnhancedMacBookRepairPage({
        category: 'laptop',
        brand: 'macbook',
        model: modelSlug,
        'repair-type': repairSlug,
      })).toBe(true);
      expect(getAliMobileEnhancedMacBookSeoPocket({ modelSlug, repairSlug })?.turnaroundMinutes).toBe(60);
    }
  });

  it('keeps Water Damage and Logic Board outside the standard timing source', () => {
    expect(getAliMobileEnhancedMacBookSeoPocket({
      modelSlug: 'macbook-air-m2-13-2022',
      repairSlug: 'water-damage-repair',
    })).toBeNull();
    expect(getAliMobileEnhancedMacBookSeoPocket({
      modelSlug: 'macbook-air-m2-13-2022',
      repairSlug: 'logic-board-repair',
    })).toBeNull();
  });
});
