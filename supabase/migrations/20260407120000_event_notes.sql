-- event_notes: jaetut merkinnät tapahtumakohtaisesti
-- event_key = location || '_' || startDate (sama merkkijono kuin frontendissä)

create table if not exists public.event_notes (
  id uuid primary key default gen_random_uuid(),
  event_key text not null,
  location text not null,
  start_date timestamptz not null,
  soittaja text not null,
  asiakas text not null,
  kommentti text not null,
  created_at timestamptz not null default now()
);

create index if not exists event_notes_event_key_idx
  on public.event_notes (event_key);

create index if not exists event_notes_event_key_created_at_idx
  on public.event_notes (event_key, created_at desc);

alter table public.event_notes enable row level security;

drop policy if exists "event_notes_select_anon" on public.event_notes;
drop policy if exists "event_notes_insert_anon" on public.event_notes;

-- Sisäinen dashboard ilman kirjautumista: anon saa lukea ja lisätä.
-- Tiukenna käytännöt (esim. vain kirjautuneet) kun käyttöoikeudet määritellään.
create policy "event_notes_select_anon"
  on public.event_notes
  for select
  to anon
  using (true);

create policy "event_notes_insert_anon"
  on public.event_notes
  for insert
  to anon
  with check (true);
