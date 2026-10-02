const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type BookingTimeInput = Readonly<{
  bookingDate?: string | null;
  bookingTime?: string | null;
  datetime?: string | null;
}>;

type BookingTotalInput = Readonly<{
  bookingTotal?: number | null;
  hasCustomQuote?: boolean | null;
}>;

function parseBookingCalendarDate(value: string): { year: number; month: number; day: number } | null {
  if (!CALENDAR_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? { year, month, day }
    : null;
}

function formatCalendarDate(value: string): string | null {
  const parts = parseBookingCalendarDate(value);
  if (!parts) return null;
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)));
}

function formatBookingTime(value: string): string | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatBookingRequestedTime(input: BookingTimeInput): { date: string; time: string } | null {
  const date = input.bookingDate ? formatCalendarDate(input.bookingDate) : null;
  const time = input.bookingTime ? formatBookingTime(input.bookingTime) : null;
  if (date && time) return { date, time };
  if (!input.datetime) return null;
  const instant = new Date(input.datetime);
  if (Number.isNaN(instant.getTime())) return null;
  const dateParts = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(instant);
  const timeParts = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(instant).toLowerCase();
  return { date: dateParts, time: timeParts };
}

export function getBookingDisplayTotal(input: BookingTotalInput): string | null {
  if (input.hasCustomQuote) return 'Quote on Request';
  const total = Number(input.bookingTotal);
  if (total === 0 && input.hasCustomQuote == null) return null;
  return Number.isFinite(total) ? `$${total.toFixed(2)}` : null;
}
