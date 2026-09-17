import { describe, expect, it } from 'vitest';

import {
  classifyPhoneBrand,
  evaluateTargetPublicRepairPageMode,
  type TargetPublicRepairPageModeInput,
} from './publicRepairPageModePolicy';

const targetInput = (
  overrides: Partial<TargetPublicRepairPageModeInput> = {},
): TargetPublicRepairPageModeInput => ({
  category: 'phone',
  brandSlug: 'samsung',
  modelSlug: 'galaxy-s25',
  repairSlug: 'screen-replacement',
  repairOrigin: 'pos',
  ...overrides,
});

const CORE_REPAIRS = [
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
  'back-cover-replacement',
];

const PERIPHERAL_REPAIRS = [
  'camera-lens-replacement',
  'front-camera-replacement',
  'back-camera-replacement',
  'loudspeaker-replacement',
  'earpiece-speaker-replacement',
  'power-button-replacement',
  'volume-button-replacement',
];

describe('evaluateTargetPublicRepairPageMode', () => {
  it('applies the future phone repair matrix without consulting POS evidence', () => {
    const phoneCases = [
      { brandSlug: 'iphone', modelSlug: 'iphone-16', core: 'independent', peripheral: 'independent' },
      { brandSlug: 'samsung', modelSlug: 'galaxy-s25', core: 'independent', peripheral: 'brand-shared' },
      { brandSlug: 'google-pixel', modelSlug: 'pixel-9', core: 'independent', peripheral: 'brand-shared' },
      { brandSlug: 'oppo', modelSlug: 'find-x8', core: 'independent', peripheral: 'brand-shared' },
      { brandSlug: 'huawei', modelSlug: 'p30-pro', core: 'generic-shared', peripheral: 'generic-shared' },
      { brandSlug: 'xiaomi', modelSlug: 'redmi-note-13', core: 'generic-shared', peripheral: 'generic-shared' },
      { brandSlug: 'motorola', modelSlug: 'moto-g85', core: 'generic-shared', peripheral: 'generic-shared' },
    ] as const;

    for (const phone of phoneCases) {
      for (const repairSlug of CORE_REPAIRS) {
        expect(evaluateTargetPublicRepairPageMode(targetInput({ ...phone, repairSlug })).targetMode).toBe(phone.core);
      }
      for (const repairSlug of PERIPHERAL_REPAIRS) {
        expect(evaluateTargetPublicRepairPageMode(targetInput({ ...phone, repairSlug })).targetMode).toBe(phone.peripheral);
      }
      for (const repairSlug of ['logic-board-repair', 'water-damage-repair']) {
        expect(evaluateTargetPublicRepairPageMode(targetInput({ ...phone, repairSlug }))).toMatchObject({
          targetMode: 'shared-only',
          independentDetailAllowed: false,
        });
      }
    }
  });

  it.each([
    ['tablet', 'samsung', 'galaxy-tab-s9'],
    ['laptop', 'macbook', 'macbook-air-m2-13-2022'],
    ['watch', 'apple', 'apple-watch-series-9'],
  ])('keeps Logic Board and Water Damage shared-only for %s', (category, brandSlug, modelSlug) => {
    for (const repairSlug of ['logic-board-repair', 'water-damage-repair']) {
      expect(evaluateTargetPublicRepairPageMode(targetInput({ category, brandSlug, modelSlug, repairSlug }))).toMatchObject({
        targetMode: 'shared-only',
        independentDetailAllowed: false,
      });
    }
  });

  it('keeps target ownership separate from current shared-master availability', () => {
    expect(evaluateTargetPublicRepairPageMode(targetInput({ repairSlug: 'front-camera-replacement' }))).toMatchObject({
      targetMode: 'brand-shared',
      ownershipScope: 'brand',
      sharedMasterAvailability: 'missing',
      independentDetailAllowed: false,
      sharedDestinationRequired: true,
      safeToExpose: false,
    });
    expect(evaluateTargetPublicRepairPageMode(targetInput({
      brandSlug: 'motorola',
      modelSlug: 'moto-g85',
      repairSlug: 'screen-replacement',
    }))).toMatchObject({
      targetMode: 'generic-shared',
      ownershipScope: 'global',
      sharedMasterAvailability: 'missing',
      independentDetailAllowed: false,
      sharedDestinationRequired: true,
      safeToExpose: false,
    });
    expect(evaluateTargetPublicRepairPageMode(targetInput({ category: 'tablet', repairSlug: 'logic-board-repair' }))).toMatchObject({
      targetMode: 'shared-only',
      ownershipScope: 'device-category',
      sharedMasterAvailability: 'missing',
      independentDetailAllowed: false,
    });
  });

  it('does not let service evidence change the target ownership decision', () => {
    const huaweiScreen = targetInput({ brandSlug: 'huawei', modelSlug: 'p60', repairSlug: 'screen-replacement' });
    const samsungCamera = targetInput({ repairSlug: 'back-camera-replacement' });
    const iphoneCamera = targetInput({ brandSlug: 'iphone', modelSlug: 'iphone-16', repairSlug: 'back-camera-replacement' });

    for (const [input, targetMode] of [
      [huaweiScreen, 'generic-shared'],
      [samsungCamera, 'brand-shared'],
      [iphoneCamera, 'independent'],
    ] as const) {
      expect(evaluateTargetPublicRepairPageMode(input)).toMatchObject({ targetMode });
      expect(evaluateTargetPublicRepairPageMode({ ...input, repairOrigin: 'absent' })).toMatchObject({ targetMode });
    }
    expect(evaluateTargetPublicRepairPageMode(targetInput({ repairSlug: 'logic-board-repair' }))).toMatchObject({
      targetMode: 'shared-only',
      independentDetailAllowed: false,
    });
  });

  it('fails closed for a repair outside the mapped taxonomy', () => {
    expect(evaluateTargetPublicRepairPageMode(targetInput({
      brandSlug: 'nokia',
      modelSlug: 'g42',
      repairSlug: 'microsoldering-special',
    }))).toMatchObject({
      targetMode: 'hidden',
      safeToExpose: false,
      independentDetailAllowed: false,
      reason: 'unknown-repair-taxonomy',
    });
  });

  it('keeps legacy treatment separate from the future page target', () => {
    expect(evaluateTargetPublicRepairPageMode(targetInput({
      repairSlug: 'front-camera-replacement',
      legacyStatus: 'independent-verified',
    }))).toMatchObject({
      targetMode: 'brand-shared',
      legacyTreatment: 'separate',
      independentDetailAllowed: false,
    });
  });

  it('preserves canonical brand and repair identities in the contract', () => {
    expect(classifyPhoneBrand('google')).toBe('core-android');
    expect(evaluateTargetPublicRepairPageMode(targetInput({
      brandSlug: 'google',
      modelSlug: 'pixel-9',
      repairSlug: 'water-damage',
    }))).toMatchObject({
      canonicalBrandSlug: 'google-pixel',
      canonicalRepairSlug: 'water-damage-repair',
      targetMode: 'shared-only',
    });
  });
});
