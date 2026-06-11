import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import {
  PUBLIC_REPAIR_RESULT_SELECT,
  REPAIR_RESULT_BUCKET,
  type PublicRepairResult,
  type RepairResultStatus,
} from '@/lib/repair-results';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set<RepairResultStatus>(['draft', 'approved', 'published', 'archived']);
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://pos.alimobile.com.au',
]);

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function createSessionClient() {
  const cookieStore = await cookies();

  return createRouteHandlerClient({
    cookies: (() => cookieStore) as unknown as typeof cookies,
  });
}

async function assertAuthenticated(supabase: ReturnType<typeof createRouteHandlerClient>) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[repair-results] Failed to read admin session:', error);
  }

  return Boolean(session?.user);
}

function buildCorsHeaders(request: Request, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  const origin = request.headers.get('origin') || '';

  headers.set('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Vary', 'Origin');

  if (ALLOWED_ORIGINS.has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }

  return headers;
}

function jsonWithCors(request: Request, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: buildCorsHeaders(request, init?.headers),
  });
}

async function assertBearerAuthenticated(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = tokenMatch?.[1];

  if (!token) return false;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return false;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error) {
    console.error('[repair-results] Failed to read bearer session:', error);
  }

  return Boolean(data.user);
}

async function isAuthorizedRequest(request: Request) {
  if (await assertBearerAuthenticated(request)) {
    return true;
  }

  const sessionClient = await createSessionClient();
  return assertAuthenticated(sessionClient);
}

async function copyToApprovedPath(
  supabase: SupabaseClient,
  currentPath: string,
  id: string,
  side: 'before' | 'after'
) {
  if (currentPath.startsWith('approved/')) return currentPath;
  if (!currentPath.startsWith(`raw/${id}/`)) {
    throw new Error(`Unexpected ${side} image path.`);
  }

  const approvedPath = `approved/${id}/${side}.webp`;
  const { error } = await supabase.storage
    .from(REPAIR_RESULT_BUCKET)
    .copy(currentPath, approvedPath);

  if (error && !error.message.toLowerCase().includes('already exists')) {
    throw error;
  }

  return approvedPath;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const authorized = await isAuthorizedRequest(request);

    if (!authorized) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const nextStatus = typeof body.status === 'string' ? body.status.trim() as RepairResultStatus : undefined;
    const nextPrivacyChecked = typeof body.privacy_checked === 'boolean' ? body.privacy_checked : undefined;
    const nextFeaturedOnHomepage = typeof body.featured_on_homepage === 'boolean' ? body.featured_on_homepage : undefined;

    if (nextStatus && !VALID_STATUSES.has(nextStatus)) {
      return jsonWithCors(request, { error: 'Invalid status.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: existing, error: fetchError } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      return jsonWithCors(request, { error: 'Repair result not found.' }, { status: 404 });
    }

    const record = existing as unknown as PublicRepairResult;
    const privacyChecked = nextPrivacyChecked ?? record.privacy_checked;
    const status = nextStatus ?? record.status;

    if (status === 'published' && !privacyChecked) {
      return jsonWithCors(request, { error: 'Privacy confirmation is required before publishing.' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      privacy_checked: privacyChecked,
      status,
      published_at: status === 'published' ? (record.published_at || new Date().toISOString()) : record.published_at,
    };

    if (nextFeaturedOnHomepage !== undefined) {
      updates.featured_on_homepage = nextFeaturedOnHomepage;
    }

    if (privacyChecked) {
      updates.before_image_path = await copyToApprovedPath(supabase, record.before_image_path, id, 'before');
      updates.after_image_path = await copyToApprovedPath(supabase, record.after_image_path, id, 'after');
    }

    const { data, error } = await supabase
      .from('repair_results')
      .update(updates)
      .eq('id', id)
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .single();

    if (error) throw error;

    return jsonWithCors(request, { status: 'SUCCESS', data });
  } catch (error) {
    console.error('[repair-results] PATCH failed:', error);
    return jsonWithCors(request, { error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
