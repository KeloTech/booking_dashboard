create table if not exists public.booking_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  constraint booking_profiles_name_not_blank check (char_length(trim(name)) > 0)
);

create unique index if not exists booking_profiles_name_unique_idx
  on public.booking_profiles (lower(name));

create index if not exists booking_profiles_name_idx
  on public.booking_profiles (name);

alter table public.booking_profiles enable row level security;

drop policy if exists "booking_profiles_select_anon" on public.booking_profiles;
drop policy if exists "booking_profiles_insert_anon" on public.booking_profiles;
drop policy if exists "booking_profiles_update_anon" on public.booking_profiles;
drop policy if exists "booking_profiles_delete_anon" on public.booking_profiles;

create policy "booking_profiles_select_anon"
  on public.booking_profiles
  for select
  to anon
  using (true);

create policy "booking_profiles_insert_anon"
  on public.booking_profiles
  for insert
  to anon
  with check (true);

create policy "booking_profiles_update_anon"
  on public.booking_profiles
  for update
  to anon
  using (true)
  with check (true);

create policy "booking_profiles_delete_anon"
  on public.booking_profiles
  for delete
  to anon
  using (true);
