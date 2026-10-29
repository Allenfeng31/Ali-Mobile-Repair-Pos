import { describe, expect, it } from 'vitest';

import { GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS } from '@/data/grandfatheredSecondaryPhoneDetailRepairs';
import {
  BATCH_ONE_SECONDARY_PHONE_BRAND_SLUGS,
  BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS,
  getSecondaryPhoneModelIdentity,
  SECONDARY_PHONE_BRAND_NAMES,
} from '@/lib/secondaryPhoneModelIdentity';
import { getSecondaryPhoneRepairDetailContent } from './secondaryPhoneRepairDetail';

describe('Batch 1 secondary-phone repair detail content', () => {
  it.each([
    ['screen-replacement', 'glass damage', 'display failure', 'touch issues'],
    ['battery-replacement', 'battery deterioration', 'charging fault', 'power fault'],
    ['charging-port-replacement', 'intermittent charging', 'charging accessories', 'further diagnosis'],
  ] as const)('provides factual %s guidance without price or timing claims', (repairSlug, ...expectedPhrases) => {
    const content = getSecondaryPhoneRepairDetailContent({
      categorySlug: 'phone',
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
    expect(getSecondaryPhoneRepairDetailContent({
      categorySlug: 'phone',
      brandSlug,
      modelName: 'Commercial Model',
      repairSlug: 'screen-replacement',
    })).not.toBeNull();
  });

  it.each([
    ['microsoft', 'screen-replacement'],
    ['xiaomi', 'back-glass-replacement'],
  ])('does not expand outside the approved cohort: %s/%s', (brandSlug, repairSlug) => {
    expect(getSecondaryPhoneRepairDetailContent({
      categorySlug: 'phone',
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
      const content = getSecondaryPhoneRepairDetailContent({
        categorySlug: 'phone',
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

  it.each(BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS)('supports the Batch 2 brand %s', (brandSlug) => {
    expect(getSecondaryPhoneRepairDetailContent({
      categorySlug: 'phone',
      brandSlug,
      modelName: 'Commercial Model',
      repairSlug: 'screen-replacement',
    })).not.toBeNull();
  });

  it('uses a price-aware Batch 2 Hero without implying multiple quality tiers', () => {
    const content = getSecondaryPhoneRepairDetailContent({
      categorySlug: 'phone',
      brandSlug: 'motorola',
      modelName: 'Motorola Moto G55',
      repairSlug: 'screen-replacement',
      isQuoteOnly: false,
    });

    expect(content?.heroSubtitle).toContain('View the current Motorola Moto G55 screen replacement price below');
    expect(content?.heroSubtitle).not.toMatch(/quality tier|options and prices/i);
  });

  it('covers exactly the 84 existing Batch 2 canonical route identities', () => {
    const batch2Brands = new Set<string>(BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS);
    const routes = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.filter(({ brandSlug }) => batch2Brands.has(brandSlug));

    expect(routes).toHaveLength(84);
    for (const route of routes) {
      const content = getSecondaryPhoneRepairDetailContent({
        categorySlug: 'phone',
        brandSlug: route.brandSlug,
        modelName: 'Commercial Model',
        repairSlug: route.repairSlug,
      });
      expect(content).not.toBeNull();
    }
  });

  it('matches the audited POS snapshot split of 74 quote-only and 10 positive-price routes', () => {
    const batch2Brands = new Set<string>(BATCH_TWO_SECONDARY_PHONE_BRAND_SLUGS);
    const routes = GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.filter(({ brandSlug }) => batch2Brands.has(brandSlug));
    const positivePriceRoutes = new Set([
      'motorola/edge-20/screen-replacement/170',
      'motorola/edge-30-pro/screen-replacement/179',
      'motorola/moto-g04/screen-replacement/129',
      'motorola/moto-g04/battery-replacement/75',
      'motorola/moto-g04/charging-port-replacement/75',
      'motorola/moto-g24/screen-replacement/140',
      'motorola/moto-g24/battery-replacement/75',
      'motorola/moto-g55/screen-replacement/129',
      'motorola/moto-g55/battery-replacement/80',
      'motorola/moto-g55/charging-port-replacement/80',
    ]);
    const positiveRouteIdentities = new Set(
      [...positivePriceRoutes].map((entry) => entry.split('/').slice(0, 3).join('/')),
    );
    const positive = routes.filter(({ brandSlug, modelSlug, repairSlug }) =>
      positiveRouteIdentities.has(`${brandSlug}/${modelSlug}/${repairSlug}`));
    const quoteOnly = routes.filter(({ brandSlug, modelSlug, repairSlug }) =>
      !positiveRouteIdentities.has(`${brandSlug}/${modelSlug}/${repairSlug}`));

    expect(positivePriceRoutes).toHaveLength(10);
    expect(positive).toHaveLength(10);
    expect(quoteOnly).toHaveLength(74);
  });

  it('does not apply phone content to another device category', () => {
    expect(getSecondaryPhoneRepairDetailContent({
      categorySlug: 'tablet',
      brandSlug: 'motorola',
      modelName: 'Commercial Model',
      repairSlug: 'screen-replacement',
    })).toBeNull();
  });
});
