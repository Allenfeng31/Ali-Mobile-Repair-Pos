import { describe, expect, it } from 'vitest';

import { resolvePublicBookingCartState } from './cartAutoSelect';
import {
  buildCameraModuleRepairHierarchyModels,
  type CameraModuleRepairHierarchyCandidate,
} from './cameraModuleRepairHierarchy';
import {
  buildGenericPeripheralRepairHierarchyModels,
  type GenericPeripheralRepairHierarchyCandidate,
} from './genericPeripheralRepairHierarchy';
import type { ParsedItem } from './inventoryUtils';
import { resolvePublicBookingSelection } from './publicBookingSelection';
import type { RepairCatalog } from './publicRepairCataloguePolicy';
import { getSharedRepairBookingHref } from './sharedRepairBooking';

const catalog = {
  brands: [
    {
      category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [
        { model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }] },
        { model: 'Pixel 9a', slug: 'pixel-9a', repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }] },
      ],
    },
    {
      category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [
        { model: 'Mate 20', slug: 'mate-20', repairTypes: [{ slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 79, repairOrigin: 'pos' }] },
        { model: 'P30 Pro', slug: 'p30-pro', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' }] },
      ],
    },
    {
      category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [
        {
          model: 'Galaxy S24', slug: 'galaxy-s24', repairTypes: [
            { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 120, repairOrigin: 'pos' },
            { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 130, repairOrigin: 'pos' },
          ],
        },
      ],
    },
    {
      category: 'phone', brand: 'iPhone', slug: 'iphone', icon: '', models: [
        { model: 'iPhone 14 Plus', slug: 'iphone-14-plus', repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos' }] },
      ],
    },
  ],
} as Pick<RepairCatalog, 'brands'>;

const mateLoudspeaker: ParsedItem = {
  id: 901,
  category: 'phone', brand: 'Huawei', deviceModel: 'Mate 20', service: 'Loudspeaker Replacement', price: 79,
  deviceType: 'phone', quality_grade: 'Standard', is_recommended: false, name: 'Huawei Mate 20 Loudspeaker Replacement',
};

function handoff(href: string, inventory: ParsedItem[] = []) {
  const query = new URL(href, 'https://example.test').searchParams;
  const selection = resolvePublicBookingSelection(catalog, Object.fromEntries(query.entries()));
  expect(selection).not.toBeNull();
  return {
    query,
    selection: selection!,
    cart: resolvePublicBookingCartState(selection!, inventory),
  };
}

