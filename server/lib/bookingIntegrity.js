const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const BOOKING_PREFIX = '[BOOKING_DATA]';

function parseCalendarDate(value) {
  if (typeof value !== 'string' || !CALENDAR_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

function getMelbourneOffsetMilliseconds(date) {
  const offset = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    timeZoneName: 'longOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value;
  const match = offset?.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) throw new Error('Unable to determine Melbourne timezone offset');
  const milliseconds = (Number(match[2]) * 60 + Number(match[3])) * 60 * 1000;
  return match[1] === '+' ? milliseconds : -milliseconds;
}

function deriveMelbourneBookingDateTime(bookingDate, bookingTime) {
  const date = parseCalendarDate(bookingDate);
  if (!date || typeof bookingTime !== 'string' || !BOOKING_TIME_PATTERN.test(bookingTime)) return null;
  const [hour, minute] = bookingTime.split(':').map(Number);
  const localWallClock = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  let instant = localWallClock - getMelbourneOffsetMilliseconds(new Date(localWallClock));
  const correctedInstant = localWallClock - getMelbourneOffsetMilliseconds(new Date(instant));
  if (correctedInstant !== instant) instant = correctedInstant;
  return new Date(instant).toISOString();
}

function formatBookingDateTimeForStaff({ bookingDate, bookingTime, datetime }) {
  const date = parseCalendarDate(bookingDate);
  if (date && typeof bookingTime === 'string' && BOOKING_TIME_PATTERN.test(bookingTime)) {
    return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year} ${bookingTime}`;
  }
  const instant = new Date(datetime);
  if (Number.isNaN(instant.getTime())) return 'Time to confirm';
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: MELBOURNE_TIME_ZONE,
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(instant);
  const value = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${value('day')}/${value('month')}/${value('year')} ${value('hour')}:${value('minute')}`;
}

function isCustomQuoteService(service) {
  return Number(service?.price) === 0;
}

function buildBookingPersistence({ devices, pricing }) {
  const bookingItems = (Array.isArray(devices) ? devices : []).map((device) => ({
    category: String(device?.category || ''),
    brand: String(device?.brand || ''),
    model: String(device?.model || ''),
    services: (Array.isArray(device?.services) ? device.services : []).map((service) => {
      const price = Number(service?.price);
      const isQuoteOnRequest = isCustomQuoteService(service);
      return {
        id: String(service?.id || ''),
        name: String(service?.name || 'Repair'),
        price: Number.isFinite(price) ? price : 0,
        ...(typeof service?.customDescription === 'string' && service.customDescription.trim()
          ? { customDescription: service.customDescription.trim() }
          : {}),
        isUpsell: String(service?.id || '').startsWith('upsell-'),
        isQuoteOnRequest,
      };
    }),
  }));
  const total = Number(pricing?.total);
  return {
    booking_total: Number.isFinite(total) ? total : 0,
    has_custom_quote: bookingItems.some((device) => device.services.some((service) => service.isQuoteOnRequest)),
    booking_items: bookingItems,
  };
}

function getArrivalRepairPrice(bookingTotal) {
  const parsed = Number(bookingTotal);
  return Number.isFinite(parsed) ? parsed : 0;
}

function filterPublicChatMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => !String(message?.content || '').startsWith(BOOKING_PREFIX));
}

module.exports = {
  MELBOURNE_TIME_ZONE,
  buildBookingPersistence,
  deriveMelbourneBookingDateTime,
  filterPublicChatMessages,
  formatBookingDateTimeForStaff,
  getArrivalRepairPrice,
};
