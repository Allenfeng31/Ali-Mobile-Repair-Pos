import { expect, test } from 'vitest';
import { transformFormDataToInventoryRows } from './inventoryTransform';

test('transforms form data with variants into database rows', () => {
  const baseData = {
    name: "iPhone 14 Pro Max Screen Replacement",
    model: "Apple||iPhone 14 Pro Max",
    device_model: "A2894",
    category: "Phone Repair",
    is_pinned: false,
    pin_order: 0,
    iconName: "Smartphone",
  };

  const variants = [
    { quality_grade: "Standard", price: 170, costPrice: 50, stock: 10, minStock: 5 },
    { quality_grade: "Premium", price: 220, costPrice: 80, stock: 5, minStock: 2 }
  ];

  const result = transformFormDataToInventoryRows(baseData, variants);

  expect(result).toHaveLength(2);
  
  expect(result[0]).toEqual({
    name: "iPhone 14 Pro Max Screen Replacement",
    model: "Apple||iPhone 14 Pro Max",
    device_model: "A2894",
    category: "Phone Repair",
    is_pinned: false,
    pin_order: 0,
    iconName: "Smartphone",
    quality_grade: "Standard",
    price: 170,
    costPrice: 50,
    stock: 10,
    minStock: 5,
    margin: 71, // round((170 - 50) / 170 * 100) = 71
    status: "in-stock"
  });

  expect(result[1]).toEqual({
    name: "iPhone 14 Pro Max Screen Replacement",
    model: "Apple||iPhone 14 Pro Max",
    device_model: "A2894",
    category: "Phone Repair",
    is_pinned: false,
    pin_order: 0,
    iconName: "Smartphone",
    quality_grade: "Premium",
    price: 220,
    costPrice: 80,
    stock: 5,
    minStock: 2,
    margin: 64, // round((220 - 80) / 220 * 100) = 64
    status: "in-stock"
  });
});
