-- Remove Ronald, Pickle, and Sumi from active Dry Food Round assignments. Combined with
-- the earlier Wet Food Round removal, these three no longer appear in either round. Cat
-- records and all historical station_visits/sightings are untouched.
update cats set primary_station_id = null where name in ('Ronald', 'Pickle', 'Sumi');
