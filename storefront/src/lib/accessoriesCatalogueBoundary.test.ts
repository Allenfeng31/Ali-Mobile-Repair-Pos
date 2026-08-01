import { describe, expect, it } from 'vitest';

import { transformPOSToCatalog } from './api';

describe('Accessories public catalogue boundary', () => {
  it('does not emit an Accessories category, brand, model, or repair detail from POS inventory', () => {
    const catalogue = transformPOSToCatalog([
      {
        id: 1,
        name: 'USB-C Fast Charger',
        model: 'Accessories||Accessories',
        category: 'Accessories',
        sku: 'CHG-USB-C-20W',
        price: 29,
      },
      {
        id: 2,
        name: 'iPhone 15 Screen Replacement',
        model: 'P iPhone||iPhone 15',
        category: 'Screen Replacement',
        price: 199,
      },
    ]);

    expect(catalogue).toHaveLength(1);
    expect(catalogue[0]).toMatchObject({ category: 'phone', slug: 'iphone' });
    expect(JSON.stringify(catalogue).toLowerCase()).not.toContain('accessories');
    expect(JSON.stringify(catalogue).toLowerCase()).not.toContain('charger');
  });
});
