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

type ScoutSessionUser = {
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

const SUPABASE_SYSTEM_ROLES = ['authenticated', 'anon', 'service_role'];

function formatMelbourneTime(date: Date): string {
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: MELBOURNE_TIME_ZONE,
  }).format(date);
}

function isSuperAdminUser(user: ScoutSessionUser | undefined): boolean {
  const topLevelRole = user?.role || '';
  const isSystemRole = SUPABASE_SYSTEM_ROLES.includes(topLevelRole.toLowerCase());
  const customRole = !topLevelRole || isSystemRole
    ? String(user?.app_metadata?.role || user?.user_metadata?.role || '')
    : topLevelRole;

  return customRole.toLowerCase().replace(/_/g, ' ') === 'super admin';
}

function isLocalDevelopmentRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

  return process.env.NODE_ENV !== 'production' && isLocalHost;
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
    const isLocalDevRequest = isLocalDevelopmentRequest(request);
    const { forceRun = false } = await readRequestBody(request);
    let sessionUserId = 'local-dev-bypass';
    let isLocalDevBypass = isLocalDevRequest;

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: (() => cookieStore) as unknown as typeof cookies,
    });

    if (isLocalDevRequest) {
      console.warn('[seo-scout] Local development auth bypass enabled for scout route.');
    } else {
      isLocalDevBypass = false;
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[seo-scout] Failed to fetch session:', sessionError);
      }

      if (!session || !isSuperAdminUser(session.user)) {
        console.log("🚨 [Scout Auth Triaged Failed] Current Session User Data:", {
          id: session?.user?.id,
          role: session?.user?.role,
          app_metadata: session?.user?.app_metadata,
          user_metadata: session?.user?.user_metadata
        });

        return NextResponse.json(
          { error: 'Unauthorized: Super Admin clearance required.' },
          { status: 401 }
        );
      }

      sessionUserId = session.user.id;
    }

    if (isLocalDevBypass) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.id) {
          sessionUserId = session.user.id;
        }

        if (session && !isSuperAdminUser(session.user)) {
          console.log("🚨 [Scout Auth Triaged Failed] Current Session User Data:", {
            id: session.user.id,
            role: session.user.role,
            app_metadata: session.user.app_metadata,
            user_metadata: session.user.user_metadata
          });
        }
      } catch (authError) {
        console.warn('[seo-scout] Local development session lookup skipped after auth-helper failure:', authError);
      } finally {
        console.warn('[seo-scout] Local development auth bypass enabled for scout route.');
      }
    }

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

    const scoutResult = await runScoutEngine(
      {
        latitude: -37.8132,
        longitude: 145.2285,
        postalCode: '3134',
        searchQueries: [
          'iphone screen repair ringwood',
          'samsung repair near me',
          'ipad battery replacement',
        ],
      },
      supabase
    );

    const { error: insertError } = await supabase.from('seo_scout_logs').insert({
      triggered_by: sessionUserId,
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
