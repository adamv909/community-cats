-- Allow authenticated users to read community data (routes, stations, cats, route_stations)
-- Previously only anon read policies existed; authenticated role needs explicit policies.

create policy "authenticated read routes"
  on public.routes for select to authenticated using (true);

create policy "authenticated read stations"
  on public.stations for select to authenticated using (true);

create policy "authenticated read cats"
  on public.cats for select to authenticated using (true);

create policy "authenticated read route_stations"
  on public.route_stations for select to authenticated using (true);
