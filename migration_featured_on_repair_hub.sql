alter table public.repair_results
add column if not exists featured_on_repair_hub boolean not null default false;
