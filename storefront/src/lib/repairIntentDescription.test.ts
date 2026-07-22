import { describe, expect, it } from 'vitest';

import { getRepairIntentDescription } from './repairIntentDescription';

const repairIntentCases = [
  ['screen-replacement', 'Screen Replacement', 'cracked glass', 'screen replacement'],
  ['battery-replacement', 'Battery Replacement', 'poor battery life', 'battery replacement'],
  ['charging-port-replacement', 'Charging Port Replacement', 'no charging', 'charging port repair'],
  ['back-glass-replacement', 'Back Glass Replacement', 'cracked rear glass', 'back glass replacement'],
  ['back-camera-replacement', 'Back Camera Replacement', 'rear camera', 'back camera replacement'],
  ['front-camera-replacement', 'Front Camera Replacement', 'selfie camera', 'front camera replacement'],
  ['camera-lens-replacement', 'Camera Lens Replacement', 'cracked lens cover', 'camera lens replacement'],
  ['water-damage-repair', 'Water Damage Repair', 'liquid damage', 'water damage assessment'],
  ['loudspeaker-replacement', 'Loudspeaker Replacement', 'no sound', 'loudspeaker replacement'],
  ['earpiece-speaker-replacement', 'Earpiece Speaker Replacement', 'low call volume', 'earpiece speaker replacement'],
  ['power-button-replacement', 'Power Button Replacement', 'unresponsive', 'power button replacement'],
  ['volume-button-replacement', 'Volume Button Replacement', 'not responding', 'volume button replacement'],
  ['logic-board-repair', 'Logic Board Repair', 'no power', 'logic board repair assessment'],
] as const;

describe('getRepairIntentDescription', () => {
  it.each(repairIntentCases)('creates a concise, local %s description', (repairSlug, repairName, intentPhrase, repairPhrase) => {
    const description = getRepairIntentDescription({
      model: 'iPhone 15',
      repairName,
      repairSlug,
      category: 'phone',
    });

    expect(description).toContain('iPhone 15');
    expect(description).toContain('Ringwood');
    expect(description.toLowerCase()).toContain(intentPhrase);
    expect(description.toLowerCase().match(new RegExp(repairPhrase, 'g'))).toHaveLength(1);
    expect(description.length).toBeLessThanOrEqual(180);
  });

  it('keeps repair-intent descriptions differentiated without repeated repair phrases', () => {
    const descriptions = repairIntentCases.map(([repairSlug, repairName]) =>
      getRepairIntentDescription({ model: 'iPhone 15', repairName, repairSlug, category: 'phone' })
    );

    expect(new Set(descriptions).size).toBe(repairIntentCases.length);
  });

  it('keeps water-damage aliases safety-specific without warranty or recovery guarantees', () => {
    for (const repairSlug of ['water-damage-repair', 'water-damage']) {
      const description = getRepairIntentDescription({
        model: 'iPhone 15',
        repairName: 'Water Damage Repair',
        repairSlug,
        category: 'phone',
      });

      expect(description).toContain('water damage assessment');
      expect(description).not.toMatch(/warranty|6-month|guarantee|guaranteed|restore/i);
    }
  });

  it('keeps standard repairs free from water-damage limitations', () => {
    const description = getRepairIntentDescription({
      model: 'iPhone 15',
      repairName: 'Screen Replacement',
      repairSlug: 'screen-replacement',
      category: 'phone',
    });

    expect(description).not.toMatch(/liquid damage|corrosion|internal cleaning/i);
  });

  it.each([
    ['MacBook Air M2 13 2022', 'Screen Replacement', 'screen-replacement', 'image faults'],
    ['MacBook Air M2 13 2022', 'Logic Board Repair', 'logic-board-repair', 'board-level faults'],
  ])('does not rely on a hard-coded model list for %s %s', (model, repairName, repairSlug, intentPhrase) => {
    const description = getRepairIntentDescription({ model, repairName, repairSlug, category: 'laptop' });

    expect(description).toContain(model);
    expect(description).toContain(intentPhrase);
    expect(description).toContain('Ringwood');
    expect(description).not.toMatch(/touch-screen|touchscreen|phone/i);
    expect(description.length).toBeLessThanOrEqual(190);
  });

  it.each([
    ['iPhone 15', 'phone', true],
    ['iPad Air', 'tablet', true],
    ['Apple Watch Series 9', 'watch', true],
    ['MacBook Air M2 13 2022', 'laptop', false],
    ['Unknown device', undefined, false],
  ])('uses category-aware screen wording for %s', (model, category, allowsTouchWording) => {
    const description = getRepairIntentDescription({
      model,
      repairName: 'Screen Replacement',
      repairSlug: 'screen-replacement',
      category,
    });

    expect(description).toContain(model);
    expect(description).toContain('Ringwood');
    expect(description).toMatch(/screen|display/i);
    expect(description.includes('touch-screen')).toBe(allowsTouchWording);
  });

  it('uses a neutral fallback for generic camera repair', () => {
    const description = getRepairIntentDescription({
      model: 'iPhone 15',
      repairName: 'Camera Repair',
      repairSlug: 'camera-repair',
      category: 'phone',
    });

    expect(description).toContain('camera repair in Ringwood');
    expect(description).not.toMatch(/rear camera|selfie camera|lens cover/i);
  });

  it('uses a neutral fallback for unknown repairs', () => {
    const description = getRepairIntentDescription({
      model: 'iPhone 15',
      repairName: 'Wireless Charging Coil Service',
      repairSlug: 'wireless-charging-coil-service',
      category: 'phone',
    });

    expect(description).toBe(
      'iPhone 15 wireless charging coil service in Ringwood. We inspect the device and confirm the repair path, timing and parts availability before work begins.'
    );
    expect(description).not.toMatch(/cracked|battery|charging port|camera|water damage|logic board/i);
  });
});
