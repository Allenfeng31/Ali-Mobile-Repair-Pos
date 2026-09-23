import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({ fetchRepairCatalogMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/components/services/CameraModuleRepairLandingPage', () => ({ default: () => <div data-testid="camera-module-landing" /> }));

import Page, { metadata } from './page';

const repair = { slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 129, repairOrigin: 'pos' as const };
const catalogue = () => ({ brands: [{ category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [repair] }] }] });

describe('front camera shared hierarchy route', () => {
  it('passes an exact selected device and canonical booking helper to the landing for a valid pair', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    const element = await Page({ searchParams: Promise.resolve({ brand: 'samsung', model: 'galaxy-s21' }) });
    const props = element.props as { hierarchy: { selectedBrandSlug: string | null; selectedModelSlug: string | null; selectedDevice: { selectedDevice: { brand: string; model: string }; booking: { href: string } } | null } };
    expect(props.hierarchy).toMatchObject({
      selectedBrandSlug: 'samsung', selectedModelSlug: 'galaxy-s21',
      selectedDevice: { selectedDevice: { brand: 'Samsung', model: 'Galaxy S21' }, booking: { href: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Samsung&model=Galaxy+S21&brandSlug=samsung&modelSlug=galaxy-s21&serviceSlug=front-camera-replacement' } },
    });
  });

  it('fails closed for model-only and service override query state without changing metadata', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalogue());
    for (const query of [{ model: 'galaxy-s21' }, { brand: 'samsung', model: 'galaxy-s21', service: 'Back Camera Replacement' }]) {
      const element = await Page({ searchParams: Promise.resolve(query) });
      expect((element.props as { hierarchy: { selectedDevice: unknown } }).hierarchy.selectedDevice).toBeNull();
    }
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/front-camera-replacement');
  });
});
