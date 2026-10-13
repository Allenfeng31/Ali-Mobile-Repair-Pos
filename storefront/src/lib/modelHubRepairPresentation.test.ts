import { describe, expect, it } from 'vitest';

import {
  getModelHubTimingSummary,
  resolveModelHubRepairPresentation,
} from './modelHubRepairPresentation';

const presentation = (brandSlug: string, modelSlug: string, repairSlug: string) =>
  resolveModelHubRepairPresentation({
    category: 'phone',
    brandSlug,
    modelSlug,
    repairSlug,
  });

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
});
