import { NextResponse } from 'next/server';
import {
  PUBLIC_REPAIR_RESULT_SELECT,
  REPAIR_RESULT_CATEGORIES,
  createPublicRepairResultsClient,
  isPublicRepairResult,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
  type RepairResultMatchingItem,
} from '@/lib/repair-results';
import { getRepairTypeHubDefinition } from '@/lib/repair-type-hubs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
};

const VALID_CATEGORIES = new Set(REPAIR_RESULT_CATEGORIES.map((category) => category.value));
const VALID_CONTEXTS = new Set(['model', 'detail', 'hub']);
const MAX_LIMIT = 3;

type MatchingContext = 'model' | 'detail' | 'hub';

function emptyResponse() {
  return NextResponse.json({ status: 'SUCCESS', data: [] }, { headers: CACHE_HEADERS });
}

function getSlugParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim().toLowerCase() || '';
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : '';
}

function getLimit(searchParams: URLSearchParams) {
  const parsed = Number.parseInt(searchParams.get('limit') || '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return MAX_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function pickPublicFields(result: PublicRepairResult): RepairResultMatchingItem {
  return {
    id: result.id,
    device_category: result.device_category,
    brand: result.brand,
    brand_slug: result.brand_slug,
    model: result.model,
    model_slug: result.model_slug,
    repair_type: result.repair_type,
    repair_type_slug: result.repair_type_slug,
    title: result.title,
    short_description: result.short_description,
    image_pair_alt_text: result.image_pair_alt_text,
    related_repair_url: result.related_repair_url,
  };
}

function uniqueByRepairType(results: PublicRepairResult[], limit: number) {
  const seen = new Set<string>();
  const unique: PublicRepairResult[] = [];
  const overflow: PublicRepairResult[] = [];

  for (const result of results) {
    if (!isPublicRepairResult(result)) continue;

    if (!seen.has(result.repair_type_slug)) {
      seen.add(result.repair_type_slug);
      unique.push(result);
    } else {
      overflow.push(result);
    }
  }

  return [...unique, ...overflow].slice(0, limit);
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const category = getSlugParam(searchParams, 'category') as RepairResultDeviceCategory;
  const brand = getSlugParam(searchParams, 'brand');
  const model = getSlugParam(searchParams, 'model');
  const repairType = getSlugParam(searchParams, 'repair_type');
  const context = searchParams.get('context')?.trim().toLowerCase() as MatchingContext | null;
  const limit = getLimit(searchParams);

  if (!VALID_CATEGORIES.has(category) || !context || !VALID_CONTEXTS.has(context)) {
    return emptyResponse();
  }

  if (context !== 'hub' && (!brand || !model)) {
    return emptyResponse();
  }

  if (context === 'detail' && !repairType) {
    return emptyResponse();
  }

  if (context === 'hub' && !repairType) {
    return emptyResponse();
  }

  const supabase = createPublicRepairResultsClient();
  if (!supabase) return emptyResponse();

  try {
    if (context === 'hub') {
      const repairHub = getRepairTypeHubDefinition(repairType);

      if (!repairHub) {
        return emptyResponse();
      }

      const { data, error } = await supabase
        .from('repair_results')
        .select(PUBLIC_REPAIR_RESULT_SELECT)
        .eq('status', 'published')
        .eq('privacy_checked', true)
        .eq('device_category', category)
        .in('repair_type_slug', repairHub.aliases)
        .neq('before_image_path', '')
        .neq('after_image_path', '')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[repair-results-matching] Failed to load repair-type hub results:', error);
        return emptyResponse();
      }

      const publicResults = ((data || []) as unknown as PublicRepairResult[]).filter(isPublicRepairResult);

      return NextResponse.json(
        { status: 'SUCCESS', data: publicResults.slice(0, limit).map(pickPublicFields) },
        { headers: CACHE_HEADERS }
      );
    }

    const buildQuery = (targetBrand: string) => {
      let q = supabase
        .from('repair_results')
        .select(PUBLIC_REPAIR_RESULT_SELECT)
        .eq('status', 'published')
        .eq('privacy_checked', true)
        .eq('device_category', category)
        .eq('brand_slug', targetBrand)
        .eq('model_slug', model)
        .neq('before_image_path', '')
        .neq('after_image_path', '')
        .order('featured_on_homepage', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });

      if (context === 'detail') {
        q = q.eq('repair_type_slug', repairType).limit(limit);
      } else {
        q = q.limit(Math.max(limit * 4, 8));
      }

      return q;
    };

    const aliases = brand === 'iphone' || brand === 'ipad' ? [brand, 'apple'] : [brand];
    let data: any[] = [];
    let fetchError: any = null;

    for (const targetBrand of aliases) {
      const { data: aliasData, error: aliasError } = await buildQuery(targetBrand);
      if (aliasError) {
        fetchError = aliasError;
        break;
      }
      if (aliasData) {
        data = data.concat(aliasData);
      }
    }

    if (fetchError) {
      console.error('[repair-results-matching] Failed to load matching results:', fetchError);
      return emptyResponse();
    }

    // Deduplicate by Repair Result id before returning data
    if (aliases.length > 1) {
      const seen = new Set<string>();
      const uniqueData = [];
      for (const row of data) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          uniqueData.push(row);
        }
      }
      data = uniqueData;
    }

    const publicResults = ((data || []) as unknown as PublicRepairResult[]).filter(isPublicRepairResult);
    const results = context === 'model'
      ? uniqueByRepairType(publicResults, limit)
      : publicResults.slice(0, limit);

    return NextResponse.json(
      { status: 'SUCCESS', data: results.map(pickPublicFields) },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[repair-results-matching] Unexpected failure:', error);
    return emptyResponse();
  }
}
