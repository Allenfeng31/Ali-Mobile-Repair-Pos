import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Blackburn service area', () => {
  const area = getServiceAreaBySlug('blackburn');
  const content = JSON.stringify(area);

  it('keeps one Blackburn area with the approved Apple and MacBook metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'blackburn')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Apple, MacBook & Phone Repair Near Blackburn | Ali Mobile');
    expect(area?.customH1).toBe('Apple, MacBook & Phone Repair Near Blackburn');
    expect(area?.metaDescription).toBe('Apple, MacBook, iPhone and phone repair near Blackburn, Blackburn South and Blackburn North at Ringwood Square Kiosk C1, with confirmed quotes.');

    for (const term of ['Apple', 'MacBook', 'Phone', 'Blackburn']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['Computer', 'IT', 'Data Recovery', 'iPad']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('covers the supporting device range and Blackburn travel area without irrelevant locations', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'iPad', 'laptop hardware', 'Blackburn South', 'Blackburn North']) {
      expect(content).toContain(term);
    }
    expect(content).not.toMatch(/Hawksburn|Craigieburn|Preston/i);
  });

  it('keeps the one Ringwood Square location and rejects local-area premises', () => {
    expect(content).toContain('Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('physical repair shop in Blackburn'))?.answer;
    expect(locationAnswer).toContain('There is no Blackburn, Blackburn South or Blackburn North branch, storefront, counter or collection point.');
  });

  it('uses the four approved device links in order without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options for Blackburn customers' },
      { href: '/repairs/phone/iphone', label: 'iPhone repair options for Blackburn customers' },
      { href: '/repairs/phone/samsung', label: 'Samsung phone repair options for Blackburn customers' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options for Blackburn customers' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('keeps hardware-only and quote-first boundaries without unsupported promises', () => {
    const itAnswer = area?.customFaqs?.find((faq) => faq.question.includes('general IT'))?.answer;

    expect(itAnswer).toContain('we do not provide general IT, managed IT, networking, software administration or on-site computer service.');
    expect(content).not.toMatch(/same-day|same-visit|15 minutes|in stock|hold (?:a )?part|reserve (?:a )?part|lowest price|price guarantee|guaranteed result|guaranteed data recovery|authorized service centre/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('burwood')).toMatchObject({
      metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Burwood | Ali Mobile',
      customH1: 'Phone, iPhone, iPad & MacBook Repair Near Burwood',
    });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({
      metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile',
      customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal',
    });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({
      metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile',
      customH1: 'Phone, iPhone, iPad & MacBook Repair Near Croydon',
    });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({
      metaTitle: 'Apple, MacBook & Phone Repair Near Nunawading | Ali Mobile Ringwood',
      customH1: 'Apple, MacBook & Phone Repair Near Nunawading',
    });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({
      metaTitle: 'Apple, MacBook & Phone Repair Near Doncaster | Ali Mobile',
      customH1: 'Apple, MacBook & Phone Repair Near Doncaster',
    });
  });
});
