import {
  hydratePublicRepairCatalogueSnapshot,
  type PublicRepairCataloguePayload,
} from './publicRepairCataloguePolicy';
import { selectLegacyPhoneRepairCandidates } from './legacyPhoneRepairCandidateSelector';

const ROW_KEYS = ['snapshot_key', 'schema_version', 'payload', 'checksum', 'source', 'fetched_at', 'validated_at', 'inventory_row_count', 'public_model_count', 'public_repair_count'];
const SHA256 = /^[a-f0-9]{64}$/;
const SNAPSHOT_TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})(?:T| )(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}(?::\d{2})?)$/;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function fail(): never {
  throw new Error('Legacy phone repair snapshot export is invalid.');
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number) {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** Accepts only explicit-zone UTC/SQL TIMESTAMPTZ syntax and canonically truncates fractions beyond milliseconds. */
export function normalizeSnapshotTimestamp(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = SNAPSHOT_TIMESTAMP.exec(value);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = '', zone] = match;
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)
    || hour > 23 || minute > 59 || second > 59) return null;

  let offsetMinutes = 0;
  if (zone !== 'Z') {
    const sign = zone[0] === '+' ? 1 : -1;
    const offsetHour = Number(zone.slice(1, 3));
    const offsetMinute = zone.length === 3 ? 0 : Number(zone.slice(4, 6));
    if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) return null;
    offsetMinutes = sign * (offsetHour * 60 + offsetMinute);
  }

  const milliseconds = Number(`${fraction.slice(0, 3).padEnd(3, '0')}`);
  const instant = Date.UTC(year, month - 1, day, hour, minute, second, milliseconds) - offsetMinutes * 60_000;
  const normalized = new Date(instant);
  return Number.isFinite(instant) ? normalized.toISOString() : null;
}

export function adaptLegacyPhoneRepairSnapshotRow(row: unknown) {
  if (!isPlainRecord(row) || Object.keys(row).length !== ROW_KEYS.length || Object.keys(row).some((key) => !ROW_KEYS.includes(key))) fail();
  if (row.snapshot_key !== 'current' || row.source !== 'live-pos' || typeof row.checksum !== 'string' || !SHA256.test(row.checksum)) fail();
  if (typeof row.schema_version !== 'number' || !Number.isInteger(row.schema_version)
    || !normalizeSnapshotTimestamp(row.fetched_at) || !normalizeSnapshotTimestamp(row.validated_at)
    || ![row.inventory_row_count, row.public_model_count, row.public_repair_count].every((count) => typeof count === 'number' && Number.isInteger(count) && count >= 0)
    || !isPlainRecord(row.payload)) fail();

  const fetchedAt = normalizeSnapshotTimestamp(row.fetched_at);
  const validatedAt = normalizeSnapshotTimestamp(row.validated_at);
  if (!fetchedAt || !validatedAt) fail();
  let catalogue;
  try {
    catalogue = hydratePublicRepairCatalogueSnapshot({
      schemaVersion: row.schema_version,
      payload: row.payload as unknown as PublicRepairCataloguePayload,
      checksum: row.checksum,
      fetchedAt,
      validatedAt,
      inventoryRowCount: row.inventory_row_count as number,
      publicModelCount: row.public_model_count as number,
      publicRepairCount: row.public_repair_count as number,
    });
  } catch {
    fail();
  }
  return {
    catalogue: { brands: catalogue.brands, ...(catalogue.retiredRepairs?.length ? { retiredRepairs: catalogue.retiredRepairs } : {}) },
    sourceSnapshot: { checksum: row.checksum, schemaVersion: row.schema_version, validatedAt },
  };
}

export function selectLegacyPhoneRepairSnapshotCandidates(row: unknown) {
  const adapted = adaptLegacyPhoneRepairSnapshotRow(row);
  return selectLegacyPhoneRepairCandidates({
    catalogue: adapted.catalogue,
    sourceSnapshot: { checksum: adapted.sourceSnapshot.checksum, schemaVersion: adapted.sourceSnapshot.schemaVersion },
  });
}
