import {
  RawItem,
  ParsedItem,
  parseItem,
  slugify,
  displayBrand,
  normalizeSamsungCatalogModelName,
} from './inventoryUtils';
import { OPPO_ENHANCED_CONFIG } from './seo/content/oppo/config';
import { withAppleWatchChargingRepairOption } from './seo/content/apple-watch';
import { SAMSUNG_HARDWARE_CONFIG } from './seo/content/samsung/config';
import type {
  AliMobileEnhancedSamsungRepairType,
  SamsungHardwareConfig,
} from './seo/content/samsung/types';
import { BRANDS, MODELS, REPAIR_TYPES } from '@/data/seo-data';
import {
  PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS,
  createSharedPublicRepairCatalogueLoader,
  resolvePublicRepairCatalogue,
  runBoundedPublicCatalogueAttempts,
  type BrandEntry,
  type ModelEntry,
  type RepairCatalog,
  type RepairOption,
  type RepairVariant,
} from './publicRepairCataloguePolicy';
import {
  readCurrentPublicRepairCatalogueSnapshot,
  writeCurrentPublicRepairCatalogueSnapshot,
} from './publicRepairCatalogueSnapshot.server';

export type {
  BrandEntry,
  ModelEntry,
  PublicRepairCatalogueSource,
  RepairCatalog,
  RepairOption,
  RepairVariant,
} from './publicRepairCataloguePolicy';

// ─── Types ──────────────────────────────────────────────────────────────────

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
const POS_FETCH_TIMEOUT_MS = 8_000;
const POS_FETCH_MAX_ATTEMPTS = 3;
const POS_FETCH_BACKOFF_MS = [150, 350] as const;
const CATALOGUE_REFRESH_MS = PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS * 1_000;
export const PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG = 'public-repair-catalogue-source';

function getPublicRepairCatalogueMode(): 'production' | 'development' | 'test' {
  const explicitMode = process.env.PUBLIC_REPAIR_CATALOGUE_MODE;
  if (explicitMode === 'test' || process.env.NODE_ENV === 'test') return 'test';
  if (explicitMode === 'development' && process.env.NODE_ENV !== 'production') return 'development';
  return 'production';
}

function allowMajorCatalogueShrink() {
  return process.env.PUBLIC_REPAIR_CATALOGUE_ALLOW_MAJOR_SHRINK === 'approved';
}

