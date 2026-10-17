import { describe, expect, it } from 'vitest';

import {
  APPLE_WATCH_BRAND_HUB_META_DESCRIPTION,
  APPLE_WATCH_BRAND_HUB_PRICING_COPY,
  APPLE_WATCH_BRAND_HUB_PRICE_REFERENCE,
} from './brand-hub-pricing';

describe('APPLE_WATCH_BRAND_HUB_PRICE_REFERENCE', () => {
  it('keeps the approved selected-model screen and battery references centralized', () => {
    expect(APPLE_WATCH_BRAND_HUB_PRICE_REFERENCE).toMatchObject({
      screenReplacementFrom: 150,
      batteryReplacementFrom: 90,
      source: 'Owner-confirmed Apple Watch service references.',
    });
    expect(APPLE_WATCH_BRAND_HUB_PRICING_COPY).toContain('Selected Apple Watch screen repairs start from $150');
    expect(APPLE_WATCH_BRAND_HUB_PRICING_COPY).toContain('selected battery replacements from $90');
    expect(APPLE_WATCH_BRAND_HUB_PRICING_COPY).toContain('Select your exact model and case size');
    expect(APPLE_WATCH_BRAND_HUB_META_DESCRIPTION).toContain('screen repairs from $150');
    expect(APPLE_WATCH_BRAND_HUB_META_DESCRIPTION).toContain('battery replacements from $90');
  });
});
