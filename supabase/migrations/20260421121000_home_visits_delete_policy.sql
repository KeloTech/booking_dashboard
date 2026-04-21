drop policy if exists "home_visits_delete_anon" on public.home_visits;

create policy "home_visits_delete_anon"
  on public.home_visits
  for delete
  to anon
  using (true);
