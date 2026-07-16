import 'server-only';

import { createServiceRoleClient } from '@/utils/supabase/service-role';
import {
  PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION,
  type StoredPublicRepairCatalogueSnapshot,
} from './publicRepairCataloguePolicy';

const SNAPSHOT_KEY = 'current';

type SnapshotRow = {
  snapshot_key: string;
  schema_version: number;
  payload: StoredPublicRepairCatalogueSnapshot['payload'];
  checksum: string;
  source: 'live-pos';
  fetched_at: string;
  validated_at: string;
  inventory_row_count: number;
  public_model_count: number;
  public_repair_count: number;
};

function asStoredSnapshot(row: SnapshotRow): StoredPublicRepairCatalogueSnapshot {
  if (row.snapshot_key !== SNAPSHOT_KEY || row.schema_version !== PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION || row.source !== 'live-pos') {
    throw new Error('Public repair catalogue snapshot metadata is invalid.');
  }

  return {
    payload: row.payload,
    checksum: row.checksum,
    fetchedAt: row.fetched_at,
    validatedAt: row.validated_at,
    inventoryRowCount: row.inventory_row_count,
    publicModelCount: row.public_model_count,
    publicRepairCount: row.public_repair_count,
  };
}

/** Server-only durable last-known-good public catalogue storage. */
export async function readCurrentPublicRepairCatalogueSnapshot(): Promise<StoredPublicRepairCatalogueSnapshot | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('public_repair_catalogue_snapshots')
    .select('snapshot_key, schema_version, payload, checksum, source, fetched_at, validated_at, inventory_row_count, public_model_count, public_repair_count')
    .eq('snapshot_key', SNAPSHOT_KEY)
    .maybeSingle();

  if (error) throw new Error('Public repair catalogue snapshot read failed.');
  return data ? asStoredSnapshot(data as SnapshotRow) : null;
}

/** Atomic upsert happens only after the candidate has completed policy validation. */
export async function writeCurrentPublicRepairCatalogueSnapshot(snapshot: StoredPublicRepairCatalogueSnapshot) {
  const client = createServiceRoleClient();
  const { error } = await client
    .from('public_repair_catalogue_snapshots')
    .upsert(
      {
        snapshot_key: SNAPSHOT_KEY,
        schema_version: PUBLIC_REPAIR_CATALOGUE_SCHEMA_VERSION,
        payload: snapshot.payload,
        checksum: snapshot.checksum,
        source: 'live-pos',
        fetched_at: snapshot.fetchedAt,
        validated_at: snapshot.validatedAt,
        inventory_row_count: snapshot.inventoryRowCount,
        public_model_count: snapshot.publicModelCount,
        public_repair_count: snapshot.publicRepairCount,
      },
      { onConflict: 'snapshot_key' },
    );

  if (error) throw new Error('Public repair catalogue snapshot update failed.');
}
