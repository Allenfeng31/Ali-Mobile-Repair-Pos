import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({ fetchRepairCatalogMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: vi.fn() }));
vi.mock('@/components/services/VirtualPhoneRepairLandingPage', () => ({ default: () => null }));

import VirtualPhoneRepairRoutePage, { resolveGooglePixelSharedPageV2Selection } from './virtualPhoneRepairRoute';
import type { SharedRepairPageSupportedModel } from './sharedRepairPageV2';

const models: SharedRepairPageSupportedModel[] = [
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Pixel 8 Pro', modelSlug: 'pixel-8-pro' },
  { category: 'phone', canonicalBrandSlug: 'google-pixel', brand: 'Google Pixel', brandSlug: 'google-pixel', model: 'Future Pixel', modelSlug: 'future-pixel' },
];

describe('Google Pixel Shared Page V2 server selection', () => {
  it.each([
    ['loudspeaker-replacement', 'Loudspeaker Replacement'],
    ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement'],
    ['power-button-replacement', 'Power Button Replacement'],
    ['volume-button-replacement', 'Volume Button Replacement'],
  ] as const)('resolves valid %s model state server-side with its canonical booking identity', (repairSlug, repairName) => {
    const selection = resolveGooglePixelSharedPageV2Selection({ repairSlug, repairName, supportedModels: models, query: { model: 'pixel-8-pro' } });
    expect(selection).toMatchObject({
      selectedModelSlug: 'pixel-8-pro',
      selectedDevice: {
        selectedDevice: { brand: 'Google Pixel', model: 'Pixel 8 Pro' },
        selectedRepair: { name: repairName, serviceSlug: repairSlug },
        booking: { href: `/book-repair?category=phone&service=${encodeURIComponent(repairName).replace(/%20/g, '+')}&brand=Google+Pixel&model=Pixel+8+Pro&brandSlug=google-pixel&modelSlug=pixel-8-pro&serviceSlug=${repairSlug}` },
      },
    });
  });

  it('fails closed for invalid, repeated, brand-conflicting, and service-conflicting query state', () => {
    for (const query of [
      { model: 'unknown' },
      { model: ['pixel-8-pro', 'future-pixel'] },
      { model: 'pixel-8-pro', brand: 'samsung' },
      { model: 'pixel-8-pro', service: 'Power Button Replacement' },
    ]) {
      const selection = resolveGooglePixelSharedPageV2Selection({ repairSlug: 'loudspeaker-replacement', repairName: 'Loudspeaker Replacement', supportedModels: models, query });
      expect(selection.selectedDevice).toBeNull();
      expect(selection.selectedModelSlug).toBeNull();
    }
  });

  it('handles future eligible models without a named-model production branch', () => {
    const selection = resolveGooglePixelSharedPageV2Selection({ repairSlug: 'loudspeaker-replacement', repairName: 'Loudspeaker Replacement', supportedModels: models, query: { model: 'future-pixel' } });
    expect(selection.selectedDevice).toMatchObject({ selectedDevice: { model: 'Future Pixel' } });
  });

  it('passes the server-selected Pixel device into the existing landing selected-device slot', async () => {
    fetchRepairCatalogMock.mockResolvedValue({ brands: [{
      category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{
        model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [{ slug: 'loudspeaker-replacement', name: 'Loudspeaker Replacement', price: 129, repairOrigin: 'pos' }],
      }],
    }] });
    const element = await VirtualPhoneRepairRoutePage({ brand: 'google', repairSlug: 'loudspeaker-replacement', query: { model: 'pixel-8-pro' } });
    expect(element.props.hierarchy).toMatchObject({
      selectedModelSlug: 'pixel-8-pro',
      selectedDevice: {
        selectedDevice: { brand: 'Google Pixel', model: 'Pixel 8 Pro' },
        booking: { href: '/book-repair?category=phone&service=Loudspeaker+Replacement&brand=Google+Pixel&model=Pixel+8+Pro&brandSlug=google-pixel&modelSlug=pixel-8-pro&serviceSlug=loudspeaker-replacement' },
      },
    });
  });

  it.each(['samsung', 'oppo'] as const)('does not opt unmigrated %s callers into Pixel V2 selected-device state', async (brand) => {
    fetchRepairCatalogMock.mockResolvedValue({ brands: [{ category: 'phone', brand: brand === 'samsung' ? 'Samsung' : 'OPPO', slug: brand, icon: '', models: [] }] });
    const element = await VirtualPhoneRepairRoutePage({ brand, repairSlug: 'loudspeaker-replacement' });
    expect(element.props.sharedPageV2).toBeUndefined();
    expect(element.props.hierarchy).toBeUndefined();
  });
});
