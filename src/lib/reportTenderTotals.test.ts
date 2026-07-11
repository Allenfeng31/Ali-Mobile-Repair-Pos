import { describe, expect, it } from 'vitest';
import type { Order } from '../types';
import { getOrderTenderTotals } from './reportTenderTotals';

const baseOrder: Order = {
  id: 'TK-TEST',
  timestamp: '2026-07-11T03:06:52.000Z',
  items: [],
  subtotal: 0,
  tax: 0,
  surcharge: 0,
  total: 0,
  profit: 0,
  type: 'sale',
  paymentMethod: 'cash',
};

describe('report tender totals', () => {
  it('splits mixed payments by actual cash and card components', () => {
    const totals = getOrderTenderTotals({
      ...baseOrder,
      id: 'TK-9539',
      paymentMethod: 'mixed',
      total: 120.30,
      mixedCash: 100,
      mixedEftpos: 20,
      surcharge: 0.30,
    });

    expect(totals).toEqual({ cash: 100, eftpos: 20.30 });
  });

  it('keeps cash-only orders in cash collections', () => {
    const totals = getOrderTenderTotals({
      ...baseOrder,
      paymentMethod: 'cash',
      total: 80,
    });

    expect(totals).toEqual({ cash: 80, eftpos: 0 });
  });

  it('keeps card-only orders in card collections', () => {
    const totals = getOrderTenderTotals({
      ...baseOrder,
      paymentMethod: 'eftpos',
      total: 101.50,
      surcharge: 1.50,
    });

    expect(totals).toEqual({ cash: 0, eftpos: 101.50 });
  });
});
