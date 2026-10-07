import { describe, expect, it } from 'vitest';

import {
  getAliMobileEnhancedSamsungRepairType,
  getAliMobileEnhancedSamsungSeoPocket,
} from './index';
import { getSamsungWhyChooseContent } from './why-choose';
import {
  SAMSUNG_HARDWARE_CONFIG,
  SAMSUNG_STANDARD_REPAIR_TURNAROUND_MINUTES,
} from './config';

const samsungRoute = (model: string, repairType: string) => ({
  category: 'phone',
  brand: 'samsung',
  model,
  'repair-type': repairType,
});

describe('standard Samsung detail families', () => {
  it.each([
    ['screen-replacement', 30, 'Screen Replacement'],
    ['battery-replacement', 30, 'Battery Replacement'],
    ['charging-port-replacement', 30, 'Charging Port Replacement'],
    ['back-glass-replacement', 20, 'Back Glass Replacement'],
    ['front-camera-replacement', 30, 'Front Camera Replacement'],
    ['back-camera-replacement', 30, 'Back Camera Replacement'],
    ['logic-board-repair', 30, 'Logic Board Repair'],
  ] as const)('uses one semantic turnaround source for %s', (repairType, turnaroundMinutes, repairName) => {
    const pocket = getAliMobileEnhancedSamsungSeoPocket({
      ...samsungRoute('galaxy-s25', repairType),
      repairType,
      pocket: null,
    });

    expect(pocket?.turnaroundMinutes).toBe(turnaroundMinutes);
    expect(pocket?.faq[0]).toMatchObject({
      question: `How long does Galaxy S25 ${repairName} usually take?`,
    });
  });

  it('uses the canonical Back Glass route for the Galaxy S family', () => {
    expect(getAliMobileEnhancedSamsungRepairType(samsungRoute('galaxy-s25', 'back-glass-replacement')))
      .toBe('back-glass-replacement');
  });

  it('makes the active Galaxy A logic-board route reach the standard family pocket', () => {
    expect(getAliMobileEnhancedSamsungRepairType(samsungRoute('galaxy-a16', 'logic-board-repair')))
      .toBe('logic-board-repair');
  });

  it('keeps the public Back Glass route on family-specific Samsung support content', () => {
    const content = getSamsungWhyChooseContent('Galaxy S25')['back-glass-replacement'];

    expect(content?.heading).toContain('back glass replacement');
    expect(content?.intro).toMatch(/rear (glass|panel)/i);
  });

  it('builds Samsung-specific Why Choose content for every Galaxy Note standard family', () => {
    const content = getSamsungWhyChooseContent('Galaxy Note 8');

    for (const repairType of Object.keys(SAMSUNG_STANDARD_REPAIR_TURNAROUND_MINUTES)) {
      expect(content[repairType]).toBeDefined();
    }

    const visibleText = Object.values(content)
      .flatMap((entry) => [entry.heading, entry.intro, ...entry.cards.flatMap((card) => card.points)])
      .join(' ');
    expect(visibleText).not.toMatch(/Fast Turnaround|Timeframe Varies|same-day|same day|immediate|while you wait/i);
  });

  it('replaces a family timing FAQ instead of layering a second timing answer over it', () => {
    const pocket = getAliMobileEnhancedSamsungSeoPocket({
      ...samsungRoute('galaxy-z-fold-7', 'screen-replacement'),
      repairType: 'screen-replacement',
      pocket: null,
    });

    expect(pocket?.faq.filter((faq) => /how long/i.test(faq.question) && /take/i.test(faq.question))).toHaveLength(1);
  });

  it('keeps every configured Samsung standard family on its family-specific pocket', () => {
    for (const config of Object.values(SAMSUNG_HARDWARE_CONFIG)) {
      for (const [repairType, turnaroundMinutes] of Object.entries(SAMSUNG_STANDARD_REPAIR_TURNAROUND_MINUTES)) {
        const pocket = getAliMobileEnhancedSamsungSeoPocket({
          ...samsungRoute(config.modelSlug, repairType),
          repairType,
          pocket: null,
        });

        expect(pocket?.turnaroundMinutes).toBe(turnaroundMinutes);
      }
    }
  });

  it('keeps Water Damage outside the standard Samsung family rollout', () => {
    expect(getAliMobileEnhancedSamsungRepairType(samsungRoute('galaxy-s25', 'water-damage-repair')))
      .toBeNull();
  });
});
