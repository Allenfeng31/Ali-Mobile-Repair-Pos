import { describe, expect, it } from 'vitest';

import { getServiceAreaBySlug } from './serviceAreas';

describe('Glen Waverley service area', () => {
  const area = getServiceAreaBySlug('glenwaverley');

  it('keeps the existing canonical area and route details', () => {
    expect(area).toMatchObject({
      slug: 'glenwaverley',
      driveTime: 'About 25 minutes',
      transitAdvice: 'Bus 742 connects Glen Waverley Station with Ringwood Station.',
      route: 'Travel toward Ringwood by bus or drive through Canterbury Road and Wantirna Road for Ringwood Square parking.',
    });
  });

  it('uses the approved MacBook-led title, H1 and local metadata', () => {
    expect(area?.metaTitle).toBe('MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile');
    expect(area?.customH1).toBe('MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal');
    expect(area?.metaDescription).toContain('MacBook');
    expect(area?.metaDescription).toContain('laptop');
    expect(area?.metaDescription).toContain('phone');
    expect(area?.metaDescription).toContain('Glen Waverley');
    expect(area?.metaDescription).toContain('Syndal');
    expect(area?.metaDescription).toContain('Ringwood Square');
    expect(area?.customIntro).toContain('Kiosk C1 inside Ringwood Square');
  });

  it('keeps the four focused repair links without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('states the Ringwood-only repair desk and separates hardware repair from IT support', () => {
    const faqs = area?.customFaqs || [];
    const noBranch = faqs.find((faq) => faq.question.includes('Glen Waverley or Syndal'));
    const itSupport = faqs.find((faq) => faq.question.includes('general IT support'));

    expect(faqs).toHaveLength(6);
    expect(noBranch?.answer).toContain('not from a Glen Waverley or Syndal branch');
    expect(itSupport?.answer).toContain('device hardware repair assessment');
    expect(itSupport?.answer).toContain('do not offer managed IT, network support or on-site computer service');
  });

  it('does not broaden the Glen Waverley and Syndal content to unrelated suburbs', () => {
    const content = JSON.stringify(area);

    expect(content).not.toContain('Mount Waverley');
    expect(content).not.toContain('Waverley Gardens');
  });
});
