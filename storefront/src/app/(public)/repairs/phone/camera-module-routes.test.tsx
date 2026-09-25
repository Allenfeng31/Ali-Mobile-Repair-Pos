import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
}));
const { fetchSharedRepairPageResultSeedsMock } = vi.hoisted(() => ({
  fetchSharedRepairPageResultSeedsMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));
vi.mock('@/lib/repair-results.server', () => ({ fetchSharedRepairPageResultSeeds: fetchSharedRepairPageResultSeedsMock }));

import FrontCameraReplacementPage, { metadata as frontMetadata } from './front-camera-replacement/page';
import BackCameraReplacementPage, { metadata as backMetadata } from './back-camera-replacement/page';

type LandingPageProps = {
  canonicalPath: string;
  candidates: Array<{ canonicalBrandSlug: string; modelSlug: string; displayBrand: string; displayModel: string }>;
  hierarchy?: {
    models: Array<{ brandSlug: string; modelSlug: string; modelLabel: string; priceLabel: string | null; bookingHref: string }>;
    selectedBrandSlug: string | null;
    selectedModelSlug: string | null;
    selectedDevice?: unknown;
  };
  initialResults?: Array<{ id: string }>;
  config: { title: string; relatedHref?: string; distinctionBody: string; inspectionBody: string };
};

const catalog = {
  brands: [
    { category: 'phone', slug: 'google-pixel', brand: 'Google Pixel', models: [{ slug: 'pixel-8-pro', model: 'Pixel 8 Pro', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 129, repairOrigin: 'pos' }, { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 149, repairOrigin: 'pos' }] }] },
    { category: 'phone', slug: 'samsung', brand: 'Samsung', models: [
      { slug: 'galaxy-s25', model: 'Galaxy S25', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' }] },
      { slug: 'galaxy-screen-only', model: 'Galaxy Screen Only', repairTypes: [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 149, repairOrigin: 'pos' }] },
    ] },
    { category: 'phone', slug: 'iphone', brand: 'iPhone', models: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 99, repairOrigin: 'pos' }, { slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 149, repairOrigin: 'pos' }] }] },
    { category: 'phone', slug: 'huawei', brand: 'Huawei', models: [
      { slug: 'p30', model: 'P30', repairTypes: [{ slug: 'front-camera-replacement', name: 'Front Camera Replacement', price: 129, repairOrigin: 'pos' }] },
      { slug: 'nova-12', model: 'Nova 12', repairTypes: [] },
    ] },
    { category: 'phone', slug: 'xiaomi', brand: 'Xiaomi', models: [{ slug: 'redmi-note-12', model: 'Redmi Note 12', repairTypes: [{ slug: 'back-camera-replacement', name: 'Back Camera Replacement', price: 149, repairOrigin: 'pos', variants: [{ quality_grade: 'Standard', price: 149 }, { quality_grade: 'Premium', price: 179 }] }] }] },
  ],
};