function waitForBackoff(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchPOSInventory({
  forceLive = false,
  baseUrl = process.env.POS_API_URL || process.env.NEXT_PUBLIC_POS_API_URL,
  fetchImpl = fetch,
}: {
  forceLive?: boolean;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
} = {}): Promise<RawItem[]> {

  if (!baseUrl) {
    throw new Error('Public POS inventory endpoint is not configured.');
  }

  return runBoundedPublicCatalogueAttempts(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), POS_FETCH_TIMEOUT_MS);
    try {
      const res = await fetchImpl(`${baseUrl}${POS_INVENTORY_ENDPOINT}`, {
        ...(forceLive
          ? { cache: 'no-store' as const }
          : {
              next: {
                revalidate: PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS,
                tags: [PUBLIC_REPAIR_CATALOGUE_SOURCE_TAG],
              },
            }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`POS inventory request returned HTTP ${res.status}.`);
      const payload: unknown = await res.json();
      if (!Array.isArray(payload)) throw new Error('POS inventory response is not an array.');
      return payload as RawItem[];
    } finally {
      clearTimeout(timeout);
    }
  }, {
    maxAttempts: POS_FETCH_MAX_ATTEMPTS,
    backoffMilliseconds: POS_FETCH_BACKOFF_MS,
    wait: waitForBackoff,
    onFailure: (attempt) => console.warn(`[public-catalogue] POS refresh attempt ${attempt}/${POS_FETCH_MAX_ATTEMPTS} failed.`),
  });
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

function normalizeRepairSlug(rawName: string): string {
  const rawSlug = slugify(rawName);

  const repairSlugRules: Array<[RegExp, string]> = [
    [/(^|-)screen-(repair|replacement)$/, 'screen-replacement'],
    [/(^|-)battery-(service|repair|replacement)$/, 'battery-replacement'],
    [/(^|-)charging-port(-(repair|replacement))?$/, 'charging-port-replacement'],
    [/(^|-)back-housing(-(repair|replacement))?$/, 'back-glass-replacement'],
    [/(^|-)back-glass(-(repair|replacement))?$/, 'back-glass-replacement'],
    [/(^|-)front-camera(-(repair|replacement))?$/, 'front-camera-replacement'],
    [/(^|-)back-camera(-(repair|replacement))?$/, 'back-camera-replacement'],
    [/(^|-)water-damage(-(repair|recovery))?$/, 'water-damage-repair'],
    [/(^|-)logic-board(-(repair|replacement))?$/, 'logic-board-repair'],
  ];

  return repairSlugRules.find(([pattern]) => pattern.test(rawSlug))?.[1] ?? rawSlug;
}

// ─── Repair Matrix Expansion ─────────────────────────────────────────────────

const UNIVERSAL_REPAIR_TYPES: RepairOption[] = [
  { slug: 'screen-replacement',          name: 'Screen Replacement',          price: 0 },
  { slug: 'battery-replacement',         name: 'Battery Replacement',         price: 0 },
  { slug: 'charging-port-replacement',   name: 'Charging Port Replacement',   price: 0 },
  { slug: 'water-damage-repair',         name: 'Water Damage Cleaning / Assessment', price: 0 },
];

const BACK_GLASS_REPAIR: RepairOption = {
  slug: 'back-glass-replacement',
  name: 'Back Glass Replacement',
  price: 0,
};

const SAMSUNG_CATALOG_BACKFILL_MODEL_SLUGS = ['galaxy-a37-5g', 'galaxy-a57-5g'] as const;

const SAMSUNG_REPAIR_TYPE_NAMES: Record<AliMobileEnhancedSamsungRepairType, string> = {
  'screen-replacement': 'Screen Replacement',
  'battery-replacement': 'Battery Replacement',
  'charging-port-replacement': 'Charging Port Replacement',
  'back-glass-replacement': 'Back Glass Replacement',
  'back-housing-replacement': 'Back Housing Replacement',
  'front-camera-replacement': 'Front Camera Replacement',
  'back-camera-replacement': 'Back Camera Replacement',
  'logic-board-repair': 'Logic Board Repair',
};

function buildSamsungBackfillRepairs(config: SamsungHardwareConfig): RepairOption[] {
  return config.supportedRepairTypes.map((slug) => ({
    slug: slug === 'back-housing-replacement' ? 'back-glass-replacement' : slug,
    name:
      slug === 'back-housing-replacement'
        ? SAMSUNG_REPAIR_TYPE_NAMES['back-glass-replacement']
        : SAMSUNG_REPAIR_TYPE_NAMES[slug],
    price: 0,
  }));
}

function backfillSamsungCatalogModels(brands: BrandEntry[]): BrandEntry[] {
  const updatedBrands = brands.map((brand) => ({
    ...brand,
    models: [...brand.models],
  }));

  let samsungBrand = updatedBrands.find(
    (brand) => brand.category === 'phone' && brand.slug === 'samsung'
  );

  if (!samsungBrand) {
    samsungBrand = {
      category: 'phone',
      brand: 'Samsung',
      slug: 'samsung',
      icon: getCategoryIcon('phone'),
      models: [],
    };
    updatedBrands.push(samsungBrand);
  }

  for (const modelSlug of SAMSUNG_CATALOG_BACKFILL_MODEL_SLUGS) {
    const config = SAMSUNG_HARDWARE_CONFIG[modelSlug];
    if (!config || samsungBrand.models.some((model) => model.slug === config.modelSlug)) {
      continue;
    }

    samsungBrand.models.push({
      model: config.modelName,
      slug: config.modelSlug,
      modelCode: config.modelCodes?.join(', '),
      repairTypes: buildSamsungBackfillRepairs(config),
    });
  }

  return updatedBrands;
}

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

  // Google Pixel (most have glass back)
  if (brand.includes('google')) {
    return true;
  }



  return false;
}

