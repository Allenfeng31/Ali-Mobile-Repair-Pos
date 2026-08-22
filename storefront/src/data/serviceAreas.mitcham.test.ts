import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Mitcham service area', () => {
  const area = getServiceAreaBySlug('mitcham');
  const content = JSON.stringify(area);

  it('keeps one Mitcham area with the approved Apple and MacBook metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'mitcham')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Apple, MacBook & Phone Repair Near Mitcham | Ali Mobile');
    expect(area?.customH1).toBe('Apple, MacBook & Phone Repair Near Mitcham');
    expect(area?.metaDescription).toBe('Apple, MacBook, iPhone and phone repair near Mitcham at Ringwood Square Kiosk C1, with model checks and a confirmed quote before supported work.');

    for (const term of ['Apple', 'MacBook', 'Phone', 'Mitcham']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['computer', 'IT support', 'data recovery', 'same-day', 'authorised', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('covers the multi-device scope while limiting MacBook and laptop work to hardware', () => {
    for (const term of ['MacBook Air', 'MacBook Pro', 'iPhone', 'Samsung', 'Google Pixel', 'iPad', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
    expect(area?.customScenarioSection?.paragraphs.join(' ')).toContain('supported hardware repair');

    const itAnswer = area?.customFaqs?.find((faq) => faq.question.includes('general computer repair'))?.answer;
    expect(itAnswer).toContain('We do not provide general computer repair, general PC repair, IT support, managed IT, business network support, networking, software administration, remote support or on-site computer service.');
  });

  it('keeps the one Ringwood Square location and original Mitcham travel fields', () => {
    expect(content).toContain('Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');
    expect(content).not.toMatch(/Coles/i);

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('shop in Mitcham'))?.answer;
    expect(locationAnswer).toContain('There is no Mitcham branch, shop, counter or collection point.');
    expect(area).toMatchObject({
      driveTime: 'About 6 minutes',
      transitAdvice: 'Use Maroondah Highway or EastLink depending on traffic.',
      landmarks: ['Mitcham Station', 'EastLink', 'Mitcham Shopping Centre'],
      route: 'Follow Maroondah Highway east toward Ringwood Square.',
    });
  });

  it('uses the four approved repair links in order without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' },
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('removes priority, timing, stock, price, authority and result guarantees', () => {
    expect(content).not.toMatch(/priority booking|15[–-]45 minutes|same-day|while-you-wait|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('burwood')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Burwood | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Burwood' });
    expect(getServiceAreaBySlug('blackburn')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Blackburn | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Blackburn' });
    expect(getServiceAreaBySlug('boronia')).toMatchObject({ metaTitle: 'Phone, iPhone & MacBook Repair Near Boronia | Ali Mobile', customH1: 'Phone, iPhone & MacBook Repair Near Boronia' });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Doncaster | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Doncaster' });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({ metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile', customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal' });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Croydon' });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Nunawading | Ali Mobile Ringwood', customH1: 'Apple, MacBook & Phone Repair Near Nunawading' });
  });
});
