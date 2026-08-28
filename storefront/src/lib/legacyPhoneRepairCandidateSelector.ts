import 'server-only';

import {
  PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION,
  type PublicRepairCataloguePayload,
  type RepairOption,
  type RepairOrigin,
} from './publicRepairCataloguePolicy';
import {
  checksumGrandfatheredPhoneRepairIdentities,
  compareDeterministicStrings,
  phoneRepairIdentityKey,
  type GrandfatheredPhoneRepairIdentity,
} from './legacyPhoneRepairBaseline';
import {
  evaluateCurrentPublicRepairDetailEligibility,
  type CurrentPublicRepairDetailEligibilityReason,
} from './publicRepairDetailEligibility';

export type CandidateExclusionReason = Exclude<CurrentPublicRepairDetailEligibilityReason, 'eligible'>
  | 'virtual'
  | 'diagnostic';

export type ExactRepairIdentity = {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
};

export type CandidateSelectionReport = {
  sourceSnapshot: { checksum: string; schemaVersion: number };
  candidates: readonly GrandfatheredPhoneRepairIdentity[];
  candidateIdentityChecksum: string;
  counts: { brands: number; models: number; repairsExamined: number; candidates: number; excluded: number };
  byBrand: Readonly<Record<string, number>>;
  byRepairSlug: Readonly<Record<string, number>>;
  byOrigin: Readonly<Record<string, number>>;
  exclusionsByReason: Readonly<Record<string, number>>;
  exclusions: readonly { identity: ExactRepairIdentity; reason: CandidateExclusionReason }[];
};

export type LegacyPhoneRepairCandidateSelectionInput = {
  sourceSnapshot: { checksum: string; schemaVersion: number };
  catalogue: Pick<PublicRepairCataloguePayload, 'brands' | 'retiredRepairs'>;
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BASELINE_ORIGINS = new Set<GrandfatheredPhoneRepairIdentity['repairOriginAtCapture']>([
  'pos', 'synthetic-core', 'synthetic-backfill', 'unknown-legacy',
]);
const KNOWN_ORIGINS = new Set<RepairOrigin>([
  'pos', 'synthetic-core', 'synthetic-backfill', 'virtual', 'diagnostic', 'unknown-legacy',
]);

function isCanonicalSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

function identityKey(identity: ExactRepairIdentity) {
  return JSON.stringify([identity.category, identity.brandSlug, identity.modelSlug, identity.repairSlug]);
}

function compareIdentity(left: ExactRepairIdentity, right: ExactRepairIdentity) {
  return compareDeterministicStrings(identityKey(left), identityKey(right));
}

function orderedCounts(counts: Map<string, number>) {
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => compareDeterministicStrings(left, right)));
}

