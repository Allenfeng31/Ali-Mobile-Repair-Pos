/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import ordersHandlers from './ordersHandlers.js';

const { createOrdersHandlers, melbourneDayStart, parseDateRange } = ordersHandlers;

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createSupabase({ orders = [], items = [], parentErrorAt, itemErrorAt, duplicateItems = false } = {}) {
  const parentQueries = [];
  const itemQueries = [];

  function createParentQuery() {
    const query = {
      orders: [],
      filters: [],
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn((column, value) => {
        query.filters.push([column, 'gte', value]);
        return query;
      }),
      lt: vi.fn((column, value) => {
        query.filters.push([column, 'lt', value]);
        return query;
      }),
      range: vi.fn(async (from, to) => {
        query.rangeValues = [from, to];
        if (parentErrorAt === parentQueries.length - 1) return { data: null, error: { message: 'private parent failure' } };
        let matchingOrders = orders.filter((entry) => query.filters.every(([column, operator, value]) => (
          operator === 'gte' ? entry[column] >= value : entry[column] < value
        )));
        matchingOrders = matchingOrders.sort((left, right) => (
          right.timestamp.localeCompare(left.timestamp) || left.id.localeCompare(right.id)
        ));
        return { data: matchingOrders.slice(from, to + 1), error: null };
      }),
    };
    parentQueries.push(query);
    return query;
  }

  function createItemQuery() {
    const query = {
      ids: [],
      select: vi.fn().mockReturnThis(),
      in: vi.fn((column, ids) => {
        query.column = column;
        query.ids = ids;
        return query;
      }),
      order: vi.fn().mockReturnThis(),
      range: vi.fn(async (from, to) => {
        query.rangeValues = [from, to];
        if (itemErrorAt === itemQueries.length - 1) return { data: null, error: { message: 'private item failure' } };
        const matchingItems = items
          .filter((entry) => query.ids.includes(entry.order_id))
          .sort((left, right) => left.id.localeCompare(right.id));
        if (duplicateItems && matchingItems[0]) matchingItems.splice(1, 0, matchingItems[0]);
        return { data: matchingItems.slice(from, to + 1), error: null };
      }),
    };
    itemQueries.push(query);
    return query;
  }

  return {
    parentQueries,
    itemQueries,
    supabase: {
      from: vi.fn((table) => (table === 'orders' ? createParentQuery() : createItemQuery())),
    },
  };
}

const order = (id, timestamp = '2026-08-10T00:00:00.000Z') => ({
  id, timestamp, subtotal: 200, tax: 20, surcharge: 3.3, total: 223.3,
});
const item = (id, orderId, name = id, price = 1, qty = 1) => ({
  id, order_id: orderId, name, sku: id, price, qty, category: price < 0 ? 'Adjustment' : 'Repair',
});
const get = async (supabase, query = {}, options = {}) => {
  const res = response();
  await createOrdersHandlers({ supabase, ...options }).get({ query }, res);
  return res;
};

