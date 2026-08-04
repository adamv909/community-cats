-- Admins could read station_visits and sightings (via "Authenticated read") but had no
-- policy allowing UPDATE/DELETE, unlike every other core table. Uses the existing
-- non-recursive public.is_admin() helper from the previous migration.

create policy "Admin full access" on public.station_visits
  for all to authenticated using (public.is_admin());

create policy "Admin full access" on public.sightings
  for all to authenticated using (public.is_admin());
