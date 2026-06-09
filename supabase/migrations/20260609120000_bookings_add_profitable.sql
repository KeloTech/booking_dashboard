alter table public.bookings
  add column if not exists profitable boolean;
