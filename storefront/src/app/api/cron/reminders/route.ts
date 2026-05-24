import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'Australia/Melbourne';
const SMS_SEGMENT_LIMIT = 160;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

type BookingSource = 'bookings' | 'appointments';
type BookingRecord = Record<string, unknown>;

type ReminderCandidate = {
  id: string;
  idField: string;
  source: BookingSource;
  phone: string;
  bookingTime: string;
  record: BookingRecord;
};

type ReminderResult = {
  id: string;
  source: BookingSource;
  status: 'sent' | 'failed';
  messageLength?: number;
  sid?: string;
  phone?: string;
  error?: string;
};

const normalizeSMSText = (text: unknown) =>
  String(text || '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const cleanSMS = (text: unknown) => normalizeSMSText(text).slice(0, SMS_SEGMENT_LIMIT);

const trimForSMS = (value: unknown, maxLength: number, fallback = '') => {
  const normalized = normalizeSMSText(value || fallback);
  return normalized.length > maxLength ? normalized.slice(0, maxLength).trim() : normalized;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || 'Unknown error');

const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

const getStringField = (record: BookingRecord, fields: string[]) => {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }

  return '';
};

const getStringFieldEntry = (record: BookingRecord, fields: string[]) => {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return { field, value: value.trim() };
    if (typeof value === 'number') return { field, value: String(value) };
  }

  return null;
};

const formatAustralianPhone = (phone: string) => {
  const formatted = phone.replace(/[^\d+]/g, '');
  if (formatted.startsWith('0')) return `+61${formatted.slice(1)}`;
  if (formatted.startsWith('61')) return `+${formatted}`;
  return formatted;
};

const maskPhone = (phone: string) =>
  phone.length <= 4 ? phone : `${phone.slice(0, 3)}...${phone.slice(-3)}`;

const getMelbourneDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const value = (type: string) => Number(parts.find(part => part.type === type)?.value || 0);

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
  };
};

const toDateString = ({ year, month, day }: { year: number; month: number; day: number }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const addDaysToDateString = (dateString: string, days: number) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return toDateString({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
};

const getTomorrowDateString = () => addDaysToDateString(toDateString(getMelbourneDateParts(new Date())), 1);

const getTimeZoneOffsetMs = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const value = (type: string) => Number(parts.find(part => part.type === type)?.value || 0);
  const zonedAsUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second')
  );

  return zonedAsUtc - date.getTime();
};

const zonedDateTimeToUtcIso = (dateString: string, timeString = '00:00') => {
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour || 0, minute || 0, 0));
  const offset = getTimeZoneOffsetMs(utcGuess);
  return new Date(utcGuess.getTime() - offset).toISOString();
};

const formatTimeInMelbourne = (value: unknown) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-AU', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const getBookingTime = (record: BookingRecord) => {
  const explicitTime = getStringField(record, ['appointment_time', 'booking_time', 'time', 'slot']);
  if (explicitTime) return explicitTime.slice(0, 5);

  const datetime = getStringField(record, ['datetime', 'appointment_datetime', 'scheduled_at', 'starts_at']);
  return formatTimeInMelbourne(datetime) || 'TBC';
};

const shouldSkipRecord = (record: BookingRecord) => {
  const status = getStringField(record, ['status', 'booking_status']).toLowerCase();
  return ['cancelled', 'canceled', 'declined'].includes(status);
};

const REMINDER_SENT_NOTE_REGEX = /\[REMINDER_SENT_AT:([^;\]]+)(?:;SID:[^\]]+)?\]/;

const getReminderSentAt = (record: BookingRecord) => {
  const explicit = getStringField(record, ['reminder_sent_at', 'reminder_sms_sent_at', 'reminderSentAt']);
  if (explicit) return explicit;

  const notes = getStringField(record, ['notes', 'internal_notes']);
  return notes.match(REMINDER_SENT_NOTE_REGEX)?.[1] || '';
};

const appendReminderSentNote = (notes: unknown, sentAt: string, sid?: string) => {
  const cleanNotes = String(notes || '').replace(REMINDER_SENT_NOTE_REGEX, '').trim();
  const marker = `[REMINDER_SENT_AT:${sentAt}${sid ? `;SID:${sid}` : ''}]`;
  return cleanNotes ? `${cleanNotes} ${marker}` : marker;
};

const isMissingReminderColumnError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes('reminder_sent_at') || message.includes('reminder_sms_sid');
};

const buildReminderSMS = (bookingTime: string) => {
  const time = trimForSMS(bookingTime, 18, 'TBC');
  return cleanSMS(
    `Reminder: Your Ali Mobile repair booking is TOMORROW at ${time}! Loc: Kiosk C1, Ringwood Square Shopping Centre. Need to change? Call 0485058514.`
  );
};

async function fetchBookingRows(supabase: SupabaseClient, tomorrowDate: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('appointment_date', tomorrowDate);

  if (error) {
    console.warn('[Cron reminders] bookings query skipped:', error.message);
    return [];
  }

  return data || [];
}

