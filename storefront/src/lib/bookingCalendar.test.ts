import { describe, expect, it } from 'vitest';

import {
  addBookingCalendarDays,
  formatBookingCalendarDate,
  getMelbourneBookingCalendarDate,
} from './bookingCalendar';

describe('booking calendar dates', () => {
  it('keeps a Melbourne Friday as 2026-10-02 without UTC date drift', () => {
    expect(getMelbourneBookingCalendarDate(new Date('2026-10-01T22:30:00.000Z'))).toBe('2026-10-02');
    expect(formatBookingCalendarDate('2026-10-02', { month: 'long', day: 'numeric' })).toBe('October 2');
  });

  it('offsets calendar days across the Melbourne DST boundary without changing the calendar date', () => {
    expect(addBookingCalendarDays('2026-10-02', 2)).toBe('2026-10-04');
    expect(formatBookingCalendarDate('2026-10-04', { weekday: 'short', month: 'short', day: 'numeric' })).toBe('Sun, Oct 4');
  });
});
