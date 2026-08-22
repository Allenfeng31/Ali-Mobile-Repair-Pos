import { describe, expect, it } from 'vitest';

import { buildLocationBreadcrumbItems } from '@/app/(public)/locations/[suburb]/locationBreadcrumbs';

import { getServiceAreaBySlug } from './serviceAreas';

describe('Doncaster service area', () => {
  const area = getServiceAreaBySlug('doncaster');
  const content = JSON.stringify(area);

  it('replaces every Doncaster fallback field with the approved Apple and MacBook content', () => {
    expect(area?.metaTitle).toBe('Apple, MacBook & Phone Repair Near Doncaster | Ali Mobile');
    expect(area?.customH1).toBe('Apple, MacBook & Phone Repair Near Doncaster');
    expect(area?.metaDescription).toBe('Apple, MacBook, iPhone, Samsung and iPad repair near Doncaster at Ringwood Square Kiosk C1, with model checks and a confirmed quote before work.');
    expect(area?.customIntro).toBeDefined();
    expect(area?.customLocalSection).toBeDefined();
    expect(area?.customScenarioSection).toBeDefined();
    expect(area?.customFaqs).toBeDefined();
    expect(area?.customLinks).toBeDefined();
  });

  it('keeps Apple and MacBook primary while covering the supported device range', () => {
    for (const device of ['Apple', 'MacBook', 'Phone']) {
      expect(area?.metaTitle).toContain(device);
      expect(area?.customH1).toContain(device);
    }

    for (const device of ['iPhone', 'Samsung', 'Google Pixel', 'iPad']) {
      expect(content).toContain(device);
    }
    expect(area?.customScenarioSection?.title).toContain('Apple and MacBook');
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
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung repair options by model' },
      { href: '/repairs/tablet/ipad', label: 'iPad repair assessment options' },
    ]);
    expect(new Set(area?.customLinks?.map((link) => link.href)).size).toBe(4);
  });

  it('does not add stock, time, price, authority or IT-service promises', () => {
    expect(content).not.toMatch(/same-day|in stock|hold (?:a )?part|lowest price|guaranteed repair|authorized service centre/i);
    const itAnswer = area?.customFaqs?.find((faq) => faq.question.includes('general IT support'))?.answer;
    expect(itAnswer).toContain('do not provide general or managed IT, network support or on-site computer service');
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
  });
});
