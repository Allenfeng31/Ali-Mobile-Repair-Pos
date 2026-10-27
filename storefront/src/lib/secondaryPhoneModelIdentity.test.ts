import { describe, expect, it } from 'vitest';

import {
  BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS,
  SECONDARY_PHONE_BRAND_NAMES,
  getSecondaryPhoneModelIdentity,
  isBatchOneSecondaryPhoneBrand,
} from './secondaryPhoneModelIdentity';

describe('secondary phone Model Hub identity', () => {
  it.each([
    ['xiaomi', 'Xiaomi', '14C', 'Xiaomi 14C'],
    ['nokia', 'Nokia', 'G42', 'Nokia G42'],
    ['vivo', 'Vivo', 'Y52 5G', 'Vivo Y52 5G'],
    ['lg', 'LG', 'Velvet', 'LG Velvet'],
    ['oneplus', 'OnePlus', '9 Pro', 'OnePlus 9 Pro'],
    ['huawei', 'Huawei', 'P30 Pro', 'Huawei P30 Pro'],
    ['htc', 'HTC', 'U12+', 'HTC U12+'],
    ['sony', 'Sony', 'Xperia 5', 'Sony Xperia 5'],
    ['telstra', 'Telstra', 'T-Pro', 'Telstra T-Pro'],
    ['motorola', 'Motorola', 'Moto G04', 'Motorola Moto G04'],
    ['microsoft', 'Microsoft', 'Lumia 950', 'Microsoft Lumia 950'],
    ['realme', 'Realme', 'C55', 'Realme C55'],
    ['asus', 'ASUS', 'ROG Phone 6', 'ASUS ROG Phone 6'],
    ['tcl', 'TCL', '20L', 'TCL 20L'],
    ['nothing', 'Nothing', 'Phone (2)', 'Nothing Phone (2)'],
  ])('qualifies %s with its consumer-facing brand', (brandSlug, brandName, modelName, expected) => {
    expect(SECONDARY_PHONE_BRAND_NAMES[brandSlug]).toBe(brandName);
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'phone', brandSlug, modelName })).toBe(expected);
  });

  it.each([
    ['vivo', 'Vivo Y20s', 'Vivo Y20s'],
    ['lg', 'LG Velvet', 'LG Velvet'],
    ['asus', 'ASUS ROG Phone 6', 'ASUS ROG Phone 6'],
    ['oneplus', 'oneplus 9 Pro', 'oneplus 9 Pro'],
    ['lg', 'LG-Velvet', 'LG-Velvet'],
  ])('does not duplicate an existing manufacturer in %s model identity', (brandSlug, modelName, expected) => {
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'phone', brandSlug, modelName })).toBe(expected);
  });

  it('leaves primary phone and non-phone identities unchanged', () => {
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'phone', brandSlug: 'samsung', modelName: 'Galaxy S24' }))
      .toBe('Galaxy S24');
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'tablet', brandSlug: 'samsung', modelName: 'Galaxy Tab A8' }))
      .toBe('Galaxy Tab A8');
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'laptop', brandSlug: 'macbook', modelName: 'MacBook Air M3' }))
      .toBe('MacBook Air M3');
    expect(getSecondaryPhoneModelIdentity({ categorySlug: 'watch', brandSlug: 'apple', modelName: 'Apple Watch Series 9' }))
      .toBe('Apple Watch Series 9');
  });

  it('limits Batch 1 content treatment to the five audited brands', () => {
    expect(BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS).toEqual(['xiaomi', 'nokia', 'vivo', 'lg', 'oneplus']);
    expect(isBatchOneSecondaryPhoneBrand('oneplus')).toBe(true);
    expect(isBatchOneSecondaryPhoneBrand('huawei')).toBe(false);
  });
});
