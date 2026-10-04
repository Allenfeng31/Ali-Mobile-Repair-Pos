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

  it('uses phone-first title, H1 and local metadata', () => {
    expect(area?.metaTitle).toBe('Phone & iPhone Repair Near Glen Waverley & Syndal | Ali Mobile');
    expect(area?.customH1).toBe('Phone & iPhone Repair Near Glen Waverley and Syndal');
    expect(area?.metaDescription).toContain('Phone');
    expect(area?.metaDescription).toContain('iPhone');
    expect(area?.metaDescription).toContain('Glen Waverley');
    expect(area?.metaDescription).toContain('Syndal');
    expect(area?.metaDescription).toContain('Ringwood Square');
    expect(area?.customIntro).toContain('Kiosk C1 inside Ringwood Square');
  });

  it('keeps the four focused repair links without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('states the Ringwood-only repair desk without computer-service intent', () => {
    const faqs = area?.customFaqs || [];
    const noBranch = faqs.find((faq) => faq.question.includes('Glen Waverley or Syndal'));
    const content = JSON.stringify(area);

    expect(faqs).toHaveLength(6);
    expect(noBranch?.answer).toContain('not from a Glen Waverley or Syndal branch');
    expect(content).not.toMatch(/computer|IT support|managed IT|network support|on-site computer/i);
  });

  it('does not broaden the Glen Waverley and Syndal content to unrelated suburbs', () => {
    const content = JSON.stringify(area);

    expect(content).not.toContain('Mount Waverley');
    expect(content).not.toContain('Waverley Gardens');
  });
});
