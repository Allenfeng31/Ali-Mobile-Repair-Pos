import { describe, expect, it } from 'vitest';

import { getServiceAreaBySlug } from './serviceAreas';

describe('Croydon service area', () => {
  const area = getServiceAreaBySlug('croydon');
  const content = JSON.stringify(area);

  it('keeps the existing canonical Croydon area and travel data', () => {
    expect(area).toMatchObject({
      slug: 'croydon',
      driveTime: 'About 10 minutes',
      landmarks: ['Croydon Central', 'Croydon Station', 'Mt Dandenong Road'],
      route: 'Head west toward Ringwood, then turn into Ringwood Square for easy centre parking.',
    });
  });

  it('uses the approved Phone, iPhone, iPad and MacBook title and H1', () => {
    expect(area?.metaTitle).toBe('Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile');
    expect(area?.customH1).toBe('Phone, iPhone, iPad & MacBook Repair Near Croydon');
    for (const device of ['Phone', 'iPhone', 'iPad', 'MacBook']) {
      expect(area?.metaTitle).toContain(device);
      expect(area?.customH1).toContain(device);
    }
    expect(area?.metaDescription).toContain('Phone');
    expect(area?.metaDescription).toContain('iPhone');
    expect(area?.metaDescription).toContain('Samsung');
    expect(area?.metaDescription).toContain('MacBook');
    expect(area?.metaDescription).toContain('Croydon');
    expect(area?.metaDescription).toContain('Ringwood Square Kiosk C1');
  });

  it('keeps four focused repair links without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung phone repair options' },
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
      { href: '/repairs/screen-replacement', label: 'Screen repair pathways' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('states the Ringwood-only kiosk and removes unsupported stock, timing, location and authority claims', () => {
    const faqs = area?.customFaqs || [];
    const noCroydonShop = faqs.find((faq) => faq.question.includes('repair shop in Croydon'));

    expect(noCroydonShop?.answer).toContain('not from a Croydon shop, counter or collection point');
    expect(content).not.toContain('authorized');
    expect(content).not.toContain('service centre');
    expect(content).not.toContain('hold a screen or battery');
    expect(content).not.toContain('20 to 40 minutes');
    expect(content).not.toContain('near Coles');
    expect(content).not.toContain('general IT');
    expect(content).not.toContain('managed IT');
    expect(content).not.toContain('on-site computer support');
  });

  it('leaves the committed Glen Waverley area unchanged', () => {
    const glenWaverley = getServiceAreaBySlug('glenwaverley');

    expect(glenWaverley).toMatchObject({
      slug: 'glenwaverley',
      metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile',
      customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal',
    });
  });
});
