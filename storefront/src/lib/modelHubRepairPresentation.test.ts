import { describe, expect, it } from 'vitest';

import {
  getModelHubTimingSummary,
  resolveModelHubRepairPresentation,
} from './modelHubRepairPresentation';
import { IPAD_MODEL_CONFIG_LIST } from './seo/content/ipad/config';
import { LENOVO_TABLET_MODEL_CONFIG_LIST } from './seo/content/lenovo-tablet';
import {
  MACBOOK_MODELS,
  MACBOOK_REPAIRS,
} from './seo/content/macbook';
import { SAMSUNG_TABLET_MODEL_CONFIG_LIST } from './seo/content/samsung-tablet';
import {
  APPLE_WATCH_MODELS,
  APPLE_WATCH_REPAIRS,
} from './seo/content/apple-watch';
import { GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS } from '@/data/grandfatheredSecondaryPhoneDetailRepairs';

const presentation = (brandSlug: string, modelSlug: string, repairSlug: string) =>
  resolveModelHubRepairPresentation({
    category: 'phone',
    brandSlug,
    modelSlug,
    repairSlug,
  });

const categoryPresentation = (category: string, brandSlug: string, modelSlug: string, repairSlug: string) =>
  resolveModelHubRepairPresentation({ category, brandSlug, modelSlug, repairSlug });

