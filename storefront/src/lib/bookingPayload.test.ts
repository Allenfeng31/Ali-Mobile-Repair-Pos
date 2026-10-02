import { describe, expect, it } from 'vitest';
import { buildBookingPayload } from './bookingPayload';
import { OTHER_REPAIR_SERVICE_ID, OTHER_REPAIR_SERVICE_NAME } from './otherRepairBooking';

describe('buildBookingPayload', () => {
  it('preserves a canonical Custom Quote identity and its non-price status', () => {
    const payload = buildBookingPayload({
      customerName: 'Test Customer',
      phone: '0400000000',
      devices: [{
        id: 'quote', brand: 'Samsung', model: 'Galaxy S21', category: 'phone', isConfirmed: true,
        services: [{
          id: 'public-booking:phone:samsung:galaxy-s21:loudspeaker-replacement',
          name: 'Loudspeaker Replacement',
          price: 0,
        }],
      }],
      total: 0,
      hasCustomQuote: true,
      pricing: { subtotal: 0, discountRate: 0, discountAmount: 0, qualifyingRepairItemCount: 1, total: 0 },
      bookingDate: '2026-07-15',
      bookingTime: '10:00',
      displayDate: '15/07/2026 10:00',
      notes: '',
      sessionToken: null,
    });

    expect(payload.hasCustomQuote).toBe(true);
    expect(payload.bookingDate).toBe('2026-07-15');
    expect(payload.bookingTime).toBe('10:00');
    expect(payload.devices[0].services).toEqual([{
      id: 'public-booking:phone:samsung:galaxy-s21:loudspeaker-replacement',
      name: 'Loudspeaker Replacement',
      price: 0,
    }]);
  });

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
      bookingDate: '2026-07-15',
      bookingTime: '10:00',
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
