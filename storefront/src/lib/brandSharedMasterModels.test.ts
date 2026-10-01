import { describe, expect, it } from 'vitest';
import { buildBrandSharedMasterModels } from './brandSharedMasterModels';
import { buildSharedRepairPageCandidates, type SharedRepairPageSupportedModel } from './sharedRepairPageV2';
import type { BrandEntry } from './publicRepairCataloguePolicy';

const brand: BrandEntry = {
  category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: 'phone',
  models: [
    { model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{ slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 119, repairOrigin: 'pos' }] },
    { model: 'Pixel 9', slug: 'pixel-9', repairTypes: [{ slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 119, repairOrigin: 'pos', variants: [{ quality_grade: 'Standard', price: 119, is_recommended: true }, { quality_grade: 'Premium', price: 169, is_recommended: false }] }] },
    { model: 'Pixel 10', slug: 'pixel-10', repairTypes: [] },
  ],
};
const supportedModels: SharedRepairPageSupportedModel[] = brand.models.map((model) => ({
  category: 'phone', canonicalBrandSlug: brand.slug, brand: brand.brand, brandSlug: brand.slug,
  model: model.model, modelSlug: model.slug,
}));

describe('brand-shared Master model adapter', () => {
  it('preserves exact, variant and unresolved POS labels without inventing a $50 model price', () => {
    const priceCandidates = buildSharedRepairPageCandidates({ brands: [brand], canonicalBrandSlug: brand.slug, repairSlug: 'loudspeaker-replacement' });
    const models = buildBrandSharedMasterModels({ supportedModels, priceCandidates, repairName: 'Loudspeaker Replacement' });

    expect(models.map((model) => [model.modelSlug, model.priceLabel, model.bookingHref])).toEqual([
      ['pixel-8', '$119', '?model=pixel-8'],
      ['pixel-9', 'From $119', '?model=pixel-9'],
      ['pixel-10', null, '?model=pixel-10'],
    ]);
  });

  it('keeps fixed Camera Lens $50 above any conflicting POS candidate', () => {
    const priceCandidates = buildSharedRepairPageCandidates({ brands: [brand], canonicalBrandSlug: brand.slug, repairSlug: 'loudspeaker-replacement' });
    const models = buildBrandSharedMasterModels({ supportedModels, priceCandidates, repairName: 'Camera Lens Replacement', fixedPrice: 50 });
    expect(models.map((model) => model.priceLabel)).toEqual(['$50', '$50', '$50']);
  });
});
