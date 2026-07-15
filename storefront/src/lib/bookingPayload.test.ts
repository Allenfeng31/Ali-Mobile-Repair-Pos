import { describe, expect, it } from 'vitest';
import { buildBookingPayload } from './bookingPayload';
import { OTHER_REPAIR_SERVICE_ID, OTHER_REPAIR_SERVICE_NAME } from './otherRepairBooking';

describe('buildBookingPayload', () => {
  it('keeps Other Repair description separate from its base service name across devices', () => {
    const payload = buildBookingPayload({
      customerName: 'Test Customer',
      phone: '0400000000',
      devices: [
        {
          id: 'a', brand: 'Samsung', model: 'Galaxy A', category: 'phone', isConfirmed: true,
          services: [{ id: OTHER_REPAIR_SERVICE_ID, name: OTHER_REPAIR_SERVICE_NAME, price: 0, customDescription: 'speaker crackles' }],
        },
        {
          id: 'b', brand: 'Apple', model: 'iPhone 12', category: 'phone', isConfirmed: true,
          services: [{ id: 101, name: 'Screen Replacement', price: 100 }],
        },
      ],
      total: 100,
      hasCustomQuote: true,
      pricing: { subtotal: 100, discountRate: 0, discountAmount: 0, qualifyingRepairItemCount: 1, total: 100 },
      datetime: '2026-07-15T10:00:00.000Z',
      displayDate: '15/07/2026 10:00',
      notes: '',
      sessionToken: null,
    });

    expect(payload.devices[0].services[0]).toEqual({
      id: OTHER_REPAIR_SERVICE_ID,
      name: 'Other Repair',
      price: 0,
      customDescription: 'speaker crackles',
    });
    expect(payload.devices[1].services[0]).toEqual({ id: 101, name: 'Screen Replacement', price: 100 });
  });
});
