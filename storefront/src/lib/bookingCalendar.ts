export const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type CalendarDateParts = Readonly<{ year: number; month: number; day: number }>;

function getDatePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value || '';
}

function parseCalendarDate(value: string): CalendarDateParts {
  if (!CALENDAR_DATE_PATTERN.test(value)) throw new Error('Invalid booking calendar date');
  const [year, month, day] = value.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error('Invalid booking calendar date');
  }
  return { year, month, day };
}

function toCalendarDate({ year, month, day }: CalendarDateParts): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function getMelbourneBookingCalendarDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return toCalendarDate({
    year: Number(getDatePart(parts, 'year')),
    month: Number(getDatePart(parts, 'month')),
    day: Number(getDatePart(parts, 'day')),
  });
}

export function addBookingCalendarDays(value: string, days: number): string {
  const { year, month, day } = parseCalendarDate(value);
  const calendarArithmetic = new Date(Date.UTC(year, month - 1, day + days));
  return toCalendarDate({
    year: calendarArithmetic.getUTCFullYear(),
    month: calendarArithmetic.getUTCMonth() + 1,
    day: calendarArithmetic.getUTCDate(),
  });
}

export function formatBookingCalendarDate(
  value: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const { year, month, day } = parseCalendarDate(value);
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

export function getBookingCalendarWeekday(value: string): number {
  const { year, month, day } = parseCalendarDate(value);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}
