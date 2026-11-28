/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';

const { createInventoryAccessHandlers, PUBLIC_INVENTORY_SELECT } = require('./inventoryAccess.js');

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function client(result) {
  const range = vi.fn().mockResolvedValue(result);
  const order = vi.fn(() => ({ range }));
  const select = vi.fn(() => ({ order }));
  return { from: vi.fn(() => ({ select })), select, range };
}

describe('inventory response boundaries', () => {
  it('returns only public repair fields without reading or serializing internal inventory data', async () => {
    const supabase = client({
      data: [
        {
          id: 1,
          name: 'Screen Replacement',
          model: 'P iPhone||iPhone 14 Pro Max',
          device_model: 'A2894',
          price: 169,
          category: 'Phone Repair',
          quality_grade: 'Standard',
          is_recommended: false,
          status: 'Active',
          costPrice: 80,
          margin: 89,
          stock: 4,
          minStock: 2,
          sku: 'private-sku',
        },
        { id: 2, name: 'Case', model: 'Accessories', category: 'Accessories', price: 20, status: 'Active' },
        { id: 3, name: 'Old Repair', model: 'P iPhone||Old', category: 'Phone Repair', price: 50, status: 'Archived' },
      ],
      error: null,
    });
    const res = response();

    await createInventoryAccessHandlers(supabase).listPublic({}, res);

    expect(supabase.select).toHaveBeenCalledWith(PUBLIC_INVENTORY_SELECT);
    expect(PUBLIC_INVENTORY_SELECT).not.toMatch(/cost|margin|stock|minStock|sku/i);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{
      id: 1,
      name: 'Screen Replacement',
      model: 'P iPhone||iPhone 14 Pro Max',
      device_model: 'A2894',
      price: 169,
      category: 'Phone Repair',
      quality_grade: 'Standard',
      is_recommended: false,
    }]);
    expect(JSON.stringify(res.body)).not.toMatch(/costPrice|margin|stock|minStock|sku/i);
  });

  it('keeps full inventory available only through the internal handler', async () => {
    const row = { id: 1, name: 'Repair', costPrice: 80, stock: 4 };
    const supabase = client({ data: [row], error: null });
    const res = response();

    await createInventoryAccessHandlers(supabase).listInternal({}, res);

    expect(supabase.select).toHaveBeenCalledWith('*');
    expect(res.body).toEqual([row]);
  });

  it('returns a generic public failure without database details or fallback prices', async () => {
    const supabase = client({ data: null, error: new Error('column costPrice failed with secret detail') });
    const res = response();

    await createInventoryAccessHandlers(supabase).listPublic({}, res);

    expect(res).toMatchObject({
      statusCode: 503,
      body: { error: 'Public repair pricing is temporarily unavailable.' },
    });
    expect(JSON.stringify(res.body)).not.toContain('costPrice');
  });
});
