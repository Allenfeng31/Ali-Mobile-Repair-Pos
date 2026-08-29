import { describe, expect, it } from 'vitest';

import { adaptLegacyPhoneRepairSnapshotRow, normalizeSnapshotTimestamp } from './legacyPhoneRepairSnapshotAdapter';
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

  it('accepts and normalizes a strict PostgreSQL TIMESTAMPTZ export without changing the row', () => {
    const value = row();
    value.fetched_at = '2026-08-28 00:18:55.696+00';
    value.validated_at = '2026-08-28 10:18:55.696+10';
    const before = structuredClone(value);

    const adapted = adaptLegacyPhoneRepairSnapshotRow(value);

    expect(adapted.sourceSnapshot.validatedAt).toBe('2026-08-28T00:18:55.696Z');
    expect(value).toEqual(before);
  });

  it.each([
    ['canonical seconds', '2026-08-28T00:18:55Z', '2026-08-28T00:18:55.000Z'],
    ['canonical milliseconds', '2026-08-28T00:18:55.696Z', '2026-08-28T00:18:55.696Z'],
    ['PostgreSQL UTC', '2026-08-28 00:18:55.696+00', '2026-08-28T00:18:55.696Z'],
    ['positive whole-hour offset', '2026-08-28 10:18:55.696+10', '2026-08-28T00:18:55.696Z'],
    ['positive minute offset', '2026-08-28 10:48:55.696+10:30', '2026-08-28T00:18:55.696Z'],
    ['negative offset across year', '2025-12-31 20:30:00.123-03:30', '2026-01-01T00:00:00.123Z'],
    ['one fractional digit', '2026-08-28 00:18:55.6+00', '2026-08-28T00:18:55.600Z'],
    ['six fractional digits truncate to milliseconds', '2026-08-28 00:18:55.696789+00', '2026-08-28T00:18:55.696Z'],
  ])('normalizes %s deterministically', (_label, input, expected) => {
    expect(normalizeSnapshotTimestamp(input)).toBe(expected);
  });

  it('rejects JavaScript Date.UTC two-digit-year reinterpretation and accepts the explicit 1000–9999 contract', () => {
    expect(normalizeSnapshotTimestamp('0099-01-01T12:00:00Z')).toBeNull();
    expect(normalizeSnapshotTimestamp('0000-01-01T00:00:00Z')).toBeNull();
    expect(normalizeSnapshotTimestamp('0001-01-01T00:00:00Z')).toBeNull();
    expect(normalizeSnapshotTimestamp('0099-01-01T00:00:00Z')).toBeNull();
    expect(normalizeSnapshotTimestamp('0999-12-31T23:59:59Z')).toBeNull();
    expect(normalizeSnapshotTimestamp('1000-01-01T00:00:00Z')).toBe('1000-01-01T00:00:00.000Z');
    expect(normalizeSnapshotTimestamp('9999-12-31T23:59:59Z')).toBe('9999-12-31T23:59:59.000Z');
  });

  it.each([
    '2026-02-30 00:00:00+00',
    '2025-02-29 00:00:00+00',
    '2026-13-01 00:00:00+00',
    '2026-01-01 24:00:00+00',
    '2026-01-01 00:60:00+00',
    '2026-01-01 00:00:60+00',
    '2026-01-01 00:00:00',
    '2026/01/01 00:00:00+00',
    '2026-01-01T00:00:00',
    '2026-01-01 00:00:00+25',
    '2026-01-01 00:00:00+10:99',
    '2026-01-01 00:00:00+00 trailing',
    ' 2026-01-01 00:00:00+00',
    '2026-01-01 00:00:00+00 ',
    '2026-01-01 00:00:00.1234567+00',
    '2026-01-01 00:00:00+14:01',
  ])('rejects invalid or ambiguous timestamp %s', (input) => {
    expect(normalizeSnapshotTimestamp(input)).toBeNull();
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
