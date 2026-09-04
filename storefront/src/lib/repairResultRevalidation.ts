import type { PublicRepairResult } from './repair-results';
import { getRepairTypeHubDefinition } from './repair-type-hubs';

export type RepairResultRevalidationState = Pick<
  PublicRepairResult,
  | 'device_category'
  | 'brand_slug'
  | 'model_slug'
  | 'repair_type_slug'
  | 'featured_on_homepage'
  | 'featured_on_repair_hub'
  | 'featured_on_brand_hub'
>;

/**
 * Resolves every concrete SSR destination a canonical Repair Result could
 * affect. Detail and Model are intentionally unconditional: an old public
 * result must be cleared after unpublish or privacy changes.
 */
export function repairResultAffectedPaths(
  result: RepairResultRevalidationState,
): string[] {
  const brandPath = `/repairs/${result.device_category}/${result.brand_slug}`;
  const modelPath = `${brandPath}/${result.model_slug}`;
  const paths = [
    `${modelPath}/${result.repair_type_slug}`,
    modelPath,
  ];

  if (result.featured_on_brand_hub) paths.push(brandPath);
  if (result.featured_on_repair_hub) paths.push(`/repairs/${result.device_category}`);
  if (result.featured_on_homepage) paths.push('/');
  if (result.device_category === 'phone') {
    const repairTypeHub = getRepairTypeHubDefinition(result.repair_type_slug);
    if (repairTypeHub) paths.push(`/repairs/${repairTypeHub.slug}`);
  }

  return paths;
}

/**
 * Includes paths from both persisted states so removed placements and future
 * canonical identity changes cannot leave an old route stale.
 */
export function repairResultAffectedPathsForMutation(
  previous: RepairResultRevalidationState | null,
  next: RepairResultRevalidationState,
): string[] {
  return [...new Set([
    ...(previous ? repairResultAffectedPaths(previous) : []),
    ...repairResultAffectedPaths(next),
  ])];
}
