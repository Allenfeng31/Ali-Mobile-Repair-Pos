-- Durable, additive catalogue notification outbox. Apply through the normal
-- Supabase migration process; this file is intentionally not executed locally.
BEGIN;

CREATE TABLE IF NOT EXISTS public.catalogue_mutation_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  operation text NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  before_item jsonb,
  after_item jsonb,
  lifecycle jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'needs_attention')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  lock_token uuid,
  last_error text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalogue_mutation_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.catalogue_mutation_outbox FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.catalogue_mutation_outbox_sequence_seq FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.catalogue_mutation_outbox TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.catalogue_mutation_outbox_sequence_seq TO service_role;

CREATE INDEX IF NOT EXISTS idx_catalogue_mutation_outbox_pending
  ON public.catalogue_mutation_outbox (next_attempt_at, sequence)
  WHERE status IN ('pending', 'processing');

CREATE OR REPLACE FUNCTION public.enqueue_catalogue_mutation_outbox()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  previous_row jsonb := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  next_row jsonb := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  current_row jsonb;
BEGIN
  current_row := COALESCE(next_row, previous_row);
  IF coalesce(current_row ->> 'category', '') ILIKE '%accessor%'
    OR NOT (coalesce(current_row ->> 'category', '') || ' ' || coalesce(current_row ->> 'name', '')) ~* 'screen|battery|charging|camera|housing|glass|logic board|speaker|microphone|power button|volume button|flex cable' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'UPDATE' AND jsonb_build_object(
    'name', previous_row -> 'name', 'model', previous_row -> 'model', 'device_model', previous_row -> 'device_model', 'category', previous_row -> 'category', 'price', previous_row -> 'price',
    'status', previous_row -> 'status', 'is_active', previous_row -> 'is_active', 'active', previous_row -> 'active', 'hidden', previous_row -> 'hidden', 'published', previous_row -> 'published', 'is_published', previous_row -> 'is_published', 'visibility', previous_row -> 'visibility'
  ) IS NOT DISTINCT FROM jsonb_build_object(
    'name', next_row -> 'name', 'model', next_row -> 'model', 'device_model', next_row -> 'device_model', 'category', next_row -> 'category', 'price', next_row -> 'price',
    'status', next_row -> 'status', 'is_active', next_row -> 'is_active', 'active', next_row -> 'active', 'hidden', next_row -> 'hidden', 'published', next_row -> 'published', 'is_published', next_row -> 'is_published', 'visibility', next_row -> 'visibility'
  ) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.catalogue_mutation_outbox (operation, before_item, after_item, lifecycle)
  VALUES (
    lower(TG_OP),
    previous_row,
    next_row,
    jsonb_strip_nulls(jsonb_build_object(
      'status', current_row -> 'status',
      'is_active', current_row -> 'is_active',
      'active', current_row -> 'active',
      'hidden', current_row -> 'hidden',
      'published', current_row -> 'published',
      'is_published', current_row -> 'is_published',
      'visibility', current_row -> 'visibility'
    ))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS inventory_catalogue_mutation_outbox ON public.inventory;
CREATE TRIGGER inventory_catalogue_mutation_outbox
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_catalogue_mutation_outbox();

COMMIT;
