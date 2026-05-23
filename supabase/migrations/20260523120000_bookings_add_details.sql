alter table if exists public.bookings
  add column if not exists details text;
