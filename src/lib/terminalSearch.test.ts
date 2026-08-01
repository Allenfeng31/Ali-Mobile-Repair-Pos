import { describe, expect, it } from 'vitest';

import { matchesTerminalSearch, terminalCategoryOptions } from './terminalSearch';

describe('Terminal accessory search', () => {
  const accessory = {
    name: 'USB-C Fast Charger',
    sku: 'CHG-USB-C-20W',
    category: 'Accessories',
    model: 'Accessories',
  };

  it('keeps product-name search working after the unified Accessories category is applied', () => {
    expect(matchesTerminalSearch(accessory, 'fast charger')).toBe(true);
  });

  it('keeps SKU search working after the unified Accessories category is applied', () => {
    expect(matchesTerminalSearch(accessory, 'chg-usb-c-20w')).toBe(true);
  });

  it('renders exactly one Accessories quick category even with legacy category spellings', () => {
    expect(terminalCategoryOptions(['Phone Repair', 'Accessory', 'Accessories', 'Phone Accessories'])
      .filter((category) => category === 'Accessories')).toHaveLength(1);
  });
});
