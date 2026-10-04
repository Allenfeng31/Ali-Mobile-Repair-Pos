import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Bayswater service area', () => {
  const area = getServiceAreaBySlug('bayswater');
  const content = JSON.stringify(area);

  it('keeps one Bayswater area with phone-first metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'bayswater')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone & iPhone Repair Near Bayswater | Ali Mobile');
    expect(area?.customH1).toBe('Phone & iPhone Repair Near Bayswater');
    expect(area?.metaDescription).toBe('Phone, iPhone, Samsung and tablet repair near Bayswater at Ringwood Square Kiosk C1, with model checks and confirmed quotes before work.');

    for (const term of ['Phone', 'iPhone', 'Bayswater']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['Computer', 'PC', 'IT', 'data recovery', 'same-day', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('keeps phone and tablet repair primary while retaining a MacBook link-out', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'iPad', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
    expect(area?.customLinks).toContainEqual({ href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' });
    expect(content).not.toMatch(/computer|IT support|managed IT|network support|on-site computer/i);
  });

  it('keeps the one Ringwood Square location and original Bayswater travel fields', () => {
    expect(content).toContain('Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');
    expect(content).not.toMatch(/Coles/i);

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('shop in Bayswater'))?.answer;
    expect(locationAnswer).toContain('There is no Bayswater branch, shop, counter or collection point.');
    expect(area).toMatchObject({
      driveTime: 'About 12 minutes',
      transitAdvice: 'Mountain Highway connects Bayswater to Ringwood efficiently.',
      landmarks: ['Bayswater Station', 'Mountain Highway', 'Bayswater Village'],
      route: 'Travel west along Mountain Highway and continue toward Ringwood Square.',
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

  it('removes timing, stock, price, authority and result guarantees', () => {
    expect(content).not.toMatch(/same-day|15[–-]45 minutes|while-you-wait|priority booking|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('ringwood-east')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Ringwood East | Ali Mobile', customH1: 'Phone & iPhone Repair Near Ringwood East' });
    expect(getServiceAreaBySlug('mitcham')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Mitcham | Ali Mobile', customH1: 'Phone & iPhone Repair Near Mitcham' });
    expect(getServiceAreaBySlug('boronia')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Boronia | Ali Mobile', customH1: 'Phone & iPhone Repair Near Boronia' });
    expect(getServiceAreaBySlug('blackburn')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Blackburn | Ali Mobile', customH1: 'Phone & iPhone Repair Near Blackburn' });
    expect(getServiceAreaBySlug('burwood')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Burwood | Ali Mobile', customH1: 'Phone & iPhone Repair Near Burwood' });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Doncaster | Ali Mobile', customH1: 'Phone & iPhone Repair Near Doncaster' });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Glen Waverley & Syndal | Ali Mobile', customH1: 'Phone & iPhone Repair Near Glen Waverley and Syndal' });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Croydon | Ali Mobile', customH1: 'Phone & iPhone Repair Near Croydon' });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({ metaTitle: 'Phone & iPhone Repair Near Nunawading | Ali Mobile Ringwood', customH1: 'Phone & iPhone Repair Near Nunawading' });
  });
});
