const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';

export function getMelbourneCalendarDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function offsetCalendarDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
}