describe('public booking full handoff', () => {
  it('carries a generated secondary-brand hierarchy href through the real resolver into the exact raw cart service', () => {
    const candidates: GenericPeripheralRepairHierarchyCandidate[] = [{
      canonicalBrandSlug: 'huawei', displayBrand: 'Huawei', modelSlug: 'mate-20', displayModel: 'Mate 20',
      repair: { slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 79, repairOrigin: 'pos' },
    }];
    const href = buildGenericPeripheralRepairHierarchyModels({
      repairSlug: 'loudspeaker-replacement', bookingService: 'Loudspeaker Replacement', candidates,
    })[0]!.bookingHref;
    const { query, selection, cart } = handoff(href, [mateLoudspeaker]);

    expect(Object.fromEntries(query.entries())).toMatchObject({
      brand: 'Huawei', model: 'Mate 20', service: 'Loudspeaker Replacement',
      brandSlug: 'huawei', modelSlug: 'mate-20', serviceSlug: 'loudspeaker-replacement',
    });
    expect(selection).toMatchObject({ brand: 'Huawei', model: 'Mate 20', service: 'Loudspeaker Replacement' });
    expect(cart).toMatchObject({ brand: 'Huawei', model: 'Mate 20', serviceToSelect: { id: 901, name: 'Loudspeaker Replacement', price: 79 } });
  });

  it.each([
    ['Loudspeaker Replacement', 'loudspeaker-replacement'],
    ['Earpiece Speaker Replacement', 'earpiece-speaker-replacement'],
    ['Power Button Replacement', 'power-button-replacement'],
    ['Volume Button Replacement', 'volume-button-replacement'],
    ['Camera Lens Replacement', 'camera-lens-replacement'],
  ])('carries Pixel %s through the real resolver and virtual cart fallback', (repairName, repairSlug) => {
    const { selection, cart } = handoff(getSharedRepairBookingHref({
      repairName,
      repairSlug,
      selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8' },
    }));

    expect(selection).toMatchObject({ brand: 'Google Pixel', model: 'Pixel 8', service: repairName, serviceSlug: repairSlug, price: 50 });
    expect(cart).toMatchObject({ brand: 'Google Pixel', model: 'Pixel 8', serviceToSelect: { name: repairName, price: 50 } });
  });

  it.each([
    ['Front Camera Replacement', 'front-camera-replacement', 'Huawei', 'P30 Pro', 'huawei', 'p30-pro'],
    ['Back Camera Replacement', 'back-camera-replacement', 'Samsung', 'Galaxy S24', 'samsung', 'galaxy-s24'],
  ] as const)('carries a %s hierarchy model-card href through the real resolver and cart', (repairName, repairSlug, brand, model, brandSlug, modelSlug) => {
    const candidates: CameraModuleRepairHierarchyCandidate[] = [{
      canonicalBrandSlug: brandSlug, displayBrand: brand, modelSlug, displayModel: model,
      repair: { slug: repairSlug, name: repairName, price: 120, repairOrigin: 'pos' },
    }];
    const href = buildCameraModuleRepairHierarchyModels({ repairSlug, bookingService: repairName, candidates })[0]!.bookingHref;
    const { selection, cart } = handoff(href);

    expect(selection).toMatchObject({ brand, model, service: repairName, serviceSlug: repairSlug });
    expect(cart).toMatchObject({
      brand, model,
      serviceToSelect: { id: `public-booking:phone:${brandSlug}:${modelSlug}:${repairSlug}`, name: repairName, price: 0 },
    });
  });

  it('keeps Camera Module query-selected CTA and model-card selection semantically identical after resolution', () => {
    const selectedModel = { brand: 'Huawei', brandSlug: 'huawei', model: 'P30 Pro', modelSlug: 'p30-pro' };
    const legacyControlHref = getSharedRepairBookingHref({ repairName: 'Front Camera Replacement', selectedModel });
    const modelCardHref = buildCameraModuleRepairHierarchyModels({
      repairSlug: 'front-camera-replacement', bookingService: 'Front Camera Replacement', candidates: [{
        canonicalBrandSlug: 'huawei', displayBrand: 'Huawei', modelSlug: 'p30-pro', displayModel: 'P30 Pro',
        repair: { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' },
      }],
    })[0]!.bookingHref;

    const fromControl = handoff(legacyControlHref);
    const fromModelCard = handoff(modelCardHref);
    expect(fromControl.selection).toMatchObject(fromModelCard.selection);
    expect(fromControl.cart.serviceToSelect).toMatchObject(fromModelCard.cart.serviceToSelect!);
  });

  it('keeps valid bookings deterministic when the raw model or raw service is missing', () => {
    const href = getSharedRepairBookingHref({
      repairName: 'Screen Replacement', repairSlug: 'screen-replacement',
      selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9a', modelSlug: 'pixel-9a' },
    });
    const absentModel = handoff(href);
    const absentService = handoff(href, [{ ...mateLoudspeaker, brand: 'Google Pixel', deviceModel: 'Pixel 9a', service: 'Battery Replacement' }]);

    for (const result of [absentModel, absentService]) {
      expect(result.cart.serviceToSelect).toMatchObject({
        id: 'public-booking:phone:google-pixel:pixel-9a:screen-replacement', price: 0,
      });
    }
  });

  it('resolves the legacy display-only booking form through the same cart seam', () => {
    const { query, selection, cart } = handoff(getSharedRepairBookingHref({
      repairName: 'Screen Replacement',
      selectedModel: { brand: 'iPhone', brandSlug: 'iphone', model: 'iPhone 14 Plus', modelSlug: 'iphone-14-plus' },
    }), [{ ...mateLoudspeaker, id: 902, brand: 'iPhone', deviceModel: 'iPhone 14 Plus', service: 'Screen Replacement', price: 199 }]);

    expect(query.get('brandSlug')).toBeNull();
    expect(selection).toMatchObject({ brandSlug: 'iphone', modelSlug: 'iphone-14-plus', serviceSlug: 'screen-replacement' });
    expect(cart.serviceToSelect).toMatchObject({ id: 902, price: 199 });
  });

  it.each([
    'category=phone&brand=Google+Pixel&model=Pixel+8&service=Screen+Replacement&brandSlug=invalid&modelSlug=pixel-8&serviceSlug=screen-replacement',
    'category=phone&brand=Google+Pixel&model=Pixel+8&service=Screen+Replacement&brandSlug=google-pixel&modelSlug=invalid&serviceSlug=screen-replacement',
    'category=phone&brand=Google+Pixel&model=Galaxy+S24&service=Screen+Replacement&brandSlug=google-pixel&modelSlug=pixel-8&serviceSlug=screen-replacement',
    'category=phone&brand=Google+Pixel&model=Pixel+8&service=Screen+Replacement&brandSlug=google-pixel&modelSlug=pixel-8&serviceSlug=invalid-repair',
    'category=phone&brand=Google&model=Pixel+8&service=Screen+Replacement&brandSlug=google-pixel&modelSlug=pixel-8&serviceSlug=screen-replacement',
    'category=phone&brandSlug=google-pixel&model=Pixel+8&service=Screen+Replacement',
  ])('fails closed for canonical validation failure before a cart state can be created: %s', (queryString) => {
    const query = new URL(`/book-repair?${queryString}`, 'https://example.test').searchParams;

    expect(resolvePublicBookingSelection(catalog, Object.fromEntries(query.entries()))).toBeNull();
  });

  it('keeps service keys distinct across models and across Front/Back Camera services after the full resolver/cart handoff', () => {
    const pixel8Screen = handoff(getSharedRepairBookingHref({ repairName: 'Screen Replacement', repairSlug: 'screen-replacement', selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8' } }));
    const pixel9aScreen = handoff(getSharedRepairBookingHref({ repairName: 'Screen Replacement', repairSlug: 'screen-replacement', selectedModel: { brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9a', modelSlug: 'pixel-9a' } }));
    const galaxyFrontCamera = handoff(getSharedRepairBookingHref({ repairName: 'Front Camera Replacement', repairSlug: 'front-camera-replacement', selectedModel: { brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S24', modelSlug: 'galaxy-s24' } }));
    const galaxyBackCamera = handoff(getSharedRepairBookingHref({ repairName: 'Back Camera Replacement', repairSlug: 'back-camera-replacement', selectedModel: { brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S24', modelSlug: 'galaxy-s24' } }));

    expect(pixel8Screen.cart.serviceToSelect?.id).not.toBe(pixel9aScreen.cart.serviceToSelect?.id);
    expect(galaxyFrontCamera.cart.serviceToSelect?.id).not.toBe(galaxyBackCamera.cart.serviceToSelect?.id);
  });
});
