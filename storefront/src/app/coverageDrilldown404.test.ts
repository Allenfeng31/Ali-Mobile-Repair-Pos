import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

const COVERAGE_DRILLDOWN_AUDIT_MANIFEST = [
  { id: 1, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/back-camera-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/back-camera-replacement', disposition: 'redirect' },
  { id: 2, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/back-housing-replacement', disposition: 'hold' },
  { id: 3, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-charging-port', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/charging-port-replacement', disposition: 'redirect' },
  { id: 4, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/water-damage-repair', disposition: 'redirect' },
  { id: 5, source: '/repairs/tablet/samsung/galaxy-tab-s9-sm-x710--sm-x716', destination: '/repairs/tablet/samsung/galaxy-tab-s9-sm-x710-sm-x716', disposition: 'redirect' },
  { id: 6, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/water-damage-repair', disposition: 'redirect' },
  { id: 7, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350--sm-t355', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350-sm-t355', disposition: 'redirect' },
  { id: 8, source: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/galaxy-tab-s9-ultra-front-camera', destination: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/front-camera-replacement', disposition: 'redirect' },
  { id: 9, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/back-housing-replacement', disposition: 'hold' },
  { id: 10, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/water-damage-repair', disposition: 'redirect' },
  { id: 11, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/battery-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/battery-replacement', disposition: 'redirect' },
  { id: 12, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-back-camera', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/back-camera-replacement', disposition: 'redirect' },
  { id: 13, source: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/lenovo-yoga-smart-tab-charging-port', destination: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/charging-port-replacement', disposition: 'redirect' },
  { id: 14, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/back-housing-replacement', disposition: 'hold' },
  { id: 15, source: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/lenovo-yoga-smart-tab-screen-repair', destination: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/screen-replacement', disposition: 'redirect' },
  { id: 16, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/screen-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/screen-replacement', disposition: 'redirect' },
  { id: 17, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-battery-service', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/battery-replacement', disposition: 'redirect' },
  { id: 18, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/charging-port-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/charging-port-replacement', disposition: 'redirect' },
  { id: 19, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/water-damage-repair', disposition: 'redirect' },
  { id: 20, source: '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810--sm-x816', destination: '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810-sm-x816', disposition: 'redirect' },
  { id: 21, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/back-housing-replacement', disposition: 'hold' },
  { id: 22, source: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/charging-port-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/charging-port-replacement', disposition: 'redirect' },
  { id: 23, source: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/lenovo-yoga-smart-tab-battery-service', destination: '/repairs/tablet/lenovo/lenovo-yoga-smart-tab-yt-x705f/battery-replacement', disposition: 'redirect' },
  { id: 24, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/water-damage-repair', disposition: 'redirect' },
  { id: 25, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/water-damage-repair', disposition: 'redirect' },
  { id: 26, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-back-camera', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/back-camera-replacement', disposition: 'redirect' },
  { id: 27, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/screen-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/screen-replacement', disposition: 'redirect' },
  { id: 28, source: '/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970--sm-t975--sm-t976', destination: '/repairs/tablet/samsung/galaxy-tab-s7-plus-sm-t970-sm-t975-sm-t976', disposition: 'redirect' },
  { id: 29, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/galaxy-tab-a7-lite-front-camera', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/front-camera-replacement', disposition: 'redirect' },
  { id: 30, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290--sm-t295/galaxy-tab-a-80-2019-charging-port', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2019-sm-t290-sm-t295/charging-port-replacement', disposition: 'redirect' },
  { id: 31, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/battery-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/battery-replacement', disposition: 'redirect' },
  { id: 32, source: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/galaxy-tab-s9-ultra-charging-port', destination: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/charging-port-replacement', disposition: 'redirect' },
  { id: 33, source: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800--sm-t805/galaxy-tab-s-105-screen-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s-105-sm-t800-sm-t805/screen-replacement', disposition: 'redirect' },
  { id: 34, source: '/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400--sm-x406', destination: '/repairs/tablet/samsung/galaxy-tab-s10-lite-sm-x400-sm-x406', disposition: 'redirect' },
  { id: 35, source: '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610--sm-p613--sm-p615--sm-p619', destination: '/repairs/tablet/samsung/galaxy-tab-s6-lite-sm-p610-sm-p613-sm-p615-sm-p619', disposition: 'redirect' },
  { id: 36, source: '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725', destination: '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725', disposition: 'redirect' },
  { id: 37, source: '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210--sm-x215', destination: '/repairs/tablet/samsung/galaxy-tab-a9-plus-sm-x210-sm-x215', disposition: 'redirect' },
  { id: 38, source: '/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810--sm-t815', destination: '/repairs/tablet/samsung/galaxy-tab-s2-97-sm-t810-sm-t815', disposition: 'redirect' },
  { id: 39, source: '/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800--sm-x806', destination: '/repairs/tablet/samsung/galaxy-tab-s8-plus-sm-x800-sm-x806', disposition: 'redirect' },
  { id: 40, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350--sm-t355/galaxy-tab-a-80-2015-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2015-sm-t350-sm-t355/water-damage-repair', disposition: 'redirect' },
  { id: 41, source: '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810--sm-x816/galaxy-tab-s9-plus-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s9-plus-sm-x810-sm-x816/water-damage-repair', disposition: 'redirect' },
  { id: 42, source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626', destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626', disposition: 'redirect' },
  { id: 43, source: '/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730--sm-t733--sm-t736', destination: '/repairs/tablet/samsung/galaxy-tab-s7-fe-sm-t730-sm-t733-sm-t736', disposition: 'redirect' },
  { id: 44, source: '/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920--sm-x926', destination: '/repairs/tablet/samsung/galaxy-tab-s10-ultra-sm-x920-sm-x926', disposition: 'redirect' },
  { id: 45, source: '/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900--sm-x906', destination: '/repairs/tablet/samsung/galaxy-tab-s8-ultra-sm-x900-sm-x906', disposition: 'redirect' },
  { id: 46, source: '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700--sm-t705', destination: '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700-sm-t705', disposition: 'redirect' },
  { id: 47, source: '/repairs/tablet/samsung/galaxy-tab-s8-sm-x700--sm-x706', destination: '/repairs/tablet/samsung/galaxy-tab-s8-sm-x700-sm-x706', disposition: 'redirect' },
  { id: 48, source: '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x736', destination: '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730-sm-x736', disposition: 'redirect' },
  { id: 49, source: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595', destination: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595', disposition: 'redirect' },
  { id: 50, source: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835', destination: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835', disposition: 'redirect' },
  { id: 51, source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516/water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510-sm-x516/water-damage-repair', disposition: 'redirect' },
  { id: 52, source: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220--sm-t225/front-camera-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a7-lite-sm-t220-sm-t225/front-camera-replacement', disposition: 'redirect' },
  { id: 53, source: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865', destination: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865', disposition: 'redirect' },
  { id: 54, source: '/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710--sm-t715', destination: '/repairs/tablet/samsung/galaxy-tab-s2-80-sm-t710-sm-t715', disposition: 'redirect' },
  { id: 55, source: '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu--tb-128fu', destination: '/repairs/tablet/lenovo/lenovo-tab-m10-plus-gen-3-tb-125fu-tb-128fu', disposition: 'redirect' },
  { id: 56, source: '/repairs/tablet/lenovo/lenovo-tab-m9-tb-310fu/lenovo-tab-m9-battery-service', destination: '/repairs/tablet/lenovo/lenovo-tab-m9-tb-310fu/battery-replacement', disposition: 'redirect' },
  { id: 57, source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616', destination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616', disposition: 'redirect' },
  { id: 58, source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526', destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526', disposition: 'redirect' },
  { id: 59, source: '/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380--sm-t385', destination: '/repairs/tablet/samsung/galaxy-tab-a-80-2017-sm-t380-sm-t385', disposition: 'redirect' },
  { id: 60, source: '/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820--sm-x826', destination: '/repairs/tablet/samsung/galaxy-tab-s10-plus-sm-x820-sm-x826', disposition: 'redirect' },
  { id: 61, source: '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730--sm-x736/galaxy-tab-s11-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-s11-sm-x730-sm-x736/back-housing-replacement', disposition: 'hold' },
  { id: 62, source: '/repairs/tablet/samsung/galaxy-tab-s3-sm-t820--sm-t825', destination: '/repairs/tablet/samsung/galaxy-tab-s3-sm-t820-sm-t825', disposition: 'redirect' },
  { id: 63, source: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910--sm-x916/screen-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-s9-ultra-sm-x910-sm-x916/screen-replacement', disposition: 'redirect' },
  { id: 64, source: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555', destination: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555', disposition: 'redirect' },
  { id: 65, source: '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720--sm-t725/galaxy-tab-s5e-screen-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s5e-sm-t720-sm-t725/screen-replacement', disposition: 'redirect' },
  { id: 66, source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610--sm-x616/back-camera-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-plus-sm-x610-sm-x616/back-camera-replacement', disposition: 'redirect' },
  { id: 67, source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520--sm-x526/galaxy-tab-s10-fe-front-camera', destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-sm-x520-sm-x526/front-camera-replacement', disposition: 'redirect' },
  { id: 68, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585--sm-t580', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2016-sm-p585-sm-t580', disposition: 'redirect' },
  { id: 69, source: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590--sm-t595/galaxy-tab-a-105-2018-battery-service', destination: '/repairs/tablet/samsung/galaxy-tab-a-105-2018-sm-t590-sm-t595/battery-replacement', disposition: 'redirect' },
  { id: 70, source: '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200--sm-x205', destination: '/repairs/tablet/samsung/galaxy-tab-a8-sm-x200-sm-x205', disposition: 'redirect' },
  { id: 71, source: '/repairs/phone/samsung/galaxy-s25/logic-board', destination: '/repairs/phone/samsung/galaxy-s25/logic-board-repair', disposition: 'redirect' },
  { id: 72, source: '/repairs/phone/google/pixel-4/water-damage-repair', destination: '/repairs/phone/google-pixel/pixel-4/water-damage-repair', disposition: 'hold' },
  { id: 73, source: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510--sm-t515/galaxy-tab-a-101-2019-screen-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-101-2019-sm-t510-sm-t515/screen-replacement', disposition: 'redirect' },
  { id: 74, source: '/repairs/phone/samsung/galaxy-note-20/logic-board', destination: '/repairs/phone/samsung/galaxy-note-20/logic-board-repair', disposition: 'redirect' },
  { id: 75, source: '/repairs/tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/lenovo-tab-p11-gen-2-back-camera', destination: '/repairs/tablet/lenovo/lenovo-tab-p11-gen-2-tb-350fu/back-camera-replacement', disposition: 'redirect' },
  { id: 76, source: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/back-camera-replacement', destination: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/back-camera-replacement', disposition: 'redirect' },
  { id: 77, source: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620--sm-x626/galaxy-tab-s10-fe-plus-screen-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s10-fe-plus-sm-x620-sm-x626/screen-replacement', disposition: 'redirect' },
  { id: 78, source: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860--sm-t865/galaxy-tab-s6-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s6-sm-t860-sm-t865/water-damage-repair', disposition: 'redirect' },
  { id: 79, source: '/repairs/tablet/ipad/ipad-pro-129-inch-6th-generation/logic-board', destination: '/repairs/tablet/ipad/ipad-pro-129-inch-6th-generation/logic-board-repair', disposition: 'redirect' },
  { id: 80, source: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510--sm-x516', destination: '/repairs/tablet/samsung/galaxy-tab-s9-fe-sm-x510-sm-x516', disposition: 'redirect' },
  { id: 81, source: '/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930--sm-x936', destination: '/repairs/tablet/samsung/galaxy-tab-s11-ultra-sm-x930-sm-x936', disposition: 'redirect' },
  { id: 84, source: '/repairs/phone/samsung/galaxy-s23-fe/logic-board', destination: '/repairs/phone/samsung/galaxy-s23-fe/logic-board-repair', disposition: 'redirect' },
  { id: 85, source: '/repairs/phone/samsung/galaxy-z-fold-5/logic-board', destination: '/repairs/phone/samsung/galaxy-z-fold-5/logic-board-repair', disposition: 'redirect' },
  { id: 86, source: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830--sm-t835/galaxy-tab-s4-water-damage-repair', destination: '/repairs/tablet/samsung/galaxy-tab-s4-sm-t830-sm-t835/water-damage-repair', disposition: 'redirect' },
  { id: 87, source: '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700--sm-t705/galaxy-tab-s-84-back-housing', destination: '/repairs/tablet/samsung/galaxy-tab-s-84-sm-t700-sm-t705/back-housing-replacement', disposition: 'hold' },
  { id: 88, source: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550--sm-t550--sm-t555/galaxy-tab-a-97-screen-repair', destination: '/repairs/tablet/samsung/galaxy-tab-a-97-sm-p550-sm-t550-sm-t555/screen-replacement', disposition: 'redirect' },
  { id: 89, source: '/repairs/tablet/ipad/ipad-pro-129-inch-4th-generation/logic-board', destination: '/repairs/tablet/ipad/ipad-pro-129-inch-4th-generation/logic-board-repair', disposition: 'redirect' },
  { id: 90, source: '/blog/categories/shop-news', destination: '/blog/category/shop-news', disposition: 'hold' },
  { id: 91, source: '/blog/reliable-phone-repair-ringwood', destination: '/blog/reliable-phone-repair-ringwood-vic', disposition: 'hold' },
] as const;

const OPPO_A77_WATER_DAMAGE_SOURCE = '/repairs/phone/oppo/a77/water-damage-repair';
const PIXEL_8_PRO_WATER_DAMAGE_SOURCE = '/repairs/phone/google-pixel/pixel-8-pro/water-damage-repair';
const COVERAGE_DRILLDOWN_NON_REDIRECT_MANIFEST = [
  { id: 82, source: OPPO_A77_WATER_DAMAGE_SOURCE, disposition: 'keep-404' },
  { id: 83, source: PIXEL_8_PRO_WATER_DAMAGE_SOURCE, disposition: 'restore-route' },
] as const;

const GOOGLE_SHARED_REPAIR_ALIASES = [
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

async function getRedirects() {
  const redirects = await nextConfig.redirects?.();

  if (!redirects) {
    throw new Error('Redirect config did not return any entries');
  }

  return redirects;
}

describe('Coverage Drilldown 404 redirect manifest', () => {
  it('keeps every live-verified legacy source as one exact permanent redirect', async () => {
    const redirects = await getRedirects();
    const approvedRedirects = COVERAGE_DRILLDOWN_AUDIT_MANIFEST.filter(
      (entry) => entry.disposition === 'redirect',
    );
    const sources = new Set(redirects.map((entry) => entry.source));

    expect(COVERAGE_DRILLDOWN_AUDIT_MANIFEST).toHaveLength(89);
    expect(new Set(COVERAGE_DRILLDOWN_AUDIT_MANIFEST.map((entry) => entry.source))).toHaveLength(89);
    expect(COVERAGE_DRILLDOWN_NON_REDIRECT_MANIFEST).toHaveLength(2);
    expect(
      new Set([
        ...COVERAGE_DRILLDOWN_AUDIT_MANIFEST.map((entry) => entry.source),
        ...COVERAGE_DRILLDOWN_NON_REDIRECT_MANIFEST.map((entry) => entry.source),
      ]),
    ).toHaveLength(91);
    expect(approvedRedirects).toHaveLength(80);

    for (const { source, destination } of approvedRedirects) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(sources.has(destination), destination).toBe(false);
    }
  });

  it('holds audit targets that did not return a 200 self-canonical page', async () => {
    const redirects = await getRedirects();
    const heldRedirects = COVERAGE_DRILLDOWN_AUDIT_MANIFEST.filter(
      (entry) => entry.disposition === 'hold',
    );

    expect(heldRedirects).toHaveLength(9);

    for (const { source, destination } of heldRedirects) {
      expect(
        redirects.filter((entry) => entry.source === source && entry.destination === destination),
        source,
      ).toHaveLength(0);
    }
  });

  it('does not add redirect configuration for the explicit Water Damage holds', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    expect(sources.has(OPPO_A77_WATER_DAMAGE_SOURCE)).toBe(false);
    expect(sources.has(PIXEL_8_PRO_WATER_DAMAGE_SOURCE)).toBe(false);
  });

  it('protects Google shared repair pages with exact aliases only', async () => {
    const redirects = await getRedirects();
    const sources = new Set(redirects.map((entry) => entry.source));

    for (const { source, destination } of GOOGLE_SHARED_REPAIR_ALIASES) {
      const matches = redirects.filter((entry) => entry.source === source);

      expect(matches, source).toHaveLength(1);
      expect(matches[0]).toMatchObject({ destination, permanent: true });
      expect(sources.has(destination), destination).toBe(false);
    }

    expect(sources.has('/repairs/phone/google/:path*')).toBe(false);
    expect(sources.has('/repairs/phone/google-pixel/:path*')).toBe(false);
    expect(
      redirects.some((entry) => entry.source.includes('--') && entry.source.includes(':')),
    ).toBe(false);
  });
});
