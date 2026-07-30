import { describe, expect, it, vi } from 'vitest';
import { loadEnvConfig } from '@next/env';

const { fetchRepairCatalogMock, pixelModels, unconfiguredPixelModels, samsungModels, iphoneModels } = vi.hoisted(() => {
  const logicBoardRepair = { slug: 'logic-board-repair' };
  const representativePixelModels = [
    'pixel-3',
    'pixel-8a',
    'pixel-8-pro',
    'pixel-10',
    'pixel-10-pro-fold',
  ];
  const unconfiguredPixelModels = Array.from({ length: 22 }, (_, index) => `pixel-fixture-${index + 1}`);
  const pixelModels = [
    ...representativePixelModels,
    ...unconfiguredPixelModels,
  ].map((slug) => ({ slug, repairTypes: [logicBoardRepair] }));
  const samsungModels = [
    'galaxy-s24-ultra',
    ...Array.from({ length: 396 }, (_, index) => `galaxy-fixture-${index + 1}`),
  ].map((slug) => ({ slug, repairTypes: [logicBoardRepair] }));
  const iphoneModels = [{ slug: 'iphone-15-pro-max', repairTypes: [logicBoardRepair] }];

  return {
    pixelModels,
    unconfiguredPixelModels,
    samsungModels,
    iphoneModels,
    fetchRepairCatalogMock: vi.fn(async () => ({
      brands: [
        { category: 'phone', slug: 'google-pixel', models: pixelModels },
        { category: 'phone', slug: 'iphone', models: iphoneModels },
        { category: 'phone', slug: 'samsung', models: samsungModels },
      ],
    })),
  };
});

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import nextConfig from '../../next.config';
import { getGooglePixelHardwareConfig } from '@/lib/seo/content/google-pixel/config';
import sitemap from './sitemap';

loadEnvConfig(process.cwd());

const approvedRedirects = [
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526/galaxy-tab-s10-fe-front-camera',
    destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526/front-camera-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t580',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585-sm-t580',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t580/galaxy-tab-a-101-2016-back-camera',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585-sm-t580/back-camera-replacement',
  },
  {
    source: '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu--tb-128fu/lenovo-tab-m10-plus-gen-3-battery-service',
    destination: '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu-tb-128fu/battery-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595/galaxy-tab-a-105-2018-battery-service',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595/battery-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200--sm-x205',
    destination: '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-screen-repair',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/screen-replacement',
  },
  {
    source: '/repairs/tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/lenovo-tab-p11-gen-2-back-camera',
    destination: '/repairs/tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/back-camera-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/back-camera-replacement',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/back-camera-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/galaxy-tab-a-97-screen-repair',
    destination: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/screen-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626/galaxy-tab-s10-fe-plus-screen-repair',
    destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626/screen-replacement',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516',
    destination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510-sm-x516',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930--sm-x936',
    destination: '/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930-sm-x936',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865/galaxy-tab-s6-water-damage-repair',
    destination: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865/water-damage-repair',
  },
  {
    source: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835/galaxy-tab-s4-water-damage-repair',
    destination: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835/water-damage-repair',
  },
  {
    source: '/product-page/ipad-case',
    destination: '/repairs/tablet/ipad',
  },
  {
    source: '/product-page/ipad-case-:slug(.*)',
    destination: '/repairs/tablet/ipad',
  },
] as const;

const googlePixelSharedRepairAliases = [
  {
    source: '/repairs/phone/google-pixel/camera-lens-replacement',
    destination: '/repairs/phone/google/camera-lens-replacement',
  },
  {
    source: '/repairs/phone/google-pixel/loudspeaker-replacement',
    destination: '/repairs/phone/google/loudspeaker-replacement',
  },
  {
    source: '/repairs/phone/google-pixel/earpiece-speaker-replacement',
    destination: '/repairs/phone/google/earpiece-speaker-replacement',
  },
  {
    source: '/repairs/phone/google-pixel/power-button-replacement',
    destination: '/repairs/phone/google/power-button-replacement',
  },
  {
    source: '/repairs/phone/google-pixel/volume-button-replacement',
    destination: '/repairs/phone/google/volume-button-replacement',
  },
] as const;

const removedBlogSources = [
  '/blog/categories/shop-news',
  '/blog/reliable-phone-repair-ringwood',
] as const;

const malformedSimilarSources = [
  '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu--tb-128fv/lenovo-tab-m10-plus-gen-3-battery-service',
  '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t581/galaxy-tab-a-101-2016-back-camera',
] as const;

async function getRedirects() {
  const redirects = await nextConfig.redirects?.();

  if (!redirects) {
    throw new Error('Redirect config did not return any entries');
  }

  return redirects;
}

function getPathname(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url.replace(/^https?:\/\/[^/]+/, '');
  }
}

