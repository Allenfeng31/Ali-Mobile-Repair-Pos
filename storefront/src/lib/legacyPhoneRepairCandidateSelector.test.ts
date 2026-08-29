import { describe, expect, it } from 'vitest';

import {
  formatLegacyPhoneRepairCandidateDryRun,
  selectLegacyPhoneRepairCandidates,
  type LegacyPhoneRepairCandidateSelectionInput,
} from './legacyPhoneRepairCandidateSelector';
import type { RepairOption, RepairOrigin } from './publicRepairCataloguePolicy';

function repair(slug: string, repairOrigin: RepairOrigin, sourceType: 'real' | 'virtual' | 'diagnostic' = 'real'): RepairOption {
  return { slug, name: slug, price: 1, sourceType, repairOrigin };
}

function input(): LegacyPhoneRepairCandidateSelectionInput {
  const catalogue: LegacyPhoneRepairCandidateSelectionInput['catalogue'] = {
      brands: [{
        category: 'phone', brand: 'OPPO', slug: 'oppo', icon: 'phone', models: [{
          model: 'Find X8 Pro', slug: 'find-x8-pro', repairTypes: [
            repair('screen-replacement', 'pos'),
            repair('battery-replacement', 'pos'),
            repair('front-camera-replacement', 'pos'),
            repair('charging-port-replacement', 'synthetic-core'),
            repair('back-glass-replacement', 'synthetic-backfill'),
            repair('loudspeaker-replacement', 'pos'),
            repair('camera-lens-replacement', 'virtual', 'virtual'),
            repair('water-damage-repair', 'pos'),
            repair('flex-cable-replacement', 'pos'),
          ],
        }, {
          model: 'Find X9 Pro', slug: 'find-x9-pro', repairTypes: [repair('screen-replacement', 'pos')],
        }],
      }, {
        category: 'phone', brand: 'Samsung', slug: 'samsung', icon: 'phone', models: [{
          model: 'Galaxy Note 20', slug: 'galaxy-note-20', repairTypes: [
            repair('screen-replacement', 'pos'), repair('charging-port-replacement', 'pos'), repair('back-glass-replacement', 'synthetic-backfill'),
          ],
        }],
      }, {
        category: 'phone', brand: 'iPhone', slug: 'iphone', icon: 'phone', models: [{
          model: 'iPhone 13', slug: 'iphone-13', repairTypes: [repair('screen-replacement', 'pos')],
        }],
      }],
      retiredRepairs: [{
        lifecycle: 'retired', category: 'phone', brand: 'OPPO', brandSlug: 'oppo', model: 'Find X7', modelSlug: 'find-x7', repair: repair('screen-replacement', 'unknown-legacy'),
      }, {
        lifecycle: 'retired', category: 'phone', brand: 'OPPO', brandSlug: 'oppo', model: 'Find X6', modelSlug: 'find-x6', repair: repair('battery-replacement', 'unknown-legacy'),
      }],
  };
  return {
    sourceSnapshot: { checksum: 'a'.repeat(64), schemaVersion: 1 },
    catalogue,
  };
}

