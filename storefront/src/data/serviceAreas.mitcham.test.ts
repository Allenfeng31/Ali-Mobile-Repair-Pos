import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Mitcham service area', () => {
  const area = getServiceAreaBySlug('mitcham');
  const content = JSON.stringify(area);

  it('keeps one Mitcham area with phone-first metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'mitcham')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone & iPhone Repair Near Mitcham | Ali Mobile');
    expect(area?.customH1).toBe('Phone & iPhone Repair Near Mitcham');
    expect(area?.metaDescription).toBe('Phone, iPhone, Samsung and tablet repair near Mitcham at Ringwood Square Kiosk C1, with model checks and a confirmed quote before supported work.');

    for (const term of ['Phone', 'iPhone', 'Mitcham']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['computer', 'IT support', 'data recovery', 'same-day', 'authorised', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('keeps phone repair primary while retaining a MacBook link-out', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'iPad', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
    expect(area?.customLinks).toContainEqual({ href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' });
    expect(content).not.toMatch(/computer|IT support|managed IT|network support|on-site computer/i);
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
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('removes priority, timing, stock, price, authority and result guarantees', () => {
    expect(content).not.toMatch(/priority booking|15[–-]45 minutes|same-day|while-you-wait|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('burwood')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Burwood | Ali Mobile', customH1: 'Phone & iPhone Repair Near Burwood' });
    expect(getServiceAreaBySlug('blackburn')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Blackburn | Ali Mobile', customH1: 'Phone & iPhone Repair Near Blackburn' });
    expect(getServiceAreaBySlug('boronia')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Boronia | Ali Mobile', customH1: 'Phone & iPhone Repair Near Boronia' });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Doncaster | Ali Mobile', customH1: 'Phone & iPhone Repair Near Doncaster' });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Glen Waverley & Syndal | Ali Mobile', customH1: 'Phone & iPhone Repair Near Glen Waverley and Syndal' });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Croydon | Ali Mobile', customH1: 'Phone & iPhone Repair Near Croydon' });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Nunawading | Ali Mobile Ringwood', customH1: 'Phone & iPhone Repair Near Nunawading' });
  });
});
