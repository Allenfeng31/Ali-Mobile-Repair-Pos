import { describe, expect, it } from 'vitest';

import { GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS } from '@/data/grandfatheredSecondaryPhoneDetailRepairs';
import {
  BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS,
  getSecondaryPhoneModelIdentity,
  SECONDARY_PHONE_BRAND_NAMES,
} from '@/lib/secondaryPhoneModelIdentity';
import { getBatch1SecondaryPhoneRepairDetailContent } from './secondaryPhoneRepairDetail';

describe('Batch 1 secondary-phone repair detail content', () => {
  it.each([
    ['screen-replacement', 'glass damage', 'display failure', 'touch issues'],
    ['battery-replacement', 'battery deterioration', 'charging fault', 'power fault'],
    ['charging-port-replacement', 'intermittent charging', 'charging accessories', 'further diagnosis'],
  ] as const)('provides factual %s guidance without price or timing claims', (repairSlug, ...expectedPhrases) => {
    const content = getBatch1SecondaryPhoneRepairDetailContent({
      brandSlug: 'xiaomi',
      modelName: 'Xiaomi 14C',
      repairSlug,
    });

    expect(content).not.toBeNull();
    const text = JSON.stringify(content).toLowerCase();
    expectedPhrases.forEach((phrase) => expect(text).toContain(phrase));
    expect(text).not.toMatch(/\$\d|\b30 minutes\b|guaranteed|manufacturer-authorised|in stock/);
  });

  it.each(['xiaomi', 'nokia', 'vivo', 'lg', 'oneplus'])('supports the Batch 1 brand %s', (brandSlug) => {
    expect(getBatch1SecondaryPhoneRepairDetailContent({
      brandSlug,
      modelName: 'Commercial Model',
      repairSlug: 'screen-replacement',
    })).not.toBeNull();
  });

  it.each([
    ['motorola', 'screen-replacement'],
    ['xiaomi', 'back-glass-replacement'],
  ])('does not expand outside the approved cohort: %s/%s', (brandSlug, repairSlug) => {
    expect(getBatch1SecondaryPhoneRepairDetailContent({
      brandSlug,
      modelName: 'Commercial Model',
      repairSlug,
    })).toBeNull();
  });

  it('covers exactly the 378 existing Batch 1 canonical route identities', () => {
    const batch1Brands = new Set<string>(BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS);
    const routes = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.filter(({ brandSlug }) => batch1Brands.has(brandSlug));
    const canonicalPaths = new Set<string>();
    const contentFamilies = new Set<string>();

    expect(routes).toHaveLength(378);

    for (const route of routes) {
      const modelName = route.modelSlug.split('-').map((part) => part.toUpperCase()).join(' ');
      const publicModel = getSecondaryPhoneModelIdentity({
        categorySlug: route.category,
        brandSlug: route.brandSlug,
        modelName,
      });
      const brandName = SECONDARY_PHONE_BRAND_NAMES[route.brandSlug];
      const content = getBatch1SecondaryPhoneRepairDetailContent({
        brandSlug: route.brandSlug,
        modelName: publicModel,
        repairSlug: route.repairSlug,
      });

      expect(publicModel.toLowerCase().startsWith(brandName.toLowerCase())).toBe(true);
      expect(content).not.toBeNull();
      expect(content?.section.heading).toContain(publicModel);
      expect(content?.heroSubtitle).not.toContain('quality tier');

      canonicalPaths.add(`/repairs/${route.category}/${route.brandSlug}/${route.modelSlug}/${route.repairSlug}`);
      contentFamilies.add(content?.section.kicker ?? '');
    }

    expect(canonicalPaths).toHaveLength(378);
    expect(contentFamilies).toEqual(new Set([
      'Screen repair guide',
      'Battery repair guide',
      'Charging port repair guide',
    ]));
  });
});
