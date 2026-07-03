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
  featured_on_repair_hub: boolean;
  featured_on_brand_hub: boolean;
  sort_order: number;
  related_repair_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface RepairResultHomepageItem {
  id: string;
  device_category: RepairResultDeviceCategory;
  model: string;
  repair_type: string;
  image_pair_alt_text: string | null;
  title: string;
  short_description: string | null;
  related_repair_url: string | null;
}

export interface RepairResultMatchingItem {
  id: string;
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  image_pair_alt_text: string | null;
  title: string;
  short_description: string | null;
  related_repair_url: string | null;
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

export interface RepairResultFrameConfig {
  aspectRatio: string;
  maxWidth: string;
  maxHeight: string;
  mobileMaxHeight: string;
  sizes: string;
}

export function getRepairResultFrameConfig(deviceCategory: RepairResultDeviceCategory): RepairResultFrameConfig {
  switch (deviceCategory) {
    case 'phone':
      return {
        aspectRatio: '3 / 4',
        maxWidth: '420px',
        maxHeight: '520px',
        mobileMaxHeight: '420px',
        sizes: '(min-width: 1024px) 420px, (min-width: 640px) 92vw, 100vw',
      };
    case 'tablet':
      return {
        aspectRatio: '4 / 3',
        maxWidth: '660px',
        maxHeight: '500px',
        mobileMaxHeight: '420px',
        sizes: '(min-width: 1024px) 660px, (min-width: 640px) 92vw, 100vw',
      };
    case 'laptop':
      return {
        aspectRatio: '16 / 10',
        maxWidth: '660px',
        maxHeight: '500px',
        mobileMaxHeight: '420px',
        sizes: '(min-width: 1024px) 660px, (min-width: 640px) 92vw, 100vw',
      };
    case 'watch':
    default:
      return {
        aspectRatio: '1 / 1',
        maxWidth: '420px',
        maxHeight: '420px',
        mobileMaxHeight: '420px',
        sizes: '(min-width: 1024px) 420px, (min-width: 640px) 84vw, 100vw',
      };
  }
}

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
  'featured_on_repair_hub',
  'featured_on_brand_hub',
  'sort_order',
  'related_repair_url',
  'created_at',
  'updated_at',
  'published_at',
].join(',');

const PUBLIC_REPAIR_RESULTS_FETCH_TIMEOUT_MS = 3500;

export function createPublicRepairResultsClient() {
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

export function getRepairResultImageSrc(result: Pick<RepairResultHomepageItem, 'id'>, side: 'before' | 'after') {
  return `/media/repair-results/${encodeURIComponent(result.id)}/${side}`;
}

export function getRepairResultAltText(
  result: Pick<RepairResultHomepageItem, 'image_pair_alt_text' | 'model' | 'repair_type'>,
  side: 'before' | 'after'
) {
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

type HubRepairGroup = 'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing';

function normalizeHubRepairGroup(slug: string): HubRepairGroup | null {
  if (slug === 'screen-replacement' || slug === 'screen-repair' || slug === 'screen') {
    return 'screen';
  }
  if (slug === 'battery-replacement' || slug === 'battery-service' || slug === 'battery-repair' || slug === 'battery') {
    return 'battery';
  }
  if (slug === 'charging-port-replacement' || slug === 'charging-port-repair' || slug === 'charging-port') {
    return 'charging-port';
  }
  if (slug === 'back-glass-replacement' || slug === 'back-housing-replacement' || slug === 'back-glass' || slug === 'back-housing') {
    return 'back-glass-or-housing';
  }
  return null;
}

export async function fetchHubRepairResults(
  category: RepairResultDeviceCategory,
  brand?: string
): Promise<PublicRepairResult[]> {
  const supabase = createPublicRepairResultsClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('status', 'published')
      .eq('privacy_checked', true)
      .neq('before_image_path', '')
      .neq('after_image_path', '')
      .eq('device_category', category);

    if (brand) {
      const aliases = brand === 'iphone' || brand === 'ipad' ? [brand, 'apple'] : [brand];
      query = query.in('brand_slug', aliases).eq('featured_on_brand_hub', true);
    } else {
      query = query.eq('featured_on_repair_hub', true);
    }

    const { data, error } = await query
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[repair-results] Failed to fetch hub repair results:', error);
      return [];
    }

    const groups: Partial<Record<HubRepairGroup, PublicRepairResult>> = {};

    for (const result of (data || []) as unknown as PublicRepairResult[]) {
      if (!isPublicRepairResult(result)) continue;
      const group = normalizeHubRepairGroup(result.repair_type_slug);
      if (group && !groups[group]) {
        groups[group] = result;
        if (Object.keys(groups).length === 4) break;
      }
    }

    const groupOrder: HubRepairGroup[] = ['screen', 'battery', 'charging-port', 'back-glass-or-housing'];
    return groupOrder.map(group => groups[group]).filter(Boolean) as PublicRepairResult[];
  } catch (error) {
    console.error('[repair-results] Unexpected hub repair result failure:', error);
    return [];
  }
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
