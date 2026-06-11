import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import {
  PUBLIC_REPAIR_RESULT_SELECT,
  REPAIR_RESULT_BUCKET,
  type RepairResultDeviceCategory,
  type RepairResultStatus,
} from '@/lib/repair-results';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

const VALID_DEVICE_CATEGORIES = new Set<RepairResultDeviceCategory>(['phone', 'tablet', 'laptop', 'watch']);
const VALID_STATUSES = new Set<RepairResultStatus>(['draft', 'approved', 'published', 'archived']);
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://pos.alimobile.com.au',
]);

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

async function sanitizeRepairImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: 'none' }).rotate();
  
  const resized = image.resize({ width: 1600, withoutEnlargement: true });
  const metadata = await resized.metadata();
  
  const output = await resized
    .webp({ quality: 80 })
    .toBuffer();

  return {
    buffer: output,
    width: metadata.width || null,
    height: metadata.height || null,
  };
}

async function uploadSanitizedRepairImage(
  supabase: SupabaseClient,
  id: string,
  side: 'before' | 'after',
  file: File,
  privacyChecked: boolean
) {
  const prefix = privacyChecked ? 'approved' : 'raw';
  const path = `${prefix}/${id}/${side}.webp`;
  const sanitized = await sanitizeRepairImage(file);
  const { error } = await supabase.storage.from(REPAIR_RESULT_BUCKET).upload(path, sanitized.buffer, {
    cacheControl: privacyChecked ? '31536000' : '3600',
    contentType: 'image/webp',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    path,
    width: sanitized.width,
    height: sanitized.height,
  };
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
    const id = randomUUID();
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
    const beforeImageUpload = await uploadSanitizedRepairImage(supabase, id, 'before', beforeImage, privacyChecked);
    const afterImageUpload = await uploadSanitizedRepairImage(supabase, id, 'after', afterImage, privacyChecked);

    const { data, error } = await supabase
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
        before_image_path: beforeImageUpload.path,
        after_image_path: afterImageUpload.path,
        image_pair_alt_text: getOptionalString(formData, 'image_pair_alt_text'),
        image_aspect_ratio: getString(formData, 'image_aspect_ratio') || '4:3',
        before_image_width: beforeImageUpload.width,
        before_image_height: beforeImageUpload.height,
        after_image_width: afterImageUpload.width,
        after_image_height: afterImageUpload.height,
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

    if (error) throw error;

    return jsonWithCors(request, { status: 'SUCCESS', data }, { status: 201 });
  } catch (error) {
    console.error('[repair-results] POST failed:', error);
    return jsonWithCors(request, { error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
