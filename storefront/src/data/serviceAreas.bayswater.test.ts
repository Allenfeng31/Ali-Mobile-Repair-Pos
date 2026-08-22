import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Bayswater service area', () => {
  const area = getServiceAreaBySlug('bayswater');
  const content = JSON.stringify(area);

  it('keeps one Bayswater area with the approved dual-core metadata', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'bayswater')).toHaveLength(1);
    expect(area?.metaTitle).toBe('Phone, MacBook & Laptop Repair Near Bayswater | Ali Mobile');
    expect(area?.customH1).toBe('Phone, MacBook & Laptop Repair Near Bayswater');
    expect(area?.metaDescription).toBe('Phone, iPhone, MacBook and supported laptop repair near Bayswater at Ringwood Square Kiosk C1, with model checks and confirmed quotes before work.');

    for (const term of ['Phone', 'MacBook', 'Laptop', 'Bayswater']) {
      expect(area?.metaTitle).toContain(term);
      expect(area?.customH1).toContain(term);
    }
    for (const term of ['Computer', 'PC', 'IT', 'data recovery', 'same-day', 'authorized']) {
      expect(area?.metaTitle).not.toContain(term);
      expect(area?.customH1).not.toContain(term);
    }
  });

  it('covers Phone and MacBook or Laptop as equal hardware-focused scenarios', () => {
    for (const term of ['iPhone', 'Samsung', 'Google Pixel', 'MacBook Air', 'MacBook Pro', 'supported laptop', 'iPad', 'screen', 'battery', 'charging', 'camera', 'no-power']) {
      expect(content).toContain(term);
    }
    expect(area?.customScenarioSection?.title).toContain('Phone and laptop');
    expect(area?.customScenarioSection?.paragraphs.join(' ')).toContain('supported hardware repair');

    const itAnswer = area?.customFaqs?.find((faq) => faq.question.includes('general computer repair'))?.answer;
    expect(itAnswer).toContain('We do not provide general computer repair, general PC repair, IT support, managed IT, networking, software administration, remote support or on-site IT support.');
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
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware repair options' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('removes timing, stock, price, authority and result guarantees', () => {
    expect(content).not.toMatch(/same-day|15[–-]45 minutes|while-you-wait|priority booking|hold (?:a )?(?:screen|battery|part)|reserve (?:a )?part|in stock|cheapest|price guarantee|guaranteed repair|guaranteed data recovery|authorized service centre|no fix, no charge/i);
  });

  it('does not change protected nearby-area title and H1 positioning', () => {
    expect(getServiceAreaBySlug('ringwood-east')).toMatchObject({ metaTitle: 'Phone, iPhone & MacBook Repair Near Ringwood East | Ali Mobile', customH1: 'Phone, iPhone & MacBook Repair Near Ringwood East' });
    expect(getServiceAreaBySlug('mitcham')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Mitcham | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Mitcham' });
    expect(getServiceAreaBySlug('boronia')).toMatchObject({ metaTitle: 'Phone, iPhone & MacBook Repair Near Boronia | Ali Mobile', customH1: 'Phone, iPhone & MacBook Repair Near Boronia' });
    expect(getServiceAreaBySlug('blackburn')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Blackburn | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Blackburn' });
    expect(getServiceAreaBySlug('burwood')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Burwood | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Burwood' });
    expect(getServiceAreaBySlug('doncaster')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Doncaster | Ali Mobile', customH1: 'Apple, MacBook & Phone Repair Near Doncaster' });
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({ metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile', customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal' });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({ metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile', customH1: 'Phone, iPhone, iPad & MacBook Repair Near Croydon' });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({ metaTitle: 'Apple, MacBook & Phone Repair Near Nunawading | Ali Mobile Ringwood', customH1: 'Apple, MacBook & Phone Repair Near Nunawading' });
  });
});
