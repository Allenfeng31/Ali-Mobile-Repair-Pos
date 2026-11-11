import { describe, expect, it } from 'vitest';

import {
  checksumLegacyPhoneRepairOriginEvidenceArtifact,
  verifyLegacyPhoneRepairCandidateOriginEvidence,
  type CandidateOriginEvidenceArtifact,
  type CandidateOriginEvidenceRecord,
  type LegacyPhoneRepairRouteIdentity,
  type V2CandidateOrigin,
} from './legacyPhoneRepairOriginEvidence';
import { checksumLegacyPhoneRepairRouteTopology } from './legacyPhoneRepairBaseline';

const screen: LegacyPhoneRepairRouteIdentity = ['phone', 'oppo', 'reno-9-pro', 'screen-replacement'];
const battery: LegacyPhoneRepairRouteIdentity = ['phone', 'oppo', 'reno-9-pro', 'battery-replacement'];
const RAW_MARKER = 'RAW-INVENTORY-ID-MUST-NOT-LEAK';

function targetSnapshot(candidates: readonly V2CandidateOrigin[], overrides = {}) {
  return {
    schemaVersion: 2 as const,
    checksum: 'a'.repeat(64),
    validatedAt: '2026-08-29T01:00:00.000Z',
    candidateTopologyChecksum: checksumLegacyPhoneRepairRouteTopology(candidates.map(({ identity }) => ({
      category: identity[0] as 'phone', brandSlug: identity[1], modelSlug: identity[2], repairSlug: identity[3],
    }))),
    ...overrides,
  };
}

function candidate(identity: LegacyPhoneRepairRouteIdentity, repairOrigin: V2CandidateOrigin['repairOrigin'] = 'pos'): V2CandidateOrigin {
  return { identity, repairOrigin };
}

function record(
  identity: LegacyPhoneRepairRouteIdentity,
  overrides: Partial<CandidateOriginEvidenceRecord> = {},
): CandidateOriginEvidenceRecord {
  const result: CandidateOriginEvidenceRecord = {
    identity,
    classifiedOrigin: 'pos',
    evidenceKind: 'raw-pos-exact',
    relationship: 'direct',
    evidenceDigest: 'b'.repeat(64),
    conflict: false,
    ...overrides,
  };
  if (result.evidenceDigest === undefined) delete result.evidenceDigest;
  return result;
}

function artifact(
  target: ReturnType<typeof targetSnapshot>,
  records: readonly CandidateOriginEvidenceRecord[],
  overrides: Partial<CandidateOriginEvidenceArtifact> = {},
): CandidateOriginEvidenceArtifact {
  const unsigned = {
    schemaVersion: 1 as const,
    kind: 'legacy-phone-repair-origin-evidence' as const,
    targetSnapshot: target,
    records,
    ...overrides,
  };
  return { ...unsigned, checksum: checksumLegacyPhoneRepairOriginEvidenceArtifact(unsigned) };
}

function verify(overrides: Partial<Parameters<typeof verifyLegacyPhoneRepairCandidateOriginEvidence>[0]> = {}) {
  const candidates = [candidate(screen), candidate(battery)];
  const target = targetSnapshot(candidates);
  return verifyLegacyPhoneRepairCandidateOriginEvidence({
    sealedV1Identities: [screen, battery],
    v2Candidates: candidates,
    targetSnapshot: target,
    evidenceArtifact: artifact(target, [record(screen), record(battery)]),
    ...overrides,
  });
}

