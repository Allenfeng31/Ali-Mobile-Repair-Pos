import { describe, expect, it } from 'vitest';
import { displayBrand, parseItem } from './inventoryUtils';

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
});
