import { describe, expect, it } from 'vitest';

import { getServiceAreaBySlug, SERVICE_AREAS } from './serviceAreas';

const EXPECTED_SERVICE_AREA_SLUGS = [
  'ringwood',
  'ringwood-east',
  'ringwood-north',
  'heathmont',
  'croydon',
  'mitcham',
  'nunawading',
  'boxhill',
  'glenwaverley',
  'wantirna',
  'doncaster',
  'bayswater',
  'boronia',
  'burwood',
  'balwyn',
  'vermont',
  'springvale',
  'kilsyth',
  'mooroolbark',
  'clayton',
  'lilydale',
  'chirnsidepark',
  'ferntreegully',
  'knoxfield',
  'rowville',
  'donvale',
  'parkorchards',
  'warrandyte',
  'blackburn',
  'warranwood',
];

describe('service area location directions', () => {
  const serializedAreas = JSON.stringify(SERVICE_AREAS);

  it('keeps the complete service-area order and slugs unchanged', () => {
    expect(SERVICE_AREAS).toHaveLength(EXPECTED_SERVICE_AREA_SLUGS.length);
    expect(SERVICE_AREAS.map((area) => area.slug)).toEqual(EXPECTED_SERVICE_AREA_SLUGS);
  });

  it('removes Coles from all serialized service-area content', () => {
    expect(serializedAreas).not.toMatch(/coles/i);
  });

  it('uses the complete Bunnings landmark for the core nearby areas', () => {
    for (const slug of ['ringwood', 'ringwood-east', 'ringwood-north', 'heathmont', 'croydon', 'mitcham']) {
      const area = getServiceAreaBySlug(slug);
      const content = JSON.stringify(area);

      expect(content).toContain('opposite Bunnings Warehouse Ringwood');
      expect(content).toContain('Kiosk C1 inside Ringwood Square Shopping Centre');
    }
  });

  it('does not misstate the kiosk as inside or merely near Bunnings', () => {
    expect(serializedAreas).not.toMatch(/inside Bunnings/i);
    expect(serializedAreas).not.toMatch(/near Bunnings/i);
  });

  it('uses the accurate Ringwood Square parking fact', () => {
    expect(serializedAreas).toContain('Free underground and outdoor parking is available at Ringwood Square.');
  });

  it('preserves the committed Glen Waverley title and H1', () => {
    const glenWaverley = getServiceAreaBySlug('glenwaverley');

    expect(glenWaverley).toMatchObject({
      metaTitle: 'MacBook & Phone Repair Near Glen Waverley & Syndal | Ali Mobile',
      customH1: 'MacBook, Laptop & Phone Repair Near Glen Waverley and Syndal',
    });
  });

  it('preserves Croydon identity, links and the tightened claim boundaries', () => {
    const croydon = getServiceAreaBySlug('croydon');
    const content = JSON.stringify(croydon);

    expect(croydon).toMatchObject({
      metaTitle: 'Phone, iPhone, iPad & MacBook Repair Near Croydon | Ali Mobile',
      customH1: 'Phone, iPhone, iPad & MacBook Repair Near Croydon',
    });
    expect(croydon?.customLinks).toEqual([
      { href: '/repairs/phone/iphone', label: 'iPhone repair options by model' },
      { href: '/repairs/phone/samsung', label: 'Samsung phone repair options' },
      { href: '/repairs/laptop/macbook', label: 'MacBook repair assessment options' },
      { href: '/repairs/screen-replacement', label: 'Screen repair pathways' },
    ]);
    expect(content).not.toMatch(/authorized|service centre|hold a screen or battery|20 to 40 minutes|general IT|managed IT|on-site computer support/i);
  });
});
