import { describe, it, expect } from 'vitest';
import { groupServicesByBaseName } from './inventoryUtils';
import { ParsedItem } from './inventoryUtils';

describe('groupServicesByBaseName', () => {
  it('groups items with the same service name into variants', () => {
    const items: ParsedItem[] = [
      {
        id: 1,
        name: 'Screen Replacement',
        brand: 'iPhone',
        deviceModel: 'iPhone 13',
        service: 'Screen Replacement',
        price: 89,
        category: 'Phone Repair',
        deviceType: 'phone',
        quality_grade: 'Standard',
        is_recommended: false,
      },
      {
        id: 2,
        name: 'Screen Replacement Premium',
        brand: 'iPhone',
        deviceModel: 'iPhone 13',
        service: 'Screen Replacement',
        price: 189,
        category: 'Phone Repair',
        deviceType: 'phone',
        quality_grade: 'Premium',
        is_recommended: true,
      },
      {
        id: 3,
        name: 'Battery Replacement',
        brand: 'iPhone',
        deviceModel: 'iPhone 13',
        service: 'Battery Replacement',
        price: 99,
        category: 'Phone Repair',
        deviceType: 'phone',
        quality_grade: 'Standard',
        is_recommended: false,
      }
    ];

    const result = groupServicesByBaseName(items);

    expect(result).toHaveLength(2);
    expect(result[0].service).toBe('Screen Replacement');
    expect(result[0].variants).toHaveLength(2);
    expect(result[0].variants[0].quality_grade).toBe('Standard');
    expect(result[0].variants[1].quality_grade).toBe('Premium');

    expect(result[1].service).toBe('Battery Replacement');
    expect(result[1].variants).toHaveLength(1);
    expect(result[1].variants[0].quality_grade).toBe('Standard');
  });
});
