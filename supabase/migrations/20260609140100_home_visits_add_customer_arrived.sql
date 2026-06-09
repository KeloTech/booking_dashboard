alter table public.home_visits
  add column if not exists customer_arrived boolean;
