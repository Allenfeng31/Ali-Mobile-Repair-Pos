import { describe, expect, it } from 'vitest';

import { resolvePublicBookingSelection } from './publicBookingSelection';
import type { RepairCatalog } from './publicRepairCataloguePolicy';
import { getSharedRepairBookingHref } from './sharedRepairBooking';
import { resolvePublicBookingCartState } from './cartAutoSelect';

const catalog = {
  brands: [
    {
      category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{
        model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{
          slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos',
        }],
      }],
    },
    {
      category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{
        model: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [{
          slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 120, repairOrigin: 'pos',
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

  it('approves virtual shared services and preserves the Google Pixel Camera Lens fixed price', () => {
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', serviceSlug: 'loudspeaker-replacement',
    })).toMatchObject({ service: 'Loudspeaker Replacement', price: 50 });
    expect(resolvePublicBookingSelection(catalog, {
      category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8', serviceSlug: 'camera-lens-replacement',
    })).toMatchObject({ service: 'Camera Lens Replacement', price: 50 });
  });

  it('carries a generated shared-page href through validation into an unresolved cart item', () => {
    const href = getSharedRepairBookingHref({
      repairName: 'Loudspeaker Replacement',
      repairSlug: 'loudspeaker-replacement',
      selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8' },
    });
    const params = new URL(href, 'https://example.test').searchParams;
    const selection = resolvePublicBookingSelection(catalog, Object.fromEntries(params.entries()));

    expect(selection).toMatchObject({ brand: 'Google Pixel', model: 'Pixel 8', service: 'Loudspeaker Replacement' });
    expect(resolvePublicBookingCartState(selection!, [])).toMatchObject({
      brand: 'Google Pixel', model: 'Pixel 8', serviceToSelect: { name: 'Loudspeaker Replacement', price: 50 },
    });
  });
});
