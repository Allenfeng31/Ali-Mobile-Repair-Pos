/**
 * Formats a given timestamp into a Melbourne (Australia/Melbourne) timezone-anchored relative date string.
 *
 * Rules:
 * - If the date is Today: return "Today"
 * - If the date is Yesterday: return "Yesterday"
 * - If the date is within the current week (but older than yesterday): return the Day of the Week (e.g., "Wednesday")
 * - If the date is from last week or older: return the Day of the Week + DD/MM/YYYY (e.g., "Monday 11/05/2026")
 */
export function formatRelativeDate(timestamp: string | Date | number | undefined | null): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  // Get en-US formatted date parts to construct a UTC date at midnight representing Melbourne local day
  const getMelbourneMidnight = (d: Date): Date => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Australia/Melbourne',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(d);
    const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return new Date(Date.UTC(
      parseInt(partMap.year, 10),
      parseInt(partMap.month, 10) - 1,
      parseInt(partMap.day, 10)
    ));
  };

  const nowMidnight = getMelbourneMidnight(new Date());
  const dateMidnight = getMelbourneMidnight(date);

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  // Calculate difference in calendar days in Melbourne time
  const diffDays = Math.round((nowMidnight.getTime() - dateMidnight.getTime()) / MS_PER_DAY);

  if (diffDays <= 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // Get Day of the Week in Melbourne timezone
  const getMelbourneDayOfWeek = (d: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Australia/Melbourne',
      weekday: 'long'
    }).format(d);
  };

  // Determine if the date is in the same calendar week as now
  // Assuming the calendar week starts on Monday (standard in Australia)
  const getMelbourneDayIndex = (d: Date): number => {
    const dayStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Australia/Melbourne',
      weekday: 'long'
    }).format(d); // "Sunday", "Monday", etc.
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.indexOf(dayStr);
  };

  const nowDayIndex = getMelbourneDayIndex(new Date()); // 0 (Sun) to 6 (Sat)
  // Calculate days since the start of the week (Monday)
  // Sunday (0) -> 6, Monday (1) -> 0, Tuesday (2) -> 1, ..., Saturday (6) -> 5
  const daysSinceMonday = nowDayIndex === 0 ? 6 : nowDayIndex - 1;

  // If the date is within the current week (older than yesterday, but since Monday):
  if (diffDays <= daysSinceMonday) {
    return getMelbourneDayOfWeek(date);
  }

  // Otherwise, it's from last week or older: "Day of the Week DD/MM/YYYY"
  const getMelbourneFormattedDate = (d: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Australia/Melbourne',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formatter.format(d); // e.g. "11/05/2026"
  };

  const dayOfWeek = getMelbourneDayOfWeek(date);
  const formattedDate = getMelbourneFormattedDate(date);
  return `${dayOfWeek} ${formattedDate}`;
}
