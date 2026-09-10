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
  const tabletModels = [
    'galaxy-tab-s11-sm-x730-sm-x736',
    'galaxy-tab-s-84-sm-t700-sm-t705',
  ].map((slug) => ({ slug, repairTypes: [{ slug: 'screen-replacement' }] }));

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
        { category: 'tablet', slug: 'samsung', models: tabletModels },
      ],
    })),
  };
});

vi.mock('@/lib/api', () => ({ fetchRepairCatalog: fetchRepairCatalogMock }));

import nextConfig from '../../next.config';
import { getGooglePixelHardwareConfig } from '@/lib/seo/content/google-pixel/config';
import { APPLE_WATCH_MODELS } from '@/lib/seo/content/apple-watch';
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

const appleWatchChargingRepairAliases = APPLE_WATCH_MODELS.map((model) => ({
  source: `/repairs/watch/apple/${model}/charging-port-replacement`,
  destination: `/repairs/watch/apple/${model}/charging-repair`,
}));

const tabletGsc404Redirects = [
  ['/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730--sm-t733--sm-t736', '/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730-sm-t733-sm-t736'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920--sm-x926', '/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920-sm-x926'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900--sm-x906', '/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900-sm-x906'],
  ['/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700--sm-t705', '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700-sm-t705'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-sm-x700--sm-x706', '/repairs/tablet/samsung/galaxy-tab-s8-sm-x700-sm-x706'],
  ['/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210--sm-x215', '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210-sm-x215'],
  ['/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x736', '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730-sm-x736'],
  ['/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810--sm-t815', '/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810-sm-t815'],
  ['/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595', '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595'],
  ['/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835', '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835'],
  ['/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610--sm-p613--sm-p615--sm-p619', '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800--sm-x806', '/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800-sm-x806'],
  ['/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865', '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865'],
  ['/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710--sm-t715', '/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710-sm-t715'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626', '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616', '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526', '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526'],
  ['/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970--sm-t975--sm-t976', '/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970-sm-t975-sm-t976'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380--sm-t385', '/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380-sm-t385'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820--sm-x826', '/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820-sm-x826'],
  ['/repairs/tablet/samsung/galaxy-tab-s3-sm-t820--sm-t825', '/repairs/tablet/samsung/galaxy-tab-s3-sm-t820-sm-t825'],
  ['/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725', '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725'],
  ['/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555', '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555'],
  ['/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu--tb-128fu', '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu-tb-128fu'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810--sm-x816/galaxy-tab-s9-plus-water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810-sm-x816/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-a8-sm-x200--sm-x205/charging-port-replacement', '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205/charging-port-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516/water-damage-repair', '/repairs/water-damage'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/front-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/front-camera-replacement'],
  ['/repairs/tablet/lenovo/lenovo-tab-m9-tb-310fu/lenovo-tab-m9-battery-service', '/repairs/tablet/lenovo/lenovo-tab-m9-tb-310fu/battery-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/screen-replacement', '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725/galaxy-tab-s5e-screen-repair', '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616/back-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616/back-camera-replacement'],
] as const;

const removedBlogSources = [
  '/blog/categories/shop-news',
  '/blog/reliable-phone-repair-ringwood',
] as const;

const malformedSimilarSources = [
  '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu--tb-128fv/lenovo-tab-m10-plus-gen-3-battery-service',
  '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t581/galaxy-tab-a-101-2016-back-camera',
  '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x735',
  '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200--sm-x206/charging-port-replacement',
] as const;

const crawledNiLegacy404Redirects = [
  ['/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400--sm-x406/screen-replacement', '/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400-sm-x406/screen-replacement'],
  ['/repairs/tablet/lenovo/lenovo-yoga-tab-13-yt-k606f/lenovo-yoga-tab-13-charging-port', '/repairs/tablet/lenovo/lenovo-yoga-tab-13-yt-k606f/charging-port-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210--sm-x215/battery-replacement', '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210-sm-x215/battery-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-sm-x710--sm-x716/galaxy-tab-s9-battery-service', '/repairs/tablet/samsung/galaxy-tab-s9-sm-x710-sm-x716/battery-replacement'],
  ['/repairs/tablet/lenovo/lenovo-tab-m10-gen-3-tb-328fu/lenovo-tab-m10-gen-3-water-damage-repair', '/repairs/water-damage'],
  ['/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595/battery-replacement', '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595/battery-replacement'],
] as const;

const crawledNiLegacy404NonSources = [
  '/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400--sm-x406/screen-repair',
  '/repairs/tablet/lenovo/lenovo-yoga-tab-13-yt-k606f/lenovo-yoga-tab-13-battery-service',
  '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210--sm-x215/battery-service',
  '/repairs/tablet/samsung/galaxy-tab-s9-sm-x710--sm-x716/screen-replacement',
  '/repairs/tablet/lenovo/lenovo-tab-m10-gen-3-tb-328fu/water-damage-repair',
  '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595/screen-replacement',
  '/repairs/phone/oneplus/10-pro',
  '/repairs/phone/nokia/c32',
  '/repairs/phone/motorola/moto-g50',
  '/repairs/phone/vivo/y15s/water-damage-repair',
  '/repairs/phone/vivo/y56-5g/water-damage-repair',
  '/repairs/phone/google/pixel-6a',
  '/repairs/phone/google/pixel-4a/back-camera-replacement',
  '/repairs/phone/google/pixel-10-pro-fold/charging-port-replacement',
  '/repairs/phone/google/pixel-7a/water-damage-repair',
  '/repairs/phone/samsung/galaxy-a50/logic-board',
  '/repairs/phone/asus/rog-phone-5/water-damage-repair',
] as const;

const samsungTabletModelHubRedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916', '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-sm-x710--sm-x716', '/repairs/tablet/samsung/galaxy-tab-s9-sm-x710-sm-x716'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350--sm-t355', '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350-sm-t355'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810--sm-x816', '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810-sm-x816'],
  ['/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970--sm-t975--sm-t976', '/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970-sm-t975-sm-t976'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400--sm-x406', '/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400-sm-x406'],
  ['/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610--sm-p613--sm-p615--sm-p619', '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619'],
  ['/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725', '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725'],
  ['/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210--sm-x215', '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210-sm-x215'],
  ['/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810--sm-t815', '/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810-sm-t815'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800--sm-x806', '/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800-sm-x806'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626', '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626'],
  ['/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730--sm-t733--sm-t736', '/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730-sm-t733-sm-t736'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920--sm-x926', '/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920-sm-x926'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900--sm-x906', '/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900-sm-x906'],
  ['/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700--sm-t705', '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700-sm-t705'],
  ['/repairs/tablet/samsung/galaxy-tab-s8-sm-x700--sm-x706', '/repairs/tablet/samsung/galaxy-tab-s8-sm-x700-sm-x706'],
  ['/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x736', '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730-sm-x736'],
  ['/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595', '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595'],
  ['/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835', '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835'],
  ['/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865', '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865'],
  ['/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710--sm-t715', '/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710-sm-t715'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616', '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526', '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380--sm-t385', '/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380-sm-t385'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820--sm-x826', '/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820-sm-x826'],
  ['/repairs/tablet/samsung/galaxy-tab-s3-sm-t820--sm-t825', '/repairs/tablet/samsung/galaxy-tab-s3-sm-t820-sm-t825'],
  ['/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555', '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555'],
  ['/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t580', '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585-sm-t580'],
  ['/repairs/tablet/samsung/galaxy-tab-a8-sm-x200--sm-x205', '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516', '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510-sm-x516'],
  ['/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930--sm-x936', '/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930-sm-x936'],
] as const;

const samsungTabletModelHubNonSources = [
  '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x917',
] as const;

const samsungTabletRepairDetailSliceARedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/charging-port-replacement', '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/charging-port-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920--sm-x926/galaxy-tab-s10-ultra-screen-repair', '/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920-sm-x926/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/battery-replacement', '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/battery-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-front-camera', '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/front-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/charging-port-replacement', '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/charging-port-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-front-camera', '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/front-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/screen-replacement', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/galaxy-tab-s9-ultra-back-camera', '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/back-camera-replacement'],
] as const;

