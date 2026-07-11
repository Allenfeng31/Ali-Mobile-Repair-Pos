import type { Order } from '../types';

export function getOrderTenderTotals(order: Order) {
  if (order.paymentMethod === 'mixed') {
    return {
      cash: order.mixedCash || 0,
      eftpos: (order.mixedEftpos || 0) + (order.surcharge || 0),
    };
  }

  if (order.paymentMethod === 'eftpos') {
    return {
      cash: 0,
      eftpos: order.total,
    };
  }

  return {
    cash: order.total,
    eftpos: 0,
  };
}