describe('historical order range retrieval', () => {
  it('uses inclusive Melbourne day starts and an exclusive next-day end for a valid one-day range', async () => {
    const { supabase, parentQueries } = createSupabase({
      orders: [
        order('before', '2026-08-09T13:59:59.999Z'),
        order('start', '2026-08-09T14:00:00.000Z'),
        order('during', '2026-08-10T13:59:59.999Z'),
        order('after', '2026-08-10T14:00:00.000Z'),
      ],
    });

    const res = await get(supabase, { from: '2026-08-10', to: '2026-08-10' });

    expect(res.body.map((entry) => entry.id)).toEqual(['during', 'start']);
    expect(parentQueries[0].gte).toHaveBeenCalledWith('timestamp', '2026-08-09T14:00:00.000Z');
    expect(parentQueries[0].lt).toHaveBeenCalledWith('timestamp', '2026-08-10T14:00:00.000Z');
  });

  it('handles multi-day Melbourne ranges and the DST transition without a 23:59:59 boundary', async () => {
    expect(parseDateRange({ from: '2026-10-04', to: '2026-10-04' })).toEqual({
      from: '2026-10-03T14:00:00.000Z',
      to: '2026-10-04T13:00:00.000Z',
    });
    expect(melbourneDayStart('2026-10-05')).toBe('2026-10-04T13:00:00.000Z');

    const { supabase } = createSupabase({
      orders: [
        order('oct-4', '2026-10-03T14:00:00.000Z'),
        order('oct-5', '2026-10-04T13:00:00.000Z'),
      ],
    });
    const res = await get(supabase, { from: '2026-10-04', to: '2026-10-05' });
    expect(res.body.map((entry) => entry.id)).toEqual(['oct-5', 'oct-4']);
  });

  it('rejects malformed, impossible, partial, and reversed dates without querying Supabase', async () => {
    for (const query of [
      { from: '2026-02-30', to: '2026-03-01' },
      { from: '10-08-2026', to: '2026-08-10' },
      { from: '2026-08-10' },
      { from: '2026-08-11', to: '2026-08-10' },
    ]) {
      const { supabase } = createSupabase();
      const res = await get(supabase, query);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid date range' });
      expect(supabase.from).not.toHaveBeenCalled();
    }
  });

  it('exhaustively merges more than 1,000 matching parents in deterministic timestamp/id order', async () => {
    const orders = Array.from({ length: 1001 }, (_, index) => order(
      `TK-${String(index).padStart(4, '0')}`,
      index < 2 ? '2026-08-10T00:00:00.000Z' : '2026-08-09T00:00:00.000Z',
    ));
    const { supabase, parentQueries } = createSupabase({ orders });
    const res = await get(supabase, { from: '2026-08-09', to: '2026-08-10' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1001);
    expect(res.body.slice(0, 2).map((entry) => entry.id)).toEqual(['TK-0000', 'TK-0001']);
    expect(parentQueries.map((query) => query.rangeValues)).toEqual([[0, 999], [1000, 1999]]);
    expect(parentQueries.every((query) => query.order.mock.calls.length === 2)).toBe(true);
    expect(parentQueries.every((query) => query.gte.mock.calls[0][1] === '2026-08-08T14:00:00.000Z')).toBe(true);
  });

  it('continues after an exact 1,000-row parent page and keeps unfiltered All Time exhaustive', async () => {
    const orders = Array.from({ length: 1000 }, (_, index) => order(`TK-${index}`));
    const { supabase, parentQueries } = createSupabase({ orders });
    const res = await get(supabase);

    expect(res.body).toHaveLength(1000);
    expect(parentQueries.map((query) => query.rangeValues)).toEqual([[0, 999], [1000, 1999]]);
    expect(parentQueries.every((query) => query.gte.mock.calls.length === 0)).toBe(true);
  });

  it('fetches only selected parents’ items in stable batches/pages, excludes unrelated rows, and deduplicates IDs', async () => {
    const matchingItems = Array.from({ length: 1001 }, (_, index) => item(`item-${String(index).padStart(4, '0')}`, 'TK-1770'));
    const { supabase, itemQueries } = createSupabase({
      orders: [order('TK-1770'), order('TK-1771')],
      items: [...matchingItems, item('second-order-item', 'TK-1771'), item('unrelated', 'OTHER')],
      duplicateItems: true,
    });
    const res = await get(supabase, {}, { orderIdBatchSize: 1, itemPageSize: 1000 });

    expect(res.body[0].items).toHaveLength(1001);
    expect(res.body[0].items.map((entry) => entry.id)).not.toContain('unrelated');
    expect(res.body[1].items).toEqual([item('second-order-item', 'TK-1771')]);
    expect(itemQueries.map((query) => query.rangeValues)).toEqual([[0, 999], [1000, 1999], [0, 999]]);
    expect(itemQueries.map((query) => query.ids)).toEqual([['TK-1770'], ['TK-1770'], ['TK-1771']]);
    expect(itemQueries.every((query) => query.column === 'order_id')).toBe(true);
    expect(itemQueries.every((query) => JSON.stringify(query.order.mock.calls[0]) === JSON.stringify(['id', { ascending: true }]))).toBe(true);
  });

  it('preserves receipt rows and stored parent totals, including negative savings and genuine zero-item orders', async () => {
    const receiptItems = [
      item('screen', 'TK-1770', 'iPhone 12 Pro Screen Replacement', 139),
      item('housing', 'TK-1770', 'iPhone 12 Pro Back Housing Replacement', 190),
      item('savings', 'TK-1770', 'Line Item Savings', -109),
    ];
    const { supabase } = createSupabase({ orders: [order('TK-1770'), order('TK-EMPTY')], items: receiptItems });
    const res = await get(supabase);

    const receipt = res.body.find((entry) => entry.id === 'TK-1770');
    expect(receipt).toMatchObject({ subtotal: 200, tax: 20, surcharge: 3.3, total: 223.3 });
    expect(receipt.items).toEqual(expect.arrayContaining(receiptItems));
    expect(res.body.find((entry) => entry.id === 'TK-EMPTY').items).toEqual([]);
  });

  it('returns generic failures and never returns partial financial data when parent or item pages fail', async () => {
    const parentFailure = createSupabase({ orders: [order('TK-1')], parentErrorAt: 0 });
    const parentRes = await get(parentFailure.supabase);
    expect(parentRes).toMatchObject({ statusCode: 500, body: { error: 'Unable to load orders' } });

    const itemFailure = createSupabase({ orders: [order('TK-1')], items: [item('one', 'TK-1')], itemErrorAt: 0 });
    const itemRes = await get(itemFailure.supabase);
    expect(itemRes).toMatchObject({ statusCode: 500, body: { error: 'Unable to load order items' } });
  });
});
