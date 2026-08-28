import { describe, expect, it } from 'vitest';

import { evaluateCurrentPublicRepairDetailEligibility } from './publicRepairDetailEligibility';

describe('evaluateCurrentPublicRepairDetailEligibility', () => {
  it.each([
    ['normal phone detail', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'eligible'],
    ['water damage central route', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'water-damage-repair', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'water-damage-central'],
    ['flex noindex', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'flex-cable-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'flex-noindex'],
    ['configured Pixel', { category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-8-pro', repairSlug: 'screen-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'eligible'],
    ['unconfigured Pixel', { category: 'phone', brandSlug: 'google-pixel', modelSlug: 'pixel-unknown', repairSlug: 'screen-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'route-policy-excluded'],
    ['Samsung Note unsupported repair', { category: 'phone', brandSlug: 'samsung', modelSlug: 'galaxy-note-20', repairSlug: 'loudspeaker-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'route-policy-excluded'],
    ['unknown POS repair', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'bespoke-pos-repair', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'eligible'],
    ['unconfigured OPPO remains a current active route', { category: 'phone', brandSlug: 'oppo', modelSlug: 'unknown-oppo', repairSlug: 'screen-replacement', hasActiveBrand: true, hasActiveModel: true, hasActiveRepair: true }, 'eligible'],
    ['missing brand', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', hasActiveBrand: false, hasActiveModel: false, hasActiveRepair: false }, 'missing-active-brand'],
    ['missing model', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', hasActiveBrand: true, hasActiveModel: false, hasActiveRepair: false }, 'missing-active-model'],
    ['retired-only', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', hasActiveBrand: false, hasActiveModel: false, hasActiveRepair: false, isRetired: true }, 'retired'],
  ] as const)('%s is %s', (_label, input, reason) => {
    expect(evaluateCurrentPublicRepairDetailEligibility(input)).toEqual({ eligible: reason === 'eligible', reason });
  });
});
