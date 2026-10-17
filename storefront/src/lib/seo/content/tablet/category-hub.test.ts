import { describe, expect, it } from 'vitest';

import {
  TABLET_CATEGORY_IPAD_SCREEN_PRICE_REFERENCE,
  TABLET_CATEGORY_META_DESCRIPTION,
} from './category-hub';

describe('tablet category hub owner-confirmed pricing reference', () => {
  it('keeps the $99 iPad Air 1 screen service qualified for selected older models', () => {
    expect(TABLET_CATEGORY_IPAD_SCREEN_PRICE_REFERENCE).toMatchObject({
      status: 'owner-confirmed-in-store',
      supportedOfflineService: 'iPad Air 1 screen replacement',
      price: '$99',
    });
    expect(TABLET_CATEGORY_IPAD_SCREEN_PRICE_REFERENCE.bodyCopy).toBe(
      'iPad screen repairs start from $99 for selected older models. Contact us to confirm pricing and availability for your device.',
    );
  });

  it('uses the exact owner-approved tablet category meta description', () => {
    expect(TABLET_CATEGORY_META_DESCRIPTION).toBe(
      'iPad, Samsung & Lenovo tablet repairs in Ringwood. iPad screen repairs from $99 on selected models. Many repairs take around 1 hour. 6-month warranty on eligible repairs.',
    );
  });
});
