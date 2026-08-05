const BUSINESS_DAYS = Object.freeze([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const);

export const BUSINESS_HOURS = Object.freeze({
  days: BUSINESS_DAYS,
  opens: "09:00",
  closes: "17:00",
  compactDisplay: "Mon-Sat, 9am-5pm",
  sentenceDisplay: "9am to 5pm, Monday to Saturday",
  bookingStartSlots: Object.freeze([
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ] as const),
});

export const LOCAL_BUSINESS_OPENING_HOURS = Object.freeze({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: BUSINESS_HOURS.days,
  opens: BUSINESS_HOURS.opens,
  closes: BUSINESS_HOURS.closes,
});
