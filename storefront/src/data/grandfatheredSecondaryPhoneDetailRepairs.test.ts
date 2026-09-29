import { describe, expect, it } from 'vitest';

import {
  GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS,
  GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_CUTOFF,
  isGrandfatheredSecondaryPhoneDetailRepair,
} from './grandfatheredSecondaryPhoneDetailRepairs';

describe('grandfathered secondary phone detail repairs', () => {
  it('preserves the exact pre-Hybrid public cutoff', () => {
    const byRepair = Object.groupBy(
      GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS,
      (identity) => identity.repairSlug,
    );
    const models = new Set(
      GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.map((identity) => `${identity.category}/${identity.brandSlug}/${identity.modelSlug}`),
    );
    const brands = new Set(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.map((identity) => identity.brandSlug));
    const canonical = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.map(
      (identity) => `${identity.category}/${identity.brandSlug}/${identity.modelSlug}/${identity.repairSlug}`,
    );

    expect(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_CUTOFF.validatedAt).toBe('2026-09-24T16:30:51.323+00:00');
    expect(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_CUTOFF.checksum).toBe('9c23fe646dde54b470f27b23af8f422d0d7e081668a06799fff090f32432d725');
    expect(byRepair['screen-replacement']).toHaveLength(179);
    expect(byRepair['battery-replacement']).toHaveLength(179);
    expect(byRepair['charging-port-replacement']).toHaveLength(179);
    expect(byRepair['back-glass-replacement'] ?? []).toHaveLength(0);
    expect(canonical).toHaveLength(537);
    expect(new Set(canonical)).toHaveLength(537);
    expect(models).toHaveLength(179);
    expect([...brands].sort()).toEqual([
      'asus', 'htc', 'huawei', 'lg', 'microsoft', 'motorola', 'nokia', 'nothing', 'oneplus', 'realme', 'sony', 'tcl', 'telstra', 'vivo', 'xiaomi',
    ]);
    expect(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.every((identity) => identity.category === 'phone')).toBe(true);
    expect(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.every((identity) => [
      'screen-replacement', 'battery-replacement', 'charging-port-replacement', 'back-glass-replacement',
    ].includes(identity.repairSlug))).toBe(true);
    expect(GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.some((identity) => [
      'apple', 'iphone', 'samsung', 'google-pixel', 'oppo',
    ].includes(identity.brandSlug))).toBe(false);
  });

  it('is exact, secondary-only, and fail-closed', () => {
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'asus', 'rog-phone-3', 'screen-replacement')).toBe(true);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'asus', 'rog-phone-3', 'battery-replacement')).toBe(true);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'asus', 'rog-phone-3', 'charging-port-replacement')).toBe(true);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'motorola', 'moto-g24', 'back-glass-replacement')).toBe(false);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'samsung', 'galaxy-s24', 'screen-replacement')).toBe(false);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('tablet', 'asus', 'rog-phone-3', 'screen-replacement')).toBe(false);
    expect(isGrandfatheredSecondaryPhoneDetailRepair('phone', 'asus', 'future-model', 'screen-replacement')).toBe(false);
  });
});
