import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import FrontCameraReplacementPage, { metadata as frontMetadata } from './front-camera-replacement/page';
import BackCameraReplacementPage, { metadata as backMetadata } from './back-camera-replacement/page';

type LandingPageProps = {
  canonicalPath: string;
  candidates: Array<{ canonicalBrandSlug: string; modelSlug: string; displayBrand: string; displayModel: string }>;
  config: { relatedHref?: string; distinctionBody: string; inspectionBody: string };
};

const catalog = {
  brands: [
    { category: 'phone', slug: 'google-pixel', brand: 'Google Pixel', models: [{ slug: 'pixel-8-pro', model: 'Pixel 8 Pro', repairTypes: [{ slug: 'front-camera-replacement' }, { slug: 'back-camera-replacement' }] }] },
    { category: 'phone', slug: 'samsung', brand: 'Samsung', models: [{ slug: 'galaxy-s25', model: 'Galaxy S25', repairTypes: [{ slug: 'front-camera-replacement' }] }] },
    { category: 'phone', slug: 'iphone', brand: 'iPhone', models: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [{ slug: 'front-camera-replacement' }, { slug: 'back-camera-replacement' }] }] },
  ],
};

describe('global camera module routes', () => {
  it('exposes unique query-free canonical, indexable metadata', () => {
    expect(frontMetadata.alternates?.canonical).toBe('/repairs/phone/front-camera-replacement');
    expect(backMetadata.alternates?.canonical).toBe('/repairs/phone/back-camera-replacement');
    expect(frontMetadata.title).not.toBe(backMetadata.title);
    expect(frontMetadata.description).not.toBe(backMetadata.description);
    expect(frontMetadata.robots).toEqual({ index: true, follow: true });
    expect(backMetadata.robots).toEqual({ index: true, follow: true });
    expect(frontMetadata.openGraph?.url).toBe('/repairs/phone/front-camera-replacement');
    expect(backMetadata.openGraph?.url).toBe('/repairs/phone/back-camera-replacement');
    expect((frontMetadata.twitter as { card?: string } | undefined)?.card).toBe('summary');
    expect((backMetadata.twitter as { card?: string } | undefined)?.card).toBe('summary');
  });

  it('keeps the routes server-first and passes only matching non-iPhone trusted candidates', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const frontProps = (await FrontCameraReplacementPage() as ReactElement<LandingPageProps>).props;
    expect(frontProps.canonicalPath).toBe('/repairs/phone/front-camera-replacement');
    expect(frontProps.candidates).toEqual([
      { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
      { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
    ]);
    expect(JSON.stringify(frontProps.candidates)).not.toMatch(/price|variants|inventory|repairTypes/i);

    const backProps = (await BackCameraReplacementPage() as ReactElement<LandingPageProps>).props;
    expect(backProps.candidates).toEqual([
      { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
    ]);
    expect(backProps.config.relatedHref).toBe('/repairs/phone/camera-lens-replacement');
    expect(backProps.config.distinctionBody).toMatch(/Cracked outer lens glass/);
    expect(backProps.config.inspectionBody).toMatch(/cannot be guaranteed/);
  });
});
