import 'server-only';

import { createHash } from 'node:crypto';

import { isWaterDamageRepairSlug } from './waterDamageRouting';
import type { RepairOrigin } from './publicRepairCataloguePolicy';

export const PHONE_PAGE_MODE_POLICY_VERSION = 'phone-page-mode-v1' as const;

type GrandfatherableRepairOrigin = Extract<
  RepairOrigin,
  'pos' | 'synthetic-core' | 'synthetic-backfill' | 'unknown-legacy'
>;

export type GrandfatheredPhoneRepairIdentity = {
  category: 'phone';
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
  /** Audit-only capture fact; it is deliberately excluded from the exact identity key. */
  repairOriginAtCapture: GrandfatherableRepairOrigin;
};

export type PhoneRepairIdentityLookup = Pick<
  GrandfatheredPhoneRepairIdentity,
  'category' | 'brandSlug' | 'modelSlug' | 'repairSlug'
>;

export type LegacyPhoneRepairBaselineManifest = {
  policyVersion: typeof PHONE_PAGE_MODE_POLICY_VERSION;
  reason: 'pre-pos-only-policy';
  capturedAt: string;
  sealedAt: string;
  sourceSnapshot: {
    checksum: string;
    schemaVersion: number;
    validatedAt: string;
    publicModelCount: number;
    publicRepairCount: number;
  };
  identityCount: number;
  identityChecksum: string;
  identities: readonly GrandfatheredPhoneRepairIdentity[];
};

export type SealedPhoneRepairBaselineInput = Omit<
  LegacyPhoneRepairBaselineManifest,
  'identityCount' | 'identityChecksum'
> & {
  identities: readonly GrandfatheredPhoneRepairIdentity[];
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const IDENTITY_KEYS = ['category', 'brandSlug', 'modelSlug', 'repairSlug', 'repairOriginAtCapture'];
const MANIFEST_KEYS = ['policyVersion', 'reason', 'capturedAt', 'sealedAt', 'sourceSnapshot', 'identityCount', 'identityChecksum', 'identities'];
const SOURCE_SNAPSHOT_KEYS = ['checksum', 'schemaVersion', 'validatedAt', 'publicModelCount', 'publicRepairCount'];
const FLEX_CABLE_SEGMENT_PATTERN = /(?:^|-)flex-cable(?:-|$)/;
const IPHONE_OR_APPLE_PHONE_BRANDS = new Set(['iphone', 'apple']);
const ALLOWED_ORIGINS = new Set<GrandfatherableRepairOrigin>([
  'pos',
  'synthetic-core',
  'synthetic-backfill',
  'unknown-legacy',
]);

/** Locale- and ICU-independent ordering for sealed identity and report contracts. */
export function compareDeterministicStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expectedKeys: readonly string[]) {
  const keys = Object.keys(value).sort();
  return keys.length === expectedKeys.length && keys.every((key, index) => key === [...expectedKeys].sort()[index]);
}

function isCanonicalSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && ISO_TIMESTAMP_PATTERN.test(value)
    && Number.isFinite(Date.parse(value));
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function assertCanonicalLookupIdentity(identity: unknown): asserts identity is PhoneRepairIdentityLookup {
  if (!isRecord(identity)
    || identity.category !== 'phone'
    || !isCanonicalSlug(identity.brandSlug)
    || !isCanonicalSlug(identity.modelSlug)
    || !isCanonicalSlug(identity.repairSlug)) {
    throw new Error('Phone repair identity must contain four canonical segments.');
  }
}

function assertGrandfatherableIdentity(identity: unknown): asserts identity is GrandfatheredPhoneRepairIdentity {
  if (!isRecord(identity) || !hasOnlyKeys(identity, IDENTITY_KEYS)) {
    throw new Error('Grandfathered phone repair identity has an invalid schema.');
  }

  assertCanonicalLookupIdentity(identity);

  if (IPHONE_OR_APPLE_PHONE_BRANDS.has(identity.brandSlug)) {
    throw new Error('iPhone and Apple phone identities are not eligible for this baseline.');
  }
  if (isWaterDamageRepairSlug(identity.repairSlug)) {
    throw new Error('Water Damage identities are not eligible for this baseline.');
  }
  if (FLEX_CABLE_SEGMENT_PATTERN.test(identity.repairSlug)) {
    throw new Error('Flex cable identities are not eligible for this baseline.');
  }
  const repairOriginAtCapture = (identity as Record<string, unknown>).repairOriginAtCapture;
  if (!ALLOWED_ORIGINS.has(repairOriginAtCapture as GrandfatherableRepairOrigin)) {
    throw new Error('Virtual and diagnostic identities are not eligible for this baseline.');
  }
}

function identityTuple(identity: PhoneRepairIdentityLookup) {
  return [identity.category, identity.brandSlug, identity.modelSlug, identity.repairSlug] as const;
}

/** JSON tuple serialization avoids delimiter-collision and excludes audit origin by contract. */
export function phoneRepairIdentityKey(identity: PhoneRepairIdentityLookup | GrandfatheredPhoneRepairIdentity) {
  assertCanonicalLookupIdentity(identity);
  return JSON.stringify(identityTuple(identity));
}

