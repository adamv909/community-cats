-- New independent Dry Food Round stations for Ribbon, Pearl, and Robin, following the
-- same pattern as the existing Q Parking / P Parking stops: each is its own station
-- tracking dry food, wet food, and water (requires_wet_food), not just a shared stop.
-- Coordinates are copied from each cat's current shared station as a provisional
-- placeholder only -- NOT verified physical locations, same as every other new stop
-- introduced this way.
insert into stations (name, area, kind, requires_wet_food, latitude, longitude, access_notes)
select 'Ribbon', 'Cluster R', 'station', true, latitude, longitude,
  'Between R-S, next to Spartan Gym. Coordinates are an unverified placeholder.'
from stations where name = 'Astrolabs' and kind = 'station';

insert into stations (name, area, kind, requires_wet_food, latitude, longitude, access_notes)
select 'Pearl', 'Cluster R', 'station', true, latitude, longitude,
  'R parking, close to Sagar Ratna. Coordinates are an unverified placeholder.'
from stations where name = 'Astrolabs' and kind = 'station';

insert into stations (name, area, kind, requires_wet_food, latitude, longitude, access_notes)
select 'Robin', 'Cluster O', 'station', true, latitude, longitude,
  'Outside West Zone. Coordinates are an unverified placeholder.'
from stations where name = 'Body & Mind Ramp' and kind = 'station';

-- Reorder the Dry Food Round: Ribbon and Pearl go right after Astrolabs (their cats'
-- former shared station); Robin goes right after Body & Mind Ramp (his former shared
-- station). Two-step large-offset shift avoids the unique (route_id, order_index)
-- constraint colliding mid-statement (same technique used for every prior reorder
-- this project).
update route_stations set order_index = order_index + 1000
where route_id = (select id from routes where round_type = 'morning');

update route_stations set order_index = case order_index
  when 1001 then 1   -- Kirin Hot Pot
  when 1002 then 2   -- Q Parking
  when 1003 then 3   -- Astrolabs
  when 1004 then 6   -- Tornado
  when 1005 then 7   -- Splendour Fields
  when 1006 then 8   -- Opposite Splendour Fields
  when 1007 then 9   -- Costa Coffee
  when 1008 then 10  -- Downstairs from Carrefour
  when 1009 then 11  -- P Parking
  when 1010 then 12  -- Behind Carrefour (fruit salad gang)
  when 1011 then 13  -- Nola Open Gym
  when 1012 then 14  -- Body & Mind Ramp
  when 1013 then 16  -- Behind the Football Pitches
end
where route_id = (select id from routes where round_type = 'morning') and order_index > 1000;

insert into route_stations (route_id, station_id, order_index)
select r.id, s.id, 4 from routes r, stations s
where r.round_type = 'morning' and s.name = 'Ribbon' and s.kind = 'station';

insert into route_stations (route_id, station_id, order_index)
select r.id, s.id, 5 from routes r, stations s
where r.round_type = 'morning' and s.name = 'Pearl' and s.kind = 'station';

insert into route_stations (route_id, station_id, order_index)
select r.id, s.id, 15 from routes r, stations s
where r.round_type = 'morning' and s.name = 'Robin' and s.kind = 'station';

-- Give each cat their own dedicated stop instead of the shared station.
update cats set primary_station_id = (select id from stations where name = 'Ribbon' and kind = 'station')
where name = 'Ribbon';

update cats set primary_station_id = (select id from stations where name = 'Pearl' and kind = 'station')
where name = 'Pearl';

update cats set primary_station_id = (select id from stations where name = 'Robin' and kind = 'station')
where name = 'Robin';

-- Station count grew from 13 to 16.
update routes set description = 'Dry food + water — all 16 stations' where round_type = 'morning';