const faultySamsungTabletBackCameraRedirect = {
  source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-back-camera',
  oldDestination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/back-camera-replacement',
  destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/back-camera-replacement',
} as const;

const samsungTabletRepairDetailSliceANonSources = [
  '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/galaxy-tab-s9-ultra-back-housing',
  '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-back-housing',
] as const;

const samsungTabletRepairDetailSliceBRedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-screen-repair', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-front-camera', '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/front-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/galaxy-tab-s9-ultra-battery-service', '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/battery-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-screen-repair', '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-back-camera', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/back-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/charging-port-replacement', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/charging-port-replacement'],
] as const;

const samsungTabletRepairDetailSliceBExistingRedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/back-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/back-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-charging-port', '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/charging-port-replacement'],
] as const;

const samsungTabletRepairDetailSliceBNonSources = [
  '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-back-housing',
  '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-back-housing',
  '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-back-housing',
  '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-back-housing',
  '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-screen-service',
] as const;

const samsungTabletRepairDetailSliceCWaterRedirect = {
  source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516/water-damage-repair',
  oldDestination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510-sm-x516/water-damage-repair',
  destination: '/repairs/water-damage',
} as const;

const samsungTabletRepairDetailSliceCBackHousingSource =
  '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x736/galaxy-tab-s11-back-housing';

