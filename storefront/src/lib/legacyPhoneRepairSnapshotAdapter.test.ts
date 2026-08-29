import { describe, expect, it } from 'vitest';

import { adaptLegacyPhoneRepairSnapshotRow } from './legacyPhoneRepairSnapshotAdapter';
import { checksumPublicRepairCatalogue, serializePublicRepairCatalogue } from './publicRepairCataloguePolicy';

function row() {
  const payload = serializePublicRepairCatalogue(['phone', 'tablet', 'laptop', 'watch'].map((category) => ({
    category, brand: `${category} brand`, slug: `${category}-brand`, icon: 'icon', models: [{
      model: `${category} model`, slug: `${category}-model`, repairTypes: [{ slug: 'screen-replacement', name: 'Screen', price: 99, repairOrigin: 'pos' as const }],
    }],
  })));
  return {
    snapshot_key: 'current', schema_version: 2, payload, checksum: checksumPublicRepairCatalogue(payload), source: 'live-pos',
    fetched_at: '2026-08-29T00:00:00.000Z', validated_at: '2026-08-29T00:00:00.000Z',
    inventory_row_count: 4, public_model_count: 4, public_repair_count: 4,
  };
}

describe('adaptLegacyPhoneRepairSnapshotRow', () => {
  it('accepts only a checksum-valid, exact current row without exposing prices', () => {
    const adapted = adaptLegacyPhoneRepairSnapshotRow(row());
    expect(adapted.sourceSnapshot.validatedAt).toBe('2026-08-29T00:00:00.000Z');
    expect(JSON.stringify(adapted.sourceSnapshot)).not.toContain('price');
  });

  it.each([
    ['unknown field', (value: Record<string, unknown>) => { value.extra = true; }],
    ['missing field', (value: Record<string, unknown>) => { delete value.source; }],
    ['wrong snapshot key', (value: Record<string, unknown>) => { value.snapshot_key = 'previous'; }],
    ['checksum mismatch', (value: Record<string, unknown>) => { value.checksum = 'a'.repeat(64); }],
    ['wrong source', (value: Record<string, unknown>) => { value.source = 'other'; }],
    ['future schema', (value: Record<string, unknown>) => { value.schema_version = 3; }],
    ['invalid timestamp', (value: Record<string, unknown>) => { value.validated_at = '2026-13-99T00:00:00.000Z'; }],
    ['negative count', (value: Record<string, unknown>) => { value.inventory_row_count = -1; }],
    ['count mismatch', (value: Record<string, unknown>) => { value.public_repair_count = 5; }],
    ['mixed origin', (value: Record<string, unknown>) => { delete (value.payload as { brands: Array<{ models: Array<{ repairTypes: Array<Record<string, unknown>> }> }> }).brands[0].models[0].repairTypes[0].repairOrigin; }],
    ['empty catalogue', (value: Record<string, unknown>) => { value.payload = { brands: [] }; }],
  ])('rejects %s', (_label, change) => {
    const value = row() as Record<string, unknown>;
    change(value);
    expect(() => adaptLegacyPhoneRepairSnapshotRow(value)).toThrow('snapshot export is invalid');
  });
});
