create table if not exists public.home_visits (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  address text not null,
  visit_time timestamptz not null,
  details text not null,
  status text not null default 'sovittu',
  created_at timestamptz not null default now()
);

create index if not exists home_visits_visit_time_idx
  on public.home_visits (visit_time);

alter table public.home_visits enable row level security;

drop policy if exists "home_visits_select_anon" on public.home_visits;
drop policy if exists "home_visits_insert_anon" on public.home_visits;
drop policy if exists "home_visits_update_anon" on public.home_visits;

create policy "home_visits_select_anon"
  on public.home_visits
  for select
  to anon
  using (true);

create policy "home_visits_insert_anon"
  on public.home_visits
  for insert
  to anon
  with check (true);

create policy "home_visits_update_anon"
  on public.home_visits
  for update
  to anon
  using (true)
  with check (true);
