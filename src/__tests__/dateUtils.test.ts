import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeDate } from '../utils/dateUtils';

describe('Melbourne Timezone-Anchored Relative Date Formatting', () => {
  beforeEach(() => {
    // Mock system time to exactly Monday, May 18, 2026 at 16:07:43 (Melbourne Time, +10:00)
    // Coordinated Universal Time (UTC) for this is 2026-05-18T06:07:43Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T06:07:43Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats Today correctly (same calendar day in Melbourne)', () => {
    // Today, May 18, 2026, morning in Melbourne (Monday 08:30:00+10:00)
    const morningToday = '2026-05-17T22:30:00Z';
    expect(formatRelativeDate(morningToday)).toBe('Today');

    // Today, May 18, 2026, evening in Melbourne (Monday 23:59:00+10:00)
    const eveningToday = '2026-05-18T13:59:00Z';
    expect(formatRelativeDate(eveningToday)).toBe('Today');
  });

  it('formats Yesterday correctly (exactly 1 calendar day before in Melbourne)', () => {
    // Yesterday, May 17, 2026, in Melbourne (Sunday)
    const yesterdayMorning = '2026-05-16T20:00:00Z'; // Sunday 06:00:00+10:00
    expect(formatRelativeDate(yesterdayMorning)).toBe('Yesterday');

    const yesterdayEvening = '2026-05-17T13:00:00Z'; // Sunday 23:00:00+10:00
    expect(formatRelativeDate(yesterdayEvening)).toBe('Yesterday');
  });

  it('formats dates from last week or older as Day of Week + DD/MM/YYYY', () => {
    // 2 days ago (Saturday, May 16, 2026). Since today is Monday (May 18),
    // Saturday is in the *previous* calendar week. So it is from last week or older.
    const saturday = '2026-05-15T22:00:00Z'; // Saturday 08:00:00+10:00
    expect(formatRelativeDate(saturday)).toBe('Saturday 16/05/2026');

    // Exactly 7 days ago (Monday, May 11, 2026)
    const lastMonday = '2026-05-10T22:00:00Z'; // Monday 11/05/2026 08:00:00+10:00
    expect(formatRelativeDate(lastMonday)).toBe('Monday 11/05/2026');

    // Older date
    const olderDate = '2026-01-01T00:00:00Z'; // Thursday 01/01/2026
    expect(formatRelativeDate(olderDate)).toBe('Thursday 01/01/2026');
  });

  it('formats within the current week (but older than yesterday) as Day of the Week', () => {
    // Let's change the mock system time to Wednesday, May 20, 2026 at 12:00:00 (Melbourne time)
    // UTC: 2026-05-20T02:00:00Z
    vi.setSystemTime(new Date('2026-05-20T02:00:00Z'));

    // Wednesday May 20 is "Today"
    // Tuesday May 19 is "Yesterday"
    
    // Monday May 18, 2026 (2 days ago, which is in the same calendar week)
    const monday = '2026-05-17T22:00:00Z'; // Monday 08:00:00+10:00
    expect(formatRelativeDate(monday)).toBe('Monday');

    // Sunday May 17, 2026 is the previous calendar week. Should format with full date.
    const sunday = '2026-05-16T22:00:00Z'; // Sunday 08:00:00+10:00
    expect(formatRelativeDate(sunday)).toBe('Sunday 17/05/2026');
  });

  it('returns empty string for missing or invalid dates', () => {
    expect(formatRelativeDate(undefined)).toBe('');
    expect(formatRelativeDate(null)).toBe('');
    expect(formatRelativeDate('invalid-date')).toBe('');
  });
});
