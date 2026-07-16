-- Durable, server-only last-known-good snapshot for public repair catalogue data.
-- Apply through the existing Supabase SQL migration process before deploying code that reads it.

CREATE TABLE IF NOT EXISTS public.public_repair_catalogue_snapshots (
  snapshot_key TEXT PRIMARY KEY CHECK (snapshot_key = 'current'),
  schema_version INTEGER NOT NULL CHECK (schema_version > 0),
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  checksum TEXT NOT NULL CHECK (char_length(checksum) = 64),
  source TEXT NOT NULL CHECK (source = 'live-pos'),
  fetched_at TIMESTAMPTZ NOT NULL,
  validated_at TIMESTAMPTZ NOT NULL,
  inventory_row_count INTEGER NOT NULL CHECK (inventory_row_count >= 0),
  public_model_count INTEGER NOT NULL CHECK (public_model_count >= 0),
  public_repair_count INTEGER NOT NULL CHECK (public_repair_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_public_repair_catalogue_snapshots_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_public_repair_catalogue_snapshots_updated_at ON public.public_repair_catalogue_snapshots;
CREATE TRIGGER trg_public_repair_catalogue_snapshots_updated_at
BEFORE UPDATE ON public.public_repair_catalogue_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.set_public_repair_catalogue_snapshots_updated_at();

ALTER TABLE public.public_repair_catalogue_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.public_repair_catalogue_snapshots FROM anon, authenticated;
