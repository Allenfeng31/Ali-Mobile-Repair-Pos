import type { ModelEntry, RepairCatalog, RepairOption } from './publicRepairCataloguePolicy';

/**
 * Strict five-service allowlist for all MacBook repairs.
 * No keyboard, trackpad, speaker, camera, back housing or other repair types.
 */
export const MACBOOK_ALLOWED_REPAIR_SLUGS = new Set([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'water-damage-repair',
  'logic-board-repair',
]);

/**
 * Canonical public alias destinations for individual size/chip variants
 * and historical/transitional URLs.
 */
export const MACBOOK_MODEL_SLUG_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  'macbook-pro-1416-m3-promax-2023': 'macbook-pro-1416-m3-promax-2024',
  'macbook-pro-14-m4-pro-2024': 'macbook-pro-1416-m4-promax-2024',
  'macbook-pro-14-m4-max-2024': 'macbook-pro-1416-m4-promax-2024',
  'macbook-pro-16-m4-pro-2024': 'macbook-pro-1416-m4-promax-2024',
  'macbook-pro-16-m4-max-2024': 'macbook-pro-1416-m4-promax-2024',
  'macbook-pro-14-m5-pro-2026': 'macbook-pro-1416-m5-promax-2026',
  'macbook-pro-14-m5-max-2026': 'macbook-pro-1416-m5-promax-2026',
  'macbook-pro-16-m5-pro-2026': 'macbook-pro-1416-m5-promax-2026',
  'macbook-pro-16-m5-max-2026': 'macbook-pro-1416-m5-promax-2026',
});

/**
 * Officially verified missing MacBook Pro models from 2024–2026 releases.
 * Authority: Apple Official Support (AU) https://support.apple.com/en-au/108052
 */
export const VERIFIED_NEW_MACBOOK_PRO_MODELS: ReadonlyArray<Readonly<{
  model: string;
  slug: string;
  modelCode?: string;
  modelIdentifiers: readonly string[];
}>> = Object.freeze([
  {
    model: 'MacBook Pro 14" M4 (2024)',
    slug: 'macbook-pro-14-m4-2024',
    modelCode: 'A3112',
    modelIdentifiers: ['Mac16,1'],
  },
  {
    model: 'MacBook Pro 14"/16" M4 Pro/Max (2024)',
    slug: 'macbook-pro-1416-m4-promax-2024',
    modelCode: 'A3185 / A3186',
    modelIdentifiers: ['Mac16,6', 'Mac16,8', 'Mac16,7', 'Mac16,5'],
  },
  {
    model: 'MacBook Pro 14" M5 (2025)',
    slug: 'macbook-pro-14-m5-2025',
    modelCode: undefined, // Apple Model Identifier: Mac17,2; A-number not officially assigned on chassis
    modelIdentifiers: ['Mac17,2'],
  },
  {
    model: 'MacBook Pro 14"/16" M5 Pro/Max (2026)',
    slug: 'macbook-pro-1416-m5-promax-2026',
    modelCode: undefined, // Apple Model Identifiers: Mac17,7, Mac17,9 (14") / Mac17,6, Mac17,8 (16")
    modelIdentifiers: ['Mac17,7', 'Mac17,9', 'Mac17,6', 'Mac17,8'],
  },
]);

/**
 * Unannounced or speculative designations formally held without public route publishing.
 */
export const HELD_SPECULATIVE_MACBOOK_MODELS: ReadonlyArray<Readonly<{
  name: string;
  status: 'HOLD';
  reason: string;
}>> = Object.freeze([
  {
    name: 'MacBook Pro 14" M6',
    status: 'HOLD',
    reason: 'Unannounced hardware; no official Apple release, identifier, or repair support.',
  },
  {
    name: 'MacBook Pro 14"/16" PROLED XDR M5 Pro/Max',
    status: 'HOLD',
    reason: 'Speculative designation; official Apple release uses standard Liquid Retina XDR naming.',
  },
]);

export function resolveMacBookCanonicalModelSlug(modelSlug: string): string {
  return MACBOOK_MODEL_SLUG_ALIASES[modelSlug.toLowerCase()] ?? modelSlug;
}

function buildQuoteOnlyMacBookRepairs(): RepairOption[] {
  return [
    { slug: 'screen-replacement', name: 'Screen Replacement', price: 0, repairOrigin: 'pos' },
    { slug: 'battery-replacement', name: 'Battery Replacement', price: 0, repairOrigin: 'pos' },
    { slug: 'charging-port-replacement', name: 'Charging Port Replacement', price: 0, repairOrigin: 'pos' },
    { slug: 'water-damage-repair', name: 'Water Damage Cleaning / Assessment', price: 0, repairOrigin: 'pos' },
    { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 0, repairOrigin: 'pos' },
  ];
}

/**
 * Transforms the MacBook catalogue for public presentation:
 * 1. Corrects the existing M3 Pro/Max year error from (2024) to (2023).
 * 2. Restricts repair scope to the five approved services.
 * 3. Appends missing officially verified 2024–2026 models with Quote on Request behaviour.
 */
export function applyMacBookCataloguePresentation(catalog: RepairCatalog): RepairCatalog {
  const brands = catalog.brands.map((brand) => {
    if (brand.category !== 'laptop' || brand.slug !== 'macbook') return brand;

    const existingModels: ModelEntry[] = brand.models.map((model) => {
      let updatedModelName = model.model;
      if (model.model.includes('M3 Pro/Max (2024)')) {
        updatedModelName = model.model.replace('(2024)', '(2023)');
      } else if (model.model.includes('M3 Pro/Max 2024')) {
        updatedModelName = model.model.replace('2024', '2023');
      }

      // Restrict repair types to strict 5-service allowlist
      const filteredRepairs = model.repairTypes.filter((repair) =>
        MACBOOK_ALLOWED_REPAIR_SLUGS.has(repair.slug)
      );

      return {
        ...model,
        model: updatedModelName,
        repairTypes: filteredRepairs,
      };
    });

    // Append verified missing new models if not already present
    for (const newModel of VERIFIED_NEW_MACBOOK_PRO_MODELS) {
      if (!existingModels.some((m) => m.slug === newModel.slug)) {
        existingModels.push({
          model: newModel.model,
          slug: newModel.slug,
          modelCode: newModel.modelCode,
          repairTypes: buildQuoteOnlyMacBookRepairs(),
        });
      }
    }

    return {
      ...brand,
      models: existingModels,
    };
  });

  return { ...catalog, brands };
}
