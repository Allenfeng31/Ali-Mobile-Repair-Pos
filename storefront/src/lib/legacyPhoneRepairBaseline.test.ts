import { describe, expect, it } from 'vitest';

import {
  PHONE_PAGE_MODE_POLICY_VERSION,
  checksumGrandfatheredPhoneRepairIdentities,
  checksumLegacyPhoneRepairRouteTopology,
  createSealedPhoneRepairBaselineManifest,
  isGrandfatheredPhoneRepair,
  phoneRepairIdentityKey,
  validateSealedPhoneRepairBaselineManifest,
  type GrandfatheredPhoneRepairIdentity,
  type LegacyPhoneRepairBaselineManifest,
} from './legacyPhoneRepairBaseline';

const SOURCE_CHECKSUM = 'a'.repeat(64);

function createManifest() {
  return createSealedPhoneRepairBaselineManifest({
    policyVersion: PHONE_PAGE_MODE_POLICY_VERSION,
    reason: 'pre-pos-only-policy',
    capturedAt: '2026-08-28T00:00:00.000Z',
    sealedAt: '2026-08-28T00:01:00.000Z',
    sourceSnapshot: {
      checksum: SOURCE_CHECKSUM,
      schemaVersion: 1,
      validatedAt: '2026-08-28T00:00:30.000Z',
      publicModelCount: 2,
      publicRepairCount: 2,
    },
    identities: [
      {
        category: 'phone',
        brandSlug: 'samsung',
        modelSlug: 'galaxy-s24',
        repairSlug: 'back-glass-replacement',
        repairOriginAtCapture: 'synthetic-backfill',
      },
      {
        category: 'phone',
        brandSlug: 'oppo',
        modelSlug: 'find-x8-pro',
        repairSlug: 'screen-replacement',
        repairOriginAtCapture: 'pos',
      },
    ],
  });
}

function mutable(manifest: LegacyPhoneRepairBaselineManifest) {
  return structuredClone(manifest) as LegacyPhoneRepairBaselineManifest;
}

