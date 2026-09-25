import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({ fetchRepairCatalogMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/components/services/CameraModuleRepairLandingPage', () => ({ default: () => <div data-testid="camera-module-landing" /> }));

import Page, { metadata } from './page';

const repair = { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 159, repairOrigin: 'pos' as const };
const catalogue = () => ({ brands: [
  { category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [{ model: 'P30', slug: 'p30', repairTypes: [repair] }] },
  { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [repair] }] },
] });

describe('back camera shared hierarchy route', () => {
  it('passes an exact selected device and canonical booking helper to the landing for a valid pair', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    const element = await Page({ searchParams: Promise.resolve({ brand: 'huawei', model: 'p30' }) });
    const props = element.props as { hierarchy: { selectedBrandSlug: string | null; selectedModelSlug: string | null; selectedDevice: { selectedDevice: { brand: string; model: string }; booking: { href: string } } | null } };
    expect(props.hierarchy).toMatchObject({
      selectedBrandSlug: 'huawei', selectedModelSlug: 'p30',
      selectedDevice: { selectedDevice: { brand: 'Huawei', model: 'P30' }, booking: { href: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=back-camera-replacement' } },
    });
  });

  it('fails closed for model-only and service override query state without changing metadata', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    for (const query of [{ model: 'p30' }, { brand: 'huawei', model: 'p30', service: 'Front Camera Replacement' }, { brand: 'samsung', model: 'galaxy-s21' }]) {
      const element = await Page({ searchParams: Promise.resolve(query) });
      expect((element.props as { hierarchy: { selectedDevice: unknown } }).hierarchy.selectedDevice).toBeNull();
    }
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/back-camera-replacement');
  });
});
