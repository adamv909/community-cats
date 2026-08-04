-- Replace placeholder station data with real JLT feeding station locations
-- Coordinates extracted from the JLT Cat Feeding Stations Google My Maps

-- Clear existing placeholder data (cascades to route_stations)
truncate public.route_stations cascade;
truncate public.routes cascade;
truncate public.cats cascade;
truncate public.cat_known_locations cascade;
truncate public.stations cascade;

-- Real stations with accurate coordinates
-- Area names set to 'JLT' as placeholder — update via admin panel once built
insert into public.stations (id, name, area, latitude, longitude) values
  ('11111111-0001-0001-0001-000000000001', 'Station 1 - Kirin Hot Pot',          'Cluster R', 25.0769437, 55.1465971),
  ('11111111-0001-0001-0001-000000000002', 'Station 2 - Donner Chef',             'Cluster R', 25.0760941, 55.1466506),
  ('11111111-0001-0001-0001-000000000003', 'Station 3 - Next to Splendour Fields','Cluster Q', 25.0754663, 55.1470100),
  ('11111111-0001-0001-0001-000000000004', 'Station 4 - Costa Coffee',            'Cluster Q', 25.0755493, 55.1458062),
  ('11111111-0001-0001-0001-000000000005', 'Station 5 - Nola / Open Gym',         'Cluster Q', 25.0744161, 55.1456842),
  ('11111111-0001-0001-0001-000000000006', 'Station 6 - Nola',                    'Cluster P', 25.0743836, 55.1450683),
  ('11111111-0001-0001-0001-000000000007', 'Station 7 - Body & Mind',             'Cluster P', 25.0739994, 55.1444943),
  ('11111111-0001-0001-0001-000000000008', 'Station 8 - Football Field',          'Cluster S', 25.0734530, 55.1452179),
  ('11111111-0001-0001-0001-000000000009', 'Station 9 - Across the Road',         'Cluster S', 25.0745251, 55.1469869),
  ('11111111-0001-0001-0001-000000000010', 'Station 10 - New Station',            'Cluster S', 25.0747884, 55.1442829);
