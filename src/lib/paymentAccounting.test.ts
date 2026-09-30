import { describe, expect, it } from 'vitest';

import {
  calculateCustomerCardSurcharge,
  getMixedPaymentAllocation,
} from './paymentAccounting';

describe('customer card surcharge policy', () => {
  it('keeps the existing 1.5% charge immediately before the Melbourne cutoff', () => {
    expect(calculateCustomerCardSurcharge(100, '2026-09-30T23:59:59.999+10:00')).toBe(1.5);
  });

  it('charges exactly zero at and after the Melbourne cutoff', () => {
    expect(calculateCustomerCardSurcharge(100, '2026-10-01T00:00:00.000+10:00')).toBe(0);
    expect(calculateCustomerCardSurcharge(100, '2026-09-30T14:00:00.000Z')).toBe(0);
    expect(calculateCustomerCardSurcharge(100, '2026-10-01T00:00:00.000Z')).toBe(0);
  });

  it('applies the pre-cutoff percentage only to the mixed card portion', () => {
    expect(calculateCustomerCardSurcharge(60, '2026-09-30T13:59:59.999Z')).toBe(0.9);
    expect(calculateCustomerCardSurcharge(60, '2026-09-30T14:00:00.000Z')).toBe(0);
  });
});

describe('mixed payment allocation', () => {
  it('preserves a cash-first 30/70 allocation', () => {
    expect(getMixedPaymentAllocation(100, 'cash', 30)).toEqual({ mixedCash: 30, mixedEftpos: 70 });
  });

  it('preserves an EFTPOS-first 70/30 allocation', () => {
    expect(getMixedPaymentAllocation(100, 'eftpos', 70)).toEqual({ mixedCash: 30, mixedEftpos: 70 });
  });
});
