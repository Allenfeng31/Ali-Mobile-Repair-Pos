import { createHash } from 'node:crypto';

import { checksumLegacyPhoneRepairRouteTopology } from './legacyPhoneRepairBaseline';
import { compareDeterministicStrings } from './deterministicStrings';
import type { RepairOrigin } from './publicRepairCataloguePolicy';

export type LegacyPhoneRepairRouteIdentity = [
  category: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: string,
];

export type CandidateOriginEvidenceKind =
  | 'raw-pos-exact'
  | 'deterministic-core-rule'
  | 'deterministic-backfill-rule'
  | 'retained-snapshot'
  | 'carried-forward'
  | 'snapshot-origin-only'
  | 'unknown';

export type CandidateOriginEvidenceRelationship = 'direct' | 'derived' | 'carried-forward' | 'unknown';

export type CandidateOriginEvidenceRecord = {
  identity: LegacyPhoneRepairRouteIdentity;
  classifiedOrigin: RepairOrigin;
  evidenceKind: CandidateOriginEvidenceKind;
  relationship: CandidateOriginEvidenceRelationship;
  evidenceDigest?: string;
  conflict: boolean;
};

export type CandidateOriginEvidenceTargetSnapshot = {
  schemaVersion: 2;
  checksum: string;
  validatedAt: string;
  candidateTopologyChecksum: string;
};

export type CandidateOriginEvidenceArtifact = {
  schemaVersion: 1;
  kind: 'legacy-phone-repair-origin-evidence';
  targetSnapshot: CandidateOriginEvidenceTargetSnapshot;
  records: readonly CandidateOriginEvidenceRecord[];
  checksum: string;
};

export type V2CandidateOrigin = {
  identity: LegacyPhoneRepairRouteIdentity;
  repairOrigin: RepairOrigin;
};

export type LegacyPhoneRepairOriginEvidenceVerificationInput = {
  sealedV1Identities: readonly LegacyPhoneRepairRouteIdentity[];
  v2Candidates: readonly V2CandidateOrigin[];
  targetSnapshot: CandidateOriginEvidenceTargetSnapshot;
  evidenceArtifact: unknown;
};

type VerificationStatus = 'eligible' | 'route-history-only' | 'unresolved';
type SealingBlocker = 'topology-mismatch' | 'unresolved-evidence' | 'conflicting-evidence';

type VerificationEntry = {
  identity: LegacyPhoneRepairRouteIdentity;
  status: VerificationStatus;
  classifiedOrigin: RepairOrigin;
  evidenceKind: CandidateOriginEvidenceKind;
  relationship: CandidateOriginEvidenceRelationship;
  hasEvidenceDigest: boolean;
  reason: string;
  conflict: boolean;
};

export type LegacyPhoneRepairOriginEvidenceVerification = {
  schemaVersion: 1;
  topology: {
    matches: boolean;
    missingFromV2: LegacyPhoneRepairRouteIdentity[];
    addedInV2: LegacyPhoneRepairRouteIdentity[];
  };
  counts: {
    totalV1Candidates: number;
    eligible: number;
    routeHistoryOnly: number;
    unresolved: number;
    conflicts: number;
  };
  entries: VerificationEntry[];
  readyToSealIndependentBaseline: boolean;
  sealingBlockers: SealingBlocker[];
};

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CANONICAL_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ORIGINS = new Set<RepairOrigin>(['pos', 'synthetic-core', 'synthetic-backfill', 'virtual', 'diagnostic', 'unknown-legacy']);
const EVIDENCE_KINDS = new Set<CandidateOriginEvidenceKind>(['raw-pos-exact', 'deterministic-core-rule', 'deterministic-backfill-rule', 'retained-snapshot', 'carried-forward', 'snapshot-origin-only', 'unknown']);
const RELATIONSHIPS = new Set<CandidateOriginEvidenceRelationship>(['direct', 'derived', 'carried-forward', 'unknown']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const actual = Object.keys(value).sort(compareDeterministicStrings);
  const allowed = [...expected].sort(compareDeterministicStrings);
  return actual.length === allowed.length && actual.every((key, index) => key === allowed[index]);
}

