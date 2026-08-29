import {
  hydratePublicRepairCatalogueSnapshot,
  type PublicRepairCataloguePayload,
} from './publicRepairCataloguePolicy';
import { selectLegacyPhoneRepairCandidates } from './legacyPhoneRepairCandidateSelector';

const ROW_KEYS = ['snapshot_key', 'schema_version', 'payload', 'checksum', 'source', 'fetched_at', 'validated_at', 'inventory_row_count', 'public_model_count', 'public_repair_count'];
const SHA256 = /^[a-f0-9]{64}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function fail(): never {
  throw new Error('Legacy phone repair snapshot export is invalid.');
}

function isValidIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && ISO.test(value) && Number.isFinite(Date.parse(value));
}

export function adaptLegacyPhoneRepairSnapshotRow(row: unknown) {
  if (!isPlainRecord(row) || Object.keys(row).length !== ROW_KEYS.length || Object.keys(row).some((key) => !ROW_KEYS.includes(key))) fail();
  if (row.snapshot_key !== 'current' || row.source !== 'live-pos' || typeof row.checksum !== 'string' || !SHA256.test(row.checksum)) fail();
  if (typeof row.schema_version !== 'number' || !Number.isInteger(row.schema_version)
    || !isValidIsoTimestamp(row.fetched_at) || !isValidIsoTimestamp(row.validated_at)
    || ![row.inventory_row_count, row.public_model_count, row.public_repair_count].every((count) => typeof count === 'number' && Number.isInteger(count) && count >= 0)
    || !isPlainRecord(row.payload)) fail();

  let catalogue;
  try {
    catalogue = hydratePublicRepairCatalogueSnapshot({
      schemaVersion: row.schema_version,
      payload: row.payload as unknown as PublicRepairCataloguePayload,
      checksum: row.checksum,
      fetchedAt: row.fetched_at,
      validatedAt: row.validated_at,
      inventoryRowCount: row.inventory_row_count as number,
      publicModelCount: row.public_model_count as number,
      publicRepairCount: row.public_repair_count as number,
    });
  } catch {
    fail();
  }
  return {
    catalogue: { brands: catalogue.brands, ...(catalogue.retiredRepairs?.length ? { retiredRepairs: catalogue.retiredRepairs } : {}) },
    sourceSnapshot: { checksum: row.checksum, schemaVersion: row.schema_version, validatedAt: row.validated_at },
  };
}

export function selectLegacyPhoneRepairSnapshotCandidates(row: unknown) {
  const adapted = adaptLegacyPhoneRepairSnapshotRow(row);
  return selectLegacyPhoneRepairCandidates({
    catalogue: adapted.catalogue,
    sourceSnapshot: { checksum: adapted.sourceSnapshot.checksum, schemaVersion: adapted.sourceSnapshot.schemaVersion },
  });
}