describe('July 15 GSC technical redirect batch', () => {
  it('keeps every approved redirect source exactly once with the exact destination', async () => {
    const redirects = await getRedirects();

    for (const { source, destination } of approvedRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
    }
  });

  it('removes only the obsolete blog redirects, keeps iPad case direct, and preserves unrelated redirects', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    for (const source of removedBlogSources) {
      expect(sources.has(source)).toBe(false);
    }

    expect(redirectBySource.get('/product-page/ipad-case')).toMatchObject({
      destination: '/repairs/tablet/ipad',
      permanent: true,
    });
    expect(redirectBySource.get('/product-page/ipad-case-:slug(.*)')).toMatchObject({
      destination: '/repairs/tablet/ipad',
      permanent: true,
    });
    expect(redirectBySource.get('/product-page/:path*')).toMatchObject({
      destination: '/repairs/phone',
      permanent: true,
    });
    expect(redirectBySource.get('/shop-case-ipad-mini')).toMatchObject({
      destination: '/repairs/tablet/apple',
      permanent: true,
    });
    expect(redirectBySource.get('/post/we-start-our-blog')).toMatchObject({
      destination: '/blog',
      permanent: true,
    });
  });

  it('does not redirect approved canonical destinations again', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const { destination } of approvedRedirects) {
      expect(sources.has(destination), destination).toBe(false);
    }
  });

  it('permanently redirects each Google Pixel shared-repair alias directly to its Google canonical URL', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    for (const { source, destination } of googlePixelSharedRepairAliases) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
      expect(matches[0].source).not.toContain('?');
      expect(matches[0].destination).not.toContain('?');

      const request = new URL(`https://www.alimobile.com.au${source}?model=pixel-8-pro`);
      const redirectTarget = new URL(destination, request.origin);

      redirectTarget.search = request.search;
      expect(`${redirectTarget.pathname}${redirectTarget.search}`).toBe(`${destination}?model=pixel-8-pro`);
    }
  });

  it('keeps Google Pixel brand, model and repair-detail routes outside the shared-repair alias boundary', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    expect(sources.has('/repairs/phone/google-pixel')).toBe(false);
    expect(sources.has('/repairs/phone/google-pixel/pixel-8-pro')).toBe(false);
    expect(sources.has('/repairs/phone/google-pixel/pixel-8-pro/screen-replacement')).toBe(false);
    expect(sources.has('/repairs/phone/google-pixel/pixel-8-pro/logic-board-repair')).toBe(false);
  });

  it('does not broaden either corrected legacy rule to similar malformed model paths', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const source of malformedSimilarSources) {
      expect(sources.has(source), source).toBe(false);
    }
  });

  it('keeps sitemap alias-free while preserving logic board, water damage, and Other Repair invariants', async () => {
    const urls = await sitemap();
    const paths = urls.map((entry) => getPathname(entry.url));

    for (const { source } of approvedRedirects) {
      expect(paths).not.toContain(source);
    }

    for (const { source, destination } of googlePixelSharedRepairAliases) {
      expect(paths).not.toContain(source);
      expect(paths.filter((path) => path === destination), destination).toHaveLength(1);
    }

    for (const source of removedBlogSources) {
      expect(paths).not.toContain(source);
    }

    const logicBoardPaths = paths.filter((path) => path.endsWith('/logic-board-repair'));
    const configuredPixelLogicBoardPaths = pixelModels
      .filter((model) => getGooglePixelHardwareConfig(model.slug))
      .map((model) => `/repairs/phone/google-pixel/${model.slug}/logic-board-repair`);
    const nonPixelLogicBoardPaths = [
      ...iphoneModels.map((model) => `/repairs/phone/iphone/${model.slug}/logic-board-repair`),
      ...samsungModels.map((model) => `/repairs/phone/samsung/${model.slug}/logic-board-repair`),
    ];
    const expectedLogicBoardPaths = new Set([
      ...configuredPixelLogicBoardPaths,
      ...nonPixelLogicBoardPaths,
    ]);

    expect(logicBoardPaths).toHaveLength(expectedLogicBoardPaths.size);
    for (const path of configuredPixelLogicBoardPaths) {
      expect(logicBoardPaths).toContain(path);
    }
    for (const slug of unconfiguredPixelModels) {
      expect(paths).not.toContain(`/repairs/phone/google-pixel/${slug}/logic-board-repair`);
    }
    expect(paths.filter((path) => path.endsWith('/logic-board'))).toHaveLength(0);
    expect(paths.filter((path) => path.includes('/phone/google/') && path.endsWith('/logic-board-repair'))).toHaveLength(0);
    expect(paths.filter((path) => path.includes('water-damage'))).toHaveLength(427);
    expect(paths.filter((path) => path.includes('/other-repair'))).toHaveLength(0);
    expect(new Set(paths)).toHaveLength(paths.length);
  });
});
