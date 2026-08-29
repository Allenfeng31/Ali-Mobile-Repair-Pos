import { getAliMobileEnhancedGooglePixelRepairType } from './seo/content/google-pixel';
import { getAliMobileEnhancedSamsungRepairType } from './seo/content/samsung';
import { getSamsungHardwareConfig } from './seo/content/samsung/config';
import { isWaterDamageRepairSlug } from './waterDamageRouting';

export type CurrentPublicRepairDetailEligibilityInput = {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
  hasActiveBrand: boolean;
  hasActiveModel: boolean;
  hasActiveRepair: boolean;
  isRetired?: boolean;
};

export type CurrentPublicRepairDetailEligibilityReason =
  | 'eligible'
  | 'non-phone'
  | 'iphone-excluded'
  | 'water-damage-central'
  | 'flex-noindex'
  | 'retired'
  | 'missing-active-brand'
  | 'missing-active-model'
  | 'route-policy-excluded'
  | 'invalid-identity';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FLEX_CABLE_SEGMENT_PATTERN = /(?:^|-)flex-cable(?:-|$)/;

function isCanonicalSlug(value: string) {
  return SLUG_PATTERN.test(value);
}

export function evaluateCurrentPublicRepairDetailEligibility(
  input: CurrentPublicRepairDetailEligibilityInput,
): { eligible: boolean; reason: CurrentPublicRepairDetailEligibilityReason } {
  if (!isCanonicalSlug(input.category) || !isCanonicalSlug(input.brandSlug)
    || !isCanonicalSlug(input.modelSlug) || !isCanonicalSlug(input.repairSlug)) {
    return { eligible: false, reason: 'invalid-identity' };
  }
  if (input.isRetired) return { eligible: false, reason: 'retired' };
  if (!input.hasActiveBrand) return { eligible: false, reason: 'missing-active-brand' };
  if (!input.hasActiveModel) return { eligible: false, reason: 'missing-active-model' };
  if (!input.hasActiveRepair) return { eligible: false, reason: 'route-policy-excluded' };
  if (input.category !== 'phone') return { eligible: false, reason: 'non-phone' };
  if (input.brandSlug === 'iphone' || input.brandSlug === 'apple') return { eligible: false, reason: 'iphone-excluded' };
  if (isWaterDamageRepairSlug(input.repairSlug)) return { eligible: false, reason: 'water-damage-central' };
  if (FLEX_CABLE_SEGMENT_PATTERN.test(input.repairSlug)) return { eligible: false, reason: 'flex-noindex' };

  if (input.repairSlug === 'logic-board') return { eligible: false, reason: 'route-policy-excluded' };
  if (input.brandSlug === 'google-pixel') {
    const isSupported = getAliMobileEnhancedGooglePixelRepairType({
      category: input.category,
      brand: input.brandSlug,
      model: input.modelSlug,
      'repair-type': input.repairSlug,
    }) !== null;
    return isSupported ? { eligible: true, reason: 'eligible' } : { eligible: false, reason: 'route-policy-excluded' };
  }
  if (input.brandSlug === 'samsung' && getSamsungHardwareConfig(input.modelSlug)?.seriesFamily === 'galaxy-note') {
    const isSupported = getAliMobileEnhancedSamsungRepairType({
      category: input.category,
      brand: input.brandSlug,
      model: input.modelSlug,
      'repair-type': input.repairSlug,
    }) !== null;
    return isSupported ? { eligible: true, reason: 'eligible' } : { eligible: false, reason: 'route-policy-excluded' };
  }

  return { eligible: true, reason: 'eligible' };
}
