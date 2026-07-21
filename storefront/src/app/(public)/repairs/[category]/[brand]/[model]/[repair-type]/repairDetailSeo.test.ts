import { describe, expect, it } from 'vitest';

import { buildRepairDetailSeo, getRepairDetailHeading } from './repairDetailSeo';

describe('repair detail SEO', () => {
  it('formats iPhone screen-repair metadata and heading from canonical labels', () => {
    const canonicalUrl = 'https://www.alimobile.com.au/repairs/phone/iphone/iphone-15/screen-replacement';
    const seo = buildRepairDetailSeo({
      title: 'iPhone 15 Screen Replacement | Ringwood from $150 | A3090',
      description: 'Need a iPhone 15 screen replacement? Clear quote-first repair support in Ringwood.',
      canonicalUrl,
      model: 'iPhone 15',
      repairName: 'Screen Replacement',
    });

    expect(seo.openGraph).toMatchObject({
      title: expect.stringContaining('iPhone 15 Screen Replacement'),
      description: seo.description,
      url: canonicalUrl,
    });
    expect(seo.twitter).toMatchObject({
      title: expect.stringContaining('iPhone 15 Screen Replacement'),
      description: seo.description,
    });
    expect(getRepairDetailHeading('iPhone 15', 'Screen Replacement')).toBe('iPhone 15 Screen Replacement');
  });
});
