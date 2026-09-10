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
import { APPLE_WATCH_MODELS } from '@/lib/seo/content/apple-watch';
import { getPhase1DniConsolidationDestination } from '@/data/phase1DniConsolidationPaths';
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
  it('includes each quote-only global camera module and logic board master once without query or lastModified', async () => {
    const urls = await sitemap();
    for (const path of [
      '/repairs/phone/front-camera-replacement',
      '/repairs/phone/back-camera-replacement',
      '/repairs/phone/logic-board-repair',
    ]) {
      const entries = urls.filter((entry) => new URL(entry.url).pathname === path);
      expect(entries).toHaveLength(1);
      expect(entries[0].url).toBe(`https://www.alimobile.com.au${path}`);
      expect(entries[0]).not.toHaveProperty('lastModified');
      expect(entries[0].url).not.toContain('?');
    }
  });

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
    } catch {
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
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-8a/logic-board-repair');

    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured/screen-replacement');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-unconfigured/logic-board-repair');
    expect(paths).not.toContain('/repairs/phone/google-pixel/pixel-8a/battery-replacement');
    const catalogueBackedPixelRepairPaths = pixelRepairPaths.filter((path) =>
      path.endsWith('/screen-replacement') || path.endsWith('/logic-board-repair'),
    );
    const expectedCatalogueBackedPixelRepairPaths = Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG).flatMap((slug) => [
      `/repairs/phone/google-pixel/${slug}/screen-replacement`,
      `/repairs/phone/google-pixel/${slug}/logic-board-repair`,
    ]).filter((path) => !getPhase1DniConsolidationDestination(path));
    expect(catalogueBackedPixelRepairPaths).toHaveLength(expectedCatalogueBackedPixelRepairPaths.length);
    expect(pixelRepairPaths).toHaveLength(new Set(pixelRepairPaths).size);

    const logicBoardUrls = paths.filter(p => p.endsWith('/logic-board-repair'));

    const pixelLogicBoardUrls = logicBoardUrls.filter(p => p.includes('/phone/google-pixel/'));
    expect(pixelLogicBoardUrls.length).toBe(Object.keys(GOOGLE_PIXEL_HARDWARE_CONFIG)
      .filter((slug) => !getPhase1DniConsolidationDestination(`/repairs/phone/google-pixel/${slug}/logic-board-repair`)).length);

    const emittedRepresentativePaths = [
      '/repairs/phone/google-pixel/pixel-8-pro/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-10-pro-fold/logic-board-repair',
    ];
    for (const p of emittedRepresentativePaths) {
      expect(paths).toContain(p);
    }
    const suppressedRepresentativePaths = [
      '/repairs/phone/google-pixel/pixel-3/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-8a/logic-board-repair',
      '/repairs/phone/google-pixel/pixel-10/logic-board-repair',
    ];
    for (const p of suppressedRepresentativePaths) {
      expect(paths).not.toContain(p);
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
    expect(waterDamageUrls.length).toBe(223);

    const malformedUrls = paths.filter(p => p.includes('undefined') || p.includes('null') || p.includes('[') || p.includes(']'));
    expect(malformedUrls.length).toBe(0);

    expect(new URL(urls.find((entry) => entry.url.endsWith('/repairs/phone/google-pixel/pixel-8a'))!.url).origin)
      .toBe('https://www.alimobile.com.au');
  });

  it('suppresses only exact Phase 1 source paths while retaining held and outside-sample routes', async () => {
    fetchRepairCatalogMock.mockResolvedValueOnce({
      brands: [
        { category: 'phone', slug: 'asus', models: [{ slug: 'rog-phone-5', repairTypes: [logicBoardRepair, { slug: 'water-damage-repair' }] }] },
        { category: 'phone', slug: 'samsung', models: [{ slug: 'galaxy-z-flip', repairTypes: [logicBoardRepair] }] },
        { category: 'phone', slug: 'iphone', models: [{ slug: 'iphone-6', repairTypes: [logicBoardRepair] }] },
      ],
    });
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);

    expect(paths).not.toContain('/repairs/phone/asus/rog-phone-5/logic-board-repair');
    expect(paths).not.toContain('/repairs/phone/asus/rog-phone-5/water-damage-repair');
    expect(paths).toContain('/repairs/laptop/macbook/macbook-air-11-2014-2015/water-damage-repair');
    expect(paths).toContain('/repairs/phone/samsung/galaxy-z-flip/logic-board-repair');
    expect(paths).toContain('/repairs/phone/iphone/iphone-6/logic-board-repair');
    expect(paths).toContain('/repairs/phone/logic-board-repair');
    expect(paths).toContain('/repairs/water-damage');
  });

  it('includes only configured Apple Watch Charging Repair routes and no legacy charging-port aliases', async () => {
    fetchRepairCatalogMock.mockResolvedValueOnce({
      brands: [{
        category: 'watch',
        slug: 'apple',
        models: [
          ...APPLE_WATCH_MODELS.map((slug) => ({
            slug,
            repairTypes: [
              { slug: 'screen-replacement' },
              { slug: 'charging-repair' },
              { slug: 'charging-port-replacement' },
            ],
          })),
          {
            slug: 'apple-watch-unconfigured',
            repairTypes: [{ slug: 'screen-replacement' }, { slug: 'charging-repair' }],
          },
        ],
      }],
    });

    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);

    for (const model of APPLE_WATCH_MODELS) {
      expect(paths.filter((path) => path === `/repairs/watch/apple/${model}`)).toHaveLength(1);
      expect(paths.filter((path) => path === `/repairs/watch/apple/${model}/charging-repair`)).toHaveLength(1);
      expect(paths).not.toContain(`/repairs/watch/apple/${model}/charging-port-replacement`);
    }
    expect(paths).not.toContain('/repairs/watch/apple/apple-watch-unconfigured');
    expect(paths).not.toContain('/repairs/watch/apple/apple-watch-unconfigured/charging-repair');
    expect(paths.filter((path) => path.includes('/charging-port-replacement'))).toHaveLength(1);
  });
});
