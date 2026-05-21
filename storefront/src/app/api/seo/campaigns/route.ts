import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

type SeoSessionUser = {
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

const SUPABASE_SYSTEM_ROLES = ['authenticated', 'anon', 'service_role'];

async function createSeoRouteSupabase() {
  const cookieStore = await cookies();

  return createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as typeof cookies,
  });
}

function isSuperAdminUser(user: SeoSessionUser | undefined): boolean {
  const topLevelRole = user?.role || '';
  const isSystemRole = SUPABASE_SYSTEM_ROLES.includes(topLevelRole.toLowerCase());
  const customRole = !topLevelRole || isSystemRole
    ? String(user?.app_metadata?.role || user?.user_metadata?.role || '')
    : topLevelRole;

  return customRole.toLowerCase().replace(/_/g, ' ') === 'super admin';
}

function isLocalDevelopmentRequest(request: Request): boolean {
  const hostname = new URL(request.url).hostname;
  return process.env.NODE_ENV !== 'production' && (hostname === 'localhost' || hostname === '127.0.0.1');
}

async function assertCanAccessSeoCampaigns(request: Request, supabase: ReturnType<typeof createRouteHandlerClient>) {
  if (isLocalDevelopmentRequest(request)) {
    return true;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[seo-campaigns] Failed to fetch session:', error);
  }

  return Boolean(session && isSuperAdminUser(session.user));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Internal Server Error';
}

export async function GET(request: Request) {
  try {
    const supabase = await createSeoRouteSupabase();
    const authorized = await assertCanAccessSeoCampaigns(request, supabase);

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (campaignId) {
      const { data, error } = await supabase
        .from('pending_seo_campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json(
        { status: 'SUCCESS', data },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    const { data, error } = await supabase
      .from('pending_seo_campaigns')
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(
      { status: 'SUCCESS', data },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('[seo-campaigns] Internal failure:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
