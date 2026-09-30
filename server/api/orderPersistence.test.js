/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import orderPersistence from './orderPersistence.js';

const { insertOrderRecord, normalizeOrderPaymentFields } = orderPersistence;

function createSupabaseInsert(results) {
  const inserted = [];
  const supabase = {
    from: vi.fn(() => ({
      insert: vi.fn((rows) => {
        inserted.push(rows[0]);
        return { select: vi.fn().mockResolvedValue(results.shift()) };
      }),
    })),
  };
  return { inserted, supabase };
}

const mixedOrder = {
  id: 'TK-MIXED',
  timestamp: '2026-09-30T14:00:00.000Z',
  subtotal: 90.91,
  tax: 9.09,
  surcharge: 0,
  total: 100,
  profit: 50,
  type: 'sale',
  paymentMethod: 'mixed',
  mixedCash: 30,
  mixedEftpos: 70,
};

describe('mixed order persistence', () => {
  it('retries legacy lowercase PostgreSQL columns without losing the split', async () => {
    const { inserted, supabase } = createSupabaseInsert([
      { data: null, error: { message: "Could not find the 'mixedCash' column" } },
      { data: [{ ...mixedOrder, mixedcash: 30, mixedeftpos: 70 }], error: null },
    ]);

    const result = await insertOrderRecord(supabase, mixedOrder);

    expect(inserted).toHaveLength(2);
    expect(inserted[0]).toMatchObject({ mixedCash: 30, mixedEftpos: 70 });
    expect(inserted[1]).toMatchObject({ mixedcash: 30, mixedeftpos: 70 });
    expect(inserted[1]).not.toHaveProperty('mixedCash');
    expect(result).toMatchObject({ error: null, order: { mixedCash: 30, mixedEftpos: 70 } });
  });

  it('fails instead of silently saving a mixed order without tender fields', async () => {
    const { inserted, supabase } = createSupabaseInsert([
      { data: null, error: { message: "Could not find the 'mixedCash' column" } },
      { data: null, error: { message: "Could not find the 'mixedcash' column" } },
    ]);

    const result = await insertOrderRecord(supabase, mixedOrder);

    expect(inserted).toHaveLength(2);
    expect(result.order).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('rejects an incomplete or unbalanced split before writing an order', async () => {
    const { inserted, supabase } = createSupabaseInsert([]);

    const missingTender = await insertOrderRecord(supabase, { ...mixedOrder, mixedCash: undefined });
    const unbalancedTender = await insertOrderRecord(supabase, { ...mixedOrder, mixedCash: 20 });

    expect(inserted).toHaveLength(0);
    expect(missingTender.error?.message).toMatch(/complete mixed payment split/i);
    expect(unbalancedTender.error?.message).toMatch(/must equal the paid total/i);
  });

  it('normalizes legacy lowercase split fields on reads', () => {
    expect(normalizeOrderPaymentFields({ ...mixedOrder, mixedCash: undefined, mixedEftpos: undefined, mixedcash: 30, mixedeftpos: 70 }))
      .toMatchObject({ mixedCash: 30, mixedEftpos: 70 });
    expect(normalizeOrderPaymentFields({ ...mixedOrder, mixedCash: 0, mixedEftpos: 0, mixedcash: 30, mixedeftpos: 70 }))
      .toMatchObject({ mixedCash: 30, mixedEftpos: 70 });
  });

  it('does not discard a non-zero historical customer surcharge during schema fallback', async () => {
    const eftposOrder = { ...mixedOrder, paymentMethod: 'eftpos', mixedCash: undefined, mixedEftpos: undefined, surcharge: 1.5, total: 101.5 };
    const { inserted, supabase } = createSupabaseInsert([
      { data: null, error: { message: "Could not find the 'surcharge' column" } },
    ]);

    const result = await insertOrderRecord(supabase, eftposOrder);

    expect(inserted).toHaveLength(1);
    expect(result.error).toBeTruthy();
  });
});
