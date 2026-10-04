import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Ringwood East service area', () => {
  const area = getServiceAreaBySlug('ringwood-east');
  const content = JSON.stringify(area);

  it('keeps one Ringwood East area with the approved Phone-led metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'ringwood-east')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone & iPhone Repair Near Ringwood East | Ali Mobile');
    expect(area?.customH1).toBe('Phone & iPhone Repair Near Ringwood East');
    expect(area?.metaDescription).toBe('Phone, iPhone, Samsung and tablet repair support near Ringwood East at Ringwood Square Kiosk C1, with model checks and a confirmed quote before supported work.');

    for (const term of ['Phone', 'iPhone', 'Ringwood East']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['computer', 'IT support', 'data recovery', 'Apple', 'same-day', 'authorised', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('keeps phone and iPhone primary with a secondary MacBook link-out', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'iPad', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
    expect(area?.customScenarioSection?.title).toContain('Phone-first');
    expect(area?.customLinks).toContainEqual({ href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' });
    expect(content).not.toMatch(/computer|IT support|managed IT|network support|on-site computer/i);
  });

  it('keeps the one Ringwood Square location and original Ringwood East travel fields', () => {
    expect(content).toContain('Ali Mobile & Repair is located at Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
    expect(content).toContain('Free underground and outdoor parking is available at Ringwood Square.');
    expect(content).not.toMatch(/Coles/i);

    const locationAnswer = area?.customFaqs?.find((faq) => faq.question.includes('shop in Ringwood East'))?.answer;
    expect(locationAnswer).toContain('There is no Ringwood East branch, shop, counter or collection point.');
    expect(area).toMatchObject({
      driveTime: 'About 5 minutes',
      transitAdvice: 'A simple trip along Maroondah Highway or through Ringwood East Village.',
      landmarks: ['Ringwood East Station', 'Maroondah Highway', 'Ringwood Lake'],
      route: 'Head west toward Ringwood Square and use the centre parking near Maroondah Highway.',
    });
  });

  it('uses the four approved repair links in order without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('removes timing, stock, price, authority and result guarantees', () => {
    expect(content).not.toMatch(/same-day|15[–-]45 minutes|while-you-wait|priority booking|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
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
