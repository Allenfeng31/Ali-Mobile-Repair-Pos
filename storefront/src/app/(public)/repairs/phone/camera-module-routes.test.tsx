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
  hierarchy?: {
    models: Array<{ brandSlug: string; modelSlug: string; modelLabel: string; priceLabel: string | null; bookingHref: string }>;
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
  };
  config: { relatedHref?: string; distinctionBody: string; inspectionBody: string };
};

const catalog = {
  brands: [
    { category: 'phone', slug: 'google-pixel', brand: 'Google Pixel', models: [{ slug: 'pixel-8-pro', model: 'Pixel 8 Pro', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 129, repairOrigin: 'pos' }, { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 149, repairOrigin: 'pos' }] }] },
    { category: 'phone', slug: 'samsung', brand: 'Samsung', models: [
      { slug: 'galaxy-s25', model: 'Galaxy S25', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' }] },
      { slug: 'galaxy-screen-only', model: 'Galaxy Screen Only', repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 149, repairOrigin: 'pos' }] },
    ] },
    { category: 'phone', slug: 'iphone', brand: 'iPhone', models: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' }, { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 149, repairOrigin: 'pos' }] }] },
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

  it('keeps the routes server-first and activates hierarchy only for Front Camera', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const frontProps = (await FrontCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'samsung', model: 'galaxy-s25' }) }) as ReactElement<LandingPageProps>).props;
    expect(frontProps.canonicalPath).toBe('/repairs/phone/front-camera-replacement');
    expect(frontProps.candidates).toEqual([
      { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
      { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
    ]);
    expect(JSON.stringify(frontProps.candidates)).not.toMatch(/price|variants|inventory|repairTypes/i);
    expect(frontProps.hierarchy).toEqual({
      models: [
        { brandSlug: 'google-pixel', brandLabel: 'Google Pixel', modelSlug: 'pixel-8-pro', modelLabel: 'Google Pixel 8 Pro', repairLabel: 'Front Camera Replacement', priceLabel: '$129', bookingHref: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Google+Pixel&model=Pixel+8+Pro' },
        { brandSlug: 'samsung', brandLabel: 'Samsung', modelSlug: 'galaxy-s25', modelLabel: 'Samsung Galaxy S25', repairLabel: 'Front Camera Replacement', priceLabel: '$99', bookingHref: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Samsung&model=Galaxy+S25' },
      ],
      selectedBrandSlug: 'samsung',
      selectedModelSlug: 'galaxy-s25',
    });

    const backProps = (await BackCameraReplacementPage() as ReactElement<LandingPageProps>).props;
    expect(backProps.candidates).toEqual([
      { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
    ]);
    expect(backProps.config.relatedHref).toBe('/repairs/phone/camera-lens-replacement');
    expect(backProps.config.distinctionBody).toMatch(/Cracked outer lens glass/);
    expect(backProps.config.inspectionBody).toMatch(/cannot be guaranteed/);
    expect(backProps.hierarchy).toBeUndefined();
  });

  it('fails closed for invalid Front Camera hierarchy query pairs without changing the canonical route', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await FrontCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'google-pixel', model: 'galaxy-s25' }) }) as ReactElement<LandingPageProps>).props;
    expect(props.canonicalPath).toBe('/repairs/phone/front-camera-replacement');
    expect(props.hierarchy?.selectedBrandSlug).toBeNull();
    expect(props.hierarchy?.selectedModelSlug).toBeNull();
  });
});
