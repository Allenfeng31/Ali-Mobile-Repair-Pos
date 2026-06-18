import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';

import { createServiceRoleClient } from '@/utils/supabase/service-role';
import {
  PUBLIC_REPAIR_RESULT_SELECT,
  REPAIR_RESULT_BUCKET,
  type RepairResultDeviceCategory,
  type RepairResultStatus,
} from '@/lib/repair-results';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_DEVICE_CATEGORIES = new Set<RepairResultDeviceCategory>(['phone', 'tablet', 'laptop', 'watch']);
const VALID_STATUSES = new Set<RepairResultStatus>(['draft', 'approved', 'published', 'archived']);
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://pos.alimobile.com.au',
]);

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

  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);
  return value.length > 0 ? value : null;
}

function getBoolean(formData: FormData, key: string) {
  return getString(formData, key) === 'true';
}

function getInteger(formData: FormData, key: string) {
  const parsed = Number.parseInt(getString(formData, key), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getImageFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

async function uploadRepairImage(
  supabase: SupabaseClient,
  id: string,
  side: 'before' | 'after',
  file: File,
  privacyChecked: boolean
) {
  const prefix = privacyChecked ? 'approved' : 'raw';
  const path = `${prefix}/${id}/${side}.webp`;
  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage.from(REPAIR_RESULT_BUCKET).upload(path, arrayBuffer, {
    cacheControl: privacyChecked ? '31536000' : '3600',
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function GET(request: Request) {
  try {
    const authorized = await isAuthorizedRequest(request);

    if (!authorized) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return jsonWithCors(
      request,
      { status: 'SUCCESS', data: data || [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('[repair-results] GET failed:', error);
    return jsonWithCors(request, { error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authorized = await isAuthorizedRequest(request);

    if (!authorized) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = getString(formData, 'id');
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
      return jsonWithCors(request, { error: 'Valid UUID id is required.' }, { status: 400 });
    }

    const deviceCategory = getString(formData, 'device_category') as RepairResultDeviceCategory;
    const status = (getString(formData, 'status') || 'draft') as RepairResultStatus;
    const privacyChecked = getBoolean(formData, 'privacy_checked');
    const beforeImage = getImageFile(formData, 'before_image');
    const afterImage = getImageFile(formData, 'after_image');

    const requiredFields = [
      'brand',
      'brand_slug',
      'model',
      'model_slug',
      'repair_type',
      'repair_type_slug',
      'title',
    ];

    const missingField = requiredFields.find((field) => !getString(formData, field));
    if (missingField) {
      return jsonWithCors(request, { error: `${missingField} is required.` }, { status: 400 });
    }

    if (!VALID_DEVICE_CATEGORIES.has(deviceCategory)) {
      return jsonWithCors(request, { error: 'Invalid device category.' }, { status: 400 });
    }

    if (!VALID_STATUSES.has(status)) {
      return jsonWithCors(request, { error: 'Invalid status.' }, { status: 400 });
    }

    if (status === 'published' && !privacyChecked) {
      return jsonWithCors(request, { error: 'Privacy confirmation is required before publishing.' }, { status: 400 });
    }

    if (!beforeImage || !afterImage) {
      return jsonWithCors(request, { error: 'Before and after images are required.' }, { status: 400 });
    }

    if (!beforeImage.type.startsWith('image/') || !afterImage.type.startsWith('image/')) {
      return jsonWithCors(request, { error: 'Only image uploads are supported.' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // 2. Check whether the ID already exists
    const { data: existingRecord, error: existingError } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (existingError) {
      return jsonWithCors(request, { error: 'Database error checking idempotency.' }, { status: 500 });
    }

    // 3. If it already exists before uploading, return 200 with idempotentReplay: true
    if (existingRecord) {
      return jsonWithCors(request, {
        status: 'SUCCESS',
        data: existingRecord,
        idempotentReplay: true,
      }, { status: 200 });
    }

    const uploadedPaths: string[] = [];
    let data;
    
    try {
      // 4. Upload files and track paths
      const beforeImagePath = await uploadRepairImage(supabase, id, 'before', beforeImage, privacyChecked);
      uploadedPaths.push(beforeImagePath);
      
      const afterImagePath = await uploadRepairImage(supabase, id, 'after', afterImage, privacyChecked);
      uploadedPaths.push(afterImagePath);

      // 5. Attempt DB insert
      const { data: insertData, error: insertError } = await supabase
        .from('repair_results')
        .insert({
          id,
          device_category: deviceCategory,
          brand: getString(formData, 'brand'),
          brand_slug: getString(formData, 'brand_slug'),
          model: getString(formData, 'model'),
          model_slug: getString(formData, 'model_slug'),
          repair_type: getString(formData, 'repair_type'),
          repair_type_slug: getString(formData, 'repair_type_slug'),
          before_image_path: beforeImagePath,
          after_image_path: afterImagePath,
          image_pair_alt_text: getOptionalString(formData, 'image_pair_alt_text'),
          image_aspect_ratio: getString(formData, 'image_aspect_ratio') || '4:3',
          before_image_width: getInteger(formData, 'before_image_width') || null,
          before_image_height: getInteger(formData, 'before_image_height') || null,
          after_image_width: getInteger(formData, 'after_image_width') || null,
          after_image_height: getInteger(formData, 'after_image_height') || null,
          title: getString(formData, 'title'),
          short_description: getOptionalString(formData, 'short_description'),
          status,
          privacy_checked: privacyChecked,
          featured_on_homepage: getBoolean(formData, 'featured_on_homepage'),
          sort_order: getInteger(formData, 'sort_order'),
          related_repair_url: getOptionalString(formData, 'related_repair_url'),
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select(PUBLIC_REPAIR_RESULT_SELECT)
        .single();

      if (insertError) {
        throw insertError;
      }
      
      data = insertData;
    } catch (error: any) {
      // Clean up ONLY this request's uploaded paths
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(REPAIR_RESULT_BUCKET).remove(uploadedPaths).catch(cleanupError => {
          console.warn('[repair-results] Failed to clean up orphan images after DB insert error:', cleanupError);
        });
      }
      
      // 7. If the insert fails because the UUID was concurrently inserted (unique constraint violation code 23505)
      if (error && error.code === '23505') {
        const { data: concurrentRecord } = await supabase
          .from('repair_results')
          .select(PUBLIC_REPAIR_RESULT_SELECT)
          .eq('id', id)
          .maybeSingle();
          
        if (concurrentRecord) {
          return jsonWithCors(request, {
            status: 'SUCCESS',
            data: concurrentRecord,
            idempotentReplay: true,
          }, { status: 200 });
        }
      }
      
      // 8. For any other insertion failure
      throw error;
    }



    return jsonWithCors(request, { status: 'SUCCESS', data }, { status: 201 });
  } catch (error) {
    console.error('[repair-results] POST failed:', error);
    return jsonWithCors(request, { error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