describe('resolveModelHubRepairPresentation', () => {
  it('keeps iPhone 16 Plus standard repairs at 30 minutes and true Back Glass variable', () => {
    expect(presentation('iphone', 'iphone-16-plus', 'screen-replacement')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('iphone', 'iphone-16-plus', 'back-glass-replacement')).toMatchObject({
      timingLabel: 'Varies',
    });
    expect(presentation('iphone', 'iphone-16-plus', 'water-damage-repair')).toMatchObject({
      timingLabel: 'Depends on Damage',
    });
    expect(presentation('iphone', 'iphone-16-plus', 'logic-board-repair')).toMatchObject({
      timingLabel: 'Diagnostic Required',
    });
  });

  it('uses the approved Samsung phone exceptions without changing the standard summary', () => {
    expect(presentation('samsung', 'galaxy-s24-ultra', 'screen-replacement')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('samsung', 'galaxy-s24-ultra', 'back-glass-replacement')).toMatchObject({
      timingLabel: '20 Minutes',
      turnaroundMinutes: 20,
    });
    expect(presentation('samsung', 'galaxy-s24-ultra', 'water-damage-repair')).toMatchObject({
      timingLabel: 'Initial Assessment & Cleaning — 30 Minutes',
    });
    expect(presentation('samsung', 'galaxy-s24-ultra', 'logic-board-repair')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
  });

  it('presents the Pixel public rear route with model-aware semantics', () => {
    expect(presentation('google-pixel', 'pixel-8-pro', 'screen-replacement')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('google-pixel', 'pixel-8-pro', 'back-glass-replacement')).toMatchObject({
      displayName: 'Back Glass Replacement',
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('google-pixel', 'pixel-9-pro', 'back-glass-replacement')).toMatchObject({
      displayName: 'Back Glass Replacement',
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('google-pixel', 'pixel-5', 'back-glass-replacement')).toMatchObject({
      displayName: 'Back Housing Replacement',
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    expect(presentation('google-pixel', 'pixel-4a-5g', 'back-glass-replacement')).toMatchObject({
      displayName: 'Back Housing Replacement',
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    expect(presentation('google-pixel', 'pixel-8-pro', 'logic-board-repair')).toMatchObject({
      timingLabel: 'Diagnostic Required',
    });
  });

  it('uses confirmed Find X3 Pro rear-glass semantics and fails closed for unknown OPPO rear semantics', () => {
    expect(presentation('oppo', 'find-x3-pro', 'screen-replacement')).toMatchObject({
      timingLabel: '45 Minutes',
      turnaroundMinutes: 45,
    });
    expect(presentation('oppo', 'find-x3-pro', 'battery-replacement')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('oppo', 'find-x3-pro', 'back-glass-replacement')).toMatchObject({
      timingLabel: '20 Minutes',
      turnaroundMinutes: 20,
    });
    expect(presentation('oppo', 'a11', 'back-glass-replacement')).toMatchObject({
      timingLabel: 'Varies',
    });
    expect(presentation('oppo', 'find-x3-pro', 'logic-board-repair')).toMatchObject({
      timingLabel: 'Diagnostic Required',
    });
  });

  it('uses 30 minutes for shared standard hardware and leaves unrelated brands unchanged', () => {
    expect(presentation('samsung', 'galaxy-s24-ultra', 'loudspeaker-replacement')).toMatchObject({
      timingLabel: '30 Minutes',
      turnaroundMinutes: 30,
    });
    expect(presentation('motorola', 'moto-g04', 'screen-replacement')).toEqual({});
  });

  it('uses only the existing shared-phone timing source for supported secondary-phone services', () => {
    for (const [brandSlug, modelSlug] of [
      ['vivo', 'y20s'],
      ['tcl', '30-plus'],
      ['huawei', 'p30-pro'],
      ['motorola', 'moto-g04'],
      ['asus', 'rog-phone-5'],
    ] as const) {
      expect(presentation(brandSlug, modelSlug, 'loudspeaker-replacement')).toMatchObject({
        timingLabel: '30 Minutes',
        turnaroundMinutes: 30,
      });
      expect(presentation(brandSlug, modelSlug, 'screen-replacement')).toEqual({});
    }
  });

  it('uses the existing iPad, tablet, MacBook and Apple Watch timing authorities', () => {
    expect(categoryPresentation('tablet', 'ipad', 'ipad-10th-generation', 'charging-port-replacement')).toEqual({
      timingLabel: 'Fast Turnaround',
    });
    expect(categoryPresentation('tablet', 'apple', 'ipad-air-5th-generation', 'charging-port-replacement')).toEqual({
      timingLabel: 'Fast Turnaround',
    });
    expect(categoryPresentation('tablet', 'ipad', 'ipad-mini-6th-generation', 'charging-port-replacement')).toMatchObject({
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    expect(categoryPresentation('tablet', 'ipad', 'ipad-pro-11-inch-4th-generation', 'charging-port-replacement')).toMatchObject({
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    expect(categoryPresentation('tablet', 'samsung', 'galaxy-tab-a-80-2017-sm-t380-sm-t385', 'screen-replacement')).toMatchObject({
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    expect(categoryPresentation('tablet', 'lenovo', 'lenovo-tab-p12-tb-370fu', 'battery-replacement')).toMatchObject({
      timingLabel: '60 Minutes',
      turnaroundMinutes: 60,
    });
    for (const repairSlug of ['screen-replacement', 'battery-replacement', 'charging-port-replacement']) {
      expect(categoryPresentation('laptop', 'macbook', 'macbook-air-m3-13-2024', repairSlug)).toMatchObject({
        timingLabel: '60 Minutes',
        turnaroundMinutes: 60,
      });
    }
    expect(categoryPresentation('laptop', 'macbook', 'macbook-air-m3-13-2024', 'logic-board-repair')).toEqual({
      timingLabel: 'Diagnostic Required',
    });
    for (const repairSlug of ['screen-replacement', 'battery-replacement', 'charging-repair']) {
      expect(categoryPresentation('watch', 'apple-watch', 'apple-watch-series-9-45mm', repairSlug)).toMatchObject({
        timingLabel: '45 Minutes',
        turnaroundMinutes: 45,
      });
    }
  });

  it('covers every code-configured remaining-family standard repair without extending specialist timing', () => {
    const secondaryPhoneModels = new Map(
      GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.map(({ brandSlug, modelSlug }) => [
        `${brandSlug}/${modelSlug}`,
        { brandSlug, modelSlug },
      ]),
    );
    for (const { brandSlug, modelSlug } of secondaryPhoneModels.values()) {
      expect(presentation(brandSlug, modelSlug, 'loudspeaker-replacement')).toMatchObject({
        timingLabel: '30 Minutes',
        turnaroundMinutes: 30,
      });
      expect(presentation(brandSlug, modelSlug, 'screen-replacement')).toEqual({});
    }

    for (const { modelSlug } of IPAD_MODEL_CONFIG_LIST) {
      for (const repairSlug of ['screen-replacement', 'battery-replacement', 'front-camera-replacement', 'back-camera-replacement']) {
        expect(categoryPresentation('tablet', 'ipad', modelSlug, repairSlug)).toMatchObject({
          timingLabel: '60 Minutes',
          turnaroundMinutes: 60,
        });
      }
      const charging = categoryPresentation('tablet', 'ipad', modelSlug, 'charging-port-replacement');
      expect(charging.timingLabel).toMatch(/^(Fast Turnaround|60 Minutes)$/);
    }

    for (const { modelSlug, supportedRepairTypes } of SAMSUNG_TABLET_MODEL_CONFIG_LIST) {
      for (const repairSlug of supportedRepairTypes) {
        expect(categoryPresentation('tablet', 'samsung', modelSlug, repairSlug)).toMatchObject({
          timingLabel: '60 Minutes',
          turnaroundMinutes: 60,
        });
      }
    }

    for (const { modelSlug, supportedRepairTypes } of LENOVO_TABLET_MODEL_CONFIG_LIST) {
      for (const repairSlug of supportedRepairTypes) {
        expect(categoryPresentation('tablet', 'lenovo', modelSlug, repairSlug)).toMatchObject({
          timingLabel: '60 Minutes',
          turnaroundMinutes: 60,
        });
      }
    }

    for (const modelSlug of MACBOOK_MODELS) {
      for (const repairSlug of MACBOOK_REPAIRS) {
        expect(categoryPresentation('laptop', 'macbook', modelSlug, repairSlug)).toMatchObject({
          timingLabel: '60 Minutes',
          turnaroundMinutes: 60,
        });
      }
      expect(categoryPresentation('laptop', 'macbook', modelSlug, 'logic-board-repair')).toEqual({
        timingLabel: 'Diagnostic Required',
      });
    }

    for (const modelSlug of APPLE_WATCH_MODELS) {
      for (const repairSlug of APPLE_WATCH_REPAIRS) {
        expect(categoryPresentation('watch', 'apple', modelSlug, repairSlug)).toMatchObject({
          timingLabel: '45 Minutes',
          turnaroundMinutes: 45,
        });
      }
    }
  });
});

describe('getModelHubTimingSummary', () => {
  it.each([
    ['iphone', 'iphone-16-plus', ['screen-replacement', 'battery-replacement', 'back-glass-replacement'], 'Most standard repairs: 30 Minutes'],
    ['samsung', 'galaxy-s24-ultra', ['screen-replacement', 'battery-replacement', 'back-glass-replacement'], 'Most standard repairs: 30 Minutes'],
    ['google-pixel', 'pixel-8-pro', ['screen-replacement', 'battery-replacement', 'back-glass-replacement'], 'Most standard repairs: 30 Minutes'],
    ['oppo', 'find-x3-pro', ['screen-replacement', 'battery-replacement', 'back-glass-replacement'], 'Most standard repairs: 30–45 Minutes'],
  ])('builds the compact %s summary from standard service authority', (brandSlug, modelSlug, repairSlugs, primaryLine) => {
    expect(getModelHubTimingSummary({
      category: 'phone',
      brandSlug,
      modelSlug,
      repairSlugs,
    })).toEqual({
      title: 'Typical repair time',
      primaryLine,
      secondaryLine: 'Exact repair time is shown with each service below.',
    });
  });

  it.each([
    ['tablet', 'ipad', 'ipad-10th-generation', ['screen-replacement', 'battery-replacement', 'charging-port-replacement'], 'Most standard repairs: 60 Minutes'],
    ['tablet', 'samsung', 'galaxy-tab-a-80-2017-sm-t380-sm-t385', ['screen-replacement', 'battery-replacement'], 'Most standard repairs: 60 Minutes'],
    ['tablet', 'lenovo', 'lenovo-tab-p12-tb-370fu', ['screen-replacement', 'battery-replacement'], 'Most standard repairs: 60 Minutes'],
    ['laptop', 'macbook', 'macbook-air-m3-13-2024', ['screen-replacement', 'battery-replacement', 'charging-port-replacement'], 'Most standard repairs: 60 Minutes'],
    ['watch', 'apple-watch', 'apple-watch-series-9-45mm', ['screen-replacement', 'battery-replacement', 'charging-repair'], 'Most standard repairs: 45 Minutes'],
  ])('builds the compact %s %s timing summary from the existing category authority', (category, brandSlug, modelSlug, repairSlugs, primaryLine) => {
    expect(getModelHubTimingSummary({ category, brandSlug, modelSlug, repairSlugs })).toEqual({
      title: 'Typical repair time',
      primaryLine,
      secondaryLine: 'Exact repair time is shown with each service below.',
    });
  });
});
