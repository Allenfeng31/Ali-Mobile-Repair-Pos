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
  modelCode?: string;
  repairTypes: RepairOption[];
}

export interface BrandEntry {
  category: string;
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

function getDeviceCategory(brand: string, model: string): 'phone' | 'tablet' | 'laptop' | 'watch' {
  const b = brand.toLowerCase();
  const m = model.toLowerCase();
  
  if (b.includes('ipad') || m.includes('ipad') || m.includes('tab')) return 'tablet';
  if (b.includes('macbook') || m.includes('macbook') || b.includes('laptop') || m.includes('laptop')) return 'laptop';
  if (b.includes('watch') || m.includes('watch')) return 'watch';
  return 'phone';
}

function getCategoryIcon(category: string): string {
  if (category === 'tablet') return '📟';
  if (category === 'laptop') return '💻';
  if (category === 'watch') return '⌚';
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
      cache: 'no-store', // Disable caching to ensure real-time data and fix "ghost cache" issues
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

const VALID_SHORT_NAMES = new Set(['se', 'xr', 'xs', 'x', 'a5', 'a7', 'a9', 's9', 's8']);

/** Filter out dirty model names: pure numbers, or too-short strings */
function isValidModelName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  // Pure numeric → garbage (e.g. "13")
  if (/^\d+$/.test(name.trim())) return false;
  // Very short names must be in the allow-list
  if (name.trim().length < 3 && !VALID_SHORT_NAMES.has(name.trim().toLowerCase())) return false;
  return true;
}

// ─── Name Mapping & Standardization ─────────────────────────────────────────

/** Canonical name map: old POS names → standard display names */
const REPAIR_NAME_MAP: Record<string, string> = {
  'Screen Repair':    'Screen Replacement',
  'Battery Service':  'Battery Replacement',
  'Charging Port':    'Charging Port Replacement',
  'Front Camera':     'Front Camera Replacement',
  'Back Camera':      'Back Camera Replacement',
  'Back Glass':       'Back Housing Replacement',
  'Back Housing':     'Back Housing Replacement',
};

/** Apply the standard name map to a raw service name */
function standardizeRepairName(rawName: string): string {
  return REPAIR_NAME_MAP[rawName] ?? rawName;
}

// ─── Repair Matrix Expansion ─────────────────────────────────────────────────

const UNIVERSAL_REPAIR_TYPES: RepairOption[] = [
  { slug: 'screen-replacement',          name: 'Screen Replacement',          price: 0 },
  { slug: 'battery-replacement',         name: 'Battery Replacement',         price: 0 },
  { slug: 'charging-port-replacement',   name: 'Charging Port Replacement',   price: 0 },
  { slug: 'water-damage-repair',         name: 'Water Damage Recovery',       price: 0 },
];

const BACK_GLASS_REPAIR: RepairOption = {
  slug: 'back-housing-replacement',
  name: 'Back Housing Replacement',
  price: 0,
};

/**
 * Check if a model qualifies for back-glass-repair.
 * Rules:
 * - iPhone generation >= 8 (not iPad, MacBook, Watch, or old iPhones)
 * - Samsung Galaxy S or Galaxy Z series
 */
function qualifiesForBackGlass(brandSlug: string, modelName: string): boolean {
  const brand = brandSlug.toLowerCase();
  const model = modelName.toLowerCase();

  // Apple iPhones >= 8
  if (brand.includes('iphone') || (brand === 'apple' && model.includes('iphone'))) {
    // Block non-phone Apple devices that might slip through
    if (model.includes('ipad') || model.includes('macbook') || model.includes('watch')) return false;
    // Extract generation number
    const genMatch = model.match(/iphone\s+(\d+)/i);
    if (genMatch) {
      return parseInt(genMatch[1], 10) >= 8;
    }
    // iPhone X/XS/XR qualify (gen ~10)
    if (/iphone\s+(x|xs|xr|x\s)/i.test(model)) return true;
    // iPhone SE 2nd/3rd/4th gen qualify (glass back since SE2)
    if (/se.*(?:2nd|3rd|4th|[234])/i.test(model)) return true;
    return false;
  }

  // Samsung Galaxy S or Z series
  if (brand.includes('samsung')) {
    if (/galaxy\s+[sz]/i.test(model)) return true;
    return false;
  }

  return false;
}

/** Ensure every model has core repair types, with smart back-glass filtering */
function ensureCoreRepairTypes(
  repairTypes: RepairOption[],
  brandSlug: string,
  modelName: string
): RepairOption[] {
  const result = [...repairTypes];

  // Always add universal repair types
  for (const core of UNIVERSAL_REPAIR_TYPES) {
    if (!result.some(r => r.slug === core.slug)) {
      result.push({ ...core });
    }
  }

  // Conditionally add back-glass-repair
  if (qualifiesForBackGlass(brandSlug, modelName)) {
    if (!result.some(r => r.slug === BACK_GLASS_REPAIR.slug)) {
      result.push({ ...BACK_GLASS_REPAIR });
    }
  } else {
    // Remove back-glass if it was in POS data but shouldn't be
    // (keep if it came from POS with an actual price — the shop explicitly offers it)
    const idx = result.findIndex(r => r.slug === BACK_GLASS_REPAIR.slug && r.price === 0);
    if (idx !== -1) result.splice(idx, 1);
  }

  return result;
}

// ─── Transform POS Data → RepairCatalog ─────────────────────────────────────

function transformPOSToCatalog(rawItems: RawItem[]): BrandEntry[] {
  const parsed = rawItems.map(parseItem).filter(Boolean) as ParsedItem[];

  // Group by category|brand → model → { repairTypes, code }
  const brandMap = new Map<string, Map<string, { repairTypes: RepairOption[], code?: string }>>();

  for (const item of parsed) {
    // Data sanitization: skip invalid model names
    if (!isValidModelName(item.deviceModel)) continue;

    // ── Name Standardization: map old POS names to canonical names ──
    const standardName = standardizeRepairName(item.service);
    const standardSlug = slugify(standardName);

    const cleanBrand = displayBrand(item.brand);
    const category = getDeviceCategory(cleanBrand, item.deviceModel);
    const compoundKey = `${category}|${cleanBrand}`;

    if (!brandMap.has(compoundKey)) {
      brandMap.set(compoundKey, new Map());
    }

    const modelMap = brandMap.get(compoundKey)!;
    if (!modelMap.has(item.deviceModel)) {
      modelMap.set(item.deviceModel, { repairTypes: [], code: item.modelCode });
    } else if (item.modelCode && !modelMap.get(item.deviceModel)!.code) {
      // Opportunistically pick up the code if it wasn't on the first row
      modelMap.get(item.deviceModel)!.code = item.modelCode;
    }

    const { repairTypes } = modelMap.get(item.deviceModel)!;

    // ── Dedup: if a slug already exists, keep the entry with the higher price ──
    const existingIdx = repairTypes.findIndex(r => r.slug === standardSlug);
    if (existingIdx !== -1) {
      // Keep the entry with higher price (prefer real POS pricing)
      if (item.price > repairTypes[existingIdx].price) {
        repairTypes[existingIdx] = {
          slug: standardSlug,
          name: standardName,
          price: item.price,
        };
      }
    } else {
      repairTypes.push({
        slug: standardSlug,
        name: standardName,
        price: item.price,
      });
    }
  }

  // Convert to array, applying matrix expansion
  const brands: BrandEntry[] = [];
  for (const [compoundKey, modelMap] of brandMap) {
    const [category, brand] = compoundKey.split('|');
    const models: ModelEntry[] = [];
    for (const [model, { repairTypes, code }] of modelMap) {
      models.push({
        model,
        slug: slugify(model),
        modelCode: code,
        repairTypes: ensureCoreRepairTypes(repairTypes, slugify(brand), model),
      });
    }
    const brandBaseName = brand.replace(/\s+(Tablet|Phone|Watch|Laptop)$/i, '');
    brands.push({
      category,
      brand: brandBaseName, 
      slug: slugify(brandBaseName),
      icon: getCategoryIcon(category),
      models,
    });
  }

  return brands;
}

// ─── Fallback: Build catalog from hardcoded seo-data.ts ─────────────────────

function buildFallbackCatalog(): BrandEntry[] {
  const entries: BrandEntry[] = [];
  
  for (const brand of BRANDS) {
    const categoryMap = new Map<string, ModelEntry[]>();
    
    for (const model of MODELS[brand] || []) {
      const category = getDeviceCategory(brand, model);
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      
      categoryMap.get(category)!.push({
        model,
        slug: slugify(model),
        repairTypes: REPAIR_TYPES.map(rt => ({
          slug: rt.slug,
          name: rt.name,
          price: 0,
        })),
      });
    }
    
    for (const [category, models] of categoryMap) {
      entries.push({
        category,
        brand,
        slug: slugify(brand),
        icon: getCategoryIcon(category),
        models,
      });
    }
  }
  
  return entries;
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
export async function fetchBrandModels(categorySlug: string, brandSlug: string): Promise<{
  brand: BrandEntry | null;
  source: 'pos' | 'fallback';
}> {
  const catalog = await fetchRepairCatalog();
  const brand = catalog.brands.find(b => b.category === categorySlug && b.slug === brandSlug) || null;
  return { brand, source: catalog.source };
}

/**
 * Fetch repair details for a specific model + repair-type combination.
 */
export async function fetchRepairDetails(
  categorySlug: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: string
): Promise<{
  brand: string;
  model: string;
  modelCode?: string;
  repairType: string;
  price: number;
  source: 'pos' | 'fallback';
} | null> {
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(b => b.category === categorySlug && b.slug === brandSlug);
  if (!brandEntry) return null;

  const modelEntry = brandEntry.models.find(m => m.slug === modelSlug);
  if (!modelEntry) return null;

  const repairEntry = modelEntry.repairTypes.find(r => r.slug === repairSlug);

  return {
    brand: brandEntry.brand,
    model: modelEntry.model,
    modelCode: modelEntry.modelCode,
    repairType: repairEntry?.name || repairSlug.replace(/-/g, ' '),
    price: repairEntry?.price || 0,
    source: catalog.source,
  };
}

/**
 * Fetch repair types for a specific brand + model (for the intermediate model page).
 */
export async function fetchModelRepairTypes(
  categorySlug: string,
  brandSlug: string,
  modelSlug: string
): Promise<{
  brand: string;
  model: string;
  repairTypes: RepairOption[];
  source: 'pos' | 'fallback';
} | null> {
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(b => b.category === categorySlug && b.slug === brandSlug);
  if (!brandEntry) return null;

  const modelEntry = brandEntry.models.find(m => m.slug === modelSlug);
  if (!modelEntry) return null;

  return {
    brand: brandEntry.brand,
    model: modelEntry.model,
    repairTypes: modelEntry.repairTypes,
    source: catalog.source,
  };
}
