alter table if exists public.home_visits
add column if not exists nickname text;