function checksumForIdentities(identities: readonly GrandfatheredPhoneRepairIdentity[]) {
  const representation = identities.map((identity) => [
    ...identityTuple(identity),
    identity.repairOriginAtCapture,
  ]);
  return createHash('sha256').update(JSON.stringify(representation)).digest('hex');
}

/** Deterministic audit checksum for explicitly supplied candidate identities. */
export function checksumGrandfatheredPhoneRepairIdentities(
  identities: readonly GrandfatheredPhoneRepairIdentity[],
) {
  const sorted = identities.map((identity) => ({ ...identity }));
  sorted.forEach(assertGrandfatherableIdentity);
  sorted.sort((left, right) => compareDeterministicStrings(phoneRepairIdentityKey(left), phoneRepairIdentityKey(right)));
  return checksumForIdentities(sorted);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

function cloneManifest(manifest: LegacyPhoneRepairBaselineManifest): LegacyPhoneRepairBaselineManifest {
  return {
    ...manifest,
    sourceSnapshot: { ...manifest.sourceSnapshot },
    identities: manifest.identities.map((identity) => ({ ...identity })),
  };
}

/**
 * Pure sealing helper for an explicitly supplied fixture/candidate set. It never reads,
 * captures, appends, updates, or merges catalogue data.
 */
export function createSealedPhoneRepairBaselineManifest(
  input: SealedPhoneRepairBaselineInput,
): Readonly<LegacyPhoneRepairBaselineManifest> {
  const identities = input.identities.map((identity) => ({ ...identity }));
  identities.forEach(assertGrandfatherableIdentity);
  identities.sort((left, right) => compareDeterministicStrings(phoneRepairIdentityKey(left), phoneRepairIdentityKey(right)));

  return validateSealedPhoneRepairBaselineManifest({
    ...input,
    sourceSnapshot: { ...input.sourceSnapshot },
    identities,
    identityCount: identities.length,
    identityChecksum: checksumForIdentities(identities),
  });
}

export function validateSealedPhoneRepairBaselineManifest(
  candidate: unknown,
): Readonly<LegacyPhoneRepairBaselineManifest> {
  if (!isRecord(candidate) || !hasOnlyKeys(candidate, MANIFEST_KEYS)) {
    throw new Error('Phone repair baseline manifest has an invalid schema.');
  }
  if (candidate.policyVersion !== PHONE_PAGE_MODE_POLICY_VERSION || candidate.reason !== 'pre-pos-only-policy') {
    throw new Error('Phone repair baseline manifest policy is invalid.');
  }
  if (!isValidTimestamp(candidate.capturedAt) || !isValidTimestamp(candidate.sealedAt)
    || Date.parse(candidate.sealedAt) < Date.parse(candidate.capturedAt)) {
    throw new Error('Phone repair baseline manifest timestamps are invalid.');
  }
  if (!isRecord(candidate.sourceSnapshot) || !hasOnlyKeys(candidate.sourceSnapshot, SOURCE_SNAPSHOT_KEYS)
    || typeof candidate.sourceSnapshot.checksum !== 'string' || !SHA256_PATTERN.test(candidate.sourceSnapshot.checksum)
    || !isPositiveInteger(candidate.sourceSnapshot.schemaVersion)
    || !isValidTimestamp(candidate.sourceSnapshot.validatedAt)
    || !isNonNegativeInteger(candidate.sourceSnapshot.publicModelCount)
    || !isNonNegativeInteger(candidate.sourceSnapshot.publicRepairCount)) {
    throw new Error('Phone repair baseline source snapshot is invalid.');
  }
  if (!isNonNegativeInteger(candidate.identityCount) || !Array.isArray(candidate.identities)
    || candidate.identities.length === 0 || candidate.identityCount !== candidate.identities.length
    || typeof candidate.identityChecksum !== 'string' || !SHA256_PATTERN.test(candidate.identityChecksum)) {
    throw new Error('Phone repair baseline manifest counts are invalid.');
  }

  candidate.identities.forEach(assertGrandfatherableIdentity);
  const keys = candidate.identities.map(phoneRepairIdentityKey);
  if (keys.some((key, index) => index > 0 && key <= keys[index - 1])) {
    throw new Error('Phone repair baseline identities must be unique and canonically sorted.');
  }
  if (checksumForIdentities(candidate.identities) !== candidate.identityChecksum) {
    throw new Error('Phone repair baseline identity checksum is invalid.');
  }

  return deepFreeze(cloneManifest(candidate as LegacyPhoneRepairBaselineManifest));
}

export function isGrandfatheredPhoneRepair(
  manifest: LegacyPhoneRepairBaselineManifest,
  identity: unknown,
) {
  try {
    assertCanonicalLookupIdentity(identity);
  } catch {
    return false;
  }

  const key = phoneRepairIdentityKey(identity);
  return manifest.identities.some((entry) => phoneRepairIdentityKey(entry) === key);
}
