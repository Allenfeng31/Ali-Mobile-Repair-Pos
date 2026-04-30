import { describe, it, expect } from 'vitest';
import { groupRepairsByVariant } from './groupRepairsByVariant';

/**
 * TDD Cycle 1 — RED
 * 
 * Behavior: Items with the same device_model and service name but different
 * quality_grade should be grouped into a single repair entry containing
 * an array of variants.
 */
describe('groupRepairsByVariant', () => {
  it('groups items with different quality grades into variants', () => {
    const items = [
      {
        id: 1,
        name: 'iPhone 13 Screen Replacement',
        model: 'iPhone||iPhone 13',
        device_model: 'A2633',
        price: 89,
        category: 'Phone Repair',
        quality_grade: 'Budget',
      },
      {
        id: 2,
        name: 'iPhone 13 Screen Replacement',
        model: 'iPhone||iPhone 13',
        device_model: 'A2633',
        price: 189,
        category: 'Phone Repair',
        quality_grade: 'Premium',
      },
    ];

    const result = groupRepairsByVariant(items);

    expect(result).toHaveLength(1);
    expect(result[0].service).toBe('Screen Replacement');
    expect(result[0].variants).toHaveLength(2);
    expect(result[0].variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ quality_grade: 'Budget', price: 89 }),
        expect.objectContaining({ quality_grade: 'Premium', price: 189 }),
      ])
    );
  });

  it('handles legacy items without quality_grade by defaulting to Standard', () => {
    const items = [
      {
        id: 3,
        name: 'iPhone 13 Battery Replacement',
        model: 'iPhone||iPhone 13',
        device_model: 'A2633',
        price: 99,
        category: 'Phone Repair',
      },
    ];

    const result = groupRepairsByVariant(items);

    expect(result).toHaveLength(1);
    expect(result[0].variants).toHaveLength(1);
    expect(result[0].variants[0]).toEqual(
      expect.objectContaining({ quality_grade: 'Standard', price: 99 })
    );
  });
});
