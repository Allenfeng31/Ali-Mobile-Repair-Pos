import {
  GRANDFATHERED_WATER_DAMAGE_PATHS,
  GRANDFATHERED_WATER_DAMAGE_PATH_SET,
} from '@/data/grandfatheredWaterDamagePaths';

const CENTRAL_WATER_DAMAGE_HREF = '/repairs/water-damage';
const WATER_DAMAGE_REPAIR_SLUGS = new Set(['water-damage', 'water-damage-repair']);
const GOOGLE_PIXEL_ALIAS_BRANDS = new Set(['google', 'pixel']);

export function isWaterDamageRepairSlug(slug: string) {
  return WATER_DAMAGE_REPAIR_SLUGS.has(slug);
}

export function isGooglePixelAliasBrand(brand: string) {
  return GOOGLE_PIXEL_ALIAS_BRANDS.has(brand);
}

export function getCanonicalBrandSlug(brand: string) {
  return isGooglePixelAliasBrand(brand) ? 'google-pixel' : brand;
}

export function getCentralWaterDamageHref() {
  return CENTRAL_WATER_DAMAGE_HREF;
}

export function getWaterDamageSitemapPaths() {
  return [CENTRAL_WATER_DAMAGE_HREF, ...GRANDFATHERED_WATER_DAMAGE_PATHS];
}

export function getGrandfatheredWaterDamageStaticParams() {
  return GRANDFATHERED_WATER_DAMAGE_PATHS.map((path) => {
    const [, , category, brand, model, repairType] = path.split('/');
    return { category, brand, model, 'repair-type': repairType };
  });
}

export function buildCanonicalModelRepairPath(category: string, brand: string, model: string, repairSlug: string) {
  const canonicalBrand = getCanonicalBrandSlug(brand);
  const canonicalRepairSlug = isWaterDamageRepairSlug(repairSlug) ? 'water-damage-repair' : repairSlug;
  return `/repairs/${category}/${canonicalBrand}/${model}/${canonicalRepairSlug}`;
}

export function isGrandfatheredWaterDamagePath(pathname: string) {
  return GRANDFATHERED_WATER_DAMAGE_PATH_SET.has(pathname);
}

export function getModelHubRepairHref(repairSlug: string, fallbackHref: string) {
  return isWaterDamageRepairSlug(repairSlug) ? CENTRAL_WATER_DAMAGE_HREF : fallbackHref;
}