describe('selectLegacyPhoneRepairCandidates', () => {
  it('keeps selection and dry-run output stable when localeCompare throws', () => {
    const originalLocaleCompare = String.prototype.localeCompare;
    const original = input();
    const expected = selectLegacyPhoneRepairCandidates(original);

    try {
      String.prototype.localeCompare = () => { throw new Error('localeCompare must not be used'); };
      const actual = selectLegacyPhoneRepairCandidates(structuredClone(original));
      expect(actual).toEqual(expected);
      expect(formatLegacyPhoneRepairCandidateDryRun(actual, 'summary'))
        .toBe(formatLegacyPhoneRepairCandidateDryRun(expected, 'summary'));
      expect(formatLegacyPhoneRepairCandidateDryRun(actual, 'json'))
        .toBe(formatLegacyPhoneRepairCandidateDryRun(expected, 'json'));
    } finally {
      String.prototype.localeCompare = originalLocaleCompare;
    }
  });

  it('keeps current normal exact details, including POS loudspeaker and synthetic repairs, while recording exclusions', () => {
    const report = selectLegacyPhoneRepairCandidates(input());
    const candidateSlugs = report.candidates.map((entry) => `${entry.brandSlug}/${entry.modelSlug}/${entry.repairSlug}`);

    expect(candidateSlugs).toContain('oppo/find-x8-pro/loudspeaker-replacement');
    expect(candidateSlugs).toContain('oppo/find-x8-pro/charging-port-replacement');
    expect(candidateSlugs).toContain('oppo/find-x8-pro/back-glass-replacement');
    expect(candidateSlugs).not.toContain('oppo/find-x8-pro/camera-lens-replacement');
    expect(report.exclusionsByReason).toMatchObject({
      virtual: 1, 'water-damage-central': 1, 'flex-noindex': 1, 'iphone-excluded': 1, retired: 2,
    });
    expect(report.candidates.every((entry) => entry.category === 'phone')).toBe(true);
    expect(report.byOrigin.virtual).toBeUndefined();
    expect(JSON.stringify(report)).not.toContain('"price"');
    expect(JSON.stringify(report)).not.toContain('moto-g04');
    expect(JSON.stringify(report)).not.toContain('nokia');
  });

  it('is deterministic, does not mutate its input, and fails closed on active/retired conflicts', () => {
    const original = input();
    const before = structuredClone(original);
    const first = selectLegacyPhoneRepairCandidates(original);
    const reordered = structuredClone(original);
    reordered.catalogue.brands.reverse();
    reordered.catalogue.brands.forEach((brand) => {
      brand.models.reverse();
      brand.models.forEach((model) => model.repairTypes.reverse());
    });
    reordered.catalogue.retiredRepairs!.reverse();

    expect(selectLegacyPhoneRepairCandidates(original)).toEqual(first);
    expect(selectLegacyPhoneRepairCandidates(reordered)).toEqual(first);
    expect(original).toEqual(before);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.candidates)).toBe(true);
    expect(formatLegacyPhoneRepairCandidateDryRun(first, 'summary')).toContain('DRY RUN ONLY');
    expect(formatLegacyPhoneRepairCandidateDryRun(first, 'summary')).toContain('NO BASELINE WRITTEN');
    expect(formatLegacyPhoneRepairCandidateDryRun(first, 'json')).toBe(JSON.stringify(first, null, 2));
    expect(first.candidateTopologyChecksum).toMatch(/^[a-f0-9]{64}$/);
    expect(formatLegacyPhoneRepairCandidateDryRun(first, 'summary')).toContain('Candidate topology checksum:');

    const conflict = input();
    conflict.catalogue.retiredRepairs!.push({
      lifecycle: 'retired', category: 'phone', brand: 'OPPO', brandSlug: 'oppo', model: 'Find X8 Pro', modelSlug: 'find-x8-pro', repair: repair('screen-replacement', 'pos'),
    });
    expect(() => selectLegacyPhoneRepairCandidates(conflict)).toThrow('active/retired exact identity conflict');
  });

  it('changes the topology checksum for every exact tuple change and identity addition or removal', () => {
    const original = selectLegacyPhoneRepairCandidates(input());
    const cases = [
      ['category', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].category = 'tablet'; }],
      ['brand', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].slug = 'oneplus'; }],
      ['model', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].models[0].slug = 'find-x7-pro'; }],
      ['repair', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].models[0].repairTypes[0].slug = 'logic-board-repair'; }],
      ['add', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].models[1].repairTypes.push(repair('logic-board-repair', 'pos')); }],
      ['remove', (value: LegacyPhoneRepairCandidateSelectionInput) => { value.catalogue.brands[0].models[1].repairTypes.pop(); }],
    ] as const;

    for (const [, mutate] of cases) {
      const changed = structuredClone(input());
      mutate(changed);
      expect(selectLegacyPhoneRepairCandidates(changed).candidateTopologyChecksum)
        .not.toBe(original.candidateTopologyChecksum);
    }
  });

  it('keeps route topology stable while capture origin changes the origin-aware checksum', () => {
    const original = selectLegacyPhoneRepairCandidates(input());
    const originsChanged = structuredClone(input());
    originsChanged.catalogue.brands[0].models[0].repairTypes[0].repairOrigin = 'synthetic-core';
    const changed = selectLegacyPhoneRepairCandidates(originsChanged);

    expect(changed.candidateTopologyChecksum).toBe(original.candidateTopologyChecksum);
    expect(changed.candidateIdentityChecksum).not.toBe(original.candidateIdentityChecksum);
  });

  it('fails closed for duplicate exact identities or missing/mixed repair origins', () => {
    const duplicate = input();
    duplicate.catalogue.brands[0].models[0].repairTypes.push(repair('screen-replacement', 'pos'));
    expect(() => selectLegacyPhoneRepairCandidates(duplicate)).toThrow('duplicate active exact identity');

    const mixed = input();
    delete mixed.catalogue.brands[0].models[0].repairTypes[0].repairOrigin;
    expect(() => selectLegacyPhoneRepairCandidates(mixed)).toThrow('invalid or mixed identity origin');

    const corrupt = input();
    corrupt.sourceSnapshot.checksum = 'not-a-checksum';
    expect(() => selectLegacyPhoneRepairCandidates(corrupt)).toThrow('source snapshot is invalid');

    const wrongSchema = input();
    wrongSchema.sourceSnapshot.schemaVersion = 3;
    expect(() => selectLegacyPhoneRepairCandidates(wrongSchema)).toThrow('source snapshot is invalid');
  });
});