describe('legacyPhoneRepairBaseline', () => {
  it('hashes only sorted exact route tuples for topology comparison', () => {
    const identities = [
      { category: 'phone', brandSlug: 'oppo', modelSlug: 'a-10', repairSlug: 'screen-replacement', repairOriginAtCapture: 'unknown-legacy' },
      { category: 'phone', brandSlug: 'oppo', modelSlug: 'a-2', repairSlug: 'battery-replacement', repairOriginAtCapture: 'unknown-legacy' },
    ] as const;
    const originsChanged = identities.map((identity, index) => ({
      ...identity,
      repairOriginAtCapture: index === 0 ? 'pos' as const : 'synthetic-core' as const,
    }));

    expect(checksumLegacyPhoneRepairRouteTopology([...identities].reverse()))
      .toBe(checksumLegacyPhoneRepairRouteTopology(identities));
    expect(checksumLegacyPhoneRepairRouteTopology(originsChanged))
      .toBe(checksumLegacyPhoneRepairRouteTopology(identities));
    expect(checksumGrandfatheredPhoneRepairIdentities(originsChanged))
      .not.toBe(checksumGrandfatheredPhoneRepairIdentities(identities));
    expect(checksumLegacyPhoneRepairRouteTopology(identities)).toMatch(/^[a-f0-9]{64}$/);
    expect(identities[0].repairOriginAtCapture).toBe('unknown-legacy');
  });
  it('uses deterministic code-unit ordering when localeCompare is unavailable', () => {
    const identities = ['a-b', 'ab', 'a-2', 'a-10'].map((modelSlug) => ({
      category: 'phone' as const,
      brandSlug: 'oppo',
      modelSlug,
      repairSlug: 'screen-replacement',
      repairOriginAtCapture: 'pos' as const,
    }));
    const first = createSealedPhoneRepairBaselineManifest({
      policyVersion: PHONE_PAGE_MODE_POLICY_VERSION, reason: 'pre-pos-only-policy',
      capturedAt: '2026-08-28T00:00:00.000Z', sealedAt: '2026-08-28T00:01:00.000Z',
      sourceSnapshot: { checksum: SOURCE_CHECKSUM, schemaVersion: 1, validatedAt: '2026-08-28T00:00:30.000Z', publicModelCount: 4, publicRepairCount: 4 },
      identities,
    });
    const reversed = createSealedPhoneRepairBaselineManifest({
      policyVersion: PHONE_PAGE_MODE_POLICY_VERSION, reason: 'pre-pos-only-policy',
      capturedAt: '2026-08-28T00:00:00.000Z', sealedAt: '2026-08-28T00:01:00.000Z',
      sourceSnapshot: { checksum: SOURCE_CHECKSUM, schemaVersion: 1, validatedAt: '2026-08-28T00:00:30.000Z', publicModelCount: 4, publicRepairCount: 4 },
      identities: [...identities].reverse(),
    });
    const originalLocaleCompare = String.prototype.localeCompare;

    try {
      String.prototype.localeCompare = () => { throw new Error('localeCompare must not be used'); };
      expect(checksumGrandfatheredPhoneRepairIdentities(identities)).toBe(first.identityChecksum);
      expect(validateSealedPhoneRepairBaselineManifest(first).identityChecksum).toBe(first.identityChecksum);
      expect(first.identities).toEqual(reversed.identities);
      expect(first.identityChecksum).toBe(reversed.identityChecksum);
    } finally {
      String.prototype.localeCompare = originalLocaleCompare;
    }
  });

  it('matches only the complete canonical identity and excludes origin from the key', () => {
    const manifest = createManifest();
    const identity = {
      category: 'phone' as const,
      brandSlug: 'oppo',
      modelSlug: 'find-x8-pro',
      repairSlug: 'screen-replacement',
    };

    expect(isGrandfatheredPhoneRepair(manifest, identity)).toBe(true);
    expect(isGrandfatheredPhoneRepair(manifest, { ...identity, category: 'tablet' })).toBe(false);
    expect(isGrandfatheredPhoneRepair(manifest, { ...identity, brandSlug: 'samsung' })).toBe(false);
    expect(isGrandfatheredPhoneRepair(manifest, { ...identity, modelSlug: 'find-x8' })).toBe(false);
    expect(isGrandfatheredPhoneRepair(manifest, { ...identity, repairSlug: 'battery-replacement' })).toBe(false);
    expect(phoneRepairIdentityKey({ ...identity, repairOriginAtCapture: 'pos' }))
      .toBe(phoneRepairIdentityKey({ ...identity, repairOriginAtCapture: 'unknown-legacy' }));
    expect(phoneRepairIdentityKey({ ...identity, brandSlug: 'oppo-x', modelSlug: 'y' }))
      .not.toBe(phoneRepairIdentityKey({ ...identity, brandSlug: 'oppo', modelSlug: 'x-y' }));
    expect(isGrandfatheredPhoneRepair(manifest, { ...identity, modelSlug: 'Find X8 Pro' })).toBe(false);
  });

  it('validates a sealed manifest, preserves sorted identities, and deep-freezes the result', () => {
    const manifest = createManifest();
    const validated = validateSealedPhoneRepairBaselineManifest(manifest);

    expect(validated.identities.map(phoneRepairIdentityKey)).toEqual([
      phoneRepairIdentityKey(validated.identities[0]),
      phoneRepairIdentityKey(validated.identities[1]),
    ].sort());
    expect(Object.isFrozen(validated)).toBe(true);
    expect(Object.isFrozen(validated.sourceSnapshot)).toBe(true);
    expect(Object.isFrozen(validated.identities)).toBe(true);
    expect(Object.isFrozen(validated.identities[0])).toBe(true);
    expect(() => (validated.identities as unknown as Array<unknown>).push({})).toThrow();
    expect(() => { validated.sourceSnapshot.checksum = 'b'.repeat(64); }).toThrow();
    expect(() => { validated.identities[0].repairSlug = 'battery-replacement'; }).toThrow();
    expect(isGrandfatheredPhoneRepair(validated, {
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement',
    })).toBe(true);
  });

  it.each([
    ['duplicate identity', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.identities = [manifest.identities[0], manifest.identities[0]]; }],
    ['wrong identity count', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.identityCount = 9; }],
    ['wrong checksum', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.identityChecksum = 'b'.repeat(64); }],
    ['tampered identity with sealed checksum', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.identities[0].repairOriginAtCapture = 'unknown-legacy'; }],
    ['wrong policy version', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.policyVersion = 'phone-page-mode-v2' as never; }],
    ['wrong reason', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.reason = 'other' as never; }],
    ['invalid timestamps', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.capturedAt = 'not-a-date'; }],
    ['sealed before captured', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.sealedAt = '2026-08-27T00:00:00.000Z'; }],
    ['invalid source checksum', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.sourceSnapshot.checksum = 'not-a-checksum'; }],
    ['zero schema version', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.sourceSnapshot.schemaVersion = 0; }],
    ['negative count', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.sourceSnapshot.publicRepairCount = -1; }],
    ['fractional count', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.sourceSnapshot.publicModelCount = 1.5; }],
    ['empty identities', (manifest: LegacyPhoneRepairBaselineManifest) => { manifest.identities = []; manifest.identityCount = 0; }],
    ['unknown manifest field', (manifest: LegacyPhoneRepairBaselineManifest) => { (manifest as Record<string, unknown>).unexpected = true; }],
    ['unknown identity field', (manifest: LegacyPhoneRepairBaselineManifest) => { (manifest.identities[0] as Record<string, unknown>).unexpected = true; }],
    ['retired identity field', (manifest: LegacyPhoneRepairBaselineManifest) => { (manifest.identities[0] as Record<string, unknown>).lifecycle = 'retired'; }],
  ])('rejects %s', (_label, mutate) => {
    const manifest = mutable(createManifest());
    mutate(manifest);
    expect(() => validateSealedPhoneRepairBaselineManifest(manifest)).toThrow();
  });

  it.each([
    ['non-phone', { category: 'tablet', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', repairOriginAtCapture: 'pos' }],
    ['iPhone', { category: 'phone', brandSlug: 'iphone', modelSlug: 'iphone-13', repairSlug: 'screen-replacement', repairOriginAtCapture: 'pos' }],
    ['Apple phone', { category: 'phone', brandSlug: 'apple', modelSlug: 'iphone-13', repairSlug: 'screen-replacement', repairOriginAtCapture: 'pos' }],
    ['non-canonical slug', { category: 'phone', brandSlug: 'oppo', modelSlug: 'Find X8 Pro', repairSlug: 'screen-replacement', repairOriginAtCapture: 'pos' }],
    ['water damage', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'water-damage-repair', repairOriginAtCapture: 'pos' }],
    ['flex cable', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'flex-cable-replacement', repairOriginAtCapture: 'pos' }],
    ['virtual repair', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', repairOriginAtCapture: 'virtual' }],
    ['diagnostic repair', { category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'screen-replacement', repairOriginAtCapture: 'diagnostic' }],
  ])('rejects %s eligibility', (_label, identity) => {
    expect(() => createSealedPhoneRepairBaselineManifest({
      ...mutable(createManifest()),
      identities: [identity as never],
    })).toThrow();
  });

  it('requires a pre-sorted, unmodified sealed manifest and does not auto-expand it', () => {
    const manifest = mutable(createManifest());
    (manifest.identities as GrandfatheredPhoneRepairIdentity[]).reverse();
    expect(() => validateSealedPhoneRepairBaselineManifest(manifest)).toThrow();

    const sealed = createManifest();
    expect(isGrandfatheredPhoneRepair(sealed, {
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x9-pro', repairSlug: 'screen-replacement',
    })).toBe(false);
    expect(isGrandfatheredPhoneRepair(sealed, {
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: 'battery-replacement',
    })).toBe(false);
    expect(isGrandfatheredPhoneRepair(sealed, {
      category: 'phone', brandSlug: 'oppo', repairSlug: 'screen-replacement',
    })).toBe(false);
    expect(isGrandfatheredPhoneRepair(sealed, {
      category: 'phone', brandSlug: 'oppo', modelSlug: 'find-x8-pro', repairSlug: '/screen-replacement/',
    })).toBe(false);
  });
});
