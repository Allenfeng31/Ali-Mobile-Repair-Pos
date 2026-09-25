import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock, fetchResultsMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
  fetchResultsMock: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: fetchResultsMock }));
vi.mock('@/components/services/CameraLensLandingPage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/services/CameraLensLandingPage')>();
  return { ...actual, default: () => null };
});

import GenericCameraLensReplacementPage from './camera-lens-replacement/page';
import GoogleCameraLensReplacementPage from './google/camera-lens-replacement/page';
import SamsungCameraLensReplacementPage from './samsung/camera-lens-replacement/page';
import OppoCameraLensReplacementPage from './oppo/camera-lens-replacement/page';

const catalog = {
  brands: [
    { category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '', models: [{ model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [{ slug: 'camera-lens-replacement', name: 'Camera Lens Replacement', price: 99, repairOrigin: 'pos' }] }] },
    { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '', models: [{ model: 'Galaxy S25', slug: 'galaxy-s25', repairTypes: [] }] },
    { category: 'phone', brand: 'OPPO', slug: 'oppo', icon: '', models: [{ model: 'Find X8 Pro', slug: 'find-x8-pro', repairTypes: [] }] },
    { category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '', models: [{ model: 'P30 Pro', slug: 'p30-pro', repairTypes: [] }] },
  ],
};

describe('Camera Lens route server selection', () => {
  it.each([
    ['generic', () => GenericCameraLensReplacementPage({ searchParams: Promise.resolve({ brand: 'huawei', model: 'p30-pro' }) }), 'huawei', 'p30-pro'],
    ['Google Pixel', () => GoogleCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'pixel-8-pro' }) }), 'google-pixel', 'pixel-8-pro'],
    ['Samsung', () => SamsungCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'galaxy-s25' }) }), 'samsung', 'galaxy-s25'],
    ['OPPO', () => OppoCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'find-x8-pro' }) }), 'oppo', 'find-x8-pro'],
  ])('passes valid %s selected identity to the shared landing page', async (_, renderPage, brandSlug, modelSlug) => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const element = await renderPage();
    expect(element.props.selectedDevice).toMatchObject({
      selectedDevice: { brandSlug, modelSlug },
      booking: { href: expect.stringContaining(`brandSlug=${brandSlug}`) },
    });
  });

  it.each([
    () => GenericCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'p30-pro' }) }),
    () => GoogleCameraLensReplacementPage({ searchParams: Promise.resolve({ model: ['pixel-8-pro', 'pixel-8-pro'] }) }),
    () => SamsungCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'galaxy-s25', brand: 'huawei' }) }),
    () => OppoCameraLensReplacementPage({ searchParams: Promise.resolve({ model: 'find-x8-pro', service: 'Camera Lens Replacement' }) }),
  ])('fails closed for malformed, conflicting, or overridden route query state', async (renderPage) => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const element = await renderPage();
    expect(element.props.selectedDevice).toBeNull();
  });
});
