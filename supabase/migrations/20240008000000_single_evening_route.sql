-- Replace the 3 cluster routes with one single Evening Round covering all 11 stations
-- Volunteers do all stations in one go, north to south (R → Q → P/O → O)

delete from public.route_stations;
delete from public.routes;

insert into public.routes (id, name, description) values
  ('33333333-0003-0003-0003-000000000001', 'Evening Round', 'All 11 stations — Clusters R, Q, P and O');

insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000001', 1),   -- Cluster R: Kirin Hot Pot
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000002', 2),   -- Cluster R: Astrolabs
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000011', 3),   -- Cluster Q: Donner Chef
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000003', 4),   -- Cluster Q: Splendour Fields
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000009', 5),   -- Cluster Q: Opposite Splendour Fields
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000004', 6),   -- Cluster P: Costa Coffee
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000006', 7),   -- Cluster P: Downstairs from Carrefour
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000010', 8),   -- Cluster P: Behind Carrefour
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000005', 9),   -- Cluster P: Nola Open Gym
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000007', 10),  -- Cluster P/O: Body & Mind Ramp
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000008', 11);  -- Cluster O: Behind Football Pitches
