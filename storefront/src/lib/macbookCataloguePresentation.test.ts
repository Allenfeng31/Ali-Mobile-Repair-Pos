import { describe, expect, it } from 'vitest';
import {
  applyMacBookCataloguePresentation,
  HELD_SPECULATIVE_MACBOOK_MODELS,
  isAmbiguousLegacyMacBookModelSlug,
  MACBOOK_ALLOWED_REPAIR_SLUGS,
  MACBOOK_MODEL_SLUG_ALIASES,
  resolveMacBookCanonicalModelSlug,
  VERIFIED_NEW_MACBOOK_PRO_MODELS,
} from './macbookCataloguePresentation';
import type { RepairCatalog } from './publicRepairCataloguePolicy';

describe('MacBook Catalogue Presentation', () => {
  const sampleCatalog: RepairCatalog = {
    source: 'pos',
    catalogueSource: 'live-pos',
    brands: [
      {
        category: 'laptop',
        brand: 'MacBook',
        slug: 'macbook',
        icon: '💻',
        models: [
          {
            model: 'MacBook Pro 14"/16" M3 Pro/Max (2024)',
            slug: 'macbook-pro-1416-m3-promax-2024',
            modelCode: 'A2992, A2991',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 750, repairOrigin: 'pos' },
              { slug: 'battery-replacement', name: 'Battery Replacement', price: 240, repairOrigin: 'pos' },
              { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
              { slug: 'water-damage-repair', name: 'Water Damage Cleaning / Assessment', price: 0, repairOrigin: 'pos' },
              { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
              // Disallowed repair that should be filtered out
              { slug: 'keyboard-replacement', name: 'Keyboard Replacement', price: 290, repairOrigin: 'pos' },
              { slug: 'back-glass-replacement', name: 'Back Glass Replacement', price: 150, repairOrigin: 'pos' },
            ],
          },
          {
            model: 'MacBook Air M3 13" (2024)',
            slug: 'macbook-air-m3-13-2024',
            modelCode: 'A3113',
            repairTypes: [
              { slug: 'screen-replacement', name: 'Screen Replacement', price: 520, repairOrigin: 'pos' },
              { slug: 'battery-replacement', name: 'Battery Replacement', price: 210, repairOrigin: 'pos' },
              { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
              { slug: 'water-damage-repair', name: 'Water Damage Cleaning / Assessment', price: 0, repairOrigin: 'pos' },
              { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
            ],
          },
        ],
      },
    ],
  };

  it('corrects the existing M3 Pro/Max year from (2024) to (2023)', () => {
    const updated = applyMacBookCataloguePresentation(sampleCatalog);
    const macbook = updated.brands.find((b) => b.slug === 'macbook');
    const m3Model = macbook?.models.find((m) => m.slug === 'macbook-pro-1416-m3-promax-2024');

    expect(m3Model?.model).toBe('MacBook Pro 14"/16" M3 Pro/Max (2023)');
    expect(m3Model?.modelCode).toBe('A2992, A2991');
  });

  it('preserves existing exact-model POS prices for Screen and Battery on M3 Pro/Max', () => {
    const updated = applyMacBookCataloguePresentation(sampleCatalog);
    const macbook = updated.brands.find((b) => b.slug === 'macbook');
    const m3Model = macbook?.models.find((m) => m.slug === 'macbook-pro-1416-m3-promax-2024');

    const screen = m3Model?.repairTypes.find((r) => r.slug === 'screen-replacement');
    const battery = m3Model?.repairTypes.find((r) => r.slug === 'battery-replacement');

    expect(screen?.price).toBe(750);
    expect(battery?.price).toBe(240);
  });

  it('restricts repairs strictly to the five approved services', () => {
    const updated = applyMacBookCataloguePresentation(sampleCatalog);
    const macbook = updated.brands.find((b) => b.slug === 'macbook');
    const m3Model = macbook?.models.find((m) => m.slug === 'macbook-pro-1416-m3-promax-2024');

    const repairSlugs = m3Model?.repairTypes.map((r) => r.slug);
    expect(repairSlugs).toEqual([
      'screen-replacement',
      'battery-replacement',
      'charging-port-replacement',
      'water-damage-repair',
      'logic-board-repair',
    ]);
    expect(m3Model?.repairTypes.every((r) => MACBOOK_ALLOWED_REPAIR_SLUGS.has(r.slug))).toBe(true);
  });

  it('appends all ten officially verified 2024–2026 MacBook Pro models with Quote on Request behaviour', () => {
    const updated = applyMacBookCataloguePresentation(sampleCatalog);
    const macbook = updated.brands.find((b) => b.slug === 'macbook');

    expect(VERIFIED_NEW_MACBOOK_PRO_MODELS).toHaveLength(10);
    for (const newModel of VERIFIED_NEW_MACBOOK_PRO_MODELS) {
      const found = macbook?.models.find((m) => m.slug === newModel.slug);
      expect(found).toBeDefined();
      expect(found?.model).toBe(newModel.model);
      expect(found?.modelCode).toBe(newModel.modelCode);
      expect(found?.repairTypes).toHaveLength(5);
      expect(found?.repairTypes.every((r) => r.price === 0)).toBe(true);
    }
  });

  it('verifies exact A-numbers for all ten 2024–2026 models', () => {
    const expectedANumbers: Record<string, string> = {
      'macbook-pro-14-m4-2024': 'A3112',
      'macbook-pro-14-m4-pro-2024': 'A3401',
      'macbook-pro-14-m4-max-2024': 'A3185',
      'macbook-pro-16-m4-pro-2024': 'A3403',
      'macbook-pro-16-m4-max-2024': 'A3186',
      'macbook-pro-14-m5-2025': 'A3434',
      'macbook-pro-14-m5-pro-2026': 'A3426',
      'macbook-pro-14-m5-max-2026': 'A3427',
      'macbook-pro-16-m5-pro-2026': 'A3428',
      'macbook-pro-16-m5-max-2026': 'A3429',
    };

    for (const [slug, code] of Object.entries(expectedANumbers)) {
      const found = VERIFIED_NEW_MACBOOK_PRO_MODELS.find((m) => m.slug === slug);
      expect(found?.modelCode).toBe(code);
    }
  });

  it('keeps speculative M6 and PROLED XDR M5 models on HOLD without public routes', () => {
    expect(HELD_SPECULATIVE_MACBOOK_MODELS).toHaveLength(2);
    expect(HELD_SPECULATIVE_MACBOOK_MODELS.map((m) => m.name)).toEqual([
      'MacBook Pro 14" M6',
      'MacBook Pro 14"/16" PROLED XDR M5 Pro/Max',
    ]);
    expect(HELD_SPECULATIVE_MACBOOK_MODELS.every((m) => m.status === 'HOLD')).toBe(true);
  });

  it.each([
    ['macbook-pro-1416-m3-promax-2023', 'macbook-pro-1416-m3-promax-2024'], // preserved older canonical
    ['macbook-pro-1416-m4-promax-2024', 'macbook-pro-1416-m4-promax-2024'], // ambiguous legacy route handled by the hub redirect
    ['macbook-pro-1416-m5-promax-2026', 'macbook-pro-1416-m5-promax-2026'], // ambiguous legacy route handled by the hub redirect
    ['macbook-pro-14-m4-2024', 'macbook-pro-14-m4-2024'], // canonical unchanged
    ['macbook-pro-14-m4-pro-2024', 'macbook-pro-14-m4-pro-2024'], // canonical unchanged
    ['macbook-pro-14-m5-2025', 'macbook-pro-14-m5-2025'], // canonical unchanged
  ])('resolves slug %s to canonical slug %s', (inputSlug, expectedSlug) => {
    expect(resolveMacBookCanonicalModelSlug(inputSlug)).toBe(expectedSlug);
  });

  it.each([
    'macbook-pro-1416-m4-promax-2024',
    'macbook-pro-1416-m5-promax-2026',
  ])('classifies %s as an ambiguous legacy model identity', (modelSlug) => {
    expect(isAmbiguousLegacyMacBookModelSlug(modelSlug)).toBe(true);
    expect(MACBOOK_MODEL_SLUG_ALIASES[modelSlug]).toBeUndefined();
  });
});