function cloneIdentity(identity: LegacyPhoneRepairRouteIdentity): LegacyPhoneRepairRouteIdentity {
  return [...identity] as LegacyPhoneRepairRouteIdentity;
}

function assertIdentity(identity: unknown): asserts identity is LegacyPhoneRepairRouteIdentity {
  if (!Array.isArray(identity) || identity.length !== 4 || identity[0] !== 'phone'
    || !identity.every((segment) => typeof segment === 'string' && SLUG_PATTERN.test(segment))) {
    throw new Error('Legacy phone repair origin evidence identity is invalid.');
  }
}

function identityKey(identity: LegacyPhoneRepairRouteIdentity) {
  return JSON.stringify(identity);
}

function sortIdentities(identities: readonly LegacyPhoneRepairRouteIdentity[]) {
  return identities.map((identity) => {
    assertIdentity(identity);
    return cloneIdentity(identity);
  }).sort((left, right) => compareDeterministicStrings(identityKey(left), identityKey(right)));
}

function assertUniqueIdentities(identities: readonly LegacyPhoneRepairRouteIdentity[], label: string) {
  const keys = new Set<string>();
  for (const identity of identities) {
    const key = identityKey(identity);
    if (keys.has(key)) throw new Error(`Legacy phone repair origin evidence has duplicate ${label} identity.`);
    keys.add(key);
  }
}

function isCanonicalUtc(value: unknown): value is string {
  return typeof value === 'string' && CANONICAL_UTC_PATTERN.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function assertTargetSnapshot(value: unknown): asserts value is CandidateOriginEvidenceTargetSnapshot {
  if (!isRecord(value) || !hasOnlyKeys(value, ['schemaVersion', 'checksum', 'validatedAt', 'candidateTopologyChecksum'])
    || value.schemaVersion !== 2 || typeof value.checksum !== 'string' || !SHA256_PATTERN.test(value.checksum)
    || !isCanonicalUtc(value.validatedAt) || typeof value.candidateTopologyChecksum !== 'string'
    || !SHA256_PATTERN.test(value.candidateTopologyChecksum)) {
    throw new Error('Legacy phone repair origin evidence target snapshot is invalid.');
  }
}

function cloneTargetSnapshot(targetSnapshot: CandidateOriginEvidenceTargetSnapshot): CandidateOriginEvidenceTargetSnapshot {
  return { ...targetSnapshot };
}

function assertEvidenceRecord(value: unknown): asserts value is CandidateOriginEvidenceRecord {
  if (!isRecord(value) || !hasOnlyKeys(value, ['identity', 'classifiedOrigin', 'evidenceKind', 'relationship', 'evidenceDigest', 'conflict'])
    && !hasOnlyKeys(value, ['identity', 'classifiedOrigin', 'evidenceKind', 'relationship', 'conflict'])) {
    throw new Error('Legacy phone repair origin evidence record has an invalid schema.');
  }
  assertIdentity(value.identity);
  if (typeof value.classifiedOrigin !== 'string' || !ORIGINS.has(value.classifiedOrigin as RepairOrigin)
    || typeof value.evidenceKind !== 'string' || !EVIDENCE_KINDS.has(value.evidenceKind as CandidateOriginEvidenceKind)
    || typeof value.relationship !== 'string' || !RELATIONSHIPS.has(value.relationship as CandidateOriginEvidenceRelationship)
    || typeof value.conflict !== 'boolean'
    || (Object.hasOwn(value, 'evidenceDigest') && (typeof value.evidenceDigest !== 'string' || !SHA256_PATTERN.test(value.evidenceDigest)))) {
    throw new Error('Legacy phone repair origin evidence record is invalid.');
  }
}

function cloneRecord(record: CandidateOriginEvidenceRecord): CandidateOriginEvidenceRecord {
  return {
    identity: cloneIdentity(record.identity),
    classifiedOrigin: record.classifiedOrigin,
    evidenceKind: record.evidenceKind,
    relationship: record.relationship,
    ...(record.evidenceDigest ? { evidenceDigest: record.evidenceDigest } : {}),
    conflict: record.conflict,
  };
}

function sortRecords(records: readonly CandidateOriginEvidenceRecord[]) {
  return records.map((record) => cloneRecord(record)).sort((left, right) => (
    compareDeterministicStrings(identityKey(left.identity), identityKey(right.identity))
  ));
}

function canonicalArtifactRepresentation(value: Omit<CandidateOriginEvidenceArtifact, 'checksum'>) {
  return {
    schemaVersion: value.schemaVersion,
    kind: value.kind,
    targetSnapshot: cloneTargetSnapshot(value.targetSnapshot),
    records: sortRecords(value.records),
  };
}

/**
 * Deterministic integrity and cutoff binding only; this SHA-256 checksum is not a
 * signature and does not authenticate an arbitrary caller. Authority must come from a
 * future controlled, local read-only evidence producer.
 */
export function checksumLegacyPhoneRepairOriginEvidenceArtifact(
  value: Omit<CandidateOriginEvidenceArtifact, 'checksum'>,
) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalArtifactRepresentation(value)))
    .digest('hex');
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

