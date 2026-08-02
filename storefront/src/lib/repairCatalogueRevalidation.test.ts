import { describe, expect, it } from 'vitest';

import {
  normalizeCatalogueMutations,
  repairCataloguePathsForMutations,
} from './repairCatalogueRevalidation';

const mutation = (overrides = {}) => ({
  operation: 'update',
  category: 'phone',
  brand: 'Motorola',
  model: 'Moto G24',
  repairType: 'Screen Replacement',
  changedFields: ['price'],
  topologyChanged: false,
  ...overrides,
});

describe('repair catalogue event invalidation policy', () => {
  it('invalidates only an exact price detail, model, brand, and dependent generic repair hub', () => {
    const paths = repairCataloguePathsForMutations(normalizeCatalogueMutations({ mutations: [mutation()] })!);
    expect(paths).toEqual(expect.arrayContaining([
      '/repairs/phone/motorola/moto-g24/screen-replacement',
      '/repairs/phone/motorola/moto-g24',
      '/repairs/phone/motorola',
      '/repairs/screen-replacement',
    ]));
    expect(paths).not.toContain('/repairs');
    expect(paths).not.toContain('/sitemap.xml');
    expect(paths.some((path) => path.includes('samsung') || path.includes('google-pixel'))).toBe(false);
  });

  it('treats the Moto G24 $140 price mutation as a public, non-topology update', () => {
    const mutations = normalizeCatalogueMutations({ mutations: [mutation({ brand: 'Motorola', model: 'Moto G24', repairType: 'Screen Replacement', changedFields: ['price'] })] })!;
    expect(mutations).toEqual([expect.objectContaining({
      category: 'phone', brand: 'motorola', model: 'moto-g24', repairType: 'screen-replacement', topologyChanged: false,
    })]);
    expect(repairCataloguePathsForMutations(mutations)).toEqual(expect.arrayContaining([
      '/repairs/phone/motorola/moto-g24/screen-replacement',
      '/repairs/phone/motorola/moto-g24',
      '/repairs/phone/motorola',
    ]));
  });

  it('expands topology changes only to the necessary category, repairs index, and sitemap', () => {
    const paths = repairCataloguePathsForMutations(normalizeCatalogueMutations({ mutations: [mutation({ operation: 'create', topologyChanged: true })] })!);
    expect(paths).toEqual(expect.arrayContaining(['/repairs/phone', '/repairs', '/sitemap.xml']));
  });

  it('preserves Google Pixel and Apple Watch charging canonicals', () => {
    const paths = repairCataloguePathsForMutations(normalizeCatalogueMutations({ mutations: [
      mutation({ brand: 'Google Pixel', model: 'Pixel 8 Pro', repairType: 'Camera Lens Replacement' }),
      mutation({ category: 'watch', brand: 'Apple Watch', model: 'Apple Watch Series 3 38mm', repairType: 'Charging Port Replacement' }),
    ] })!);
    expect(paths).toContain('/repairs/phone/google-pixel/pixel-8-pro/camera-lens-replacement');
    expect(paths).toContain('/repairs/phone/google/camera-lens-replacement');
    expect(paths).toContain('/repairs/watch/apple/apple-watch-series-3-38mm/charging-repair');
    expect(paths).not.toContain('/repairs/watch/apple/apple-watch-series-3-38mm/charging-port-replacement');
  });

  it('rejects caller-controlled paths and Accessories identities', () => {
    expect(normalizeCatalogueMutations({ mutations: [mutation({ path: '/anything', brand: 'Accessories' })] })).toBeNull();
    expect(normalizeCatalogueMutations({ mutations: [mutation({ path: '/sitemap.xml' })] })).toBeNull();
  });
});
