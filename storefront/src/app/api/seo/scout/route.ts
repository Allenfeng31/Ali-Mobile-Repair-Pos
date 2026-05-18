import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { runScoutEngine } from '@/lib/seo/scout';

const MELBOURNE_TIME_ZONE = 'Australia/Melbourne';
const COOLDOWN_SECONDS = 12 * 60 * 60;

type ScoutRequestBody = {
  forceRun?: boolean;
};

type ScoutLog = {
  created_at: string;
};

function formatMelbourneTime(date: Date): string {
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: MELBOURNE_TIME_ZONE,
  }).format(date);
}

async function readRequestBody(request: Request): Promise<ScoutRequestBody> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[seo-scout] Failed to fetch session:', sessionError);
    }

    if (!session || session.user.user_metadata?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Super Admin clearance required.' },
        { status: 401 }
      );
    }

    const { forceRun = false } = await readRequestBody(request);

    const { data: lastRunLog, error: lastRunError } = await supabase
      .from('seo_scout_logs')
      .select('created_at')
      .eq('status', 'SUCCESS')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<ScoutLog>();

    if (lastRunError) {
      throw new Error(`Failed to read SEO Scout cooldown log: ${lastRunError.message}`);
    }

    if (lastRunLog && !forceRun) {
      const lastRunAt = new Date(lastRunLog.created_at);
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - lastRunAt.getTime()) / 1000);
      const remainingSeconds = COOLDOWN_SECONDS - elapsedSeconds;

      if (remainingSeconds > 0) {
        return NextResponse.json(
          {
            status: 'LOCKED',
            message: 'Scout is cooling down.',
            remainingSeconds,
            lastRunAt: formatMelbourneTime(lastRunAt),
          },
          { status: 429 }
        );
      }
    }

    const scoutResult = await runScoutEngine({
      latitude: -37.8132,
      longitude: 145.2285,
      postalCode: '3134',
      searchQueries: [
        'iphone screen repair ringwood',
        'samsung repair near me',
        'ipad battery replacement',
      ],
    });

    const { error: insertError } = await supabase.from('seo_scout_logs').insert({
      triggered_by: session.user.id,
      keywords_found: scoutResult.insertedCount,
      violations_blocked: scoutResult.blockedCount,
      status: 'SUCCESS',
    });

    if (insertError) {
      throw new Error(`Failed to write SEO Scout telemetry log: ${insertError.message}`);
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Scout mission completed successfully.',
      data: {
        discovered: scoutResult.insertedCount,
        blockedByRisk: scoutResult.blockedCount,
        timestamp: formatMelbourneTime(new Date()),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[seo-scout] Internal failure:', error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
