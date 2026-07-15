import { describe, it, expect, vi } from 'vitest';
import { loadEnvConfig } from '@next/env';

const { fetchRepairCatalogMock } = vi.hoisted(() => {
  const logicBoardRepair = { slug: 'logic-board-repair' };
  const representativePixelModels = [
    'pixel-3',
    'pixel-8a',
    'pixel-8-pro',
    'pixel-10',
    'pixel-10-pro-fold',
  ];
  const pixelModels = [
    ...representativePixelModels,
    ...Array.from({ length: 22 }, (_, index) => `pixel-fixture-${index + 1}`),
  ].map((slug) => ({ slug, repairTypes: [logicBoardRepair] }));
  const samsungModels = [
    'galaxy-s24-ultra',
    ...Array.from({ length: 396 }, (_, index) => `galaxy-fixture-${index + 1}`),
  ].map((slug) => ({ slug, repairTypes: [logicBoardRepair] }));

  return {
    fetchRepairCatalogMock: vi.fn(async () => ({
      brands: [
        { category: 'phone', slug: 'google-pixel', models: pixelModels },
        { category: 'phone', slug: 'iphone', models: [{ slug: 'iphone-15-pro-max', repairTypes: [logicBoardRepair] }] },
        { category: 'phone', slug: 'samsung', models: samsungModels },
      ],
    })),
  };
});

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import sitemap from './sitemap';

loadEnvConfig(process.cwd());

describe('Sitemap SEO Generation', () => {
  it('excludes booking-only Other Repair from public sitemap output', async () => {
    const urls = await sitemap();
    const paths = urls.map((entry) => new URL(entry.url).pathname);

    expect(paths.filter((path) => path.includes('/other-repair'))).toEqual([]);
  });

  it('enforces Logic Board repair canonical and alias invariants', async () => {
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

    // 1. Logic Board canonical URL count is exactly 425
    const logicBoardUrls = paths.filter(p => p.endsWith('/logic-board-repair'));
    expect(logicBoardUrls.length).toBe(425);

    // 2. Google Pixel Logic Board URL count is exactly 27
    const pixelLogicBoardUrls = logicBoardUrls.filter(p => p.includes('/phone/google-pixel/'));
    expect(pixelLogicBoardUrls.length).toBe(27);

    // 3. Representative paths exist
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

    // 4. Legacy paths ending exactly in /logic-board are absent
    const legacyLogicBoardUrls = paths.filter(p => p.endsWith('/logic-board'));
    expect(legacyLogicBoardUrls.length).toBe(0);

    // 5. /repairs/phone/google/ aliases are absent
    const googleAliasUrls = paths.filter(p => p.includes('/phone/google/'));
    // Wait, let's make sure it doesn't match "/repairs/phone/google/camera-lens-replacement" which is specifically in sitemap
    const googleLogicBoardAliasUrls = googleAliasUrls.filter(p => p.endsWith('/logic-board-repair'));
    expect(googleLogicBoardAliasUrls.length).toBe(0);

    // 6. /repairs/phone/pixel/ aliases are absent
    const pixelAliasUrls = paths.filter(p => p.includes('/phone/pixel/'));
    expect(pixelAliasUrls.length).toBe(0);

    // 7. No duplicate Logic Board URLs exist
    const uniqueLogicBoardUrls = new Set(logicBoardUrls);
    expect(logicBoardUrls.length).toBe(uniqueLogicBoardUrls.size);

    // 8. Representative non-Google Logic Board URLs remain present
    expect(paths).toContain('/repairs/phone/iphone/iphone-15-pro-max/logic-board-repair');
    expect(paths).toContain('/repairs/phone/samsung/galaxy-s24-ultra/logic-board-repair');

    // 9. Water Damage sitemap count remains 427
    const waterDamageUrls = paths.filter(p => p.includes('water-damage'));
    expect(waterDamageUrls.length).toBe(427);

    // 10. A future invalid or malformed model does not enter sitemap automatically
    // It should not generate anything with "undefined" or null
    const malformedUrls = paths.filter(p => p.includes('undefined') || p.includes('null') || p.includes('[') || p.includes(']'));
    expect(malformedUrls.length).toBe(0);
  });
});
