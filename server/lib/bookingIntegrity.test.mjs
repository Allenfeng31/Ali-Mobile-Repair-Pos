import { describe, expect, it } from 'vitest';
import bookingIntegrity from './bookingIntegrity.js';

const {
  buildBookingPersistence,
  deriveMelbourneBookingDateTime,
  filterPublicChatMessages,
  formatBookingDateTimeForStaff,
  getArrivalRepairPrice,
} = bookingIntegrity;

describe('booking integrity', () => {
  it('derives the correct Melbourne appointment instant before and during DST', () => {
    expect(deriveMelbourneBookingDateTime('2026-10-02', '12:30')).toBe('2026-10-02T02:30:00.000Z');
    expect(deriveMelbourneBookingDateTime('2026-10-04', '12:30')).toBe('2026-10-04T01:30:00.000Z');
  });

  it('uses persisted calendar values and Melbourne legacy fallback for staff date display', () => {
    expect(formatBookingDateTimeForStaff({ bookingDate: '2026-10-02', bookingTime: '12:30' })).toBe('02/10/2026 12:30');
    expect(formatBookingDateTimeForStaff({ datetime: '2026-10-02T02:30:00.000Z' })).toBe('02/10/2026 12:30');
  });

  it('creates a durable service snapshot including a tempered-glass upsell', () => {
    const persistence = buildBookingPersistence({
      devices: [{
        category: 'phone', brand: 'Google Pixel', model: 'Pixel 10 Pro XL',
        services: [
          { id: 1, name: 'Charging Port Replacement', price: 120 },
          { id: 'upsell-glass-1', name: 'Tempered Glass', price: 20 },
        ],
      }],
      pricing: { total: 140 },
    });

    expect(persistence).toMatchObject({ booking_total: 140, has_custom_quote: false });
    expect(persistence.booking_items[0].services).toEqual([
      expect.objectContaining({ name: 'Charging Port Replacement', price: 120, isUpsell: false }),
      expect.objectContaining({ name: 'Tempered Glass', price: 20, isUpsell: true }),
    ]);
  });

  it('preserves quote-only numeric zero separately from customer-facing quote state', () => {
    const persistence = buildBookingPersistence({
      devices: [{ category: 'phone', brand: 'Samsung', model: 'Galaxy S21', services: [{ id: 'quote', name: 'Logic Board Repair', price: 0 }] }],
      pricing: { total: 0 },
    });

    expect(persistence).toMatchObject({ booking_total: 0, has_custom_quote: true });
    expect(persistence.booking_items[0].services[0]).toMatchObject({ isQuoteOnRequest: true });
  });

  it.each([
    [0, 0],
    [50, 50],
    [100, 100],
    [null, 0],
  ])('transfers appointment booking total %p as repair price %p', (bookingTotal, expected) => {
    expect(getArrivalRepairPrice(bookingTotal)).toBe(expected);
  });

  it('does not expose booking metadata through the customer chat response', () => {
    expect(filterPublicChatMessages([
      { id: 'booking', content: '[BOOKING_DATA] {"bookingTotal":120}' },
      { id: 'customer-message', content: 'Can I book at 12:30?' },
    ])).toEqual([{ id: 'customer-message', content: 'Can I book at 12:30?' }]);
  });
});
