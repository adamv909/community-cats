-- Corrects a bug in the previous migration: reusing an existing morning station's id for
-- an evening stop (e.g. "Behind the Football Pitches" for "Football Station") meant ANY
-- cat whose morning primary_station_id happened to be that station showed up at the
-- evening stop too — even cats the evening data doesn't place there. For example Cleo and
-- Tinker's morning primary is "Behind the Football Pitches", so they incorrectly appeared
-- at the evening "Football Station" alongside Ozzy/Oriel, despite the source data placing
-- them at "Kulcha King / Bridge" instead.
--
-- Fix: give the 5 previously-reused evening stops their own dedicated station rows,
-- fully decoupled from the morning stations they overlap with geographically. This also
-- better matches the user's explicit request to treat evening "stops" as their own
-- concept, not the same records as morning "stations".

insert into stations (name, area, latitude, longitude, access_notes, kind) values
  ('Football Station', 'Cluster O', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Fruit Salad Station', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Carrefour / Nola''s Area', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Costa / Soon', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Splendor Fields Station / Running Track', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop');

-- Repoint the Evening Round's route_stations at the new dedicated stops
update route_stations set station_id = (select id from stations where name = 'Football Station')
where route_id = (select id from routes where round_type = 'evening')
  and station_id = (select id from stations where name = 'Behind the Football Pitches');

update route_stations set station_id = (select id from stations where name = 'Fruit Salad Station')
where route_id = (select id from routes where round_type = 'evening')
  and station_id = (select id from stations where name = 'Behind Carrefour (fruit salad gang)');

update route_stations set station_id = (select id from stations where name = 'Carrefour / Nola''s Area')
where route_id = (select id from routes where round_type = 'evening')
  and station_id = (select id from stations where name = 'Downstairs from Carrefour');

update route_stations set station_id = (select id from stations where name = 'Costa / Soon')
where route_id = (select id from routes where round_type = 'evening')
  and station_id = (select id from stations where name = 'Costa Coffee');

update route_stations set station_id = (select id from stations where name = 'Splendor Fields Station / Running Track')
where route_id = (select id from routes where round_type = 'evening')
  and station_id = (select id from stations where name = 'Splendour Fields');

-- Drop the 5 known_locations rows from the previous migration that pointed at the old
-- (morning) station ids for these groups — they need to point at the new dedicated ids.
delete from cat_known_locations
where (cat_id, station_id) in (
  select c.id, s.id from cats c, stations s where c.name = 'Oscar' and s.name = 'Behind Carrefour (fruit salad gang)'
  union all select c.id, s.id from cats c, stations s where c.name = 'Mango' and s.name = 'Downstairs from Carrefour'
  union all select c.id, s.id from cats c, stations s where c.name = 'Maple' and s.name = 'Splendour Fields'
  union all select c.id, s.id from cats c, stations s where c.name = 'Honey' and s.name = 'Splendour Fields'
  union all select c.id, s.id from cats c, stations s where c.name = 'Peaches' and s.name = 'Costa Coffee'
);

-- Every cat in these 5 groups now needs an explicit known_location at the new dedicated
-- stop, since none of them can rely on primary_station_id (which still correctly points
-- at their separate morning station).
insert into cat_known_locations (cat_id, station_id)
select c.id, s.id from cats c, stations s where c.name = 'Ozzy' and s.name = 'Football Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Oriel' and s.name = 'Football Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Oscar' and s.name = 'Fruit Salad Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Fluffy Tail' and s.name = 'Fruit Salad Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Apricot' and s.name = 'Fruit Salad Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Cherry' and s.name = 'Fruit Salad Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Blacky' and s.name = 'Carrefour / Nola''s Area'
union all select c.id, s.id from cats c, stations s where c.name = 'Puffer' and s.name = 'Carrefour / Nola''s Area'
union all select c.id, s.id from cats c, stations s where c.name = 'Mango' and s.name = 'Carrefour / Nola''s Area'
union all select c.id, s.id from cats c, stations s where c.name = 'Pablo' and s.name = 'Costa / Soon'
union all select c.id, s.id from cats c, stations s where c.name = 'Peaches' and s.name = 'Costa / Soon'
union all select c.id, s.id from cats c, stations s where c.name = 'Casper' and s.name = 'Splendor Fields Station / Running Track'
union all select c.id, s.id from cats c, stations s where c.name = 'Peno' and s.name = 'Splendor Fields Station / Running Track'
union all select c.id, s.id from cats c, stations s where c.name = 'Maple' and s.name = 'Splendor Fields Station / Running Track'
union all select c.id, s.id from cats c, stations s where c.name = 'Honey' and s.name = 'Splendor Fields Station / Running Track';
