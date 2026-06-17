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

async function fetchAllPublicRepairResults(): Promise<PublicRepairResult[]> {

  const supabase = createPublicRepairResultsClient();
  if (!supabase) return [];

  const accumulated: PublicRepairResult[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data, error } = await supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('status', 'published')
      .eq('privacy_checked', true)
      .neq('before_image_path', '')
      .neq('after_image_path', '')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('[repair-results] Global query failed:', error);
      throw new Error(`Supabase query failed: ${error.message || JSON.stringify(error)}`);
    }

    const rawResults = (data || []) as unknown as PublicRepairResult[];
    const validResults = rawResults.filter(isPublicRepairResult);

    accumulated.push(...validResults);

    if (validResults.length < pageSize) {
      break;
    }
    offset += pageSize;
  }

  return accumulated;
}

const getCachedPublicRepairResultsDataset = unstable_cache(
  async () => fetchAllPublicRepairResults(),
  ['repair-results-global-dataset-v1'],
  { tags: ['repair-results-global'], revalidate: false }
);

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

  // Invalidate the one shared public Repair Results dataset tag
  safeRevalidateTag('repair-results-global');

  // Invalidate only the affected public paths
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

export async function getRepairResults(params: GetRepairResultsParams): Promise<PublicRepairResult[]> {
  const dataset = await getCachedPublicRepairResultsDataset();

  const context = normalizeSlug(params.context) as RepairResultsContext;
  const category = normalizeSlug(params.category);
  const brand = normalizeSlug(params.brand);
  const model = normalizeSlug(params.model);
  const repairType = normalizeSlug(params.repairType);

  let filtered = dataset;

  if (context === 'homepage') {
    filtered = filtered.filter(r => r.featured_on_homepage);
  } else {
    if (category) {
      filtered = filtered.filter(r => r.device_category === category);
    }

    if (brand) {
      let targetBrand = brand;
      let brandFiltered = filtered.filter(r => r.brand_slug === targetBrand);

      const requiresFallbackCheck = brand === 'ipad' && (context === 'detail' || context === 'model' || context === 'brand');

      if (requiresFallbackCheck) {
         let finalMatches = brandFiltered;
         if (context === 'detail') finalMatches = finalMatches.filter(r => r.model_slug === model && r.repair_type_slug === repairType);
         else if (context === 'model') finalMatches = finalMatches.filter(r => r.model_slug === model);

         if (finalMatches.length === 0) {
           targetBrand = 'apple';
           brandFiltered = filtered.filter(r => r.brand_slug === targetBrand);
         }
      }
      filtered = brandFiltered;
    }

    if (context === 'detail') {
      filtered = filtered.filter(r => r.model_slug === model && r.repair_type_slug === repairType);
    } else if (context === 'model') {
      filtered = filtered.filter(r => r.model_slug === model);
    }
  }

  const dedupedResults = applyExactGroupDeduplication(filtered);

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
