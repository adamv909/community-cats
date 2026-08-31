-- Generic per-station flag: some Dry Food Round stops also need wet food tracked,
-- not just dry food + water. Defaults to false for every existing station.
alter table stations add column requires_wet_food boolean not null default false;
alter table station_visits add column wet_food_topped_up boolean not null default false;

-- Meeku and Scrappy get their own dedicated stops (previously folded into the shared
-- "Kirin Hot Pot" and "Downstairs from Carrefour" stations). Coordinates are copied from
-- those neighbouring stations as provisional placeholders only -- NOT verified physical
-- locations, same as every other placeholder coordinate introduced this session.
insert into stations (name, area, kind, requires_wet_food, latitude, longitude)
select 'Scrappy', area, 'station', true, latitude, longitude
from stations where name = 'Kirin Hot Pot' and kind = 'station';

insert into stations (name, area, kind, requires_wet_food, latitude, longitude)
select 'Meeku', area, 'station', true, latitude, longitude
from stations where name = 'Downstairs from Carrefour' and kind = 'station';

-- Reorder the Dry Food Round's route_stations so the two new stops sit right after their
-- former shared station. Two-step large-offset shift avoids the unique
-- (route_id, order_index) constraint colliding mid-statement (same technique used earlier
-- this session for route_stations reordering).
update route_stations set order_index = order_index + 1000
where route_id = (select id from routes where round_type = 'morning');

update route_stations set order_index = case order_index
  when 1001 then 1   -- Kirin Hot Pot
  when 1002 then 3   -- Astrolabs
  when 1003 then 4   -- Tornado
  when 1004 then 5   -- Splendour Fields
  when 1005 then 6   -- Opposite Splendour Fields
  when 1006 then 7   -- Costa Coffee
  when 1007 then 8   -- Downstairs from Carrefour
  when 1008 then 10  -- Behind Carrefour (fruit salad gang)
  when 1009 then 11  -- Nola Open Gym
  when 1010 then 12  -- Body & Mind Ramp
  when 1011 then 13  -- Behind the Football Pitches
end
where route_id = (select id from routes where round_type = 'morning') and order_index > 1000;

insert into route_stations (route_id, station_id, order_index)
select r.id, s.id, 2 from routes r, stations s
where r.round_type = 'morning' and s.name = 'Scrappy' and s.kind = 'station';

insert into route_stations (route_id, station_id, order_index)
select r.id, s.id, 9 from routes r, stations s
where r.round_type = 'morning' and s.name = 'Meeku' and s.kind = 'station';

-- Give each cat its own dedicated stop instead of the shared station.
update cats set primary_station_id = (select id from stations where name = 'Scrappy' and kind = 'station')
where name = 'Scrappy';

update cats set primary_station_id = (select id from stations where name = 'Meeku' and kind = 'station')
where name = 'Meeku';
