alter table public.repair_results
add column if not exists featured_on_brand_hub boolean not null default false;
