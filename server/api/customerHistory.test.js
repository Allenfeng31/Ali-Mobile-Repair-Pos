/**
 * @vitest-environment node
 */
import { describe, expect, it, vi } from 'vitest';
import customerHistory from './customerHistory.js';

const { CUSTOMER_HISTORY_PAGE_SIZE, fetchAllRows, fetchCustomerRepairHistory } = customerHistory;

function customer(id) {
  return { id, name: `Customer ${id}`, phone: `04${id}`, repairs: [] };
}

function repair(id, customerId, timestamp, status = 'In Processing') {
  return {
    id,
    customer_id: customerId,
    timestamp,
    repairItem: 'Screen Replacement',
    modelNumber: 'Example Phone',
    price: 100,
    status,
  };
}

function createSupabase({ customers = [], repairs = [], fail = {}, missingData = {}, throwRange = {} } = {}) {
  const queries = { customers: [], repairs: [] };

  function createQuery(table) {
    const query = {
      orders: [],
      select: vi.fn().mockReturnThis(),
      order: vi.fn((column, options) => {
        query.orders.push([column, options]);
        return query;
      }),
      range: vi.fn(async (from, to) => {
        const page = queries[table].length - 1;
        if (fail[table] === page) return { data: null, error: { message: `${table} page failed` } };
        if (missingData[table] === page) return { data: null, error: null };
        if (throwRange[table] === page) throw new Error(`${table} transport failed`);

        const source = table === 'customers' ? customers : repairs;
        const sorted = [...source].sort((left, right) => {
          for (const [column, options] of query.orders) {
            const comparison = String(left[column]).localeCompare(String(right[column]));
            if (comparison !== 0) return options.ascending ? comparison : -comparison;
          }
          return 0;
        });
        return { data: sorted.slice(from, to + 1), error: null };
      }),
    };
    queries[table].push(query);
    return query;
  }

  return {
    queries,
    supabase: {
      from: vi.fn((table) => createQuery(table)),
    },
  };
}