describe('verifyLegacyPhoneRepairCandidateOriginEvidence', () => {
  it('accepts a canonical artifact only when its target matches the supplied v2 snapshot', () => {
    const result = verify();
    expect(result.readyToSealIndependentBaseline).toBe(true);
    expect(result.sealingBlockers).toEqual([]);
    expect(result.entries.every((entry) => entry.status === 'eligible')).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.entries)).toBe(true);
    expect(Object.isFrozen(result.entries[0])).toBe(true);
  });

  it.each([
    ['different snapshot checksum', (value: ReturnType<typeof targetSnapshot>) => ({ ...value, checksum: 'c'.repeat(64) })],
    ['different validatedAt', (value: ReturnType<typeof targetSnapshot>) => ({ ...value, validatedAt: '2026-08-29T01:00:01.000Z' })],
    ['different topology checksum', (value: ReturnType<typeof targetSnapshot>) => ({ ...value, candidateTopologyChecksum: 'd'.repeat(64) })],
  ])('rejects an artifact bound to %s', (_label, mutate) => {
    const candidates = [candidate(screen), candidate(battery)];
    const originalTarget = targetSnapshot(candidates);
    const actualTarget = mutate(originalTarget);
    expect(() => verify({
      v2Candidates: candidates,
      targetSnapshot: actualTarget,
      evidenceArtifact: artifact(originalTarget, [record(screen), record(battery)]),
    })).toThrow();
  });

  it('rejects tampered artifact fields, future contracts, duplicate and orphan evidence', () => {
    const candidates = [candidate(screen), candidate(battery)];
    const target = targetSnapshot(candidates);
    const valid = artifact(target, [record(screen), record(battery)]);
    const orphan: LegacyPhoneRepairRouteIdentity = ['phone', 'oppo', 'reno-10-pro', 'screen-replacement'];

    for (const mutated of [
      { ...valid, checksum: '0'.repeat(64) },
      { ...valid, targetSnapshot: { ...target, validatedAt: '2026-08-29T01:00:01.000Z' } },
      { ...valid, records: [{ ...record(screen), relationship: 'derived' }, record(battery)] },
      { ...valid, kind: 'future-kind' },
      { ...valid, schemaVersion: 2 },
      { ...valid, records: [record(screen), record(screen)] },
      artifact(target, [record(screen), record(orphan)]),
      { ...valid, records: [{ ...record(screen), evidenceReference: RAW_MARKER }, record(battery)] },
      artifact(target, [record(screen, { evidenceDigest: 'not-a-digest' }), record(battery)]),
    ]) {
      expect(() => verify({ v2Candidates: candidates, targetSnapshot: target, evidenceArtifact: mutated as never })).toThrow();
    }
  });

  it('recomputes v2 topology instead of trusting target metadata', () => {
    const candidates = [candidate(screen), candidate(battery)];
    const target = targetSnapshot(candidates, { candidateTopologyChecksum: 'e'.repeat(64) });
    expect(() => verify({
      v2Candidates: candidates,
      targetSnapshot: target,
      evidenceArtifact: artifact(target, [record(screen), record(battery)]),
    })).toThrow();
  });

  it('uses a digest only as opaque evidence metadata and never echoes a raw marker', () => {
    const result = verify({
      evidenceArtifact: artifact(targetSnapshot([candidate(screen), candidate(battery)]), [
        record(screen, { evidenceDigest: 'f'.repeat(64) }), record(battery),
      ]),
    });
    expect(JSON.stringify(result)).not.toContain(RAW_MARKER);
    expect(JSON.stringify(result)).not.toContain('evidenceDigest');
    expect(result.entries.every((entry) => entry.hasEvidenceDigest)).toBe(true);

    const invalidArtifact = {
      ...artifact(targetSnapshot([candidate(screen), candidate(battery)]), [record(screen), record(battery)]),
      records: [{ ...record(screen), evidenceReference: RAW_MARKER }, record(battery)],
    };
    let thrown = '';
    try {
      verify({ evidenceArtifact: invalidArtifact as never });
    } catch (error) {
      thrown = String(error);
    }
    expect(thrown).not.toContain(RAW_MARKER);
  });

  it('rejects duplicate v1/v2 identities and treats v2-origin disagreement as a conflict', () => {
    const candidates = [candidate(screen), candidate(battery)];
    const target = targetSnapshot(candidates);
    const validArtifact = artifact(target, [record(screen), record(battery)]);
    expect(() => verify({ sealedV1Identities: [screen, screen], v2Candidates: candidates, targetSnapshot: target, evidenceArtifact: validArtifact })).toThrow();
    expect(() => verify({ sealedV1Identities: [screen, battery], v2Candidates: [candidate(screen), candidate(screen)], targetSnapshot: target, evidenceArtifact: validArtifact })).toThrow();

    const inconsistentCandidates = [candidate(screen, 'synthetic-core'), candidate(battery)];
    const inconsistentTarget = targetSnapshot(inconsistentCandidates);
    const result = verify({
      v2Candidates: inconsistentCandidates,
      targetSnapshot: inconsistentTarget,
      evidenceArtifact: artifact(inconsistentTarget, [record(screen), record(battery)]),
    });
    expect(result.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({ identity: screen, status: 'unresolved', conflict: true }),
    ]));
    expect(result.readyToSealIndependentBaseline).toBe(false);
    expect(result.sealingBlockers).toEqual(expect.arrayContaining(['conflicting-evidence']));
  });

  it.each([
    ['snapshot-only POS', record(screen, { evidenceKind: 'snapshot-origin-only', relationship: 'unknown', evidenceDigest: undefined })],
    ['retained POS', record(screen, { evidenceKind: 'retained-snapshot', relationship: 'carried-forward' })],
    ['carried forward POS', record(screen, { evidenceKind: 'carried-forward', relationship: 'carried-forward' })],
    ['unknown legacy', record(screen, { classifiedOrigin: 'unknown-legacy', evidenceKind: 'unknown', relationship: 'unknown', evidenceDigest: undefined })],
    ['missing digest', record(screen, { evidenceDigest: undefined })],
    ['conflict', record(screen, { conflict: true })],
  ])('keeps %s unresolved and globally unsealable', (_label, changedRecord) => {
    const candidates = [candidate(screen), candidate(battery)];
    const target = targetSnapshot(candidates);
    const result = verify({ evidenceArtifact: artifact(target, [changedRecord, record(battery)]) });
    expect(result.entries).toEqual(expect.arrayContaining([expect.objectContaining({ identity: screen, status: 'unresolved' })]));
    expect(result.readyToSealIndependentBaseline).toBe(false);
    expect(result.sealingBlockers).toEqual(expect.arrayContaining(['unresolved-evidence']));
  });

  it.each([
    ['synthetic core', record(screen, { classifiedOrigin: 'synthetic-core', evidenceKind: 'deterministic-core-rule', relationship: 'derived', evidenceDigest: undefined })],
    ['synthetic backfill', record(screen, { classifiedOrigin: 'synthetic-backfill', evidenceKind: 'deterministic-backfill-rule', relationship: 'derived', evidenceDigest: undefined })],
  ])('keeps %s route history only and can still seal when fully resolved', (_label, changedRecord) => {
    const candidates = [candidate(screen, changedRecord.classifiedOrigin), candidate(battery)];
    const target = targetSnapshot(candidates);
    const result = verify({ v2Candidates: candidates, targetSnapshot: target, evidenceArtifact: artifact(target, [changedRecord, record(battery)]) });
    expect(result.entries).toEqual(expect.arrayContaining([expect.objectContaining({ identity: screen, status: 'route-history-only' })]));
    expect(result.readyToSealIndependentBaseline).toBe(true);
  });

  it('blocks sealing for missing or added topology even if remaining evidence is eligible', () => {
    const added: LegacyPhoneRepairRouteIdentity = ['phone', 'oppo', 'reno-9-pro', 'logic-board-repair'];
    const candidates = [candidate(screen), candidate(added)];
    const target = targetSnapshot(candidates);
    const result = verify({
      v2Candidates: candidates,
      targetSnapshot: target,
      evidenceArtifact: artifact(target, [record(screen)]),
    });
    expect(result.topology).toEqual({ matches: false, missingFromV2: [battery], addedInV2: [added] });
    expect(result.readyToSealIndependentBaseline).toBe(false);
    expect(result.sealingBlockers).toEqual(expect.arrayContaining(['topology-mismatch', 'unresolved-evidence']));
  });

  it('is deterministic across artifact and input order without mutating inputs', () => {
    const candidates = [candidate(screen), candidate(battery)];
    const target = targetSnapshot(candidates);
    const records = [record(screen), record(battery)];
    const original = { sealedV1Identities: [screen, battery], v2Candidates: candidates, targetSnapshot: target, evidenceArtifact: artifact(target, records) };
    const before = structuredClone(original);
    const reorderedArtifact = artifact(target, [...records].reverse());
    const reordered = { ...original, sealedV1Identities: [...original.sealedV1Identities].reverse(), v2Candidates: [...candidates].reverse(), evidenceArtifact: reorderedArtifact };

    expect(reorderedArtifact.checksum).toBe(original.evidenceArtifact.checksum);
    expect(verify(reordered)).toEqual(verify(original));
    expect(original).toEqual(before);
  });
});
