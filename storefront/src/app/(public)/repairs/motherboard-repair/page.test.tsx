import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({ fetchRepairCatalogMock: vi.fn() }));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import MotherboardRepairPage, { generateMetadata } from './page';

const catalog = {
  brands: [
    { category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '📱', models: [{ model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [] }] },
    { category: 'phone', brand: 'Asus', slug: 'asus', icon: '📱', models: [{ model: 'ROG Phone 5', slug: 'rog-phone-5', repairTypes: [] }] },
    { category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: '💻', models: [{ model: 'MacBook Air (M3)', slug: 'macbook-air-m3', repairTypes: [] }] },
    { category: 'tablet', brand: 'iPad', slug: 'ipad', icon: '📟', models: [{ model: 'iPad Pro', slug: 'ipad-pro', repairTypes: [] }] },
  ],
};

describe('Motherboard Repair Master route', () => {
  it('keeps the clean Master indexable and canonical', async () => {
    await expect(generateMetadata({ searchParams: Promise.resolve({}) })).resolves.toMatchObject({
      alternates: { canonical: '/repairs/motherboard-repair' },
      robots: { index: true, follow: true },
      openGraph: { url: '/repairs/motherboard-repair' },
    });
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(JSON.stringify(metadata)).not.toMatch(/30 minutes|same day repair|same day service|while you wait|30–60 minutes/i);
  });

  it('makes selected and malformed query states noindex while retaining the clean canonical', async () => {
    for (const query of [
      { category: 'phone', brand: 'samsung', model: 'galaxy-s21' },
      { category: 'tablet', brand: 'ipad', model: 'ipad-pro' },
    ]) {
      await expect(generateMetadata({ searchParams: Promise.resolve(query) })).resolves.toMatchObject({
        alternates: { canonical: '/repairs/motherboard-repair' },
        robots: { index: false, follow: true },
        openGraph: { url: '/repairs/motherboard-repair' },
      });
    }
  });

  it('passes only Phase-1 eligible models and a server-validated selection to the Master UI', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await MotherboardRepairPage({
      searchParams: Promise.resolve({ category: 'laptop', brand: 'macbook', model: 'macbook-air-m3' }),
    }) as ReactElement<{
      canonicalPath: string;
      eligibleDevices: Array<{ category: string; brandSlug: string; modelSlug: string }>;
      selection: { category: string; brandSlug: string; modelSlug: string } | null;
    }>).props;

    expect(props.canonicalPath).toBe('/repairs/motherboard-repair');
    expect(props.eligibleDevices).toEqual(expect.arrayContaining([
      { category: 'phone', brand: 'Samsung', brandSlug: 'samsung', model: 'Galaxy S21', modelSlug: 'galaxy-s21' },
      { category: 'laptop', brand: 'MacBook', brandSlug: 'macbook', model: 'MacBook Air (M3)', modelSlug: 'macbook-air-m3' },
    ]));
    expect(props.eligibleDevices).not.toEqual(expect.arrayContaining([expect.objectContaining({ category: 'tablet' })]));
    expect(props.selection).toEqual(expect.objectContaining({ category: 'laptop', brandSlug: 'macbook', modelSlug: 'macbook-air-m3' }));
  });

  it('falls back to generic selection for a mismatched category and model', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await MotherboardRepairPage({
      searchParams: Promise.resolve({ category: 'phone', brand: 'macbook', model: 'macbook-air-m3' }),
    }) as ReactElement<{ selection: unknown }>).props;

    expect(props.selection).toBeNull();
  });
});
