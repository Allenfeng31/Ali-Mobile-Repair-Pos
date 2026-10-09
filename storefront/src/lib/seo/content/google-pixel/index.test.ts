import { describe, expect, it } from 'vitest';

import {
  getAliMobileEnhancedGooglePixelSeoPocket,
} from './index';
import {
  GOOGLE_PIXEL_HARDWARE_CONFIG,
  GOOGLE_PIXEL_STANDARD_REPAIR_TURNAROUND_MINUTES,
} from './config';
import type { AliMobileEnhancedGooglePixelRepairType } from './types';

const pixelRoute = (model: string, repairType: string) => ({
  category: 'phone',
  brand: 'google-pixel',
  model,
  repairType,
  pocket: null,
});

describe('standard Google Pixel detail families', () => {
  it('keeps the approved six-family cohort at 166 canonical model-detail routes', () => {
    const configurations = Object.values(GOOGLE_PIXEL_HARDWARE_CONFIG);
    const countRoutesFor = (repairType: keyof typeof GOOGLE_PIXEL_STANDARD_REPAIR_TURNAROUND_MINUTES) =>
      configurations.filter((configuration) => configuration.supportedRepairTypes.includes(repairType)).length;

    expect(configurations).toHaveLength(28);
    const familyCounts = {
      screen: countRoutesFor('screen-replacement'),
      battery: countRoutesFor('battery-replacement'),
      chargingPort: countRoutesFor('charging-port-replacement'),
      backGlass: countRoutesFor('back-glass-replacement'),
      frontCamera: countRoutesFor('front-camera-replacement'),
      backCamera: countRoutesFor('back-camera-replacement'),
    };

    expect(familyCounts).toEqual({
      screen: 28,
      battery: 28,
      chargingPort: 28,
      backGlass: 28,
      frontCamera: 27,
      backCamera: 27,
    });
    expect(Object.values(familyCounts).reduce((total, count) => total + count, 0)).toBe(166);
  });

  it('resolves a semantic turnaround for every configured route in the six-family cohort', () => {
    const standardRepairTypes = Object.entries(
      GOOGLE_PIXEL_STANDARD_REPAIR_TURNAROUND_MINUTES,
    ) as Array<[AliMobileEnhancedGooglePixelRepairType, number]>;
    let routeCount = 0;

    for (const configuration of Object.values(GOOGLE_PIXEL_HARDWARE_CONFIG)) {
      for (const [repairType, turnaroundMinutes] of standardRepairTypes) {
        if (!configuration.supportedRepairTypes.includes(repairType)) continue;

        const pocket = getAliMobileEnhancedGooglePixelSeoPocket(
          pixelRoute(configuration.modelSlug, repairType),
        );

        expect(pocket?.turnaroundMinutes).toBe(turnaroundMinutes);
        routeCount += 1;
      }
    }

    expect(routeCount).toBe(166);
  });

  it.each([
    ['screen-replacement', 30],
    ['battery-replacement', 30],
    ['charging-port-replacement', 30],
    ['front-camera-replacement', 30],
    ['back-camera-replacement', 30],
    ['back-glass-replacement', 60],
  ] as const)('uses one semantic turnaround source for %s', (repairType, turnaroundMinutes) => {
    expect(GOOGLE_PIXEL_STANDARD_REPAIR_TURNAROUND_MINUTES[repairType]).toBe(turnaroundMinutes);

    const pocket = getAliMobileEnhancedGooglePixelSeoPocket(pixelRoute('pixel-7-pro', repairType));

    expect(pocket?.turnaroundMinutes).toBe(turnaroundMinutes);
    expect(pocket?.faq.filter((faq) => /how long/i.test(faq.question))).toHaveLength(1);
  });

  it('keeps Pixel Logic Board outside the standard family timing source', () => {
    const pocket = getAliMobileEnhancedGooglePixelSeoPocket(pixelRoute('pixel-7-pro', 'logic-board-repair'));

    expect(pocket?.turnaroundMinutes).toBeUndefined();
  });
});
