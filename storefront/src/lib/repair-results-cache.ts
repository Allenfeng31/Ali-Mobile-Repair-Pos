import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';
import {
  createPublicRepairResultsClient,
  isPublicRepairResult,
  PUBLIC_REPAIR_RESULT_SELECT,
  type PublicRepairResult,
} from './repair-results';

export type RepairResultsContext = 'homepage' | 'detail' | 'model' | 'brand' | 'category';

export interface GetRepairResultsParams {
  context: RepairResultsContext;
  category?: string;
  brand?: string;
  model?: string;
  repairType?: string;
}

function normalizeSlug(val: string | null | undefined): string {
  if (!val) return '';
  return val.trim().toLowerCase();
}

const DIVERSITY_ALGORITHM_VERSION = 'selection-v1';

export function getCacheKey(params: GetRepairResultsParams): string {
  const context = normalizeSlug(params.context);
  const category = normalizeSlug(params.category);
  const brand = normalizeSlug(params.brand);
  const model = normalizeSlug(params.model);
  const repairType = normalizeSlug(params.repairType);
  const limit = context === 'homepage' ? 4 : context === 'detail' ? 3 : 4;
  return `repair-results-query-${context}-${limit}-${DIVERSITY_ALGORITHM_VERSION}-${category}-${brand}-${model}-${repairType}`;
}

export function getCacheTagsForScope(params: GetRepairResultsParams): string[] {
  const context = normalizeSlug(params.context);
  const category = normalizeSlug(params.category);
  const brand = normalizeSlug(params.brand);
  const model = normalizeSlug(params.model);
  const repairType = normalizeSlug(params.repairType);

  const tags: string[] = ['repair-results'];

  if (context === 'homepage') {
    tags.push('repair-results:homepage');
  }

  if (category) {
    tags.push(`repair-results:category:${category}`);
  }
  if (category && brand) {
    tags.push(`repair-results:brand:${category}:${brand}`);
  }
  if (category && brand && model) {
    tags.push(`repair-results:model:${category}:${brand}:${model}`);
  }
  if (category && brand && model && repairType) {
    tags.push(`repair-results:detail:${category}:${brand}:${model}:${repairType}`);
  }

  tags.push(`repair-results:version:${DIVERSITY_ALGORITHM_VERSION}`);
  return tags;
}

function safeRevalidateTag(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 100) return false;
  // Strictly enforce a-z, 0-9, and hyphens. Reject paths, dots, query params, etc.
  return /^[a-z0-9-]+$/.test(slug);
}

export function invalidateRepairResultScopes(record: {
  device_category: string;
  brand_slug: string;
  model_slug: string;
  repair_type_slug: string;
  featured_on_homepage?: boolean;
}) {
  const category = normalizeSlug(record.device_category);
  const brand = normalizeSlug(record.brand_slug);
  const model = normalizeSlug(record.model_slug);
  const repairType = normalizeSlug(record.repair_type_slug);

  const validCategories = new Set(['phone', 'tablet', 'laptop', 'watch']);
  if (!validCategories.has(category)) {
    console.warn('[repair-results] Cache invalidation skipped for invalid category:', category);
    return;
  }

  if (category && !isValidSlug(category)) return;
  if (brand && !isValidSlug(brand)) return;
  if (model && !isValidSlug(model)) return;
  if (repairType && !isValidSlug(repairType)) return;

  safeRevalidateTag(`repair-results:category:${category}`);
  safeRevalidateTag(`repair-results:brand:${category}:${brand}`);
  safeRevalidateTag(`repair-results:model:${category}:${brand}:${model}`);
  safeRevalidateTag(`repair-results:detail:${category}:${brand}:${model}:${repairType}`);

  if (record.featured_on_homepage) {
    safeRevalidateTag('repair-results:homepage');
  }

  revalidatePath(`/repairs/${category}`, 'page');
  revalidatePath(`/repairs/${category}/${brand}`, 'page');
  revalidatePath(`/repairs/${category}/${brand}/${model}`, 'page');
  revalidatePath(`/repairs/${category}/${brand}/${model}/${repairType}`, 'page');
  if (record.featured_on_homepage) {
    revalidatePath('/', 'page');
  }
}

function applyExactGroupDeduplication(results: PublicRepairResult[]): PublicRepairResult[] {
  // Sort first by published_at DESC, created_at DESC, id DESC
  const sorted = [...results].sort((a, b) => {
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;

    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (createdA !== createdB) return createdB - createdA;

    return b.id.localeCompare(a.id);
  });

  const selected: PublicRepairResult[] = [];
  const seenGroups = new Set<string>();

  for (const result of sorted) {
    const groupKey = JSON.stringify([result.device_category, result.brand_slug, result.model_slug, result.repair_type_slug]);
    if (!seenGroups.has(groupKey)) {
      seenGroups.add(groupKey);
      selected.push(result);
    }
  }

  return selected;
}

