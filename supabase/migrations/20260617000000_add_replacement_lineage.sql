-- Add replacement lineage column
ALTER TABLE public.repair_results
ADD COLUMN IF NOT EXISTS replaces_result_id uuid NULL REFERENCES public.repair_results(id);

-- Standard index for querying lineage
CREATE INDEX IF NOT EXISTS idx_repair_results_replaces_id ON public.repair_results(replaces_result_id);

-- Partial unique index to prevent multiple unpublished staged replacements for the same original result
CREATE UNIQUE INDEX IF NOT EXISTS idx_repair_results_single_replacement
ON public.repair_results(replaces_result_id)
WHERE replaces_result_id IS NOT NULL AND status IN ('draft', 'approved');

-- Prevent immediate self-reference
ALTER TABLE public.repair_results
ADD CONSTRAINT chk_repair_results_no_self_replace CHECK (id != replaces_result_id);

-- Prevent cyclic replacements
CREATE OR REPLACE FUNCTION public.check_repair_results_cycles()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_ancestor uuid;
BEGIN
  IF NEW.replaces_result_id IS NULL THEN
    RETURN NEW;
  END IF;

  current_ancestor := NEW.replaces_result_id;
  
  -- Recursively check ancestors up to a reasonable depth
  FOR i IN 1..50 LOOP
    SELECT replaces_result_id INTO current_ancestor
    FROM public.repair_results
    WHERE id = current_ancestor;

    IF current_ancestor IS NULL THEN
      RETURN NEW;
    END IF;

    IF current_ancestor = NEW.id THEN
      RAISE EXCEPTION 'Replacement cycle detected.';
    END IF;
  END LOOP;

  RAISE EXCEPTION 'Replacement lineage too deep or cycle detected.';
END;
$$;

DROP TRIGGER IF EXISTS trg_check_repair_results_cycles ON public.repair_results;
CREATE TRIGGER trg_check_repair_results_cycles
BEFORE INSERT OR UPDATE OF replaces_result_id
ON public.repair_results
FOR EACH ROW
EXECUTE FUNCTION public.check_repair_results_cycles();

-- Create atomic activation RPC
CREATE OR REPLACE FUNCTION public.activate_repair_result_replacement(
  old_id uuid,
  new_id uuid,
  req_status text,
  req_featured boolean
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_row public.repair_results%ROWTYPE;
  new_row public.repair_results%ROWTYPE;
BEGIN
  IF old_id = new_id THEN
    RAISE EXCEPTION 'Old and staged IDs must differ.';
  END IF;

  IF req_status NOT IN ('draft', 'approved', 'published', 'archived') THEN
    RAISE EXCEPTION 'Unsupported activation status: %', req_status;
  END IF;

  IF req_featured = true AND req_status != 'published' THEN
    RAISE EXCEPTION 'featured_on_homepage = true is allowed only when status is published.';
  END IF;

  -- Validate old row exists
  SELECT * INTO old_row FROM public.repair_results WHERE id = old_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Old Repair Result (%) not found.', old_id;
  END IF;

  -- Validate new row exists and links correctly
  SELECT * INTO new_row FROM public.repair_results WHERE id = new_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Staged Repair Result (%) not found.', new_id;
  END IF;

  IF new_row.replaces_result_id IS DISTINCT FROM old_id THEN
    RAISE EXCEPTION 'Staged Repair Result does not correctly reference old result ID.';
  END IF;

  IF new_row.status = 'published' THEN
    RAISE EXCEPTION 'Staged Repair Result is already published. Use idempotent replay.';
  END IF;

  IF req_status = 'published' THEN
    -- Archive old row and remove featuring ONLY when the new replacement is explicitly published
    UPDATE public.repair_results
    SET status = 'archived',
        featured_on_homepage = false
    WHERE id = old_id;
  END IF;

  -- Activate new row
  UPDATE public.repair_results
  SET status = req_status,
      featured_on_homepage = req_featured,
      published_at = CASE WHEN req_status = 'published' THEN COALESCE(new_row.published_at, now()) ELSE new_row.published_at END
  WHERE id = new_id
  RETURNING * INTO new_row;

  RETURN json_build_object(
    'old_record', row_to_json(old_row),
    'new_record', row_to_json(new_row)
  );
END;
$$;

-- Revoke public access
REVOKE EXECUTE ON FUNCTION public.activate_repair_result_replacement(uuid, uuid, text, boolean) FROM public, anon, authenticated;
-- Allow it only through the server-side service-role workflow
GRANT EXECUTE ON FUNCTION public.activate_repair_result_replacement(uuid, uuid, text, boolean) TO service_role;
