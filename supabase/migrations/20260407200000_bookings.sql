create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  booking_type text not null,
  booking_date date not null,
  booking_time text not null,
  event_key text,
  event_name text,
  status text not null default 'odottaa',
  owner text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_booking_date_idx
  on public.bookings (booking_date, booking_time);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_anon" on public.bookings;
drop policy if exists "bookings_insert_anon" on public.bookings;
drop policy if exists "bookings_update_anon" on public.bookings;
drop policy if exists "bookings_delete_anon" on public.bookings;

create policy "bookings_select_anon"
  on public.bookings
  for select
  to anon
  using (true);

create policy "bookings_insert_anon"
  on public.bookings
  for insert
  to anon
  with check (true);

create policy "bookings_update_anon"
  on public.bookings
  for update
  to anon
  using (true)
  with check (true);

create policy "bookings_delete_anon"
  on public.bookings
  for delete
  to anon
  using (true);