function applyDeterministicDiversity(results: PublicRepairResult[], context: RepairResultsContext): PublicRepairResult[] {
  let limit = 4;
  if (context === 'homepage') limit = 4; // Homepage fetches 1 per category upstream
  if (context === 'detail') limit = 3;

  const selected: PublicRepairResult[] = [];
  const countByBrand = new Map<string, number>();
  const countByModel = new Map<string, number>();
  const countByRepairType = new Map<string, number>();

  // Ensure deterministic tie-break ordering: published_at DESC, sort_order ASC, id DESC
  // Note: Database already sorts by published_at DESC, sort_order ASC.
  // We re-sort here just to guarantee stable ID tie-breaking if dates/sorts match.
  const sorted = [...results].sort((a, b) => {
    if (context === 'homepage') {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    }
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return b.id.localeCompare(a.id);
  });

  for (const result of sorted) {
    if (selected.length >= limit) break;

    const brand = result.brand_slug;
    const model = result.model_slug;
    const repairType = result.repair_type_slug;

    if (context === 'homepage') {
      // 1 per category logic is handled upstream by fetching all and reducing
      selected.push(result);
      continue;
    }

    if (context === 'detail') {
      selected.push(result);
      continue;
    }

    if (context === 'model') {
      // Prefer different repair types, max 2 per repair type
      const rtCount = countByRepairType.get(repairType) || 0;
      if (rtCount >= 2) continue;
      countByRepairType.set(repairType, rtCount + 1);
      selected.push(result);
      continue;
    }

    if (context === 'brand') {
      // Max 2 per model, max 2 per repair type
      const mCount = countByModel.get(model) || 0;
      const rtCount = countByRepairType.get(repairType) || 0;
      if (mCount >= 2 || rtCount >= 2) continue;
      countByModel.set(model, mCount + 1);
      countByRepairType.set(repairType, rtCount + 1);
      selected.push(result);
      continue;
    }

    if (context === 'category') {
      // Max 2 per brand, max 2 per repair type
      const bCount = countByBrand.get(brand) || 0;
      const rtCount = countByRepairType.get(repairType) || 0;
      if (bCount >= 2 || rtCount >= 2) continue;
      countByBrand.set(brand, bCount + 1);
      countByRepairType.set(repairType, rtCount + 1);
      selected.push(result);
      continue;
    }
  }

  return selected;
}

async function fetchRepairResultsData(params: GetRepairResultsParams): Promise<PublicRepairResult[]> {
  const supabase = createPublicRepairResultsClient();
  if (!supabase) return [];

  const { context } = params;
  const category = normalizeSlug(params.category);
  const brand = normalizeSlug(params.brand);
  const model = normalizeSlug(params.model);
  const repairType = normalizeSlug(params.repairType);

  async function getCandidates(isFallback: boolean): Promise<PublicRepairResult[]> {
    if (!supabase) return [];

    const accumulated: PublicRepairResult[] = [];
    let offset = 0;
    const pageSize = 50;

    while (true) {
      let q = supabase
        .from('repair_results')
        .select(PUBLIC_REPAIR_RESULT_SELECT)
        .eq('status', 'published')
        .eq('privacy_checked', true)
        .neq('before_image_path', '')
        .neq('after_image_path', '');

      if (context === 'homepage') {
        q = q.eq('featured_on_homepage', true);
      } else {
        if (category) q = q.eq('device_category', category);
        const targetBrand = isFallback ? 'apple' : brand;

        if (context === 'detail') {
          q = q.eq('brand_slug', targetBrand).eq('model_slug', model).eq('repair_type_slug', repairType).limit(3);
        } else if (context === 'model') {
          q = q.eq('brand_slug', targetBrand).eq('model_slug', model);
        } else if (context === 'brand') {
          q = q.eq('brand_slug', targetBrand);
        }
      }

      if (context !== 'homepage') {
        q = q.order('published_at', { ascending: false, nullsFirst: false })
             .order('created_at', { ascending: false, nullsFirst: false })
             .order('id', { ascending: false });
      } else {
        q = q.order('sort_order', { ascending: true })
             .order('published_at', { ascending: false, nullsFirst: false });
      }

      if (context === 'model' || context === 'brand' || context === 'category') {
        q = q.range(offset, offset + pageSize - 1);
      }

      let data, error;
      for (let attempt = 1; attempt <= 5; attempt++) {
        const res = await q;
        data = res.data;
        error = res.error;
        if (!error || !error.message?.includes('AbortError')) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      if (error) {
        console.error('[repair-results] Query failed:', error);
        throw new Error(`Supabase query failed: ${error.message || JSON.stringify(error)}`);
      }

      const rawResults = (data || []) as unknown as PublicRepairResult[];
      const validResults = rawResults.filter(isPublicRepairResult);

      accumulated.push(...validResults);

      if (context === 'homepage' || context === 'detail') {
        break;
      }

      const dedupedAccumulated = applyExactGroupDeduplication(accumulated);
      const testDiversity = applyDeterministicDiversity(dedupedAccumulated, context);

      const targetLimit = 4;
      if (testDiversity.length >= targetLimit || validResults.length < pageSize) {
        break;
      }

      offset += pageSize;
    }

    return accumulated;
  }

  let candidates = await getCandidates(false);

  if (candidates.length === 0 && brand === 'ipad' && (context === 'detail' || context === 'model' || context === 'brand')) {
    candidates = await getCandidates(true);
  }

  const dedupedResults = applyExactGroupDeduplication(candidates);

  if (context === 'homepage') {
    // Re-sort homepage by sort_order
    const sortedForHome = [...dedupedResults].sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return dateB - dateA;
    });

    // 1 per category
    const byCategory: Partial<Record<string, PublicRepairResult>> = {};
    for (const res of sortedForHome) {
      if (!byCategory[res.device_category]) {
        byCategory[res.device_category] = res;
      }
    }
    return Object.values(byCategory).filter((r): r is PublicRepairResult => r !== undefined);
  }

  return applyDeterministicDiversity(dedupedResults, context);
}

export async function getRepairResults(params: GetRepairResultsParams): Promise<PublicRepairResult[]> {
  const cacheKey = getCacheKey(params);
  const tags = getCacheTagsForScope(params);

  const cachedFn = unstable_cache(
    async () => fetchRepairResultsData(params),
    [cacheKey],
    { tags, revalidate: false }
  );

  return cachedFn();
}
