import type {
  PublicRepairCatalogueSource,
  RepairOption,
  RepairOrigin,
} from './publicRepairCataloguePolicy';
import {
  classifyPhoneBrand,
  evaluateNonIphonePublicRepairPageMode,
  type NonIphonePublicRepairPageModeDecision,
} from './publicRepairPageModePolicy';
import { compareDeterministicStrings } from './deterministicStrings';
import { getPhase1DniConsolidationDestination } from '@/data/phase1DniConsolidationPaths';
import { getModelHubWaterDamageHref } from './waterDamageRouting';

export type ModelHubRepairPageModeInput = Readonly<{
  category: string;
  brandSlug: string;
  modelSlug: string;
  catalogueSource: PublicRepairCatalogueSource;
  repairTypes: readonly RepairOption[];
}>;

export type ModelHubResolvedRepairOption = Readonly<Omit<RepairOption, 'repairOrigin'> & {
  href?: string;
}>;

export type ModelHubRepairPageModeReport = Readonly<{
  repairSlug: string;
  mode: NonIphonePublicRepairPageModeDecision['mode'];
  reason: NonIphonePublicRepairPageModeDecision['reason'];
  routeAvailable: boolean;
}>;

export type ModelHubRepairPageModeResolution = Readonly<{
  options: readonly ModelHubResolvedRepairOption[];
  decisions: readonly ModelHubRepairPageModeReport[];
}>;

function legacyDetailHref(category: string, brandSlug: string, modelSlug: string, repairSlug: string) {
  return `/repairs/${category}/${brandSlug}/${modelSlug}/${repairSlug}`;
}

function repairOrigin(repair: RepairOption): RepairOrigin | 'absent' {
  return repair.repairOrigin ?? 'absent';
}

function repairComparisonKey(repair: RepairOption) {
  return JSON.stringify({
    slug: repair.slug,
    name: repair.name,
    price: repair.price,
    variants: repair.variants ?? [],
    repairOrigin: repairOrigin(repair),
  });
}

function evidenceFor(
  catalogueSource: PublicRepairCatalogueSource,
  origin: RepairOrigin | 'absent',
  conflict: boolean,
) {
  if (conflict) return 'conflict' as const;
  if (catalogueSource === 'live-pos' && origin === 'pos') return 'current-live-pos-exact' as const;
  if (catalogueSource === 'last-known-good' && (origin === 'pos' || origin === 'unknown-legacy')) {
    return 'snapshot-origin-only' as const;
  }
  if (origin === 'unknown-legacy') return 'snapshot-origin-only' as const;
  return 'none' as const;
}

function sharedHref(
  decision: NonIphonePublicRepairPageModeDecision,
  category: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: string,
): string | undefined {
  const target = decision.target;
  if (!target) return undefined;
  if (decision.reason === 'central-water-damage') {
    return getModelHubWaterDamageHref({
      category,
      brand: brandSlug,
      model: modelSlug,
      repairSlug,
    });
  }

  const query = new URLSearchParams();
  switch (target.scope) {
    case 'brand':
      query.set('model', modelSlug);
      return `${target.href}?${query.toString()}`;
    case 'global':
      query.set('brand', brandSlug);
      query.set('model', modelSlug);
      return `${target.href}?${query.toString()}`;
    case 'model':
      return undefined;
  }
}

function resolvedHref(
  decision: NonIphonePublicRepairPageModeDecision,
  fallbackHref: string,
  category: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: string,
) : string | undefined {
  if (decision.mode === 'unresolved') return undefined;
  if (decision.mode === 'shared' && decision.target) {
    return sharedHref(decision, category, brandSlug, modelSlug, repairSlug);
  }
  return decision.target?.href ?? fallbackHref;
}

const PROTECTED_REPAIR_TYPE_HUB_SLUGS = new Set([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
]);

function preservesPrimaryPhoneHubRoute(
  input: ModelHubRepairPageModeInput,
  repairSlug: string,
  decision: NonIphonePublicRepairPageModeDecision,
) {
  return input.category === 'phone'
    && classifyPhoneBrand(input.brandSlug) !== 'secondary-phone'
    && PROTECTED_REPAIR_TYPE_HUB_SLUGS.has(repairSlug)
    && decision.mode === 'shared';
}

function freezeOption(repair: RepairOption, href: string | undefined): ModelHubResolvedRepairOption {
  const { repairOrigin: omittedRepairOrigin, ...uiRepair } = repair;
  void omittedRepairOrigin;
  return Object.freeze({ ...uiRepair, ...(href ? { href } : {}) });
}

/**
 * Server-side Model Hub adapter. It converts trusted catalogue provenance into
 * fail-closed policy evidence and never exposes that evidence to Client UI.
 */
export function resolveModelHubRepairPageMode(
  input: ModelHubRepairPageModeInput,
): ModelHubRepairPageModeResolution {
  const grouped = new Map<string, RepairOption[]>();
  for (const repair of input.repairTypes) {
    const entries = grouped.get(repair.slug) ?? [];
    entries.push(repair);
    grouped.set(repair.slug, entries);
  }

  const resolved = [...grouped.entries()]
    .sort(([left], [right]) => compareDeterministicStrings(left, right))
    .map(([repairSlug, entries]) => {
      const sortedEntries = [...entries].sort((left, right) =>
        compareDeterministicStrings(repairComparisonKey(left), repairComparisonKey(right)));
      const selectedRepair = sortedEntries[0]!;
      const origins = new Set(entries.map(repairOrigin));
      const conflict = origins.size > 1;
      const origin = repairOrigin(selectedRepair);
      const decision = evaluateNonIphonePublicRepairPageMode({
        category: input.category,
        brandSlug: input.brandSlug,
        modelSlug: input.modelSlug,
        repairSlug,
        repairOrigin: origin,
        eligibilityEvidence: evidenceFor(input.catalogueSource, origin, conflict),
        legacyStatus: 'none',
      });
      const fallbackHref = legacyDetailHref(input.category, input.brandSlug, input.modelSlug, repairSlug);
      const phase1Destination = getPhase1DniConsolidationDestination(fallbackHref);
      const report = Object.freeze({
        repairSlug,
        mode: decision.mode,
        reason: decision.reason,
        routeAvailable: decision.routeAvailable,
      });

      const href = preservesPrimaryPhoneHubRoute(input, repairSlug, decision)
        ? fallbackHref
        : resolvedHref(decision, fallbackHref, input.category, input.brandSlug, input.modelSlug, repairSlug);

      return { decision, report, option: freezeOption(selectedRepair, phase1Destination ?? href) };
    });

  return Object.freeze({
    options: Object.freeze(resolved.filter(({ decision }) => decision.mode !== 'hidden').map(({ option }) => option)),
    decisions: Object.freeze(resolved.map(({ report }) => report)),
  });
}
