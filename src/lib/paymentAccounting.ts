export const CUSTOMER_CARD_SURCHARGE_CUTOFF = Date.parse('2026-09-30T14:00:00.000Z');
export const HISTORICAL_CUSTOMER_CARD_SURCHARGE_RATE = 0.015;

type PaymentTimestamp = Date | string | number;

function timestampMilliseconds(value: PaymentTimestamp): number {
  const milliseconds = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(milliseconds)) throw new Error('Invalid payment timestamp');
  return milliseconds;
}

export function calculateCustomerCardSurcharge(cardAmount: number, paymentTimestamp: PaymentTimestamp): number {
  if (timestampMilliseconds(paymentTimestamp) >= CUSTOMER_CARD_SURCHARGE_CUTOFF) return 0;
  return Number((Math.max(0, cardAmount) * HISTORICAL_CUSTOMER_CARD_SURCHARGE_RATE).toFixed(2));
}

export function getMixedPaymentAllocation(
  total: number,
  changedTender: 'cash' | 'eftpos',
  enteredAmount: number,
) {
  const amount = Math.min(total, Math.max(0, enteredAmount));
  const remainder = Number((total - amount).toFixed(2));

  return changedTender === 'cash'
    ? { mixedCash: amount, mixedEftpos: remainder }
    : { mixedCash: remainder, mixedEftpos: amount };
}
