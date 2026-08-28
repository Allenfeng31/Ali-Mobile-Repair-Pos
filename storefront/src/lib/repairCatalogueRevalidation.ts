import { timingSafeEqual } from 'node:crypto';
import type { RepairCatalog } from '@/lib/api';

export type CatalogueMutation = {
  operation: 'create' | 'update' | 'delete';
  category: 'phone' | 'tablet' | 'laptop' | 'watch';
  brand: string;
  model: string;
  modelCode?: string;
  repairType: string;
  changedFields: string[];
  topologyChanged: boolean;
  retirement?: boolean;
};

const MAX_MUTATIONS = 500;
const MAX_TEXT_LENGTH = 120;
const SAFE_CHANGED_FIELDS = new Set(['name', 'model', 'device_model', 'category', 'price', 'costPrice', 'quality_grade', 'is_recommended', 'topology', 'stock', 'quantity', 'minStock', 'status']);
const SAFE_OPERATIONS = new Set(['create', 'update', 'delete']);
const SAFE_CATEGORIES = new Set(['phone', 'tablet', 'laptop', 'watch']);
const SAFE_MUTATION_KEYS = new Set(['operation', 'category', 'brand', 'model', 'modelCode', 'repairType', 'changedFields', 'topologyChanged', 'retirement']);
const GENERIC_REPAIR_HUBS = new Set(['screen-replacement', 'battery-replacement', 'charging-port-replacement', 'back-glass-replacement']);

function toSlug(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > MAX_TEXT_LENGTH) return null;
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

function canonicalBrandSlug(category: CatalogueMutation['category'], brand: unknown): string | null {
  const slug = toSlug(brand);
  if (!slug) return null;
  if (category === 'phone' && ['google', 'pixel', 'googlepixel'].includes(slug)) return 'google-pixel';
  if (category === 'watch' && ['apple-watch', 'applewatch'].includes(slug)) return 'apple';
  return slug;
}

function canonicalPublicRepairSlug(slug: string): string {
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

  return repairSlugRules.find(([pattern]) => pattern.test(slug))?.[1] ?? slug;
}

function canonicalRepairSlug(category: CatalogueMutation['category'], brand: string, repair: unknown): string | null {
  const rawSlug = toSlug(repair);
  const slug = rawSlug ? canonicalPublicRepairSlug(rawSlug) : null;
  if (!slug) return null;
  return category === 'watch' && brand === 'apple' && slug === 'charging-port-replacement' ? 'charging-repair' : slug;
}

export function isAuthorizedRepairCatalogueRevalidation(providedSecret: string | null, expectedSecret: string | undefined) {
  if (!providedSecret || !expectedSecret) return false;
  const provided = Buffer.from(providedSecret);
  const expected = Buffer.from(expectedSecret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function normalizeCatalogueMutations(payload: unknown): CatalogueMutation[] | null {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { mutations?: unknown }).mutations)) return null;
  const input = (payload as { mutations: unknown[] }).mutations;
  if (!input.length || input.length > MAX_MUTATIONS) return null;
  const mutations: CatalogueMutation[] = [];

  for (const value of input) {
    if (!value || typeof value !== 'object') return null;
    const raw = value as Record<string, unknown>;
    if (Object.keys(raw).some((key) => !SAFE_MUTATION_KEYS.has(key))) return null;
    if (!SAFE_OPERATIONS.has(String(raw.operation)) || !SAFE_CATEGORIES.has(String(raw.category))) return null;
    if (String(raw.category) === 'Accessories' || String(raw.brand).toLowerCase() === 'accessories') return null;
    const category = raw.category as CatalogueMutation['category'];
    const brand = canonicalBrandSlug(category, raw.brand);
    const model = toSlug(raw.model);
    const repairType = brand ? canonicalRepairSlug(category, brand, raw.repairType) : null;
    const changedFields = Array.isArray(raw.changedFields) && raw.changedFields.every((field) => typeof field === 'string' && SAFE_CHANGED_FIELDS.has(field))
      ? [...new Set(raw.changedFields)]
      : null;
    if (!brand || !model || !repairType || !changedFields) return null;
    if (raw.operation === 'update' && changedFields.length === 0) return null;
    mutations.push({
      operation: raw.operation as CatalogueMutation['operation'],
      category,
      brand,
      model,
      ...(typeof raw.modelCode === 'string' && raw.modelCode.length <= MAX_TEXT_LENGTH ? { modelCode: raw.modelCode.trim() } : {}),
      repairType,
      changedFields,
      topologyChanged: Boolean(raw.topologyChanged),
      ...(raw.retirement === true ? { retirement: true } : {}),
    });
  }
  return mutations;
}

export function isIgnoredCatalogueMutation(mutations: CatalogueMutation[]) {
  return mutations.every((mutation) => mutation.operation === 'update' && mutation.changedFields.every((field) => ['stock', 'quantity', 'minStock', 'status'].includes(field)));
}

export function extractCatalogueTopology(catalog: RepairCatalog): Set<string> {
  const topology = new Set<string>();
  for (const brand of catalog.brands) {
    topology.add(`${brand.category}`);
    topology.add(`${brand.category}/${brand.slug}`);
    for (const model of brand.models) {
      topology.add(`${brand.category}/${brand.slug}/${model.slug}`);
      for (const repair of model.repairTypes) {
        topology.add(`${brand.category}/${brand.slug}/${model.slug}/${repair.slug}`);
      }
    }
  }
  return topology;
}

export function repairCataloguePathsForMutations(mutations: CatalogueMutation[]) {
  const paths = new Set<string>();
  for (const mutation of mutations) {
    const base = `/repairs/${mutation.category}/${mutation.brand}`;
    paths.add(`${base}/${mutation.model}/${mutation.repairType}`);
    paths.add(`${base}/${mutation.model}`);
    paths.add(base);

    if (mutation.category === 'phone' && mutation.repairType === 'camera-lens-replacement' && ['samsung', 'google-pixel', 'oppo'].includes(mutation.brand)) {
      const sharedBrand = mutation.brand === 'google-pixel' ? 'google' : mutation.brand;
      paths.add(`/repairs/phone/${sharedBrand}/camera-lens-replacement`);
    } else if (GENERIC_REPAIR_HUBS.has(mutation.repairType)) {
      paths.add(`/repairs/${mutation.repairType}`);
    }

    if (mutation.topologyChanged) {
      paths.add(`/repairs/${mutation.category}`);
      paths.add('/repairs');
      paths.add('/sitemap.xml');
    }
  }
  return [...paths];
}
