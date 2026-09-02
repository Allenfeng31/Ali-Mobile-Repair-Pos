import 'server-only';

import { getRepairTypeHubDefinition } from './repair-type-hubs';
import {
  createPublicRepairResultsClient,
  getRepairResultBrandAliases,
  getServerRepairResultProofLimit,
  MAX_DETAIL_INITIAL_REPAIR_RESULTS,
  PUBLIC_REPAIR_RESULT_SELECT,
  selectDetailRepairResultInitialSeeds,
  selectServerRepairResultProofs,
  type PublicRepairResult,
  type RepairResultDeviceCategory,
  type RepairResultMatchingItem,
  type ServerRepairResultProof,
  type ServerRepairResultProofRequest,
} from './repair-results';

export interface RepairDetailInitialResultSeedRequest {
  category: RepairResultDeviceCategory;
  brandSlug: string;
  modelSlug: string;
  repairTypeSlug: string;
}

/**
 * Mirrors the public matching endpoint's exact Detail ordering while exposing
 * only the already-public matching-item fields needed by the existing UI.
 */
export async function fetchRepairDetailInitialResults(
  request: RepairDetailInitialResultSeedRequest,
): Promise<RepairResultMatchingItem[]> {
  const supabase = createPublicRepairResultsClient();
  if (!supabase) return [];

  const exactUrl = `/repairs/${request.category}/${request.brandSlug}/${request.modelSlug}/${request.repairTypeSlug}`;
  const aliases = getRepairResultBrandAliases(request.brandSlug);
  const records: PublicRepairResult[] = [];

  try {
    for (const brandSlug of aliases) {
      const { data, error } = await supabase
        .from('repair_results')
        .select(PUBLIC_REPAIR_RESULT_SELECT)
        .eq('status', 'published')
        .eq('privacy_checked', true)
        .eq('device_category', request.category)
        .eq('brand_slug', brandSlug)
        .neq('before_image_path', '')
        .neq('after_image_path', '')
        .order('featured_on_homepage', { ascending: false })
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })
        .or(`model_slug.eq.${request.modelSlug},related_repair_url.eq.${exactUrl}`)
        .eq('repair_type_slug', request.repairTypeSlug)
        .limit(MAX_DETAIL_INITIAL_REPAIR_RESULTS);

      if (error) {
        console.error('[repair-results] Failed to fetch Detail initial result:', error);
        return [];
      }

      records.push(...((data || []) as unknown as PublicRepairResult[]));
    }

    return selectDetailRepairResultInitialSeeds(records);
  } catch (error) {
    console.error('[repair-results] Unexpected Detail initial result failure:', error);
    return [];
  }
}

export async function fetchServerRepairResultProofs(
  request: ServerRepairResultProofRequest,
): Promise<ServerRepairResultProof[]> {
  const supabase = createPublicRepairResultsClient();
  if (!supabase) return [];

  try {
    let query = supabase
      .from('repair_results')
      .select(PUBLIC_REPAIR_RESULT_SELECT)
      .eq('status', 'published')
      .eq('privacy_checked', true)
      .neq('before_image_path', '')
      .neq('after_image_path', '');

    switch (request.surface) {
      case 'homepage':
        query = query.eq('featured_on_homepage', true);
        break;
      case 'repair-hub':
        query = query.eq('device_category', request.category).eq('featured_on_repair_hub', true);
        break;
      case 'brand-hub':
        query = query
          .eq('device_category', request.category)
          .in('brand_slug', getRepairResultBrandAliases(request.brandSlug))
          .eq('featured_on_brand_hub', true);
        break;
      case 'model-hub':
        query = query
          .eq('device_category', request.category)
          .in('brand_slug', getRepairResultBrandAliases(request.brandSlug))
          .eq('model_slug', request.modelSlug);
        break;
      case 'repair-detail':
        query = query
          .eq('device_category', request.category)
          .in('brand_slug', getRepairResultBrandAliases(request.brandSlug))
          .eq('model_slug', request.modelSlug)
          .eq('repair_type_slug', request.repairTypeSlug);
        break;
      case 'repair-type-hub': {
        const repairHub = getRepairTypeHubDefinition(request.repairTypeSlug);
        if (!repairHub) return [];
        query = query
          .eq('device_category', request.category)
          .in('repair_type_slug', repairHub.aliases);
        break;
      }
    }

    const orderedQuery = request.surface === 'homepage'
      ? query
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('id', { ascending: false })
      : query
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

    const { data, error } = await orderedQuery.limit(getServerRepairResultProofLimit(request.limit));

    if (error) {
      console.error('[repair-results] Failed to fetch server proof results:', error);
      return [];
    }

    return selectServerRepairResultProofs((data || []) as unknown as PublicRepairResult[], request);
  } catch (error) {
    console.error('[repair-results] Unexpected server proof result failure:', error);
    return [];
  }
}
