import { RawItem, ParsedItem, parseItem, slugify, displayBrand } from './inventoryUtils';
import { BRANDS, MODELS, REPAIR_TYPES } from '@/data/seo-data';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RepairOption {
  slug: string;
  name: string;
  price: number;
}

export interface ModelEntry {
  model: string;
  slug: string;
  repairTypes: RepairOption[];
}

export interface BrandEntry {
  brand: string;
  slug: string;
  icon: string;
  models: ModelEntry[];
}

export interface RepairCatalog {
  brands: BrandEntry[];
  source: 'pos' | 'fallback';
}

// ─── Brand icon mapping ─────────────────────────────────────────────────────

function getBrandIcon(brand: string): string {
  const lower = brand.toLowerCase();
  if (lower.includes('ipad') || lower.includes('tablet')) return '📟';
  if (lower.includes('macbook') || lower.includes('laptop')) return '💻';
  if (lower.includes('watch')) return '⌚';
  return '📱';
}

// ─── POS Fetch (Server-Side Only) ───────────────────────────────────────────

const POS_INVENTORY_ENDPOINT = '/api/inventory';

async function fetchPOSInventory(): Promise<RawItem[] | null> {
  const baseUrl = process.env.POS_API_URL || process.env.NEXT_PUBLIC_POS_API_URL;

  if (!baseUrl) {
    console.warn('[api.ts] No POS_API_URL configured, using fallback data');
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}${POS_INVENTORY_ENDPOINT}`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    });

    if (!res.ok) {
      console.error(`[api.ts] POS API returned ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('[api.ts] Failed to fetch POS inventory:', error);
    return null;
  }
}

// ─── Data Sanitization ───────────────────────────────────────────────────────

const VALID_SHORT_NAMES = new Set(['se', 'xr', 'xs', 'x', 'a5', 'a9', 's9', 's8']);

/** Filter out dirty model names: pure numbers, or too-short strings */
function isValidModelName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  // Pure numeric → garbage (e.g. "13")
  if (/^\d+$/.test(name.trim())) return false;
  // Very short names must be in the allow-list
  if (name.trim().length < 3 && !VALID_SHORT_NAMES.has(name.trim().toLowerCase())) return false;
  return true;
}

// ─── Repair Matrix Expansion ─────────────────────────────────────────────────

const CORE_REPAIR_TYPES: RepairOption[] = [
  { slug: 'screen-replacement',   name: 'Screen Replacement',    price: 0 },
  { slug: 'battery-replacement',  name: 'Battery Replacement',   price: 0 },
  { slug: 'charging-port-repair', name: 'Charging Port Repair',  price: 0 },
  { slug: 'water-damage-repair',  name: 'Water Damage Recovery', price: 0 },
  { slug: 'back-glass-repair',    name: 'Back Glass Replacement', price: 0 },
];

/** Ensure every model has at least the 5 core repair types */
function ensureCoreRepairTypes(repairTypes: RepairOption[]): RepairOption[] {
  const result = [...repairTypes];
  for (const core of CORE_REPAIR_TYPES) {
    if (!result.some(r => r.slug === core.slug)) {
      result.push({ ...core });
    }
  }
  return result;
}

// ─── Transform POS Data → RepairCatalog ─────────────────────────────────────

function transformPOSToCatalog(rawItems: RawItem[]): BrandEntry[] {
  const parsed = rawItems.map(parseItem).filter(Boolean) as ParsedItem[];

  // Group by brand → model → repair types
  const brandMap = new Map<string, Map<string, RepairOption[]>>();

  for (const item of parsed) {
    // Data sanitization: skip invalid model names
    if (!isValidModelName(item.deviceModel)) continue;

    const cleanBrand = displayBrand(item.brand);
    if (!brandMap.has(cleanBrand)) {
      brandMap.set(cleanBrand, new Map());
    }

    const modelMap = brandMap.get(cleanBrand)!;
    if (!modelMap.has(item.deviceModel)) {
      modelMap.set(item.deviceModel, []);
    }

    const repairTypes = modelMap.get(item.deviceModel)!;
    const serviceSlug = slugify(item.service);

    // Avoid duplicate repair types for same model
    if (!repairTypes.some(r => r.slug === serviceSlug)) {
      repairTypes.push({
        slug: serviceSlug,
        name: item.service,
        price: item.price,
      });
    }
  }

  // Convert to array, applying matrix expansion
  const brands: BrandEntry[] = [];
  for (const [brand, modelMap] of brandMap) {
    const models: ModelEntry[] = [];
    for (const [model, repairTypes] of modelMap) {
      models.push({
        model,
        slug: slugify(model),
        repairTypes: ensureCoreRepairTypes(repairTypes),
      });
    }
    brands.push({
      brand,
      slug: slugify(brand),
      icon: getBrandIcon(brand),
      models,
    });
  }

  return brands;
}

// ─── Fallback: Build catalog from hardcoded seo-data.ts ─────────────────────

function buildFallbackCatalog(): BrandEntry[] {
  return BRANDS.map(brand => {
    const models = (MODELS[brand] || []).map(model => ({
      model,
      slug: slugify(model),
      repairTypes: REPAIR_TYPES.map(rt => ({
        slug: rt.slug,
        name: rt.name,
        price: 0, // No price without POS
      })),
    }));

    return {
      brand,
      slug: slugify(brand),
      icon: getBrandIcon(brand),
      models,
    };
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetches the repair catalog from POS backend, with graceful fallback
 * to hardcoded seo-data.ts if the POS API is unreachable.
 *
 * This function is designed for server-side use only (RSC / generateStaticParams).
 * The ISR cache ensures it's called at most once per hour.
 */
export async function fetchRepairCatalog(): Promise<RepairCatalog> {
  const rawItems = await fetchPOSInventory();

  if (rawItems && rawItems.length > 0) {
    const brands = transformPOSToCatalog(rawItems);
    if (brands.length > 0) {
      return { brands, source: 'pos' };
    }
  }

  // Fallback to hardcoded data
  return { brands: buildFallbackCatalog(), source: 'fallback' };
}

/**
 * Fetch a specific brand's model list for the sub-hub page.
 */
export async function fetchBrandModels(brandSlug: string): Promise<{
  brand: BrandEntry | null;
  source: 'pos' | 'fallback';
}> {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find(b => b.slug === brandSlug) || null;
  return { brand, source: catalog.source };
}

/**
 * Fetch repair details for a specific model + repair-type combination.
 */
export async function fetchRepairDetails(
  brandSlug: string,
  modelSlug: string,
  repairSlug: string
): Promise<{
  brand: string;
  model: string;
  repairType: string;
  price: number;
  source: 'pos' | 'fallback';
} | null> {
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(b => b.slug === brandSlug);
  if (!brandEntry) return null;

  const modelEntry = brandEntry.models.find(m => m.slug === modelSlug);
  if (!modelEntry) return null;

  const repairEntry = modelEntry.repairTypes.find(r => r.slug === repairSlug);

  return {
    brand: brandEntry.brand,
    model: modelEntry.model,
    repairType: repairEntry?.name || repairSlug.replace(/-/g, ' '),
    price: repairEntry?.price || 0,
    source: catalog.source,
  };
}
