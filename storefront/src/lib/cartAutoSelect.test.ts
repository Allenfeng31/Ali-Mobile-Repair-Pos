import { describe, it, expect } from 'vitest';
import { resolveInitialCartState, resolvePublicBookingCartState } from './cartAutoSelect';
import { ParsedItem } from './inventoryUtils';

describe('cartAutoSelect', () => {
  const mockInventory: ParsedItem[] = [
    {
      id: 1,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Screen Replacement',
      price: 200,
      deviceType: 'phone',
      quality_grade: 'Standard',
      is_recommended: false,
      itemCode: 'IP14PM-SCR-STD',
      name: 'iPhone 14 Pro Max Screen Replacement Standard'
    },
    {
      id: 2,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Screen Replacement',
      price: 300,
      deviceType: 'phone',
      quality_grade: 'Genuine',
      is_recommended: true,
      itemCode: 'IP14PM-SCR-GEN',
      name: 'iPhone 14 Pro Max Screen Replacement Genuine'
    },
    {
      id: 3,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Battery Replacement',
      price: 150,
      deviceType: 'phone',
      quality_grade: 'Standard',
      is_recommended: false,
      itemCode: 'IP14PM-BAT-STD',
      name: 'iPhone 14 Pro Max Battery Replacement'
    }
  ];

  it('should return nulls if params are missing', () => {
    const result = resolveInitialCartState(null, null, null, mockInventory);
    expect(result.brand).toBeNull();
  });

  it('should not auto-select but should expand if service has multiple variants', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Screen Replacement', mockInventory);
    expect(result.brand).toBe('iPhone');
    expect(result.model).toBe('iPhone 14 Pro Max');
    expect(result.serviceToSelect).toBeNull();
    expect(result.serviceToExpand).toBe('Screen Replacement');
    expect(result.shouldAutoConfirm).toBe(false);
  });

  it('should auto-select and auto-confirm if service has only one variant', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Battery Replacement', mockInventory);
    expect(result.brand).toBe('iPhone');
    expect(result.model).toBe('iPhone 14 Pro Max');
    expect(result.serviceToSelect).not.toBeNull();
    expect(result.serviceToSelect?.id).toBe(3);
    expect(result.serviceToExpand).toBeNull();
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('should auto-select the specified tier variant when tier param is provided for a multi-variant service', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Screen Replacement', mockInventory, 'Genuine');
    expect(result.brand).toBe('iPhone');
    expect(result.model).toBe('iPhone 14 Pro Max');
    expect(result.serviceToSelect).not.toBeNull();
    expect(result.serviceToSelect?.id).toBe(2);
    expect(result.serviceToSelect?.price).toBe(300);
    expect(result.serviceToExpand).toBeNull();
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('should fall back to expand behavior if tier param does not match any variant', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Screen Replacement', mockInventory, 'NonExistent');
    expect(result.serviceToSelect).toBeNull();
    expect(result.serviceToExpand).toBe('Screen Replacement');
    expect(result.shouldAutoConfirm).toBe(false);
  });

  it('should ignore tier param when service has only one variant', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Battery Replacement', mockInventory, 'Premium');
    expect(result.serviceToSelect).not.toBeNull();
    expect(result.serviceToSelect?.id).toBe(3);
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('auto-selects the configured Apple Watch Charging Repair diagnostic service', () => {
    const result = resolveInitialCartState(
      'Apple',
      'Apple Watch Series 3 38mm',
      'Charging Repair',
      [{
        id: 10,
        category: 'watch',
        brand: 'Apple Watch',
        deviceModel: 'Apple Watch Series 3 38mm',
        service: 'Screen Replacement',
        price: 0,
        deviceType: 'watch',
        quality_grade: 'Standard',
        is_recommended: false,
        name: 'Apple Watch Series 3 38mm Screen Replacement',
      }],
    );

    expect(result).toMatchObject({
      brand: 'Apple Watch',
      model: 'Apple Watch Series 3 38mm',
      category: 'watch',
      serviceToSelect: expect.objectContaining({ name: 'Charging Repair', price: 0 }),
      serviceToExpand: null,
      shouldAutoConfirm: true,
    });
  });

  const googleCameraLensInventory: ParsedItem[] = [{
    id: 20,
    category: 'phone',
    brand: 'P Google Pixel',
    deviceModel: 'Pixel 10a',
    service: 'Screen Replacement',
    price: 120,
    deviceType: 'phone',
    quality_grade: 'Standard',
    is_recommended: false,
    name: 'Google Pixel Pixel 10a Screen Replacement',
  }];

  it('books Google Camera Lens at the fixed $50 price when no exact POS service exists', () => {
    const result = resolveInitialCartState(
      'Google Pixel',
      'Pixel 10a',
      'Camera Lens Replacement',
      googleCameraLensInventory,
      null,
    );

    expect(result.serviceToSelect).toMatchObject({ name: 'Camera Lens Replacement', price: 50 });
    expect(result.serviceToExpand).toBeNull();
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('retains an exact POS Camera Lens identity at the owner-approved fixed price', () => {
    const result = resolveInitialCartState(
      'Google Pixel',
      'Pixel 10a',
      'Camera Lens Replacement',
      [...googleCameraLensInventory, {
        id: 21,
        category: 'phone',
        brand: 'P Google Pixel',
        deviceModel: 'Pixel 10a',
        service: 'Camera Lens Replacement',
        price: 129,
        deviceType: 'phone',
        quality_grade: 'Standard',
        is_recommended: false,
        name: 'Google Pixel Pixel 10a Camera Lens Replacement',
      }],
      null,
    );

    expect(result.serviceToSelect).toMatchObject({ id: 21, name: 'Camera Lens Replacement', price: 50 });
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('preserves the legacy virtual $50 Camera Lens fallback', () => {
    const result = resolveInitialCartState(
      'Google Pixel',
      'Pixel 10a',
      'Camera Lens Replacement',
      googleCameraLensInventory,
    );

    expect(result.serviceToSelect).toMatchObject({ name: 'Camera Lens Replacement', price: 50 });
    expect(result.shouldAutoConfirm).toBe(true);
  });

  it('uses the exact current raw service when an approved public selection is present', () => {
    const result = resolvePublicBookingCartState({
      category: 'phone', brand: 'iPhone', brandSlug: 'iphone', model: 'iPhone 14 Pro Max', modelSlug: 'iphone-14-pro-max',
      service: 'Battery Replacement', serviceSlug: 'battery-replacement', price: 150,
    }, mockInventory);

    expect(result.serviceToSelect).toMatchObject({ id: 3, name: 'Battery Replacement', price: 150 });
  });

  it('keeps an approved selection as a deterministic custom quote when its raw model or service is absent', () => {
    const selection = {
      category: 'phone', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9a', modelSlug: 'pixel-9a',
      service: 'Screen Replacement', serviceSlug: 'screen-replacement', price: 199,
    };
    const result = resolvePublicBookingCartState(selection, []);

    expect(result).toMatchObject({
      brand: 'Google Pixel', model: 'Pixel 9a', category: 'phone', shouldAutoConfirm: true,
      serviceToSelect: { id: 'public-booking:phone:google-pixel:pixel-9a:screen-replacement', price: 0 },
    });
  });

  it('keeps the approved Google Pixel Camera Lens fixed price when raw inventory is absent', () => {
    const result = resolvePublicBookingCartState({
      category: 'phone', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 9a', modelSlug: 'pixel-9a',
      service: 'Camera Lens Replacement', serviceSlug: 'camera-lens-replacement', price: 50,
    }, []);

    expect(result.serviceToSelect).toMatchObject({ price: 50, id: 'public-booking:phone:google-pixel:pixel-9a:camera-lens-replacement' });
  });

  it.each([
    ['Front Camera Replacement', 'front-camera-replacement'],
    ['Back Camera Replacement', 'back-camera-replacement'],
  ])('keeps an approved %s selection bookable without a raw service', (service, serviceSlug) => {
    const result = resolvePublicBookingCartState({
      category: 'phone', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S24', modelSlug: 'galaxy-s24',
      service, serviceSlug, price: 120,
    }, []);

    expect(result.serviceToSelect).toMatchObject({
      id: `public-booking:phone:samsung:galaxy-s24:${serviceSlug}`, name: service, price: 0,
    });
  });
});
