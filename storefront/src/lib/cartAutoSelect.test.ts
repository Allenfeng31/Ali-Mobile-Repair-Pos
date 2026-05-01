import { describe, it, expect } from 'vitest';
import { resolveInitialCartState } from './cartAutoSelect';
import { ParsedItem } from './inventoryUtils';

describe('cartAutoSelect', () => {
  const mockInventory: ParsedItem[] = [
    {
      id: 1,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Screen Replacement',
      price: 200,
      quality_grade: 'Standard',
      itemCode: 'IP14PM-SCR-STD',
      name: 'iPhone 14 Pro Max Screen Replacement Standard'
    },
    {
      id: 2,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Screen Replacement',
      price: 300,
      quality_grade: 'Genuine',
      itemCode: 'IP14PM-SCR-GEN',
      name: 'iPhone 14 Pro Max Screen Replacement Genuine'
    },
    {
      id: 3,
      category: 'phone',
      brand: 'iPhone',
      deviceModel: 'iPhone 14 Pro Max',
      service: 'Battery Replacement',
      price: 150,
      quality_grade: 'Standard',
      itemCode: 'IP14PM-BAT-STD',
      name: 'iPhone 14 Pro Max Battery Replacement'
    }
  ];

  it('should return nulls if params are missing', () => {
    const result = resolveInitialCartState(null, null, null, mockInventory);
    expect(result.brand).toBeNull();
  });

  it('should not auto-select but should expand if service has multiple variants', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Screen Replacement', mockInventory);
    expect(result.brand).toBe('iPhone');
    expect(result.model).toBe('iPhone 14 Pro Max');
    expect(result.serviceToSelect).toBeNull();
    expect(result.serviceToExpand).toBe('Screen Replacement');
    expect(result.shouldAutoConfirm).toBe(false);
  });

  it('should auto-select and auto-confirm if service has only one variant', () => {
    const result = resolveInitialCartState('iPhone', 'iPhone 14 Pro Max', 'Battery Replacement', mockInventory);
    expect(result.brand).toBe('iPhone');
    expect(result.model).toBe('iPhone 14 Pro Max');
    expect(result.serviceToSelect).not.toBeNull();
    expect(result.serviceToSelect?.id).toBe(3);
    expect(result.serviceToExpand).toBeNull();
    expect(result.shouldAutoConfirm).toBe(true);
  });
});
