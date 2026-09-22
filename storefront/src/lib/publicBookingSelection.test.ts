import { describe, expect, it } from 'vitest';

import { resolvePublicBookingSelection } from './publicBookingSelection';
import type { RepairCatalog } from './publicRepairCataloguePolicy';
import { getSharedRepairBookingHref } from './sharedRepairBooking';
import { resolvePublicBookingCartState } from './cartAutoSelect';

const catalog = {
  brands: [
    {
      category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [
        {
          model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{
            slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos',
          }],
        },
        {
          model: 'Pixel Future', slug: 'pixel-future', repairTypes: [{
            slug: 'battery-replacement', name: 'Battery Replacement', price: 149, repairOrigin: 'pos',
          }],
        },
      ],
    },
    {
      category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{
        model: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{
          slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 120, repairOrigin: 'pos',
        }],
      }],
    },
    {
      category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [{
        model: 'Mate 20', slug: 'mate-20', repairTypes: [{
          slug: 'battery-replacement', name: 'Battery Replacement', price: 0, repairOrigin: 'pos', variants: [
            { quality_grade: 'Standard', price: 95, is_recommended: false },
          ],
        }],
      }],
    },
    {
      category: 'tablet', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{
        model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{
          slug: 'screen-replacement', name: 'Screen Replacement', price: 99, repairOrigin: 'pos',
        }],
      }],
    },
  ],
} as Pick<RepairCatalog, 'brands'>;

const canonical = {
  category: 'phone',
  brandSlug: 'google-pixel',
  modelSlug: 'pixel-8',
  serviceSlug: 'screen-replacement',
  brand: 'Google Pixel',
  model: 'Pixel 8',
  service: 'Screen Replacement',
};

describe('resolvePublicBookingSelection', () => {
  it('resolves a canonical shared-page identity with its trusted display values', () => {
    expect(resolvePublicBookingSelection(catalog, canonical)).toMatchObject({
      ...canonical,
      price: 199,
      priceAuthority: 'exact-pos',
    });
  });

  it.each([
    [{ ...canonical, category: 'watch' }],
    [{ ...canonical, brandSlug: 'unknown' }],
    [{ ...canonical, modelSlug: 'unknown' }],
    [{ ...canonical, brandSlug: 'samsung' }],
    [{ ...canonical, serviceSlug: 'battery-replacement' }],
    [{ ...canonical, brand: 'Google' }],
    [{ category: 'phone', brandSlug: 'google-pixel', model: 'Pixel 8', service: 'Screen Replacement' }],
  ])('fails closed for invalid or partial canonical identity %#', (selection) => {
    expect(resolvePublicBookingSelection(catalog, selection)).toBeNull();
  });

  it('accepts an unambiguous legacy display-only booking identity', () => {
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brand: 'Samsung', model: 'Galaxy S24', service: 'Front Camera Replacement',
    })).toMatchObject({
      category: 'phone', brandSlug: 'samsung', modelSlug: 'galaxy-s24', serviceSlug: 'front-camera-replacement',
    });
  });

  it('fails closed for an ambiguous legacy display-only identity', () => {
    expect(resolvePublicBookingSelection(catalog, {
      brand: 'Google Pixel', model: 'Pixel 8', service: 'Screen Replacement',
    })).toBeNull();
  });

  it('keeps virtual peripherals bookable as quotes and preserves fixed Camera Lens authority', () => {
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', serviceSlug: 'loudspeaker-replacement',
    })).toMatchObject({ service: 'Loudspeaker Replacement', price: 50, priceAuthority: 'quote-only' });
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', serviceSlug: 'camera-lens-replacement',
    })).toMatchObject({ service: 'Camera Lens Replacement', price: 50, priceAuthority: 'fixed-camera-lens' });
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'huawei', modelSlug: 'mate-20', serviceSlug: 'camera-lens-replacement',
    })).toMatchObject({ service: 'Camera Lens Replacement', price: 50, priceAuthority: 'fixed-camera-lens' });
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-future', serviceSlug: 'loudspeaker-replacement',
    })).toMatchObject({ service: 'Loudspeaker Replacement', priceAuthority: 'quote-only' });
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-future', serviceSlug: 'battery-replacement',
    })).toMatchObject({ price: 149, priceAuthority: 'exact-pos' });
  });

  it('uses one concrete POS variant but leaves multiple variants quote-only until a tier is chosen', () => {
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'huawei', modelSlug: 'mate-20', serviceSlug: 'battery-replacement',
    })).toMatchObject({ price: 95, priceAuthority: 'exact-pos-variant' });

    const multipleVariantCatalog = {
      brands: [{
        category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '', models: [{
          model: 'Find X8', slug: 'find-x8', repairTypes: [{
            slug: 'screen-replacement', name: 'Screen Replacement', price: 100, repairOrigin: 'pos', variants: [
              { quality_grade: 'Standard', price: 100, is_recommended: false },
              { quality_grade: 'Premium', price: 150, is_recommended: true },
            ],
          }],
        }],
      }],
    } as Pick<RepairCatalog, 'brands'>;

    expect(resolvePublicBookingSelection(multipleVariantCatalog, {
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8', serviceSlug: 'screen-replacement',
    })).toMatchObject({ priceAuthority: 'quote-only' });
  });

  it('carries a generated shared-page href through validation into an unresolved cart item', () => {
    const href = getSharedRepairBookingHref({
      repairName: 'Loudspeaker Replacement',
      repairSlug: 'loudspeaker-replacement',
      selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8' },
    });
    const params = new URL(href, 'https://example.test').searchParams;
    const selection = resolvePublicBookingSelection(catalog, Object.fromEntries(params.entries()));

    expect(selection).toMatchObject({ brand: 'Google Pixel', model: 'Pixel 8', service: 'Loudspeaker Replacement', priceAuthority: 'quote-only' });
    expect(resolvePublicBookingCartState(selection!, [])).toMatchObject({
      brand: 'Google Pixel', model: 'Pixel 8', serviceToSelect: { name: 'Loudspeaker Replacement', price: 0 },
    });
  });
});
