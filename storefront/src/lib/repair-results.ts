import { createClient } from '@supabase/supabase-js';
import { getRepairTypeHubDefinition } from './repair-type-hubs';

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

export interface HomepageRepairResultSeed {
  resultsByCategory: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>>;
  latestPublishedAt: string | null;
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

export interface ServerRepairResultProof {
  device_category: RepairResultDeviceCategory;
  brand: string;
  brand_slug: string;
  model: string;
  model_slug: string;
  repair_type: string;
  repair_type_slug: string;
  title: string;
  short_description: string | null;
  related_repair_url: string | null;
}

export type ServerRepairResultProofRequest =
  | { surface: 'homepage'; limit?: number }
  | { surface: 'repair-hub'; category: RepairResultDeviceCategory; limit?: number }
  | { surface: 'brand-hub'; category: RepairResultDeviceCategory; brandSlug: string; limit?: number }
  | { surface: 'model-hub'; category: RepairResultDeviceCategory; brandSlug: string; modelSlug: string; limit?: number }
  | { surface: 'repair-detail'; category: RepairResultDeviceCategory; brandSlug: string; modelSlug: string; repairTypeSlug: string; limit?: number }
  | { surface: 'repair-type-hub'; category: RepairResultDeviceCategory; repairTypeSlug: string; limit?: number };

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
export const MAX_SERVER_REPAIR_RESULT_PROOFS = 4;
export const MAX_DETAIL_INITIAL_REPAIR_RESULTS = 1;
export const MAX_HOMEPAGE_REPAIR_RESULT_QUERY_ROWS = 24;
export const MAX_HUB_REPAIR_RESULT_QUERY_ROWS = 50;

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

function toRepairResultHomepageItem(result: PublicRepairResult): RepairResultHomepageItem {
  return {
    id: result.id,
    device_category: result.device_category,
    model: result.model,
    repair_type: result.repair_type,
    image_pair_alt_text: result.image_pair_alt_text,
    title: result.title,
    short_description: result.short_description,
    related_repair_url: result.related_repair_url,
  };
}

/**
 * Applies the existing homepage query order to at most 24 candidates, then
 * keeps the first qualifying public result for each fixed homepage category.
 */
export function selectHomepageRepairResultSeed(
  results: readonly PublicRepairResult[],
): HomepageRepairResultSeed {
  const resultsByCategory: Partial<Record<RepairResultDeviceCategory, RepairResultHomepageItem>> = {};
  let latestPublishedAt: string | null = null;

  for (const result of results.slice(0, MAX_HOMEPAGE_REPAIR_RESULT_QUERY_ROWS)) {
    if (!isPublicRepairResult(result) || !result.featured_on_homepage || resultsByCategory[result.device_category]) {
      continue;
    }

    resultsByCategory[result.device_category] = toRepairResultHomepageItem(result);
    const timestamp = result.published_at || result.created_at;
    if (timestamp && (!latestPublishedAt || new Date(timestamp) > new Date(latestPublishedAt))) {
      latestPublishedAt = timestamp;
    }
  }

  return { resultsByCategory, latestPublishedAt };
}

/**
 * Projects an already-query-ordered exact Detail result into the existing
 * public matching-item shape. Media storage paths stay server-only.
 */
export function selectDetailRepairResultInitialSeeds(
  results: readonly PublicRepairResult[],
): RepairResultMatchingItem[] {
  return results
    .filter(isPublicRepairResult)
    .slice(0, MAX_DETAIL_INITIAL_REPAIR_RESULTS)
    .map((result) => ({
      id: result.id,
      device_category: result.device_category,
      brand: result.brand,
      brand_slug: result.brand_slug,
      model: result.model,
      model_slug: result.model_slug,
      repair_type: result.repair_type,
      repair_type_slug: result.repair_type_slug,
      image_pair_alt_text: result.image_pair_alt_text,
      title: result.title,
      short_description: result.short_description,
      related_repair_url: result.related_repair_url,
    }));
}

/**
 * Selects ordered, already-queried Model Hub candidates for the existing
 * public matching-item UI. Alias-overlap IDs are collapsed before repair-type
 * diversity is applied, and private storage paths never leave this boundary.
 */
export function selectModelRepairResultInitialSeeds(
  results: readonly PublicRepairResult[],
  limit = 3,
): RepairResultMatchingItem[] {
  const seenIds = new Set<string>();
  const seenRepairTypes = new Set<string>();
  const distinct: PublicRepairResult[] = [];
  const duplicates: PublicRepairResult[] = [];

  for (const result of results) {
    if (seenIds.has(result.id) || !isPublicRepairResult(result)) continue;
    seenIds.add(result.id);

    if (seenRepairTypes.has(result.repair_type_slug)) {
      duplicates.push(result);
    } else {
      seenRepairTypes.add(result.repair_type_slug);
      distinct.push(result);
    }
  }

  return [...distinct, ...duplicates]
    .slice(0, Math.min(Math.max(0, limit), 3))
    .map((result) => ({
      id: result.id,
      device_category: result.device_category,
      brand: result.brand,
      brand_slug: result.brand_slug,
      model: result.model,
      model_slug: result.model_slug,
      repair_type: result.repair_type,
      repair_type_slug: result.repair_type_slug,
      image_pair_alt_text: result.image_pair_alt_text,
      title: result.title,
      short_description: result.short_description,
      related_repair_url: result.related_repair_url,
    }));
}

export function getRepairResultBrandAliases(brandSlug: string) {
  return brandSlug === 'iphone' || brandSlug === 'ipad' ? [brandSlug, 'apple'] : [brandSlug];
}

export function getServerRepairResultProofLimit(limit?: number) {
  if (!Number.isFinite(limit) || !limit || limit < 1) return MAX_SERVER_REPAIR_RESULT_PROOFS;
  return Math.min(Math.floor(limit), MAX_SERVER_REPAIR_RESULT_PROOFS);
}

function compareServerRepairResultProofs(
  left: PublicRepairResult,
  right: PublicRepairResult,
  surface: ServerRepairResultProofRequest['surface'],
) {
  if (surface === 'homepage' && left.sort_order !== right.sort_order) {
    return left.sort_order - right.sort_order;
  }

  const leftPublished = left.published_at || left.created_at;
  const rightPublished = right.published_at || right.created_at;
  if (leftPublished !== rightPublished) return leftPublished > rightPublished ? -1 : 1;
  if (left.created_at !== right.created_at) return left.created_at > right.created_at ? -1 : 1;
  return left.id > right.id ? -1 : left.id < right.id ? 1 : 0;
}

function isServerRepairResultProofMatch(
  result: PublicRepairResult,
  request: ServerRepairResultProofRequest,
) {
  if (!isPublicRepairResult(result)) return false;

  switch (request.surface) {
    case 'homepage':
      return result.featured_on_homepage;
    case 'repair-hub':
      return result.featured_on_repair_hub && result.device_category === request.category;
    case 'brand-hub':
      return result.featured_on_brand_hub
        && result.device_category === request.category
        && getRepairResultBrandAliases(request.brandSlug).includes(result.brand_slug);
    case 'model-hub':
      return result.device_category === request.category
        && getRepairResultBrandAliases(request.brandSlug).includes(result.brand_slug)
        && result.model_slug === request.modelSlug;
    case 'repair-detail':
      return result.device_category === request.category
        && getRepairResultBrandAliases(request.brandSlug).includes(result.brand_slug)
        && result.model_slug === request.modelSlug
        && result.repair_type_slug === request.repairTypeSlug;
    case 'repair-type-hub': {
      const repairHub = getRepairTypeHubDefinition(request.repairTypeSlug);
      if (!repairHub) return false;
      return result.device_category === request.category
        && repairHub.aliases.includes(result.repair_type_slug);
    }
  }
}

function toServerRepairResultProof(result: PublicRepairResult): ServerRepairResultProof {
  return {
    device_category: result.device_category,
    brand: result.brand,
    brand_slug: result.brand_slug,
    model: result.model,
    model_slug: result.model_slug,
    repair_type: result.repair_type,
    repair_type_slug: result.repair_type_slug,
    title: result.title,
    short_description: result.short_description,
    related_repair_url: result.related_repair_url,
  };
}

/**
 * Storefront-only read adapter. It projects already-published Repair Result
 * records into a safe, serializable proof shape; it does not decide taxonomy
 * or placement eligibility beyond the existing persisted facts.
 */
export function selectServerRepairResultProofs(
  results: readonly PublicRepairResult[],
  request: ServerRepairResultProofRequest,
): ServerRepairResultProof[] {
  return results
    .filter((result) => isServerRepairResultProofMatch(result, request))
    .sort((left, right) => compareServerRepairResultProofs(left, right, request.surface))
    .slice(0, getServerRepairResultProofLimit(request.limit))
    .map(toServerRepairResultProof);
}

export type HubRepairGroup = 'screen' | 'battery' | 'charging-port' | 'back-glass-or-housing';

export function normalizeHubRepairGroup(slug: string): HubRepairGroup | null {
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

const HUB_REPAIR_GROUP_ORDER: readonly HubRepairGroup[] = [
  'screen',
  'battery',
  'charging-port',
  'back-glass-or-housing',
];

export function toRepairResultMatchingItem(result: PublicRepairResult): RepairResultMatchingItem {
  return {
    id: result.id,
    device_category: result.device_category,
    brand: result.brand,
    brand_slug: result.brand_slug,
    model: result.model,
    model_slug: result.model_slug,
    repair_type: result.repair_type,
    repair_type_slug: result.repair_type_slug,
    image_pair_alt_text: result.image_pair_alt_text,
    title: result.title,
    short_description: result.short_description,
    related_repair_url: result.related_repair_url,
  };
}

/**
 * Selects the existing generic Repair-Type Hub contract from already ordered
 * candidate rows and projects only the visual fields used by its UI.
 */
export function selectRepairTypeHubRepairResultSeeds(
  results: readonly PublicRepairResult[],
  category: RepairResultDeviceCategory,
  repairTypeSlug: string,
): RepairResultMatchingItem[] {
  const repairHub = getRepairTypeHubDefinition(repairTypeSlug);
  if (!repairHub) return [];

  return results
    .filter((result) => (
      result.device_category === category
      && repairHub.aliases.includes(result.repair_type_slug)
      && isPublicRepairResult(result)
    ))
    .slice(0, 3)
    .map(toRepairResultMatchingItem);
}

/**
 * Selects the existing Hub UI's first public result per repair group from an
 * already-query-ordered, bounded candidate list.
 */
export function selectHubRepairResults(
  results: readonly PublicRepairResult[],
): PublicRepairResult[] {
  const groups: Partial<Record<HubRepairGroup, PublicRepairResult>> = {};

  for (const result of results.slice(0, MAX_HUB_REPAIR_RESULT_QUERY_ROWS)) {
    if (!isPublicRepairResult(result)) continue;
    const group = normalizeHubRepairGroup(result.repair_type_slug);
    if (group && !groups[group]) {
      groups[group] = result;
      if (Object.keys(groups).length === HUB_REPAIR_GROUP_ORDER.length) break;
    }
  }

  return HUB_REPAIR_GROUP_ORDER.map((group) => groups[group]).filter(Boolean) as PublicRepairResult[];
}

/**
 * Projects exact-category, repair-hub placement candidates into the public
 * visual shape used by the existing HubRepairResultsSection.
 */
export function selectCategoryHubRepairResultSeeds(
  results: readonly PublicRepairResult[],
  category: RepairResultDeviceCategory,
): RepairResultMatchingItem[] {
  return selectHubRepairResults(
    results
      .slice(0, MAX_HUB_REPAIR_RESULT_QUERY_ROWS)
      .filter((result) => result.device_category === category && result.featured_on_repair_hub),
  ).map(toRepairResultMatchingItem);
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
      .limit(MAX_HUB_REPAIR_RESULT_QUERY_ROWS);

    if (error) {
      console.error('[repair-results] Failed to fetch hub repair results:', error);
      return [];
    }

    return selectHubRepairResults((data || []) as unknown as PublicRepairResult[]);
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
      .limit(MAX_HOMEPAGE_REPAIR_RESULT_QUERY_ROWS);

    if (error) {
      console.error('[repair-results] Failed to fetch featured repair results:', error);
      return {};
    }

    const publicResults = (data || []) as unknown as PublicRepairResult[];
    const selected = selectHomepageRepairResultSeed(publicResults);
    const byCategory: Partial<Record<RepairResultDeviceCategory, PublicRepairResult>> = {};
    const selectedIds = new Set(Object.values(selected.resultsByCategory).map((result) => result.id));

    for (const result of publicResults) {
      if (selectedIds.has(result.id)) {
        byCategory[result.device_category] = result;
      }
    }

    return byCategory;
  } catch (error) {
    console.error('[repair-results] Unexpected featured repair result failure:', error);
    return {};
  }
}
