import { describe, expect, it } from 'vitest';

import {
  repairResultAffectedPaths,
  repairResultAffectedPathsForMutation,
} from './repairResultRevalidation';

const baseResult = {
  device_category: 'phone' as const,
  brand_slug: 'iphone',
  model_slug: 'iphone-16-pro',
  repair_type_slug: 'screen-replacement',
  featured_on_homepage: false,
  featured_on_repair_hub: false,
  featured_on_brand_hub: false,
};

describe('repair result revalidation paths', () => {
  it('returns exact Detail and Model paths for every canonical result state', () => {
    expect(repairResultAffectedPaths(baseResult)).toEqual([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
    ]);
  });

  it('adds only configured placement destinations and never /repairs', () => {
    const paths = repairResultAffectedPaths({
      ...baseResult,
      featured_on_homepage: true,
      featured_on_repair_hub: true,
      featured_on_brand_hub: true,
    });

    expect(paths).toEqual([
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
      '/repairs/phone/iphone',
      '/repairs/phone',
      '/',
    ]);
    expect(paths).not.toContain('/repairs');
  });

  it('unions old and new paths for removed placements and future taxonomy moves', () => {
    expect(repairResultAffectedPathsForMutation(
      { ...baseResult, model_slug: 'iphone-15-pro', featured_on_homepage: true, featured_on_brand_hub: true },
      baseResult,
    )).toEqual([
      '/repairs/phone/iphone/iphone-15-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-15-pro',
      '/repairs/phone/iphone',
      '/',
      '/repairs/phone/iphone/iphone-16-pro/screen-replacement',
      '/repairs/phone/iphone/iphone-16-pro',
    ]);
  });

  it('supports arbitrary future canonical slugs and removes duplicate paths deterministically', () => {
    const future = {
      ...baseResult,
      brand_slug: 'future-brand',
      model_slug: 'future-model',
      repair_type_slug: 'future-repair',
    };

    expect(repairResultAffectedPathsForMutation(future, future)).toEqual([
      '/repairs/phone/future-brand/future-model/future-repair',
      '/repairs/phone/future-brand/future-model',
    ]);
  });
});
