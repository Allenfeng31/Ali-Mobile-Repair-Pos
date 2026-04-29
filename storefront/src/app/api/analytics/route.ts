import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const MELBOURNE_TZ = 'Australia/Melbourne';

/**
 * Server-side Supabase client using the Service Role Key.
 * This bypasses ALL RLS policies, which is exactly what we need
 * for the admin analytics dashboard.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL server env vars');
  }

  return createClient(url, serviceKey);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');

    const supabaseAdmin = getServiceClient();

    // -----------------------------------------------------------
    // 1. Build the query window in Melbourne local time,
    //    then convert to REAL UTC via fromZonedTime() before
    //    sending to Supabase. This is the critical timezone fix.
    // -----------------------------------------------------------
    const nowMelbourne = toZonedTime(new Date(), MELBOURNE_TZ);

    let localStart: Date;
    let localEnd: Date = endOfDay(nowMelbourne);

    if (timeRange === 'today') {
      localStart = startOfDay(nowMelbourne);
    } else if (timeRange === '7d') {
      localStart = startOfDay(subDays(nowMelbourne, 6));
    } else if (timeRange === '30d') {
      localStart = startOfDay(subDays(nowMelbourne, 29));
    } else {
      // Custom range – dates arrive as YYYY-MM-DD strings
      localStart = startOfDay(
        toZonedTime(new Date(customStart || format(subDays(nowMelbourne, 6), 'yyyy-MM-dd')), MELBOURNE_TZ)
      );
      localEnd = endOfDay(
        toZonedTime(new Date(customEnd || format(nowMelbourne, 'yyyy-MM-dd')), MELBOURNE_TZ)
      );
    }

    // Convert Melbourne wall-clock → real UTC instant for the DB query
    const currentStartUTC = fromZonedTime(localStart, MELBOURNE_TZ);
    const currentEndUTC = fromZonedTime(localEnd, MELBOURNE_TZ);

    // Previous period (for Period-over-Period comparison)
    const durationMs = currentEndUTC.getTime() - currentStartUTC.getTime();
    const previousEndUTC = new Date(currentStartUTC.getTime() - 1);
    const previousStartUTC = new Date(previousEndUTC.getTime() - durationMs);

    // -----------------------------------------------------------
    // 2. Fetch events for both current + previous period in one go
    // -----------------------------------------------------------
    const { data: allEvents, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      .gte('created_at', previousStartUTC.toISOString())
      .lte('created_at', currentEndUTC.toISOString());

    if (error) {
      console.error('[analytics-api] Supabase query failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // -----------------------------------------------------------
    // 3. Return raw events + period boundaries so the client
    //    can do its charting / aggregation as before.
    // -----------------------------------------------------------
    return NextResponse.json({
      events: allEvents || [],
      currentStartUTC: currentStartUTC.toISOString(),
      currentEndUTC: currentEndUTC.toISOString(),
      previousStartUTC: previousStartUTC.toISOString(),
      previousEndUTC: previousEndUTC.toISOString(),
    });
  } catch (err: any) {
    console.error('[analytics-api] Unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