/** Ensure every model has core repair types, with smart back-glass filtering */
function ensureCoreRepairTypes(
  repairTypes: RepairOption[],
  categorySlug: string,
  brandSlug: string,
  modelName: string
): RepairOption[] {
  const isAppleWatch = categorySlug === 'watch' && brandSlug === 'apple';
  const result = isAppleWatch
    ? repairTypes.filter((repair) => repair.slug !== 'charging-port-replacement')
    : [...repairTypes];
  const isGalaxyNoteModel = brandSlug.includes('samsung') && /galaxy\s+note/i.test(modelName);

  const isOppo = brandSlug === 'oppo';

  // For OPPO, if the model is in OPPO_ENHANCED_CONFIG, we use only genuine POS products.
  if (isOppo) {
    const oppoSlug = slugify(modelName);
    const hasOppoConfig = Object.prototype.hasOwnProperty.call(OPPO_ENHANCED_CONFIG.models, oppoSlug);
    
    // Only apply enhanced handling if the model is explicitly configured
    if (hasOppoConfig) {
      // Check if it has the exactly 7 genuine POS products required for the OPPO rollout
      // The 7 products are: screen-replacement, battery-replacement, charging-port-replacement,
      // back-housing-replacement, front-camera-replacement, back-camera-replacement, logic-board-repair
      const requiredSlugs = [
        'screen-replacement',
        'battery-replacement',
        'charging-port-replacement',
        'back-glass-replacement',
        'front-camera-replacement',
        'back-camera-replacement',
        'logic-board-repair'
      ];

      const genuineSlugs = result.map(r => r.slug);
      const hasAllGenuine = requiredSlugs.every(slug => genuineSlugs.includes(slug));
      
      // Ensure there are no unexpected extra repairs like generic water damage
      const noExtras = result.filter(r => r.slug !== 'water-damage-repair').length === requiredSlugs.length;

      console.log('[DEBUG] oppoSlug is:', oppoSlug);

      if (oppoSlug === 'reno-10-pro-plus') {
        console.log('[DEBUG] reno-10-pro-plus genuineSlugs:', genuineSlugs);
        console.log('[DEBUG] hasAllGenuine:', hasAllGenuine, 'noExtras:', noExtras, 'filtered len:', result.filter(r => r.slug !== 'water-damage-repair').length);
      }

      if (hasAllGenuine && noExtras) {
        // Remove synthetic water-damage-repair if it somehow got added (it shouldn't be in POS)
        const wdIdx = result.findIndex(r => r.slug === 'water-damage-repair');
        if (wdIdx !== -1) result.splice(wdIdx, 1);
        
        // Keep only genuine POS products, no synthetic additions
        return result;
      }
      
      // If it fails the 7 genuine products check, it falls through to the synthetic generic logic.
      // This effectively excludes it from the "active" enhanced set while keeping the site from breaking.
    }
  }

  // Apple Watch uses magnetic charging diagnosis rather than a physical charging-port repair.
  for (const core of UNIVERSAL_REPAIR_TYPES) {
    if (isAppleWatch && core.slug === 'charging-port-replacement') continue;
    if (!result.some(r => r.slug === core.slug)) {
      result.push({ ...core, sourceType: 'real' });
    }
  }

  // Galaxy Note models keep only the genuine POS rows already present in the catalogue.
  if (isGalaxyNoteModel) {
    return result;
  }

  // Conditionally add back-glass-repair
  if (qualifiesForBackGlass(brandSlug, modelName)) {
    if (!result.some(r => r.slug === BACK_GLASS_REPAIR.slug)) {
      result.push({ ...BACK_GLASS_REPAIR, sourceType: 'real' });
    }
  } else {
    // Remove back-glass if it was in POS data but shouldn't be
    // (keep if it came from POS with an actual price — the shop explicitly offers it)
    const idx = result.findIndex(r => r.slug === BACK_GLASS_REPAIR.slug && r.price === 0);
    if (idx !== -1) result.splice(idx, 1);
  }

  return withAppleWatchChargingRepairOption(result, categorySlug, brandSlug, slugify(modelName));
}

// ─── Transform POS Data → RepairCatalog ─────────────────────────────────────

