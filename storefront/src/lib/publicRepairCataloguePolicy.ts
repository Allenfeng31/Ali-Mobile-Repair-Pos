import { createHash } from 'node:crypto';
import { isApprovedPublicRepairRetirement } from './publicRepairCatalogueRetirements';

export const PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION = 1;
export const PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS = 86_400;
export const PUBLIC_REPAIR_CATALOGUE_DEFAULT_MIN_REPAIR_RATIO = 0.7;
export const PUBLIC_REPAIR_CATALOGUE_REQUIRED_CATEGORIES = ['phone', 'tablet', 'laptop', 'watch'] as const;

export type PublicRepairCatalogueSource = 'live-pos' | 'last-known-good' | 'development-fallback';
export type PublicRepairCatalogueMode = 'production' | 'development' | 'test';

export interface RepairVariant {
  quality_grade: string;
  price: number;
  is_recommended: boolean;
}

export interface RepairOption {
  slug: string;
  name: string;
  price: number;
  variants?: RepairVariant[];
  sourceType?: 'real' | 'virtual' | 'diagnostic';
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

export interface PublicRepairCataloguePayload {
  brands: BrandEntry[];
}

export interface RepairCatalog extends PublicRepairCataloguePayload {
  /** Legacy consumer compatibility. Use catalogueSource for durable-source reporting. */
  source: 'pos' | 'fallback';
  catalogueSource: PublicRepairCatalogueSource;
  fetchedAt: string;
  validatedAt: string;
  checksum: string;
  inventoryRowCount: number;
  publicModelCount: number;
  publicRepairCount: number;
}

export interface StoredPublicRepairCatalogueSnapshot {
  payload: PublicRepairCataloguePayload;
  checksum: string;
  fetchedAt: string;
  validatedAt: string;
  inventoryRowCount: number;
  publicModelCount: number;
  publicRepairCount: number;
}

export interface PublicRepairCatalogueCounts {
  publicModelCount: number;
  publicRepairCount: number;
}

export interface PublicRepairCatalogueResolverDependencies<RawItem> {
  mode: PublicRepairCatalogueMode;
  fetchLiveInventory: () => Promise<RawItem[]>;
  transformLiveInventory: (items: RawItem[]) => BrandEntry[];
  readSnapshot: () => Promise<StoredPublicRepairCatalogueSnapshot | null>;
  writeSnapshot: (snapshot: StoredPublicRepairCatalogueSnapshot) => Promise<void>;
  createDevelopmentFallback: () => BrandEntry[];
  inventoryRowCount?: (items: RawItem[]) => number;
  minRepairRatio?: number;
  refreshWindowMilliseconds?: number;
  allowMajorShrink?: boolean;
  now?: () => Date;
  onWarning?: (message: string) => void;
}

export function createSharedPublicRepairCatalogueLoader<T>(
  load: () => Promise<T>,
  refreshMilliseconds: number,
  now: () => number = Date.now,
) {
  let promise: Promise<T> | null = null;
  let resolvedAt = 0;

  return () => {
    if (promise && now() - resolvedAt < refreshMilliseconds) return promise;
    resolvedAt = now();
    promise = load().catch((error) => {
      promise = null;
      resolvedAt = 0;
      throw error;
    });
    return promise;
  };
}

export async function runBoundedPublicCatalogueAttempts<T>(
  request: (attempt: number) => Promise<T>,
  options: {
    maxAttempts: number;
    backoffMilliseconds: readonly number[];
    wait: (milliseconds: number) => Promise<void>;
    onFailure: (attempt: number) => void;
  },
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await request(attempt);
    } catch (error) {
      lastError = error;
      options.onFailure(attempt);
      if (attempt < options.maxAttempts) await options.wait(options.backoffMilliseconds[attempt - 1] ?? 0);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Bounded public catalogue request failed.');
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function safePrice(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function sorted<T>(items: readonly T[], compare: (a: T, b: T) => number) {
  return [...items].sort(compare);
}

/** Removes non-public POS fields before snapshot persistence. */
export function serializePublicRepairCatalogue(brands: BrandEntry[]): PublicRepairCataloguePayload {
  return {
    brands: sorted(brands, (a, b) => `${a.category}/${a.slug}`.localeCompare(`${b.category}/${b.slug}`)).map((brand) => ({
      category: brand.category,
      brand: brand.brand,
      slug: brand.slug,
      icon: brand.icon,
      models: sorted(brand.models, (a, b) => a.slug.localeCompare(b.slug)).map((model) => ({
        model: model.model,
        slug: model.slug,
        ...(model.modelCode ? { modelCode: model.modelCode } : {}),
        repairTypes: sorted(model.repairTypes, (a, b) => a.slug.localeCompare(b.slug)).map((repair) => ({
          slug: repair.slug,
          name: repair.name,
          price: safePrice(repair.price),
          ...(repair.sourceType ? { sourceType: repair.sourceType } : {}),
          ...(repair.variants
            ? {
                variants: repair.variants.map((variant) => ({
                  quality_grade: variant.quality_grade,
                  price: safePrice(variant.price),
                  is_recommended: Boolean(variant.is_recommended),
                })),
              }
            : {}),
        })),
      })),
    })),
  };
}

export function countPublicRepairCatalogue(brands: BrandEntry[]): PublicRepairCatalogueCounts {
  return brands.reduce(
    (counts, brand) => {
      counts.publicModelCount += brand.models.length;
      counts.publicRepairCount += brand.models.reduce((total, model) => total + model.repairTypes.length, 0);
      return counts;
    },
    { publicModelCount: 0, publicRepairCount: 0 },
  );
}

export function checksumPublicRepairCatalogue(payload: PublicRepairCataloguePayload) {
  return createHash('sha256').update(JSON.stringify(serializePublicRepairCatalogue(payload.brands))).digest('hex');
}

export function validatePublicRepairCatalogue(payload: PublicRepairCataloguePayload): string | null {
  if (!payload || !Array.isArray(payload.brands) || payload.brands.length === 0) {
    return 'catalogue has no public brands';
  }

  const categories = new Set<string>();
  for (const brand of payload.brands) {
    if (!PUBLIC_REPAIR_CATALOGUE_REQUIRED_CATEGORIES.includes(brand.category as (typeof PUBLIC_REPAIR_CATALOGUE_REQUIRED_CATEGORIES)[number])) {
      return 'catalogue contains an unsupported category';
    }
    if (!brand.brand?.trim() || !SLUG_PATTERN.test(brand.slug)) {
      return 'catalogue contains an invalid public brand';
    }
    categories.add(brand.category);
    for (const model of brand.models) {
      if (!model.model?.trim() || !SLUG_PATTERN.test(model.slug) || !Array.isArray(model.repairTypes) || model.repairTypes.length === 0) {
        return 'catalogue contains an invalid public model';
      }
      for (const repair of model.repairTypes) {
        if (!repair.name?.trim() || !SLUG_PATTERN.test(repair.slug) || !Number.isFinite(safePrice(repair.price))) {
          return 'catalogue contains an invalid public repair';
        }
      }
    }
  }

  if (!PUBLIC_REPAIR_CATALOGUE_REQUIRED_CATEGORIES.every((category) => categories.has(category))) {
    return 'catalogue is missing a required public category';
  }

  const counts = countPublicRepairCatalogue(payload.brands);
  return counts.publicModelCount > 0 && counts.publicRepairCount > 0 ? null : 'catalogue has no public models or repairs';
}

export function mergeMissingPublicRepairEntries(
  previous: BrandEntry[],
  candidate: BrandEntry[],
  isApprovedRetirement = isApprovedPublicRepairRetirement,
) {
  const merged = serializePublicRepairCatalogue(candidate).brands;
  let retainedMissingEntries = 0;

  const retainableModel = (brand: BrandEntry, model: ModelEntry): ModelEntry | null => {
    const repairTypes = model.repairTypes.filter((repair) => !isApprovedRetirement(brand.category, brand.slug, model.slug, repair.slug));
    return repairTypes.length ? { ...model, repairTypes } : null;
  };

  for (const previousBrand of previous) {
    let targetBrand = merged.find((brand) => brand.category === previousBrand.category && brand.slug === previousBrand.slug);
    if (!targetBrand) {
      const models = previousBrand.models.map((model) => retainableModel(previousBrand, model)).filter((model): model is ModelEntry => Boolean(model));
      if (models.length) {
        merged.push(serializePublicRepairCatalogue([{ ...previousBrand, models }]).brands[0]);
        retainedMissingEntries += models.reduce((total, model) => total + model.repairTypes.length, 0);
      }
      continue;
    }

    for (const previousModel of previousBrand.models) {
      let targetModel = targetBrand.models.find((model) => model.slug === previousModel.slug);
      if (!targetModel) {
        const retained = retainableModel(previousBrand, previousModel);
        if (retained) {
          targetBrand.models.push(serializePublicRepairCatalogue([{ ...previousBrand, models: [retained] }]).brands[0].models[0]);
          retainedMissingEntries += retained.repairTypes.length;
        }
        continue;
      }

      for (const previousRepair of previousModel.repairTypes) {
        if (!isApprovedRetirement(previousBrand.category, previousBrand.slug, previousModel.slug, previousRepair.slug) && !targetModel.repairTypes.some((repair) => repair.slug === previousRepair.slug)) {
          targetModel.repairTypes.push(serializePublicRepairCatalogue([{ ...previousBrand, models: [{ ...previousModel, repairTypes: [previousRepair] }] }]).brands[0].models[0].repairTypes[0]);
          retainedMissingEntries += 1;
        }
      }
    }
  }

  return { brands: serializePublicRepairCatalogue(merged).brands, retainedMissingEntries };
}

function createCatalog(
  brands: BrandEntry[],
  source: PublicRepairCatalogueSource,
  inventoryRowCount: number,
  now: Date,
): RepairCatalog {
  const payload = serializePublicRepairCatalogue(brands);
  const validationError = validatePublicRepairCatalogue(payload);
  if (validationError) throw new Error(`Public repair catalogue rejected: ${validationError}.`);
  const counts = countPublicRepairCatalogue(payload.brands);
  const timestamp = now.toISOString();
  return {
    ...payload,
    source: source === 'development-fallback' ? 'fallback' : 'pos',
    catalogueSource: source,
    fetchedAt: timestamp,
    validatedAt: timestamp,
    checksum: checksumPublicRepairCatalogue(payload),
    inventoryRowCount,
    ...counts,
  };
}

function catalogFromSnapshot(snapshot: StoredPublicRepairCatalogueSnapshot): RepairCatalog {
  const payload = serializePublicRepairCatalogue(snapshot.payload.brands);
  const validationError = validatePublicRepairCatalogue(payload);
  if (validationError || checksumPublicRepairCatalogue(payload) !== snapshot.checksum) {
    throw new Error('Last-known-good public repair catalogue snapshot is invalid.');
  }
  const counts = countPublicRepairCatalogue(payload.brands);
  if (counts.publicModelCount !== snapshot.publicModelCount || counts.publicRepairCount !== snapshot.publicRepairCount) {
    throw new Error('Last-known-good public repair catalogue snapshot counts do not match its payload.');
  }
  return {
    ...payload,
    source: 'pos',
    catalogueSource: 'last-known-good',
    fetchedAt: snapshot.fetchedAt,
    validatedAt: snapshot.validatedAt,
    checksum: snapshot.checksum,
    inventoryRowCount: snapshot.inventoryRowCount,
    ...counts,
  };
}

function assertCandidateIsNotCatastrophic(
  candidate: RepairCatalog,
  previous: RepairCatalog | null,
  minRepairRatio: number,
  allowMajorShrink: boolean,
) {
  if (!previous || allowMajorShrink) return;

  const candidateCategories = new Set(candidate.brands.map((brand) => brand.category));
  const previousCategories = new Set(previous.brands.map((brand) => brand.category));
  if ([...previousCategories].some((category) => !candidateCategories.has(category))) {
    throw new Error('Public repair catalogue refresh rejected because a previously available category disappeared.');
  }

  if (candidate.publicRepairCount / previous.publicRepairCount < minRepairRatio) {
    throw new Error('Public repair catalogue refresh rejected because its repair count shrank beyond the configured safety threshold.');
  }
}

function snapshotFromCatalog(catalog: RepairCatalog): StoredPublicRepairCatalogueSnapshot {
  return {
    payload: serializePublicRepairCatalogue(catalog.brands),
    checksum: catalog.checksum,
    fetchedAt: catalog.fetchedAt,
    validatedAt: catalog.validatedAt,
    inventoryRowCount: catalog.inventoryRowCount,
    publicModelCount: catalog.publicModelCount,
    publicRepairCount: catalog.publicRepairCount,
  };
}

export async function resolvePublicRepairCatalogue<RawItem>(
  dependencies: PublicRepairCatalogueResolverDependencies<RawItem>,
): Promise<RepairCatalog> {
  const now = dependencies.now ?? (() => new Date());
  const minRepairRatio = dependencies.minRepairRatio ?? PUBLIC_REPAIR_CATALOGUE_DEFAULT_MIN_REPAIR_RATIO;
  const refreshWindowMilliseconds = dependencies.refreshWindowMilliseconds ?? PUBLIC_REPAIR_CATALOGUE_REFRESH_SECONDS * 1_000;
  let previousSnapshot: StoredPublicRepairCatalogueSnapshot | null;
  try {
    previousSnapshot = await dependencies.readSnapshot();
  } catch {
    if (dependencies.mode === 'production') {
      throw new Error('Production build stopped: durable public repair catalogue snapshot storage is unavailable.');
    }
    dependencies.onWarning?.('Public repair catalogue snapshot storage is unavailable in explicit development/test mode.');
    previousSnapshot = null;
  }
  const previous = previousSnapshot ? catalogFromSnapshot(previousSnapshot) : null;

  if (previous) {
    const snapshotAge = now().getTime() - Date.parse(previous.validatedAt);
    if (Number.isFinite(snapshotAge) && snapshotAge >= 0 && snapshotAge < refreshWindowMilliseconds) {
      dependencies.onWarning?.('Using the current last-known-good public catalogue snapshot; the 24-hour refresh window has not elapsed.');
      return previous;
    }
  }

  try {
    const inventory = await dependencies.fetchLiveInventory();
    if (!Array.isArray(inventory) || inventory.length === 0) throw new Error('Live POS inventory response is empty.');
    const candidate = createCatalog(
      dependencies.transformLiveInventory(inventory),
      'live-pos',
      dependencies.inventoryRowCount?.(inventory) ?? inventory.length,
      now(),
    );
    assertCandidateIsNotCatastrophic(candidate, previous, minRepairRatio, Boolean(dependencies.allowMajorShrink));
    const merged = previous ? mergeMissingPublicRepairEntries(previous.brands, candidate.brands) : { brands: candidate.brands, retainedMissingEntries: 0 };
    if (merged.retainedMissingEntries > 0) {
      dependencies.onWarning?.(`Retained ${merged.retainedMissingEntries} previously verified public repair entries missing from this refresh.`);
    }
    const accepted = createCatalog(merged.brands, 'live-pos', candidate.inventoryRowCount, now());
    await dependencies.writeSnapshot(snapshotFromCatalog(accepted));
    return accepted;
  } catch (error) {
    if (previous) {
      dependencies.onWarning?.('Live POS catalogue refresh failed; using the last-known-good public catalogue snapshot.');
      return previous;
    }
    if (dependencies.mode === 'development' || dependencies.mode === 'test') {
      dependencies.onWarning?.('Using explicit development/test public repair catalogue fallback.');
      return createCatalog(dependencies.createDevelopmentFallback(), 'development-fallback', 0, now());
    }
    throw new Error('Production build stopped: no validated live POS catalogue or last-known-good public catalogue snapshot is available.');
  }
}
