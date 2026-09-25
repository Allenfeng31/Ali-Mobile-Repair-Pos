import { describe, expect, it, vi } from 'vitest';

const fetchRepairCatalog = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ fetchRepairCatalog }));

import { GET } from './route';

const catalog = {
  brands: [{
    category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{
      model: 'Pixel 8', slug: 'pixel-8', repairTypes: [{
        slug: 'screen-replacement', name: 'Screen Replacement', price: 199, repairOrigin: 'pos',
      }],
    }],
  }, {
    category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [{
      model: 'P30', slug: 'p30', repairTypes: [{
        slug: 'screen-replacement', name: 'Screen Replacement', price: 129, repairOrigin: 'pos',
      }],
    }],
  }, {
    category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{
      model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [],
    }],
  }],
};

describe('GET /api/booking-selection', () => {
  it('returns only the resolved public selection for a valid canonical identity', async () => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);
    const response = await GET(new Request('https://example.test/api/booking-selection?category=phone&brandSlug=google-pixel&modelSlug=pixel-8&serviceSlug=screen-replacement&brand=Google%20Pixel&model=Pixel%208&service=Screen%20Replacement'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      selection: {
        category: 'phone', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8', modelSlug: 'pixel-8',
        service: 'Screen Replacement', serviceSlug: 'screen-replacement', price: 199, priceAuthority: 'exact-pos',
      },
    });
  });

  it('fails closed without exposing a selection for invalid canonical input', async () => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);
    const response = await GET(new Request('https://example.test/api/booking-selection?category=phone&brandSlug=google-pixel&modelSlug=pixel-8&serviceSlug=battery-replacement'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid booking selection.' });
  });

  it.each([
    ['front-camera-replacement', 'Front Camera Replacement'],
    ['back-camera-replacement', 'Back Camera Replacement'],
  ])('returns a zero-price canonical Custom Quote for an eligible missing %s record', async (serviceSlug, service) => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);
    const response = await GET(new Request(`https://example.test/api/booking-selection?category=phone&brandSlug=huawei&modelSlug=p30&serviceSlug=${serviceSlug}&brand=Huawei&model=P30&service=${encodeURIComponent(service)}`));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ selection: {
      category: 'phone', brand: 'Huawei', brandSlug: 'huawei', model: 'P30', modelSlug: 'p30',
      service, serviceSlug, price: 0, priceAuthority: 'quote-only',
    } });
  });

  it('keeps an excluded Samsung model without a Camera record fail-closed', async () => {
    fetchRepairCatalog.mockResolvedValueOnce(catalog);
    const response = await GET(new Request('https://example.test/api/booking-selection?category=phone&brandSlug=samsung&modelSlug=galaxy-s21&serviceSlug=front-camera-replacement'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid booking selection.' });
  });
});
