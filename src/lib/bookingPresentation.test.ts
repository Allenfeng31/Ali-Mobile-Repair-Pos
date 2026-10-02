import { describe, expect, it } from 'vitest';

import { formatBookingRequestedTime, getBookingDisplayTotal } from './bookingPresentation';

describe('booking presentation', () => {
  it('uses persisted calendar date and time without UTC reparsing', () => {
    expect(formatBookingRequestedTime({ bookingDate: '2026-10-02', bookingTime: '12:30' })).toEqual({
      date: '2 October 2026',
      time: '12:30 pm',
    });
  });

  it('formats legacy datetimes explicitly in Melbourne time', () => {
    expect(formatBookingRequestedTime({ datetime: '2026-10-02T02:30:00.000Z' })).toEqual({
      date: '2 October 2026',
      time: '12:30 pm',
    });
  });

  it('uses quote wording instead of a fake zero total', () => {
    expect(getBookingDisplayTotal({ bookingTotal: 0, hasCustomQuote: true })).toBe('Quote on Request');
    expect(getBookingDisplayTotal({ bookingTotal: 120, hasCustomQuote: false })).toBe('$120.00');
    expect(getBookingDisplayTotal({ bookingTotal: 0 })).toBeNull();
  });
});
