import { describe, expect, it } from 'vitest';

import { buildLocationBreadcrumbItems } from '@/app/(public)/locations/[suburb]/locationBreadcrumbs';

import { getServiceAreaBySlug } from './serviceAreas';

describe('Doncaster service area', () => {
  const area = getServiceAreaBySlug('doncaster');
  const content = JSON.stringify(area);

  it('keeps Doncaster phone-first configured content', () => {
    expect(area?.metaTitle).toBe('Phone & iPhone Repair Near Doncaster | Ali Mobile');
    expect(area?.customH1).toBe('Phone & iPhone Repair Near Doncaster');
    expect(area?.metaDescription).toBe('Phone, iPhone, Samsung and iPad repair near Doncaster at Ringwood Square Kiosk C1, with model checks and a confirmed quote before work.');
    expect(area?.customIntro).toBeDefined();
    expect(area?.customLocalSection).toBeDefined();
    expect(area?.customScenarioSection).toBeDefined();
    expect(area?.customFaqs).toBeDefined();
    expect(area?.customLinks).toBeDefined();
  });

  it('keeps phone and iPhone primary while covering the supported device range', () => {
    for (const device of ['Phone', 'iPhone']) {
      expect(area?.metaTitle).toContain(device);
      expect(area?.customH1).toContain(device);
    }

    for (const device of ['iPhone', 'Samsung', 'Google Pixel', 'iPad']) {
      expect(content).toContain(device);
    }
    expect(area?.customScenarioSection?.title).toContain('Phone and device');
  });

  it('keeps Doncaster East and Doncaster Heights as supported travel areas, not branches', () => {
    expect(content).toContain('Doncaster East');
    expect(content).toContain('Doncaster Heights');

    const branchAnswer = area?.customFaqs?.find((faq) => faq.question.includes('repair shop'))?.answer;
    expect(branchAnswer).toContain('There is no Doncaster, Doncaster East or Doncaster Heights branch, counter or collection point.');
    expect(branchAnswer).toContain('Kiosk C1 inside Ringwood Square Shopping Centre, opposite Bunnings Warehouse Ringwood.');
  });

  it('uses the four approved device-hub links without duplicates', () => {
    expect(area?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('does not add computer-service, time, price or authority promises', () => {
    expect(content).not.toMatch(/same-day|in stock|hold (?:a )?part|lowest price|guaranteed repair|authorized service centre/i);
    expect(content).not.toMatch(/computer|IT support|managed IT|network support|on-site computer/i);
  });

  it('keeps the canonical location ownership and slug unchanged', () => {
    expect(area?.slug).toBe('doncaster');
    expect(buildLocationBreadcrumbItems('https://www.alimobile.com.au', area!)[1]).toMatchObject({
      item: 'https://www.alimobile.com.au/locations/doncaster',
      name: 'Doncaster',
    });
  });

  it('does not change the protected nearby area positioning', () => {
    expect(getServiceAreaBySlug('glenwaverley')).toMatchObject({
      metaTitle: 'Phone & iPhone Repair Near Glen Waverley & Syndal | Ali Mobile',
      customH1: 'Phone & iPhone Repair Near Glen Waverley and Syndal',
    });
    expect(getServiceAreaBySlug('croydon')).toMatchObject({
      metaTitle: 'Phone & iPhone Repair Near Croydon | Ali Mobile',
      customH1: 'Phone & iPhone Repair Near Croydon',
    });
    expect(getServiceAreaBySlug('nunawading')).toMatchObject({
      metaTitle: 'Phone & iPhone Repair Near Nunawading | Ali Mobile Ringwood',
      customH1: 'Phone & iPhone Repair Near Nunawading',
    });
  });
});
