import { describe, expect, it } from 'vitest';
import type { RepairCatalog } from './publicRepairCataloguePolicy';
import { buildRepairResultTaxonomy, resolveRepairResultTaxonomy } from './repairResultTaxonomy';

const catalog: Pick<RepairCatalog, 'brands'> = {
  brands: [
    {
      category: 'phone',
      brand: 'Samsung',
      slug: 'samsung',
      icon: 'phone',
      models: [
        {
          model: 'Galaxy S24',
          slug: 'galaxy-s24',
          repairTypes: [
            { slug: 'battery-replacement', name: 'Battery Replacement', price: 0 },
            { slug: 'screen-replacement', name: 'Screen Replacement', price: 0 },
          ],
        },
      ],
    },
    {
      category: 'laptop',
      brand: 'MacBook',
      slug: 'macbook',
      icon: 'laptop',
      models: [
        {
          model: 'MacBook Air M2 13-inch 2022',
          slug: 'macbook-air-m2-13-2022',
          repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 0 }],
        },
      ],
    },
  ],
};

describe('repair result taxonomy', () => {
  it('provides dependent category, brand, model, and repair options from the canonical catalogue', () => {
    const taxonomy = buildRepairResultTaxonomy(catalog);

    expect(taxonomy.categories.map(({ value }) => value)).toEqual(['phone', 'laptop']);
    expect(taxonomy.categories[0].brands[0]).toMatchObject({ name: 'Samsung', slug: 'samsung' });
    expect(taxonomy.categories[0].brands[0].models[0]).toMatchObject({ name: 'Galaxy S24', slug: 'galaxy-s24' });
    expect(taxonomy.categories[0].brands[0].models[0].repairTypes.map(({ slug }) => slug)).toEqual([
      'battery-replacement',
      'screen-replacement',
      'camera-lens-replacement',
      'loudspeaker-replacement',
      'earpiece-speaker-replacement',
      'power-button-replacement',
      'volume-button-replacement',
    ]);
  });

  it('resolves the MacBook Air M2 taxonomy and canonical repair URL exactly', () => {
    const resolved = resolveRepairResultTaxonomy(catalog, {
      deviceCategory: 'laptop',
      brandSlug: 'macbook',
      modelSlug: 'macbook-air-m2-13-2022',
      repairTypeSlug: 'screen-replacement',
    });

    expect(resolved).toEqual({
      deviceCategory: 'laptop',
      brand: 'MacBook',
      brandSlug: 'macbook',
      model: 'MacBook Air M2 13-inch 2022',
      modelSlug: 'macbook-air-m2-13-2022',
      repairType: 'Screen Replacement',
      repairTypeSlug: 'screen-replacement',
      modelUrl: '/repairs/laptop/macbook/macbook-air-m2-13-2022',
      repairHubUrl: '/repairs/laptop',
      brandHubUrl: '/repairs/laptop/macbook',
      relatedRepairUrl: '/repairs/laptop/macbook/macbook-air-m2-13-2022/screen-replacement',
    });
  });

  it('rejects selections that are not present in the canonical taxonomy', () => {
    expect(resolveRepairResultTaxonomy(catalog, {
      deviceCategory: 'laptop',
      brandSlug: 'apple',
      modelSlug: 'macbook-air-m2-13-inch',
      repairTypeSlug: 'screen-replacement',
    })).toBeNull();
  });
});
