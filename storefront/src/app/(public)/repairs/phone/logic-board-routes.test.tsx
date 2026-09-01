import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { fetchRepairCatalogMock } = vi.hoisted(() => ({
  fetchRepairCatalogMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import LogicBoardRepairPage, { metadata } from './logic-board-repair/page';

type LandingPageProps = {
  canonicalPath: string;
  candidates: Array<{ canonicalBrandSlug: string; modelSlug: string; displayBrand: string; displayModel: string }>;
};

const catalog = {
  brands: [
    { category: 'phone', slug: 'google-pixel', brand: 'Google Pixel', models: [{ slug: 'pixel-8-pro', model: 'Pixel 8 Pro', repairTypes: [{ slug: 'logic-board-repair' }] }] },
    { category: 'phone', slug: 'samsung', brand: 'Samsung', models: [{ slug: 'galaxy-s25', model: 'Galaxy S25', repairTypes: [{ slug: 'logic-board-repair' }] }] },
    { category: 'phone', slug: 'iphone', brand: 'iPhone', models: [{ slug: 'iphone-15', model: 'iPhone 15', repairTypes: [{ slug: 'logic-board-repair' }] }] },
  ],
};

describe('global logic board module routes', () => {
  it('exposes unique query-free canonical, indexable metadata', () => {
    expect(metadata.alternates?.canonical).toBe('/repairs/phone/logic-board-repair');
    expect(metadata.title).toMatch(/Logic Board/i);
    expect(metadata.description).toMatch(/assessment/i);
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph?.url).toBe('/repairs/phone/logic-board-repair');
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe('summary');
  });

  it('keeps the routes server-first and passes only matching non-iPhone trusted candidates', async () => {
    fetchRepairCatalogMock.mockResolvedValue(catalog);
    const props = (await LogicBoardRepairPage() as ReactElement<LandingPageProps>).props;
    expect(props.canonicalPath).toBe('/repairs/phone/logic-board-repair');
    expect(props.candidates).toEqual([
      { canonicalBrandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', displayBrand: 'Google Pixel', displayModel: 'Pixel 8 Pro' },
      { canonicalBrandSlug: 'samsung', modelSlug: 'galaxy-s25', displayBrand: 'Samsung', displayModel: 'Galaxy S25' },
    ]);
    expect(JSON.stringify(props.candidates)).not.toMatch(/price|variants|inventory|repairTypes/i);
  });
});
