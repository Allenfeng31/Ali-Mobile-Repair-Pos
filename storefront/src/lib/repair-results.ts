import { createClient } from '@supabase/supabase-js';

export type RepairResultDeviceCategory = 'phone' | 'tablet' | 'laptop' | 'watch';
export type RepairResultStatus = 'draft' | 'approved' | 'published' | 'archived';

export interface PublicRepairResult {
  id: string;
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  before_image_path: string;
  after_image_path: string;
  image_pair_alt_text: string | null;
  image_aspect_ratio: string | null;
  before_image_width: number | null;
  before_image_height: number | null;
  after_image_width: number | null;
  after_image_height: number | null;
  title: string;
  short_description: string | null;
  status: RepairResultStatus;
  privacy_checked: boolean;
  featured_on_homepage: boolean;
  sort_order: number;
  related_repair_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export const REPAIR_RESULT_BUCKET = 'repair-results';

export const REPAIR_RESULT_CATEGORIES: Array<{
  value: RepairResultDeviceCategory;
  label: string;
}> = [
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'laptop', label: 'MacBook' },
  { value: 'watch', label: 'Watch' },
];

export const PUBLIC_REPAIR_RESULT_SELECT = [
  'id',
  'device_category',
  'brand',
  'brand_slug',
  'model',
  'model_slug',
  'repair_type',
  'repair_type_slug',
  'before_image_path',
  'after_image_path',
  'image_pair_alt_text',
  'image_aspect_ratio',
  'before_image_width',
  'before_image_height',
  'after_image_width',
  'after_image_height',
  'title',
  'short_description',
  'status',
  'privacy_checked',
  'featured_on_homepage',
  'sort_order',
  'related_repair_url',
  'created_at',
  'updated_at',
  'published_at',
].join(',');

const PUBLIC_REPAIR_RESULTS_FETCH_TIMEOUT_MS = 3500;

function createPublicRepairResultsClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PUBLIC_REPAIR_RESULTS_FETCH_TIMEOUT_MS);

        try {
          return await fetch(input, {
            ...init,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  });
}

export function getRepairResultImageSrc(result: PublicRepairResult, side: 'before' | 'after') {
  return `/media/repair-results/${encodeURIComponent(result.id)}/${side}`;
}

export function getRepairResultAltText(result: PublicRepairResult, side: 'before' | 'after') {
  const explicitAlt = result.image_pair_alt_text?.trim();
  if (explicitAlt) return `${explicitAlt} - ${side}`;

  return `${side === 'before' ? 'Before' : 'After'} ${result.model} ${result.repair_type} completed at Ali Mobile & Repair in Ringwood Square`;
}

export function getRepairResultAspectRatio(value?: string | null) {
  const normalized = (value || '4:3').trim();
  const ratioMatch = normalized.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);

  if (ratioMatch) {
    return `${ratioMatch[1]} / ${ratioMatch[2]}`;
  }

  if (/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(normalized)) {
    return normalized;
  }

  return '4 / 3';
}

export function isPublicRepairResult(result: Pick<PublicRepairResult, 'status' | 'privacy_checked' | 'before_image_path' | 'after_image_path'>) {
  return (
    result.status === 'published' &&
    result.privacy_checked === true &&
    result.before_image_path.trim().length > 0 &&
    result.after_image_path.trim().length > 0
  );
}

export async function fetchFeaturedRepairResultsByCategory(): Promise<Partial<Record<RepairResultDeviceCategory, PublicRepairResult>>> {
  const supabase = createPublicRepairResultsClient();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('status', 'published')
      .eq('privacy_checked', true)
      .eq('featured_on_homepage', true)
      .neq('before_image_path', '')
      .neq('after_image_path', '')
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(24);

    if (error) {
      console.error('[repair-results] Failed to fetch featured repair results:', error);
      return {};
    }

    const byCategory: Partial<Record<RepairResultDeviceCategory, PublicRepairResult>> = {};

    for (const result of (data || []) as unknown as PublicRepairResult[]) {
      if (!isPublicRepairResult(result)) continue;
      if (!byCategory[result.device_category]) {
        byCategory[result.device_category] = result;
      }
    }

    return byCategory;
  } catch (error) {
    console.error('[repair-results] Unexpected featured repair result failure:', error);
    return {};
  }
}
