import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Burwood service area', () => {
  const area = getServiceAreaBySlug('burwood');
  const content = JSON.stringify(area);

  it('keeps one Burwood area with the approved multi-device metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'burwood')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone, iPhone, iPad & MacBook Repair Near Burwood | Ali Mobile');
    expect(area?.customH1).toBe('Phone, iPhone, iPad & MacBook Repair Near Burwood');
    expect(area?.metaDescription).toBe('Phone, iPhone, iPad and MacBook repair near Burwood, Burwood East and Burwood Heights at Ringwood Square Kiosk C1, with model checks and confirmed quotes.');

    for (const term of ['Phone', 'iPhone', 'iPad', 'MacBook', 'Burwood']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
  });

  it('covers the supported devices and hardware-assessment fault paths', () => {
    for (const term of ['Samsung', 'Google Pixel', 'laptop hardware', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
  });

  it('serves the Burwood travel area from the one Ringwood Square location', () => {
    for (const suburb of ['Burwood East', 'Burwood Heights', 'Bennettswood']) {
      expect(content).toContain(suburb);
    }

    expect(content).toContain('Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('repair shop in Burwood'))?.answer;
    expect(locationAnswer).toContain('There is no Burwood, Burwood East, Burwood Heights or Bennettswood branch, shop, counter or collection point.');
  });

  it('uses the four approved device links in order without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options for Burwood customers' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options for Burwood customers' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options for Burwood customers' },
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options for Burwood customers' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('does not add unsupported IT, timing, stock, price or authority promises', () => {
    const itAnswer = area?.customFaqs?.find((faq) => faq.question.includes('general IT support'))?.answer;

    expect(itAnswer).toContain('We do not provide general IT, managed IT, networking, software administration or on-site computer service.');
    expect(content).not.toMatch(/same-day|15 minutes|in stock|hold (?:a )?part|reserve (?:a )?part|lowest price|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
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
