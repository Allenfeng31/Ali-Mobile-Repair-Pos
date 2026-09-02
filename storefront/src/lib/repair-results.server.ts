import 'server-only';

import { getRepairTypeHubDefinition } from './repair-type-hubs';
import {
  createPublicRepairResultsClient,
  getRepairResultBrandAliases,
  getServerRepairResultProofLimit,
  PUBLIC_REPAIR_RESULT_SELECT,
  selectServerRepairResultProofs,
  type PublicRepairResult,
  type ServerRepairResultProof,
  type ServerRepairResultProofRequest,
} from './repair-results';

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