describe('customer repair history retrieval', () => {
  it.each([
    [0, [[0, 499]]],
    [500, [[0, 499], [500, 999]]],
    [501, [[0, 499], [500, 999]]],
    [1000, [[0, 499], [500, 999], [1000, 1499]]],
    [1001, [[0, 499], [500, 999], [1000, 1499]]],
  ])('uses safe inclusive ranges for %i rows', async (count, expectedRanges) => {
    const customers = Array.from({ length: count }, (_, index) => customer(`customer-${index}`));
    const { supabase, queries } = createSupabase({ customers });

    await expect(fetchAllRows({
      supabase,
      table: 'customers',
      fields: 'id',
      orders: [['name', { ascending: true }], ['id', { ascending: true }]],
    })).resolves.toHaveLength(count);

    expect(queries.customers.map((query) => query.range.mock.calls[0])).toEqual(expectedRanges);
  });

  it('returns more than 1,000 customers and repairs, including a completed repair beyond the first page', async () => {
    const customers = Array.from({ length: 1001 }, (_, index) => customer(`customer-${String(index).padStart(4, '0')}`));
    const repairs = Array.from({ length: 1001 }, (_, index) => repair(
      `repair-${String(index).padStart(4, '0')}`,
      `customer-${String(index).padStart(4, '0')}`,
      `2026-01-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
      index === 1000 ? 'Completed' : 'In Processing',
    ));
    const { supabase, queries } = createSupabase({ customers, repairs });

    const result = await fetchCustomerRepairHistory({ supabase });

    expect(result).toHaveLength(1001);
    expect(result.flatMap((entry) => entry.repairs)).toHaveLength(1001);
    expect(result.find((entry) => entry.id === 'customer-1000').repairs).toEqual([
      expect.objectContaining({ id: 'repair-1000', status: 'Completed' }),
    ]);
    expect(queries.customers.map((query) => query.range.mock.calls[0])).toEqual([[0, 499], [500, 999], [1000, 1499]]);
    expect(queries.repairs.map((query) => query.range.mock.calls[0])).toEqual([[0, 499], [500, 999], [1000, 1499]]);
    const customerOrder = [
      ['name', { ascending: true }],
      ['id', { ascending: true }],
    ];
    const repairOrder = [
      ['timestamp', { ascending: true }],
      ['id', { ascending: true }],
    ];
    for (const query of queries.customers) expect(query.order.mock.calls).toEqual(customerOrder);
    for (const query of queries.repairs) expect(query.order.mock.calls).toEqual(repairOrder);
  });

  it('rejects the entire retrieval when a later repair page fails instead of returning a prefix', async () => {
    const customers = Array.from({ length: CUSTOMER_HISTORY_PAGE_SIZE + 1 }, (_, index) => customer(`customer-${index}`));
    const repairs = Array.from({ length: CUSTOMER_HISTORY_PAGE_SIZE + 1 }, (_, index) => repair(`repair-${index}`, `customer-${index}`, `2026-02-01T00:00:00.000Z`));
    const error = vi.fn();
    const { supabase } = createSupabase({ customers, repairs, fail: { repairs: 1 } });

    await expect(fetchCustomerRepairHistory({ supabase, logger: { error } })).rejects.toThrow('Unable to fetch complete repairs dataset');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('repairs page 2 range 500-999'));
  });

  it('rejects the entire retrieval when a later customer page fails instead of returning a prefix', async () => {
    const customers = Array.from({ length: CUSTOMER_HISTORY_PAGE_SIZE + 1 }, (_, index) => customer(`customer-${index}`));
    const error = vi.fn();
    const { supabase } = createSupabase({ customers, fail: { customers: 1 } });

    await expect(fetchCustomerRepairHistory({ supabase, logger: { error } })).rejects.toThrow('Unable to fetch complete customers dataset');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('customers page 2 range 500-999'));
  });

  it('rejects missing page data instead of treating a fetched prefix as complete', async () => {
    const customers = Array.from({ length: CUSTOMER_HISTORY_PAGE_SIZE + 1 }, (_, index) => customer(`customer-${index}`));
    const error = vi.fn();
    const { supabase } = createSupabase({ customers, missingData: { customers: 1 } });

    await expect(fetchCustomerRepairHistory({ supabase, logger: { error } })).rejects.toThrow('Unable to fetch complete customers dataset');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('customers page 2 range 500-999: missing page data'));
  });

  it('logs page context and rejects when a range request throws', async () => {
    const customers = Array.from({ length: CUSTOMER_HISTORY_PAGE_SIZE + 1 }, (_, index) => customer(`customer-${index}`));
    const error = vi.fn();
    const { supabase } = createSupabase({ customers, throwRange: { customers: 1 } });

    await expect(fetchAllRows({
      supabase,
      table: 'customers',
      fields: 'id',
      orders: [['name', { ascending: true }], ['id', { ascending: true }]],
      logger: { error },
    })).rejects.toThrow('customers transport failed');
    expect(error).toHaveBeenCalledWith(expect.stringContaining('customers page 2 range 500-999: customers transport failed'));
  });

  it('preserves the existing response shape for a normal small dataset', async () => {
    const { supabase } = createSupabase({
      customers: [customer('b'), customer('a')],
      repairs: [
        repair('repair-b', 'b', '2026-03-02T00:00:00.000Z'),
        repair('repair-a', 'a', '2026-03-01T00:00:00.000Z', 'Completed'),
      ],
    });

    await expect(fetchCustomerRepairHistory({ supabase })).resolves.toEqual([
      expect.objectContaining({ id: 'a', repairs: [expect.objectContaining({ id: 'repair-a', status: 'Completed' })] }),
      expect.objectContaining({ id: 'b', repairs: [expect.objectContaining({ id: 'repair-b' })] }),
    ]);
  });
});