const samsungTabletRepairDetailSliceCPreservedRedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350--sm-t355/galaxy-tab-a-80-2015-water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350-sm-t355/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810--sm-x816/galaxy-tab-s9-plus-water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810-sm-x816/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/front-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/front-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/screen-replacement', '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725/galaxy-tab-s5e-screen-repair', '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616/back-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616/back-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526/galaxy-tab-s10-fe-front-camera', '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526/front-camera-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595/galaxy-tab-a-105-2018-battery-service', '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595/battery-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-screen-repair', '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/back-camera-replacement', '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/back-camera-replacement'],
] as const;

const samsungTabletRepairDetailFinalTailBackHousingSource =
  '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700--sm-t705/galaxy-tab-s-84-back-housing';

const samsungTabletRepairDetailFinalTailPreservedRedirects = [
  ['/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626/galaxy-tab-s10-fe-plus-screen-repair', '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626/screen-replacement'],
  ['/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865/galaxy-tab-s6-water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835/galaxy-tab-s4-water-damage-repair', '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835/water-damage-repair'],
  ['/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/galaxy-tab-a-97-screen-repair', '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/screen-replacement'],
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
  it('leaves unsupported Samsung Tablet Final Tail back-housing unresolved', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    expect(sources.has(samsungTabletRepairDetailFinalTailBackHousingSource)).toBe(false);
    expect(sources.has('/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700-sm-t705/back-housing-replacement')).toBe(false);
    expect(
      redirects.some((entry) => entry.source.includes('/repairs/tablet/samsung/:model/') && entry.source.includes('back-housing')),
    ).toBe(false);

    expect(samsungTabletRepairDetailFinalTailPreservedRedirects).toHaveLength(4);
    for (const [source, destination] of samsungTabletRepairDetailFinalTailPreservedRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
    }
  });

  it('applies only the approved Samsung Tablet Repair Detail Slice C corrections', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(redirectBySource.get(samsungTabletRepairDetailSliceCWaterRedirect.source)).toMatchObject({
      destination: samsungTabletRepairDetailSliceCWaterRedirect.destination,
      permanent: true,
    });
    expect(redirectBySource.get(samsungTabletRepairDetailSliceCWaterRedirect.source)?.destination)
      .not.toBe(samsungTabletRepairDetailSliceCWaterRedirect.oldDestination);
    expect(sources.has(samsungTabletRepairDetailSliceCBackHousingSource)).toBe(false);
    expect(
      redirects.some((entry) => entry.source.includes('/repairs/tablet/samsung/:model/') && entry.source.includes('back-housing')),
    ).toBe(false);

    expect(samsungTabletRepairDetailSliceCPreservedRedirects).toHaveLength(10);
    for (const [source, destination] of samsungTabletRepairDetailSliceCPreservedRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
    }
  });

  it('permanently redirects only the approved Samsung Tablet Repair Detail Slice B sources directly', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(samsungTabletRepairDetailSliceBRedirects).toHaveLength(6);
    expect(new Set(samsungTabletRepairDetailSliceBRedirects.map(([source]) => source))).toHaveLength(6);
    for (const [source, destination] of samsungTabletRepairDetailSliceBRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
    }
  });

  it('preserves existing Slice B aliases while holding unsupported and nearby legacy paths', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const [source, destination] of samsungTabletRepairDetailSliceBExistingRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
    }

    for (const source of samsungTabletRepairDetailSliceBNonSources) {
      expect(sources.has(source), source).toBe(false);
    }
  });

  it('permanently redirects only the approved Samsung Tablet Repair Detail Slice A sources directly', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(samsungTabletRepairDetailSliceARedirects).toHaveLength(10);
    expect(new Set(samsungTabletRepairDetailSliceARedirects.map(([source]) => source))).toHaveLength(10);
    for (const [source, destination] of samsungTabletRepairDetailSliceARedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
    }

    expect(redirectBySource.get(samsungTabletRepairDetailSliceARedirects[5][0])).toMatchObject({
      destination: samsungTabletRepairDetailSliceARedirects[5][1],
      permanent: true,
    });
    expect(redirectBySource.get(samsungTabletRepairDetailSliceARedirects[7][0])).toMatchObject({
      destination: samsungTabletRepairDetailSliceARedirects[7][1],
      permanent: true,
    });
  });

  it('corrects the S 10.5 back-camera redirect without an obsolete-detail hop', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));
    const matches = redirects.filter((entry) => entry.source === faultySamsungTabletBackCameraRedirect.source);

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      destination: faultySamsungTabletBackCameraRedirect.destination,
      permanent: true,
    });
    expect(matches[0].destination).not.toBe(faultySamsungTabletBackCameraRedirect.oldDestination);
    expect(redirectBySource.has(faultySamsungTabletBackCameraRedirect.destination)).toBe(false);
    expect(redirectBySource.has(faultySamsungTabletBackCameraRedirect.oldDestination)).toBe(false);
  });

  it('does not broaden the Samsung Tablet Repair Detail Slice A redirects', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const source of samsungTabletRepairDetailSliceANonSources) {
      expect(sources.has(source), source).toBe(false);
    }
  });

  it('keeps each audited Samsung Tablet Model Hub redirect exact and permanent', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(samsungTabletModelHubRedirects).toHaveLength(32);
    for (const [source, destination] of samsungTabletModelHubRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
    }
  });

  it('does not broaden the audited Samsung Tablet Model Hub redirects', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const source of samsungTabletModelHubNonSources) {
      expect(sources.has(source), source).toBe(false);
    }
  });

  it('permanently redirects only the six approved Crawled-NI legacy 404 sources directly', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(crawledNiLegacy404Redirects).toHaveLength(6);
    for (const [source, destination] of crawledNiLegacy404Redirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
    }

    expect(redirectBySource.get(crawledNiLegacy404Redirects[4][0])).toMatchObject({
      destination: '/repairs/water-damage',
      permanent: true,
    });
  });

  it('does not broaden the six approved Crawled-NI legacy 404 redirects', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const source of crawledNiLegacy404NonSources) {
      expect(sources.has(source), source).toBe(false);
    }
  });

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

  it('permanently redirects each configured Apple Watch legacy charging-port URL directly to Charging Repair', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(appleWatchChargingRepairAliases).toHaveLength(22);
    for (const { source, destination } of appleWatchChargingRepairAliases) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
      expect(matches[0].source).not.toContain('?');
      expect(matches[0].destination).not.toContain('?');

      const request = new URL(`https://www.alimobile.com.au${source}?model=apple-watch-fixture`);
      const redirectTarget = new URL(destination, request.origin);
      redirectTarget.search = request.search;
      expect(`${redirectTarget.pathname}${redirectTarget.search}`).toBe(`${destination}?model=apple-watch-fixture`);
    }

    expect(redirectBySource.has('/repairs/watch/apple/charging-port-replacement')).toBe(false);
    expect(redirectBySource.has('/repairs/watch/apple/apple-watch-unconfigured/charging-port-replacement')).toBe(false);
  });

  it('permanently reconciles each approved Tablet GSC 404 source in one hop', async () => {
    const redirects = await getRedirects();
    const redirectBySource = new Map(redirects.map((entry) => [entry.source, entry]));

    expect(tabletGsc404Redirects).toHaveLength(32);
    for (const [source, destination] of tabletGsc404Redirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(redirectBySource.has(destination), destination).toBe(false);
      expect(matches[0].source).not.toContain('?');
      expect(matches[0].destination).not.toContain('?');

      const request = new URL(`https://www.alimobile.com.au${source}?model=tablet-fixture`);
      const redirectTarget = new URL(destination, request.origin);

      redirectTarget.search = request.search;
      expect(`${redirectTarget.pathname}${redirectTarget.search}`).toBe(`${destination}?model=tablet-fixture`);
    }
  });

  it('keeps canonical Tablet model hubs untouched', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));
    const canonicalModelHubs = new Set(
      tabletGsc404Redirects.map(([, destination]) => destination.split('/').slice(0, 5).join('/')),
    );

    for (const modelHub of canonicalModelHubs) {
      expect(sources.has(modelHub), modelHub).toBe(false);
    }
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
    const backHousingModelHubDestinations = tabletGsc404Redirects
      .filter(([source]) => source.endsWith('-back-housing'))
      .map(([, destination]) => destination);

    for (const { source } of approvedRedirects) {
      expect(paths).not.toContain(source);
    }

    for (const { source, destination } of googlePixelSharedRepairAliases) {
      expect(paths).not.toContain(source);
      expect(paths.filter((path) => path === destination), destination).toHaveLength(1);
    }

    for (const [source, destination] of tabletGsc404Redirects) {
      expect(paths).not.toContain(source);
      expect(paths.filter((path) => path === destination).length, destination).toBeLessThanOrEqual(1);
    }
    expect(backHousingModelHubDestinations).toHaveLength(0);
    for (const destination of backHousingModelHubDestinations) {
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
      '/repairs/phone/logic-board-repair',
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