describe('global camera module routes', () => {
  it('exposes unique query-free canonical, indexable metadata', () => {
    expect(frontMetadata.title).toBe('Phone Front Camera Repair Melbourne | Ali Mobile');
    expect(backMetadata.title).toBe('Phone Back Camera Repair Melbourne | Ali Mobile');
    expect(frontMetadata.description).toMatch(/Melbourne/);
    expect(backMetadata.description).toMatch(/Melbourne/);
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

  it('keeps both camera routes server-first, excludes brand-page cohorts, and leaves no-repair models bookable', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    fetchSharedRepairPageResultSeedsMock.mockResolvedValue([{ id: 'camera-proof' }]);
    const frontProps = (await FrontCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'huawei', model: 'nova-12' }) }) as ReactElement<LandingPageProps>).props;
    expect(frontProps.config.title).toBe('Phone Front Camera Repair & Replacement');
    expect(frontProps.canonicalPath).toBe('/repairs/phone/front-camera-replacement');
    expect(frontProps.candidates).toEqual([
      { canonicalBrandSlug: 'huawei', modelSlug: 'nova-12', displayBrand: 'Huawei', displayModel: 'Nova 12' },
      { canonicalBrandSlug: 'huawei', modelSlug: 'p30', displayBrand: 'Huawei', displayModel: 'P30' },
      { canonicalBrandSlug: 'xiaomi', modelSlug: 'redmi-note-12', displayBrand: 'Xiaomi', displayModel: 'Redmi Note 12' },
    ]);
    expect(JSON.stringify(frontProps.candidates)).not.toMatch(/price|variants|inventory|repairTypes/i);
    expect(frontProps.hierarchy).toEqual({
      models: [
        { brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'nova-12', modelLabel: 'Huawei Nova 12', repairLabel: 'Front Camera Replacement', priceLabel: null, bookingHref: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=Nova+12&brandSlug=huawei&modelSlug=nova-12&serviceSlug=front-camera-replacement' },
        { brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'p30', modelLabel: 'Huawei P30', repairLabel: 'Front Camera Replacement', priceLabel: '$129', bookingHref: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=front-camera-replacement' },
        { brandSlug: 'xiaomi', brandLabel: 'Xiaomi', modelSlug: 'redmi-note-12', modelLabel: 'Xiaomi Redmi Note 12', repairLabel: 'Front Camera Replacement', priceLabel: null, bookingHref: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Xiaomi&model=Redmi+Note+12&brandSlug=xiaomi&modelSlug=redmi-note-12&serviceSlug=front-camera-replacement' },
      ],
      selectedBrandSlug: 'huawei',
      selectedModelSlug: 'nova-12',
      selectedDevice: {
        selectedDevice: { brand: 'Huawei', brandSlug: 'huawei', model: 'Nova 12', modelSlug: 'nova-12' },
        selectedRepair: { name: 'Front Camera Replacement', serviceSlug: 'front-camera-replacement' },
        booking: { href: '/book-repair?category=phone&service=Front+Camera+Replacement&brand=Huawei&model=Nova+12&brandSlug=huawei&modelSlug=nova-12&serviceSlug=front-camera-replacement', isAvailable: true },
      },
    });
    expect(frontProps.initialResults).toEqual([{ id: 'camera-proof' }]);
    expect(fetchSharedRepairPageResultSeedsMock).toHaveBeenCalledWith({
      category: 'phone', brandSlug: 'huawei', repairTypeSlug: 'front-camera-replacement', selectedModelSlug: 'nova-12',
    });

    const backProps = (await BackCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'xiaomi', model: 'redmi-note-12' }) }) as ReactElement<LandingPageProps>).props;
    expect(backProps.config.title).toBe('Phone Back Camera Repair & Replacement');
    expect(backProps.candidates).toEqual([
      { canonicalBrandSlug: 'huawei', modelSlug: 'nova-12', displayBrand: 'Huawei', displayModel: 'Nova 12' },
      { canonicalBrandSlug: 'huawei', modelSlug: 'p30', displayBrand: 'Huawei', displayModel: 'P30' },
      { canonicalBrandSlug: 'xiaomi', modelSlug: 'redmi-note-12', displayBrand: 'Xiaomi', displayModel: 'Redmi Note 12' },
    ]);
    expect(backProps.config.relatedHref).toBe('/repairs/phone/camera-lens-replacement');
    expect(backProps.config.distinctionBody).toMatch(/Cracked outer lens glass/);
    expect(backProps.config.inspectionBody).toMatch(/cannot be guaranteed/);
    expect(backProps.hierarchy).toEqual({
      models: [
        { brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'nova-12', modelLabel: 'Huawei Nova 12', repairLabel: 'Back Camera Replacement', priceLabel: null, bookingHref: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=Huawei&model=Nova+12&brandSlug=huawei&modelSlug=nova-12&serviceSlug=back-camera-replacement' },
        { brandSlug: 'huawei', brandLabel: 'Huawei', modelSlug: 'p30', modelLabel: 'Huawei P30', repairLabel: 'Back Camera Replacement', priceLabel: null, bookingHref: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=Huawei&model=P30&brandSlug=huawei&modelSlug=p30&serviceSlug=back-camera-replacement' },
        { brandSlug: 'xiaomi', brandLabel: 'Xiaomi', modelSlug: 'redmi-note-12', modelLabel: 'Xiaomi Redmi Note 12', repairLabel: 'Back Camera Replacement', priceLabel: 'From $149', bookingHref: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=Xiaomi&model=Redmi+Note+12&brandSlug=xiaomi&modelSlug=redmi-note-12&serviceSlug=back-camera-replacement' },
      ],
      selectedBrandSlug: 'xiaomi',
      selectedModelSlug: 'redmi-note-12',
      selectedDevice: {
        selectedDevice: { brand: 'Xiaomi', brandSlug: 'xiaomi', model: 'Redmi Note 12', modelSlug: 'redmi-note-12' },
        selectedRepair: { name: 'Back Camera Replacement', serviceSlug: 'back-camera-replacement' },
        booking: { href: '/book-repair?category=phone&service=Back+Camera+Replacement&brand=Xiaomi&model=Redmi+Note+12&brandSlug=xiaomi&modelSlug=redmi-note-12&serviceSlug=back-camera-replacement', isAvailable: true },
      },
    });
    expect(backProps.initialResults).toEqual([{ id: 'camera-proof' }]);
    expect(fetchSharedRepairPageResultSeedsMock).toHaveBeenLastCalledWith({
      category: 'phone', brandSlug: 'xiaomi', repairTypeSlug: 'back-camera-replacement', selectedModelSlug: 'redmi-note-12',
    });
  });

  it('fails closed for invalid Front Camera hierarchy query pairs without changing the canonical route', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await FrontCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'huawei', model: 'galaxy-s25' }) }) as ReactElement<LandingPageProps>).props;
    expect(props.canonicalPath).toBe('/repairs/phone/front-camera-replacement');
    expect(props.hierarchy?.selectedBrandSlug).toBeNull();
    expect(props.hierarchy?.selectedModelSlug).toBeNull();
  });

  it('fails closed for invalid Back Camera query pairs without changing the canonical route', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await BackCameraReplacementPage({ searchParams: Promise.resolve({ brand: 'xiaomi', model: 'p30' }) }) as ReactElement<LandingPageProps>).props;
    expect(props.canonicalPath).toBe('/repairs/phone/back-camera-replacement');
    expect(props.hierarchy?.selectedBrandSlug).toBeNull();
    expect(props.hierarchy?.selectedModelSlug).toBeNull();
  });
});