async function fetchAppointmentRows(supabase: SupabaseClient, tomorrowDate: string) {
  const startIso = zonedDateTimeToUtcIso(tomorrowDate);
  const endIso = zonedDateTimeToUtcIso(addDaysToDateString(tomorrowDate, 1));

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .gte('datetime', startIso)
    .lt('datetime', endIso);

  if (error) {
    console.warn('[Cron reminders] appointments query skipped:', error.message);
    return [];
  }

  return data || [];
}

const toCandidate = (record: BookingRecord, source: BookingSource, index: number): ReminderCandidate | null => {
  if (shouldSkipRecord(record)) return null;
  if (getReminderSentAt(record)) return null;

  const phone = getStringField(record, ['phone', 'customer_phone', 'phone_number', 'mobile']);
  if (!phone) return null;

  const idEntry = getStringFieldEntry(record, ['id', 'booking_id', 'appointment_id']);

  return {
    id: idEntry?.value || `${source}-${index}`,
    idField: idEntry?.field || 'id',
    source,
    phone,
    bookingTime: getBookingTime(record),
    record,
  };
};

async function markReminderSent(
  supabase: SupabaseClient,
  candidate: ReminderCandidate,
  sentAt: string,
  sid?: string
) {
  const updateWithSid = await supabase
    .from(candidate.source)
    .update({ reminder_sent_at: sentAt, reminder_sms_sid: sid || null })
    .eq(candidate.idField, candidate.id);

  if (!updateWithSid.error) return;

  if (!isMissingReminderColumnError(updateWithSid.error)) {
    throw updateWithSid.error;
  }

  const updateSentAtOnly = await supabase
    .from(candidate.source)
    .update({ reminder_sent_at: sentAt })
    .eq(candidate.idField, candidate.id);

  if (!updateSentAtOnly.error) return;

  if (!isMissingReminderColumnError(updateSentAtOnly.error)) {
    throw updateSentAtOnly.error;
  }

  const noteField = 'notes' in candidate.record ? 'notes' : 'internal_notes';
  const existingNotes = candidate.record[noteField];
  const notes = appendReminderSentNote(existingNotes, sentAt, sid);
  const notesUpdate = await supabase
    .from(candidate.source)
    .update({ [noteField]: notes })
    .eq(candidate.idField, candidate.id);

  if (notesUpdate.error) {
    throw notesUpdate.error;
  }
}

async function runReminderJob() {
  try {
    const tomorrowDate = getTomorrowDateString();
    const supabase = getSupabase();

    const [bookingRows, appointmentRows] = await Promise.all([
      fetchBookingRows(supabase, tomorrowDate),
      fetchAppointmentRows(supabase, tomorrowDate),
    ]);

    const seen = new Set<string>();
    const candidates = [
      ...bookingRows.map((record, index) => toCandidate(record, 'bookings', index)),
      ...appointmentRows.map((record, index) => toCandidate(record, 'appointments', index)),
    ].filter((candidate): candidate is ReminderCandidate => {
      if (!candidate) return false;

      const dedupeKey = `${formatAustralianPhone(candidate.phone)}|${candidate.bookingTime}`;
      if (seen.has(dedupeKey)) return false;

      seen.add(dedupeKey);
      return true;
    });

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('[Cron reminders] Twilio not configured. Reminder job completed without SMS sends.');
      return NextResponse.json({
        success: true,
        smsEnabled: false,
        date: tomorrowDate,
        candidates: candidates.length,
        message: 'Twilio not configured',
      });
    }

    const client = twilio(accountSid, authToken);
    const results: ReminderResult[] = [];

    for (const candidate of candidates) {
      try {
        const to = formatAustralianPhone(candidate.phone);
        const body = buildReminderSMS(candidate.bookingTime);

        if (!to) throw new Error('Missing customer phone');
        if (body.length > SMS_SEGMENT_LIMIT) throw new Error(`Reminder SMS exceeds ${SMS_SEGMENT_LIMIT} characters`);

        const message = await client.messages.create({
          body,
          from: fromNumber,
          to,
        });
        const sentAt = new Date().toISOString();

        await markReminderSent(supabase, candidate, sentAt, message.sid);

        results.push({
          id: candidate.id,
          source: candidate.source,
          status: 'sent',
          sid: message.sid,
          phone: maskPhone(to),
          messageLength: body.length,
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('[Cron reminders] Failed to send reminder:', {
          id: candidate.id,
          source: candidate.source,
          error: errorMessage,
        });

        results.push({
          id: candidate.id,
          source: candidate.source,
          status: 'failed',
          phone: maskPhone(formatAustralianPhone(candidate.phone)),
          error: errorMessage,
        });
      }
    }

    const sent = results.filter(result => result.status === 'sent').length;
    const failed = results.filter(result => result.status === 'failed').length;

    return NextResponse.json({
      success: true,
      smsEnabled: true,
      date: tomorrowDate,
      bookingsChecked: bookingRows.length,
      appointmentsChecked: appointmentRows.length,
      candidates: candidates.length,
      sent,
      failed,
      results,
    });
  } catch (error) {
    console.error('[Cron reminders] Reminder job failed:', error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return runReminderJob();
}

export async function POST() {
  return runReminderJob();
}
