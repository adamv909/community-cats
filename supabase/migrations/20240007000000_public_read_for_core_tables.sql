-- Allow unauthenticated reads on non-sensitive tables.
-- Station locations, cat names, and route info are community data — no need to hide them.
-- User profiles and feeding round history remain authenticated-only.

create policy "Public read" on public.stations
  for select to anon using (true);

create policy "Public read" on public.cats
  for select to anon using (true);

create policy "Public read" on public.routes
  for select to anon using (true);

create policy "Public read" on public.route_stations
  for select to anon using (true);
