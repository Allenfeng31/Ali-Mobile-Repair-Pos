import { describe, expect, it } from 'vitest';
import { displayBrand, parseItem, slugify } from './inventoryUtils';

describe('parseItem', () => {
  it('maps iPad rows that are stored under P Other into the tablet brand/model with the POS price', () => {
    const parsed = parseItem({
      id: 1138,
      name: 'iPad Pro 12.9-inch 3rd Generation Screen Replacement',
      model: 'P Other||T iPad iPad Pro 12.9-inch 3rd Generation',
      device_model: 'A1876, A2014',
      price: 350,
      category: 'Screen Replacement',
      quality_grade: 'Standard',
      is_recommended: false,
    });

    expect(parsed).toMatchObject({
      brand: 'T iPad',
      deviceModel: 'iPad Pro 12.9-inch 3rd Generation',
      service: 'Screen Replacement',
      price: 350,
      deviceType: 'tablet',
    });
    expect(displayBrand(parsed!.brand)).toBe('iPad');
  });

  it('keeps priced core repairs even when the POS category is Other', () => {
    const parsed = parseItem({
      id: 2001,
      name: 'iPad 10th Generation Battery Service',
      model: 'P Other||T iPad iPad 10th Generation',
      device_model: 'A2696, A2757',
      price: 140,
      category: 'Other',
      quality_grade: 'Genuine',
      is_recommended: true,
    });

    expect(parsed).toMatchObject({
      brand: 'T iPad',
      deviceModel: 'iPad 10th Generation',
      service: 'Battery Replacement',
      price: 140,
      deviceType: 'tablet',
    });
  });

  it.each([
    ['iPhone 14', 'Loudspeaker Replacement', 'loudspeaker-replacement'],
    ['iPhone 13 mini', 'Earpiece Speaker Replacement', 'earpiece-speaker-replacement'],
    ['iPhone 14 Plus', 'Microphone Replacement', 'microphone-replacement'],
    ['iPhone 15 Pro', 'Power Button Replacement', 'power-button-replacement'],
    ['iPhone 16 Pro Max', 'Volume Button Replacement', 'volume-button-replacement'],
    ['iPhone SE 3', 'Loudspeaker Replacement', 'loudspeaker-replacement'],
  ])('parses %s %s without a flex-cable collision or model-prefixed slug', (model, repairName, repairSlug) => {
    const parsed = parseItem({
      id: 3000,
      name: `${model} ${repairName}`,
      model: `P iPhone||${model} ${repairName}`,
      device_model: 'A2893',
      price: 180,
      category: repairName,
      quality_grade: 'Standard',
      is_recommended: false,
    });

    expect(parsed).toMatchObject({
      brand: 'P iPhone',
      deviceModel: model,
      service: repairName,
      deviceType: 'phone',
    });
    expect(slugify(parsed!.service)).toBe(repairSlug);
    expect(slugify(parsed!.service)).not.toContain('iphone');
    expect(parsed!.service).not.toBe('Flex Cable');
  });

  it('keeps legacy generic Power Button rows mapped to Flex Cable', () => {
    const parsed = parseItem({
      id: 3001,
      name: 'Power Button',
      model: 'P iPhone||iPhone 14',
      price: 120,
      category: 'Power Button',
      quality_grade: 'Standard',
      is_recommended: false,
    });

    expect(parsed?.service).toBe('Flex Cable');
  });
});
