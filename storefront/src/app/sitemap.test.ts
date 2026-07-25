import { describe, it, expect, vi } from 'vitest';
import { loadEnvConfig } from '@next/env';

const { fetchRepairCatalogMock } = vi.hoisted(() => {
  return {
    fetchRepairCatalogMock: vi.fn(),
  };
});

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import {
  getGooglePixelHardwareConfig,
  GOOGLE_PIXEL_HARDWARE_CONFIG,
} from '@/lib/seo/content/google-pixel/config';
import sitemap from './sitemap';

loadEnvConfig(process.cwd());

const logicBoardRepair = { slug: 'logic-board-repair' };
const screenRepair = { slug: 'screen-replacement' };
const pixelModels = [
  ...Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG).map((slug) => ({
    slug,
    repairTypes: [logicBoardRepair, screenRepair],
  })),
  {
    slug: 'pixel-unconfigured',
    repairTypes: [logicBoardRepair, screenRepair],
  },
];
const samsungModels = [
  'galaxy-s24-ultra',
  ...Array.from({ length: 396 }, (_, index) => `galaxy-fixture-${index + 1}`),
].map((slug) => ({ slug, repairTypes: [logicBoardRepair] }));

fetchRepairCatalogMock.mockResolvedValue({
  brands: [
    { category: 'phone', slug: 'google-pixel', models: pixelModels },
    { category: 'phone', slug: 'iphone', models: [{ slug: 'iphone-15-pro-max', repairTypes: [logicBoardRepair] }] },
    { category: 'phone', slug: 'samsung', models: samsungModels },
    { category: 'phone', slug: 'oppo', models: [{ slug: 'find-x8', repairTypes: [logicBoardRepair, screenRepair] }] },
  ],
});

describe('Sitemap SEO Generation', () => {
  it('excludes booking-only Other Repair from public sitemap output', async () => {
    const urls = await sitemap();
    const paths = urls.map((entry) => new URL(entry.url).pathname);

    expect(paths.filter((path) => path.includes('/other-repair'))).toEqual([]);
  });

  it('includes only configured Google Pixel models and their catalogue-backed repairs', async () => {
    const urls = await sitemap();
    const paths = urls.map(u => {
      // Extract pathname from full URL
      try {
        const urlObj = new URL(u.url);
        return urlObj.pathname;
      } catch (e) {
        return u.url.replace(/^https?:\/\/[^\/]+/, '');
      }
    });

    const pixelModelPaths = paths.filter((path) => /^\/repairs\/phone\/google-pixel\/[^/]+$/.test(path));
    const pixelRepairPaths = paths.filter((path) => /^\/repairs\/phone\/google-pixel\/[^/]+\/[^/]+$/.test(path));

    expect(getGooglePixelHardwareConfig('pixel-8a')).not.toBeNull();
    expect(getGooglePixelHardwareConfig('pixel-unconfigured')).toBeNull();
    expect(paths.filter((path) => path === '/repairs/phone/google-pixel')).toHaveLength(1);
    expect(pixelModelPaths).toHaveLength(Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG).length);
    expect(paths).toContain('/repairs/phone/google-pixel/pixel-8-pro');
    expect(paths).toContain('/repairs/phone/google-pixel/pixel-8a');
    expect(paths).toContain('/repairs/phone/google-pixel/pixel-8a/screen-replacement');
    expect(paths).toContain('/repairs/phone/google-pixel/pixel-8a/logic-board-repair');

    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured/screen-replacement');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured/logic-board-repair');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-8a/battery-replacement');
    const catalogueBackedPixelRepairPaths = pixelRepairPaths.filter((path) =>
      path.endsWith('/screen-replacement') || path.endsWith('/logic-board-repair'),
    );
    expect(catalogueBackedPixelRepairPaths).toHaveLength(
      Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG).length * 2,
    );
    expect(pixelRepairPaths).toHaveLength(new Set(pixelRepairPaths).size);

    // Logic Board paths remain canonical and include each configured Pixel model.
    const logicBoardUrls = paths.filter(p => p.endsWith('/logic-board-repair'));
    expect(logicBoardUrls.length).toBe(426);

    const pixelLogicBoardUrls = logicBoardUrls.filter(p => p.includes('/phone/google-pixel/'));
    expect(pixelLogicBoardUrls.length).toBe(Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG).length);

    const representativePaths = [
      '/repairs/phone/google-pixel/pixel-3/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-8a/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-8-pro/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-10/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-10-pro-fold/logic-board-repair'
    ];
    for (const p of representativePaths) {
      expect(paths).toContain(p);
    }

    const legacyLogicBoardUrls = paths.filter(p => p.endsWith('/logic-board'));
    expect(legacyLogicBoardUrls.length).toBe(0);

    const googleAliasUrls = paths.filter(p => p.includes('/phone/google/'));
    const googleLogicBoardAliasUrls = googleAliasUrls.filter(p => p.endsWith('/logic-board-repair'));
    expect(googleLogicBoardAliasUrls.length).toBe(0);

    const pixelAliasUrls = paths.filter(p => p.includes('/phone/pixel/'));
    expect(pixelAliasUrls.length).toBe(0);

    const uniqueLogicBoardUrls = new Set(logicBoardUrls);
    expect(logicBoardUrls.length).toBe(uniqueLogicBoardUrls.size);

    expect(paths).toContain('/repairs/phone/iphone/iphone-15-pro-max/logic-board-repair');
    expect(paths).toContain('/repairs/phone/samsung/galaxy-s24-ultra/logic-board-repair');
    expect(paths).toContain('/repairs/phone/oppo/find-x8/screen-replacement');

    const waterDamageUrls = paths.filter(p => p.includes('water-damage'));
    expect(waterDamageUrls.length).toBe(427);

    const malformedUrls = paths.filter(p => p.includes('undefined') || p.includes('null') || p.includes('[') || p.includes(']'));
    expect(malformedUrls.length).toBe(0);

    expect(new URL(urls.find((entry) => entry.url.endsWith('/repairs/phone/google-pixel/pixel-8a'))!.url).origin)
      .toBe('https://www.alimobile.com.au');
  });
});
