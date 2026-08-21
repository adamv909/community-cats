-- cat_known_locations was part of the original schema but never actually used until this
-- evening-round change activated it. It only ever got an "authenticated read" policy, not
-- the "anon read" policy that cats/stations both have — so it silently returns zero rows
-- for anything that isn't a real signed-in session (found via the dev SKIP_AUTH preview,
-- which uses the anon key). Matches the existing public-read convention on cats/stations.

create policy "Public read" on cat_known_locations
  for select
  to anon
  using (true);