function increment(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

function assertSourceSnapshot(sourceSnapshot: LegacyPhoneRepairCandidateSelectionInput['sourceSnapshot']) {
  if (!SHA256_PATTERN.test(sourceSnapshot.checksum)
    || sourceSnapshot.schemaVersion !== PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION) {
    throw new Error('Legacy phone repair candidate source snapshot is invalid.');
  }
}

function assertIdentity(identity: ExactRepairIdentity, repair: RepairOption) {
  if (!isCanonicalSlug(identity.category) || !isCanonicalSlug(identity.brandSlug)
    || !isCanonicalSlug(identity.modelSlug) || !isCanonicalSlug(identity.repairSlug)
    || !KNOWN_ORIGINS.has(repair.repairOrigin as RepairOrigin)) {
    throw new Error('Legacy phone repair candidate snapshot contains an invalid or mixed identity origin.');
  }
}

function toExactIdentity(category: string, brandSlug: string, modelSlug: string, repairSlug: string): ExactRepairIdentity {
  return { category, brandSlug, modelSlug, repairSlug };
}

function formatCounts(title: string, values: Readonly<Record<string, number>>) {
  const entries = Object.entries(values);
  return `${title}: ${entries.length === 0 ? 'none' : entries.map(([key, count]) => `${key}=${count}`).join(', ')}`;
}

/**
 * Pure selection over an explicitly supplied, fixed catalogue payload. It performs no
 * snapshot reads, fetches, environment access, baseline sealing, or output writes.
 */
export function selectLegacyPhoneRepairCandidates(
  input: LegacyPhoneRepairCandidateSelectionInput,
): Readonly<CandidateSelectionReport> {
  assertSourceSnapshot(input.sourceSnapshot);

  const activeIdentities = new Set<string>();
  const retiredIdentities = new Set<string>();
  const candidates: GrandfatheredPhoneRepairIdentity[] = [];
  const exclusions: Array<{ identity: ExactRepairIdentity; reason: CandidateExclusionReason }> = [];
  const byBrand = new Map<string, number>();
  const byRepairSlug = new Map<string, number>();
  const byOrigin = new Map<string, number>();
  const exclusionsByReason = new Map<string, number>();
  let models = 0;
  let repairsExamined = 0;

  for (const brand of input.catalogue.brands) {
    for (const model of brand.models) {
      models += 1;
      for (const repair of model.repairTypes) {
        const identity = toExactIdentity(brand.category, brand.slug, model.slug, repair.slug);
        assertIdentity(identity, repair);
        const key = identityKey(identity);
        if (activeIdentities.has(key)) throw new Error('duplicate active exact identity');
        activeIdentities.add(key);
      }
    }
  }

  for (const retired of input.catalogue.retiredRepairs ?? []) {
    const identity = toExactIdentity(retired.category, retired.brandSlug, retired.modelSlug, retired.repair.slug);
    assertIdentity(identity, retired.repair);
    const key = identityKey(identity);
    if (retiredIdentities.has(key)) throw new Error('duplicate retired exact identity');
    if (activeIdentities.has(key)) throw new Error('active/retired exact identity conflict');
    retiredIdentities.add(key);
  }

  for (const brand of input.catalogue.brands) {
    for (const model of brand.models) {
      for (const repair of model.repairTypes) {
        repairsExamined += 1;
        const identity = toExactIdentity(brand.category, brand.slug, model.slug, repair.slug);
        let reason: CandidateExclusionReason | 'eligible';
        if (repair.repairOrigin === 'virtual' || repair.sourceType === 'virtual') {
          reason = 'virtual';
        } else if (repair.repairOrigin === 'diagnostic' || repair.sourceType === 'diagnostic') {
          reason = 'diagnostic';
        } else {
          reason = evaluateCurrentPublicRepairDetailEligibility({
            ...identity,
            hasActiveBrand: true,
            hasActiveModel: true,
            hasActiveRepair: true,
          }).reason;
        }

        if (reason !== 'eligible') {
          exclusions.push({ identity, reason });
          increment(exclusionsByReason, reason);
          continue;
        }
        if (!BASELINE_ORIGINS.has(repair.repairOrigin as GrandfatheredPhoneRepairIdentity['repairOriginAtCapture'])) {
          throw new Error('Legacy phone repair candidate repair origin is invalid.');
        }
        const candidate: GrandfatheredPhoneRepairIdentity = {
          ...identity,
          category: 'phone',
          repairOriginAtCapture: repair.repairOrigin as GrandfatheredPhoneRepairIdentity['repairOriginAtCapture'],
        };
        candidates.push(candidate);
        increment(byBrand, candidate.brandSlug);
        increment(byRepairSlug, candidate.repairSlug);
        increment(byOrigin, candidate.repairOriginAtCapture);
      }
    }
  }

  for (const retired of input.catalogue.retiredRepairs ?? []) {
    repairsExamined += 1;
    const identity = toExactIdentity(retired.category, retired.brandSlug, retired.modelSlug, retired.repair.slug);
    exclusions.push({ identity, reason: 'retired' });
    increment(exclusionsByReason, 'retired');
  }

  candidates.sort((left, right) => compareDeterministicStrings(phoneRepairIdentityKey(left), phoneRepairIdentityKey(right)));
  exclusions.sort((left, right) => compareIdentity(left.identity, right.identity) || compareDeterministicStrings(left.reason, right.reason));
  const report: CandidateSelectionReport = {
    sourceSnapshot: { ...input.sourceSnapshot },
    candidates,
    candidateIdentityChecksum: checksumGrandfatheredPhoneRepairIdentities(candidates),
    counts: {
      brands: input.catalogue.brands.length,
      models,
      repairsExamined,
      candidates: candidates.length,
      excluded: exclusions.length,
    },
    byBrand: orderedCounts(byBrand),
    byRepairSlug: orderedCounts(byRepairSlug),
    byOrigin: orderedCounts(byOrigin),
    exclusionsByReason: orderedCounts(exclusionsByReason),
    exclusions,
  };

  return deepFreeze(report);
}

/** Read-only dry-run formatting. The caller owns all input/output I/O. */
export function formatLegacyPhoneRepairCandidateDryRun(
  report: CandidateSelectionReport,
  format: 'summary' | 'json',
) {
  if (format === 'json') return JSON.stringify(report, null, 2);
  return [
    'DRY RUN ONLY',
    'NO BASELINE WRITTEN',
    `Source snapshot checksum: ${report.sourceSnapshot.checksum}`,
    `Source snapshot schema version: ${report.sourceSnapshot.schemaVersion}`,
    `Examined: brands=${report.counts.brands}, models=${report.counts.models}, repairs=${report.counts.repairsExamined}`,
    `Candidates: ${report.counts.candidates}`,
    `Excluded: ${report.counts.excluded}`,
    `Candidate identity checksum: ${report.candidateIdentityChecksum}`,
    formatCounts('By brand', report.byBrand),
    formatCounts('By repair slug', report.byRepairSlug),
    formatCounts('By origin', report.byOrigin),
    formatCounts('Exclusions by reason', report.exclusionsByReason),
  ].join('\n');
}
