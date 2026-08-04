-- Migration 20240010 added "authenticated read X" policies for routes/stations/cats/
-- route_stations that are functionally identical to the "Authenticated read" policies
-- already created in the initial schema (both are `for select to authenticated using (true)`).
-- Multiple SELECT policies union, so nothing was broken — but the duplication makes
-- pg_policies confusing and risks a future restrictive policy silently being bypassed by
-- one of the duplicates. Drop the redundant set; the originals from 20240001 remain.

drop policy if exists "authenticated read routes" on public.routes;
drop policy if exists "authenticated read stations" on public.stations;
drop policy if exists "authenticated read cats" on public.cats;
drop policy if exists "authenticated read route_stations" on public.route_stations;
