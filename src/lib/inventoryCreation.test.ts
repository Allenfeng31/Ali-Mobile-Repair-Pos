import { describe, expect, it } from 'vitest';

import {
  buildBulkRepairRows,
  deriveRepairBrandOptions,
  isDuplicateRepairRow,
  priceLabel,
  repairBrandOptionsForCategory,
  REPAIR_DEVICE_CATEGORIES,
} from './inventoryCreation';

describe('repair product creation vocabulary', () => {
  const options = deriveRepairBrandOptions(
    ['iPhone', 'Samsung', 'iPad', 'MacBook', 'Apple Watch'],
    [{ model: 'P Motorola||Moto G24' }, { brand: 'P samsung' }],
  );

  it('exposes Phone, Tablet, Laptop, and Watch before a brand is selected', () => {
    expect(REPAIR_DEVICE_CATEGORIES.map((category) => category.value)).toEqual([
      'Phone', 'Tablet', 'Laptop', 'Watch',
    ]);
  });

  it('keeps iPhone under Phone and derives Motorola from current inventory', () => {
    expect(repairBrandOptionsForCategory(options, 'Phone')).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'iPhone', value: 'P iPhone' }),
      expect.objectContaining({ label: 'Motorola', value: 'P Motorola' }),
    ]));
  });

  it('deduplicates brands case-insensitively within a device category', () => {
    expect(repairBrandOptionsForCategory(options, 'Phone').filter((option) => option.label.toLowerCase() === 'samsung'))
      .toHaveLength(1);
  });

  it('changes the available brands when the device category changes', () => {
    expect(repairBrandOptionsForCategory(options, 'Tablet').map((option) => option.label)).toContain('iPad');
    expect(repairBrandOptionsForCategory(options, 'Watch').map((option) => option.label)).toContain('Apple Watch');
  });

  it('detects duplicate repair rows without silently overwriting them', () => {
    expect(isDuplicateRepairRow(
      [{ model: 'P Motorola||Moto G24', name: 'Moto G24 Screen Replacement' }],
      'P Motorola',
      'Moto G24',
      'Screen Replacement',
    )).toBe(true);
  });

  it('labels blank and zero repair prices as Quote', () => {
    expect(priceLabel('')).toBe('Quote');
    expect(priceLabel(0)).toBe('Quote');
    expect(priceLabel('129')).toBe('$129.00');
  });

  it('builds only selected repair rows with their individual cost and price', () => {
    const result = buildBulkRepairRows({
      inventory: [],
      brand: 'P Motorola',
      modelName: 'Moto G24',
      deviceModel: 'XT2423-2',
      templates: [
        { label: 'Screen Replacement', iconName: 'Smartphone' },
        { label: 'Battery Replacement', iconName: 'Battery' },
      ],
      selections: {
        'Screen Replacement': { selected: true, price: '149', costPrice: '65' },
        'Battery Replacement': { selected: false, price: '99', costPrice: '35' },
      },
    });

    expect(result.duplicateCount).toBe(0);
    expect(result.rows).toEqual([expect.objectContaining({
      name: 'Moto G24 Screen Replacement',
      model: 'P Motorola||Moto G24',
      category: 'Screen Replacement',
      price: 149,
      costPrice: 65,
    })]);
  });
});