function validateArtifact(value: unknown): Readonly<CandidateOriginEvidenceArtifact> {
  if (!isRecord(value) || !hasOnlyKeys(value, ['schemaVersion', 'kind', 'targetSnapshot', 'records', 'checksum'])
    || value.schemaVersion !== 1 || value.kind !== 'legacy-phone-repair-origin-evidence'
    || !Array.isArray(value.records) || typeof value.checksum !== 'string' || !SHA256_PATTERN.test(value.checksum)) {
    throw new Error('Legacy phone repair origin evidence artifact is invalid.');
  }
  assertTargetSnapshot(value.targetSnapshot);
  value.records.forEach(assertEvidenceRecord);
  const records = sortRecords(value.records as CandidateOriginEvidenceRecord[]);
  assertUniqueIdentities(records.map((record) => record.identity), 'artifact evidence');
  const candidate = {
    schemaVersion: 1 as const,
    kind: 'legacy-phone-repair-origin-evidence' as const,
    targetSnapshot: cloneTargetSnapshot(value.targetSnapshot),
    records,
  };
  if (checksumLegacyPhoneRepairOriginEvidenceArtifact(candidate) !== value.checksum) {
    throw new Error('Legacy phone repair origin evidence artifact checksum is invalid.');
  }
  return deepFreeze({ ...candidate, checksum: value.checksum });
}

function topologyChecksum(identities: readonly LegacyPhoneRepairRouteIdentity[]) {
  return checksumLegacyPhoneRepairRouteTopology(identities.map(([category, brandSlug, modelSlug, repairSlug]) => ({
    category: category as 'phone', brandSlug, modelSlug, repairSlug,
  })));
}

function targetKey(targetSnapshot: CandidateOriginEvidenceTargetSnapshot) {
  return JSON.stringify(cloneTargetSnapshot(targetSnapshot));
}

function classify(
  identity: LegacyPhoneRepairRouteIdentity,
  candidate: V2CandidateOrigin | undefined,
  record: CandidateOriginEvidenceRecord | undefined,
): VerificationEntry {
  const classifiedOrigin = candidate?.repairOrigin ?? record?.classifiedOrigin ?? 'unknown-legacy';
  const evidenceKind = record?.evidenceKind ?? 'unknown';
  const relationship = record?.relationship ?? 'unknown';
  const hasEvidenceDigest = Boolean(record?.evidenceDigest);
  const conflict = record?.conflict === true || (Boolean(candidate && record) && candidate!.repairOrigin !== record!.classifiedOrigin);
  const common = { identity: cloneIdentity(identity), classifiedOrigin, evidenceKind, relationship, hasEvidenceDigest, conflict };

  if (!candidate) return { ...common, status: 'unresolved', reason: 'missing-from-v2-topology' };
  if (conflict) return { ...common, status: 'unresolved', reason: 'conflicting-evidence' };
  if (!record) return { ...common, status: 'unresolved', reason: 'missing-evidence' };
  if (candidate.repairOrigin === 'pos' && record.evidenceKind === 'raw-pos-exact'
    && record.relationship === 'direct' && hasEvidenceDigest) {
    return { ...common, status: 'eligible', reason: 'direct-pos-exact-evidence' };
  }
  if (candidate.repairOrigin === 'synthetic-core' || candidate.repairOrigin === 'synthetic-backfill'
    || candidate.repairOrigin === 'virtual' || candidate.repairOrigin === 'diagnostic') {
    return { ...common, status: 'route-history-only', reason: 'non-independent-origin' };
  }
  return { ...common, status: 'unresolved', reason: 'insufficient-exact-evidence' };
}

