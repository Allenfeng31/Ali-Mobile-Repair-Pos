import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Boronia service area', () => {
  const area = getServiceAreaBySlug('boronia');
  const content = JSON.stringify(area);

  it('keeps one Boronia area with the approved Phone-led metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'boronia')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone, iPhone & MacBook Repair Near Boronia | Ali Mobile');
    expect(area?.customH1).toBe('Phone, iPhone & MacBook Repair Near Boronia');
    expect(area?.metaDescription).toBe('Phone, iPhone and MacBook repair near Boronia at Ringwood Square Kiosk C1, with screen, battery and charging checks and confirmed quotes before work.');

    for (const term of ['Phone', 'iPhone', 'MacBook', 'Boronia']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['iPad', 'data recovery', 'same-day', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('covers the supported repair scope while keeping MacBook hardware-only', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'MacBook', 'iPad', 'screen', 'battery', 'charging', 'laptop hardware']) {
      expect(content).toContain(term);
    }
    expect(area?.customScenarioSection?.paragraphs.join(' ')).toContain('MacBook and laptop enquiries are limited to hardware assessment and supported hardware repair.');
  });

  it('keeps the single Ringwood Square location and established travel facts', () => {
    expect(content).toContain('Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');
    expect(content).not.toMatch(/Coles/i);

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('shop in Boronia'))?.answer;
    expect(locationAnswer).toContain('There is no Boronia branch, shop, counter or collection point.');
    expect(area).toMatchObject({
      driveTime: 'About 16 minutes',
      transitAdvice: 'Use the Belgrave line from Boronia Station to Ringwood Station.',
      landmarks: ['Boronia Station', 'Dorset Square', 'Mountain Highway'],
      route: 'Head north-west through Dorset Road or Mountain Highway toward Ringwood Square.',
    });
  });

  it('uses the four approved repair links in order without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' },
      { href: '/repairs/screen-replacement', label: 'Screen replacement assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('removes unsupported timing, stock, price, authority and result promises', () => {
    expect(content).not.toMatch(/15[–-]45 minutes|same-day|while-you-wait|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('burwood')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Burwood | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Burwood' });
    expect(getServiceAreaBySlug('blackburn')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Blackburn | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Blackburn' });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Doncaster | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Doncaster' });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({ metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile', customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal' });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Croydon' });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Nunawading | Ali Mobile Ringwood', customH1: 'Apple, MacBook & Phone Repair Near Nunawading' });
  });
});