export function transformPOSToCatalog(rawItems: RawItem[]): BrandEntry[] {
  const parsed = rawItems.map(parseItem).filter(Boolean) as ParsedItem[];

  // Group by category|brand → model → { repairTypes, code }
  const brandMap = new Map<string, Map<string, { repairTypes: RepairOption[], code?: string }>>();

  for (const item of parsed) {
    // Data sanitization: skip invalid model names
    if (!isValidModelName(item.deviceModel)) continue;

    // ── Name Standardization: map old POS names to canonical names ──
    const standardName = standardizeRepairName(item.service);
    const standardSlug = normalizeRepairSlug(standardName);

    const cleanBrand = displayBrand(item.brand);
    const normalizedModelName =
      slugify(cleanBrand) === 'samsung'
        ? normalizeSamsungCatalogModelName(item.deviceModel, item.modelCode)
        : item.deviceModel;
    const category = getDeviceCategory(cleanBrand, item.deviceModel);
    const compoundKey = `${category}|${cleanBrand}`;

    if (!brandMap.has(compoundKey)) {
      brandMap.set(compoundKey, new Map());
    }

    const modelMap = brandMap.get(compoundKey)!;
    if (!modelMap.has(normalizedModelName)) {
      modelMap.set(normalizedModelName, { repairTypes: [], code: item.modelCode });
    } else if (item.modelCode && !modelMap.get(normalizedModelName)!.code) {
      // Opportunistically pick up the code if it wasn't on the first row
      modelMap.get(normalizedModelName)!.code = item.modelCode;
    }

    const { repairTypes } = modelMap.get(normalizedModelName)!;

    // ── Dedup: if a slug already exists, push as a variant ──
    const existingIdx = repairTypes.findIndex(r => r.slug === standardSlug);
    if (existingIdx !== -1) {
      const existing = repairTypes[existingIdx];
      if (!existing.variants) {
        // Initialize variants with the existing item if it didn't have any
        existing.variants = [{ quality_grade: 'Standard', price: existing.price, is_recommended: false }];
      }
      existing.variants!.push({
        quality_grade: item.quality_grade,
        price: item.price,
        is_recommended: item.is_recommended,
      });
      // The base price should be the lowest (starting price)
      if (item.price > 0 && (existing.price === 0 || item.price < existing.price)) {
        existing.price = item.price;
      }
    } else {
      repairTypes.push({
        slug: standardSlug,
        name: standardName,
        price: item.price,
        variants: [{ quality_grade: item.quality_grade, price: item.price, is_recommended: item.is_recommended }],
        sourceType: 'real',
      });
    }
  }

  // Convert to array, applying matrix expansion
  const brands: BrandEntry[] = [];
  for (const [compoundKey, modelMap] of brandMap) {
    const [category, brand] = compoundKey.split('|');
    const brandBaseName = brand.replace(/\s+(Tablet|Phone|Watch|Laptop)$/i, '');
    const canonicalBrandSlug = slugify(brandBaseName);
    const models: ModelEntry[] = [];
    for (const [model, { repairTypes, code }] of modelMap) {
      models.push({
        model,
        slug: slugify(model),
        modelCode: code,
        repairTypes: ensureCoreRepairTypes(repairTypes, category, canonicalBrandSlug, model),
      });
    }
    const normalizedBrandName = brandBaseName.toLowerCase() === 'google' ? 'Google Pixel' : brandBaseName;
    brands.push({
      category,
      brand: normalizedBrandName,
      slug: slugify(normalizedBrandName),
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
      const canonicalBrandSlug = slugify(brand.replace(/\s+(Tablet|Phone|Watch|Laptop)$/i, ''));
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      
      categoryMap.get(category)!.push({
        model,
        slug: slugify(model),
        repairTypes: ensureCoreRepairTypes(REPAIR_TYPES.map(rt => ({
          slug: rt.slug,
          name: rt.name,
          price: 0,
        })), category, canonicalBrandSlug, model),
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
 * Resolves one shared public catalogue per 7-day safety refresh window. Production
 * uses live POS or the durable last-known-good snapshot; it never accepts the
 * small development fallback.
 */
function resolveCurrentPublicRepairCatalogue(forceRefresh = false): Promise<RepairCatalog> {
  return resolvePublicRepairCatalogue({
    mode: getPublicRepairCatalogueMode(),
    fetchLiveInventory: () => fetchPOSInventory({ forceLive: forceRefresh }),
    transformLiveInventory: (items) => transformPOSToCatalog(items),
    readSnapshot: readCurrentPublicRepairCatalogueSnapshot,
    writeSnapshot: writeCurrentPublicRepairCatalogueSnapshot,
    createDevelopmentFallback: () => backfillSamsungCatalogModels(buildFallbackCatalog()),
    allowMajorShrink: allowMajorCatalogueShrink(),
    forceRefresh,
    onWarning: (message) => console.warn(`[public-catalogue] ${message}`),
  });
}

export async function fetchRepairCatalog(): Promise<RepairCatalog> {
  return sharedPublicRepairCatalogue();
}

/** Refreshes, validates, and durably stores the snapshot before route invalidation. */
export async function refreshPublicRepairCatalogue(): Promise<RepairCatalog> {
  return resolveCurrentPublicRepairCatalogue(true);
}

const sharedPublicRepairCatalogue = createSharedPublicRepairCatalogueLoader(
  () => resolveCurrentPublicRepairCatalogue(),
  CATALOGUE_REFRESH_MS,
);

/**
 * Fetch a specific brand's model list for the sub-hub page.
 */
export async function fetchBrandModels(categorySlug: string, brandSlug: string): Promise<{
  brand: BrandEntry | null;
  source: RepairCatalog['source'];
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
  variants: RepairVariant[];
  source: RepairCatalog['source'];
  sourceType?: 'real' | 'virtual' | 'diagnostic';
} | null> {
  const catalog = await fetchRepairCatalog();
  const brandEntry = catalog.brands.find(b => b.category === categorySlug && b.slug === brandSlug);
  if (!brandEntry) return null;

  const modelEntry = brandEntry.models.find(m => m.slug === modelSlug);
  if (!modelEntry) return null;

  const repairEntry = modelEntry.repairTypes.find(r => r.slug === repairSlug);
  if (!repairEntry) return null;

  return {
    brand: brandEntry.brand,
    model: modelEntry.model,
    modelCode: modelEntry.modelCode,
    repairType: repairEntry.name,
    price: repairEntry.price,
    variants: repairEntry.variants || [],
    source: catalog.source,
    sourceType: repairEntry.sourceType,
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
  source: RepairCatalog['source'];
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
