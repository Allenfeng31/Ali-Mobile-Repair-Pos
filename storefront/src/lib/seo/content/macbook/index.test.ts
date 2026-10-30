import { describe, expect, it } from 'vitest';
import {
  MACBOOK_REPAIRS,
  MACBOOK_MODELS,
  MACBOOK_BRAND_HUB_TIMING,
  MACBOOK_STANDARD_REPAIR_TURNAROUND_MINUTES,
  getAliMobileEnhancedMacBookSeoPocket,
  getMacBookCategoryHubLinks,
  isAliMobileEnhancedMacBookRepairPage,
  isNewMacBookProModel,
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
  it('keeps the Brand Hub wording aligned with the same approved 60-minute repair direction', () => {
    expect(MACBOOK_BRAND_HUB_TIMING).toEqual({
      label: 'Around 1 Hour',
      description: 'Many standard MacBook repairs take around 1 hour when the correct part is available and the repair path is confirmed. More complex repairs and diagnostic work may take longer.',
    });
  });

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

describe('MacBook M4/M5 Enhanced Repair Details', () => {
  const NEW_MODELS = [
    'macbook-pro-14-m4-2024',
    'macbook-pro-14-m4-pro-2024',
    'macbook-pro-14-m4-max-2024',
    'macbook-pro-16-m4-pro-2024',
    'macbook-pro-16-m4-max-2024',
    'macbook-pro-14-m5-2025',
    'macbook-pro-14-m5-pro-2026',
    'macbook-pro-14-m5-max-2026',
    'macbook-pro-16-m5-pro-2026',
    'macbook-pro-16-m5-max-2026',
  ];

  it.each(NEW_MODELS)('enables enhanced repair page and full pocket structure for %s', (modelSlug) => {
    for (const repairSlug of MACBOOK_REPAIRS) {
      expect(isAliMobileEnhancedMacBookRepairPage({
        category: 'laptop',
        brand: 'macbook',
        model: modelSlug,
        'repair-type': repairSlug,
      })).toBe(true);

      const pocket = getAliMobileEnhancedMacBookSeoPocket({ modelSlug, repairSlug });
      expect(pocket).not.toBeNull();
      expect(pocket?.quickAnswer).toBeTruthy();
      expect(pocket?.repairOptions.length).toBeGreaterThanOrEqual(2);
      expect(pocket?.commonProblems.length).toBeGreaterThanOrEqual(3);
      expect(pocket?.diagnosticSteps.length).toBeGreaterThanOrEqual(3);
      expect(pocket?.faq.length).toBe(6);
      expect(pocket?.serviceSection.cards.length).toBe(3);
      expect(pocket?.localService.items.length).toBe(3);
      expect(pocket?.finalCta.bullets.length).toBe(3);

      expect(isNewMacBookProModel(modelSlug)).toBe(true);
      expect(pocket?.turnaroundMinutes).toBe(60);
    }
  });

  it.each([
    'macbook-pro-1416-m4-promax-2024',
    'macbook-pro-1416-m5-promax-2026',
  ])('does not assign enhanced model content to ambiguous combined slug %s', (transitionalSlug) => {
    for (const repairSlug of MACBOOK_REPAIRS) {
      expect(isAliMobileEnhancedMacBookRepairPage({
        category: 'laptop',
        brand: 'macbook',
        model: transitionalSlug,
        'repair-type': repairSlug,
      })).toBe(false);
      expect(getAliMobileEnhancedMacBookSeoPocket({ modelSlug: transitionalSlug, repairSlug })).toBeNull();
    }
  });
});
