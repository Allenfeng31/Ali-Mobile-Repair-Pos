import { describe, expect, it } from 'vitest';

import {
  MOTHERBOARD_REPAIR_NAME,
  MOTHERBOARD_REPAIR_SLUG,
  withMotherboardMasterModelHubOption,
} from './motherboardRepair';

describe('Motherboard Model Hub option', () => {
  it('replaces existing board-family options in place with one quote-only Master card', () => {
    const options = withMotherboardMasterModelHubOption([
      { slug: 'screen-replacement', name: 'Screen Replacement', price: 199 },
      { slug: 'logic-board-repair', name: 'Logic Board Repair', price: 499 },
      { slug: 'logic-board', name: 'Logic Board', price: 199 },
      { slug: 'battery-replacement', name: 'Battery Replacement', price: 89 },
    ], 'phone', 'samsung', 'galaxy-s21');

    expect(options.filter((option) => option.slug === MOTHERBOARD_REPAIR_SLUG)).toHaveLength(1);
    expect(options).toEqual([
      { slug: 'screen-replacement', name: 'Screen Replacement', price: 199 },
      expect.objectContaining({
        slug: MOTHERBOARD_REPAIR_SLUG,
        name: MOTHERBOARD_REPAIR_NAME,
        price: 0,
        priceLabel: 'Quote on Request',
        href: '/repairs/motherboard-repair?category=phone&brand=samsung&model=galaxy-s21',
      }),
      { slug: 'battery-replacement', name: 'Battery Replacement', price: 89 },
    ]);
  });

  it.each([
    ['phone', 'iphone', 'iphone-15'],
    ['phone', 'samsung', 'galaxy-s21'],
    ['phone', 'google-pixel', 'pixel-8-pro'],
    ['phone', 'oppo', 'find-x5-pro'],
    ['phone', 'asus', 'rog-phone-5'],
    ['laptop', 'macbook', 'macbook-air-m3'],
  ])('injects one quote-only Master card for eligible %s/%s/%s without a board catalogue row', (category, brandSlug, modelSlug) => {
    const original = [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199 }];
    const options = withMotherboardMasterModelHubOption(original, category, brandSlug, modelSlug);
    const motherboard = options.filter((option) => option.slug === MOTHERBOARD_REPAIR_SLUG);

    expect(motherboard).toEqual([expect.objectContaining({
      name: MOTHERBOARD_REPAIR_NAME,
      price: 0,
      priceLabel: 'Quote on Request',
      href: `/repairs/motherboard-repair?category=${category}&brand=${brandSlug}&model=${modelSlug}`,
    })]);
    expect(options.find((option) => option.slug === 'screen-replacement')).toEqual(original[0]);
  });

  it.each([
    ['tablet', 'ipad', 'ipad-pro'],
    ['watch', 'apple-watch', 'series-9'],
    ['laptop', 'dell', 'xps-13'],
  ])('does not inject a Motherboard card for excluded %s/%s/%s', (category, brandSlug, modelSlug) => {
    const original = [{ slug: 'screen-replacement', name: 'Screen Replacement', price: 199 }];

    expect(withMotherboardMasterModelHubOption(original, category, brandSlug, modelSlug)).toEqual(original);
  });
});