/** Pure advisory verifier; it reads no snapshot/raw POS, writes no artifact/manifest, and changes no route eligibility. */
export function verifyLegacyPhoneRepairCandidateOriginEvidence(
  input: LegacyPhoneRepairOriginEvidenceVerificationInput,
): Readonly<LegacyPhoneRepairOriginEvidenceVerification> {
  const sealedV1 = sortIdentities(input.sealedV1Identities);
  const v2Candidates = input.v2Candidates.map((candidate) => {
    assertIdentity(candidate.identity);
    if (!ORIGINS.has(candidate.repairOrigin)) throw new Error('Legacy phone repair origin evidence v2 candidate is invalid.');
    return { identity: cloneIdentity(candidate.identity), repairOrigin: candidate.repairOrigin };
  }).sort((left, right) => compareDeterministicStrings(identityKey(left.identity), identityKey(right.identity)));
  assertUniqueIdentities(sealedV1, 'sealed v1');
  assertUniqueIdentities(v2Candidates.map((candidate) => candidate.identity), 'v2 candidate');
  assertTargetSnapshot(input.targetSnapshot);
  const actualTopologyChecksum = topologyChecksum(v2Candidates.map((candidate) => candidate.identity));
  if (actualTopologyChecksum !== input.targetSnapshot.candidateTopologyChecksum) {
    throw new Error('Legacy phone repair origin evidence target topology checksum is invalid.');
  }
  const artifact = validateArtifact(input.evidenceArtifact);
  if (targetKey(artifact.targetSnapshot) !== targetKey(input.targetSnapshot)) {
    throw new Error('Legacy phone repair origin evidence artifact target does not match the supplied v2 snapshot.');
  }

  const v1Keys = new Set(sealedV1.map(identityKey));
  const v2ByKey = new Map(v2Candidates.map((candidate) => [identityKey(candidate.identity), candidate]));
  const recordsByKey = new Map(artifact.records.map((record) => [identityKey(record.identity), record]));
  for (const key of recordsByKey.keys()) {
    if (!v1Keys.has(key) || !v2ByKey.has(key)) throw new Error('Legacy phone repair origin evidence artifact contains orphan evidence.');
  }

  const missingFromV2 = sealedV1.filter((identity) => !v2ByKey.has(identityKey(identity)));
  const addedInV2 = v2Candidates.filter((candidate) => !v1Keys.has(identityKey(candidate.identity))).map((candidate) => cloneIdentity(candidate.identity));
  const entries = sealedV1.map((identity) => classify(identity, v2ByKey.get(identityKey(identity)), recordsByKey.get(identityKey(identity))));
  const conflicts = entries.filter((entry) => entry.conflict).length;
  const unresolved = entries.filter((entry) => entry.status === 'unresolved').length;
  const topologyMatches = missingFromV2.length === 0 && addedInV2.length === 0;
  const sealingBlockers = [
    ...(!topologyMatches ? ['topology-mismatch' as const] : []),
    ...(unresolved > 0 ? ['unresolved-evidence' as const] : []),
    ...(conflicts > 0 ? ['conflicting-evidence' as const] : []),
  ].sort(compareDeterministicStrings);

  return deepFreeze({
    schemaVersion: 1,
    topology: { matches: topologyMatches, missingFromV2, addedInV2 },
    counts: {
      totalV1Candidates: sealedV1.length,
      eligible: entries.filter((entry) => entry.status === 'eligible').length,
      routeHistoryOnly: entries.filter((entry) => entry.status === 'route-history-only').length,
      unresolved,
      conflicts,
    },
    entries,
    readyToSealIndependentBaseline: sealingBlockers.length === 0,
    sealingBlockers,
  });
}
