/**
 * The only approved way to retire a public repair URL after a catalogue refresh.
 * Add a reviewed canonical `category/brand/model/repair-slug` entry here; leave
 * this list empty unless a route retirement has explicit business approval.
 */
export const APPROVED_PUBLIC_REPAIR_RETIREMENTS = new Set<string>();

export function publicRepairRouteKey(category: string, brand: string, model: string, repairSlug: string) {
  return `${category}/${brand}/${model}/${repairSlug}`;
}

export function isApprovedPublicRepairRetirement(category: string, brand: string, model: string, repairSlug: string) {
  return APPROVED_PUBLIC_REPAIR_RETIREMENTS.has(publicRepairRouteKey(category, brand, model, repairSlug));
}
