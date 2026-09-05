import { describe, expect, it } from 'vitest';

import { SERVICE_AREAS, getServiceAreaBySlug } from './serviceAreas';

describe('Heathmont service area', () => {
  const area = getServiceAreaBySlug('heathmont');
  const visibleContent = [
    area?.customIntro,
    area?.customLocalSection?.title,
    ...(area?.customLocalSection?.paragraphs || []),
    area?.customScenarioSection?.title,
    ...(area?.customScenarioSection?.paragraphs || []),
    ...(area?.customFaqs?.flatMap((faq) => [faq.question, faq.answer]) || []),
    ...(area?.customLinks?.map((link) => link.label) || []),
  ].join(' ');

  it('keeps the established Heathmont metadata and one matching slug', () => {
    expect(SERVICE_AREAS.filter((serviceArea) => serviceArea.slug === 'heathmont')).toHaveLength(1);
    expect(area).toMatchObject({
      metaTitle: 'Phone, Apple & MacBook Repair Near Heathmont | Ali Mobile Ringwood',
      customH1: 'Phone, Apple & MacBook Repair Near Heathmont',
      metaDescription: 'Need phone, iPhone, Apple, MacBook or screen repair near Heathmont? Visit Kiosk C1 inside Ringwood Square for quote-first repair support.',
    });
  });

  it('covers the supported phone, tablet and MacBook repair scope', () => {
    for (const term of ['Heathmont', 'Kiosk C1', 'opposite Bunnings Warehouse Ringwood', 'phone', 'iPhone', 'Samsung', 'Google Pixel', 'iPad', 'MacBook', 'screen', 'glass', 'battery', 'charging', 'camera', 'no-power']) {
      expect(visibleContent).toContain(term);
    }
    expect(visibleContent).toContain('MacBook repair near Heathmont');
    expect(visibleContent).toContain('hardware issues');
  });

  it('keeps the one Ringwood Square counter and original Heathmont travel fields', () => {
    expect(visibleContent).toContain('We do not operate a branch, shop, counter or collection point in Heathmont.');
    expect(visibleContent).toContain('Free underground and outdoor parking is available at Ringwood Square.');
    expect(area).toMatchObject({
      driveTime: 'About 5 minutes',
      transitAdvice: 'Travel via Canterbury Road or Heathmont Road toward Ringwood.',
      landmarks: ['Heathmont Station', 'Canterbury Road', 'Dandenong Creek Trail'],
      route: 'Drive north toward Maroondah Highway and park at Ringwood Square Shopping Centre.',
    });
  });

  it('uses the four approved internal links in order', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/laptop/macbook', label: 'MacBook hardware assessment options' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
  });

  it('keeps explicit business-boundary denials while excluding unsupported guarantees', () => {
    expect(visibleContent).toContain('this service does not include general computer repair, managed IT, networking, software administration, remote support or on-site IT service.');
    expect(visibleContent).not.toMatch(/15[–-]45|same-day|No Fix No Charge|in stock for your visit|ensure we have|hold|price guarantee|authorized|data recovery|near Coles|inside Bunnings|near Bunnings/i);
  });
});
