-- Replace placeholder station names/areas with the validated JLT feeding station list
-- Removes seed cats/routes from migration 20240005 and replaces with correct data

-- ── Clear seed data from migration 20240005 ───────────────────────────────────
delete from public.route_stations;
delete from public.routes;
delete from public.cats;

-- ── Update existing 10 stations with validated names and areas ────────────────
update public.stations set name = 'Kirin Hot Pot',                          area = 'Cluster R'   where id = '11111111-0001-0001-0001-000000000001';
update public.stations set name = 'Astrolabs',                              area = 'Cluster R'   where id = '11111111-0001-0001-0001-000000000002';
update public.stations set name = 'Splendour Fields',                       area = 'Cluster Q'   where id = '11111111-0001-0001-0001-000000000003';
update public.stations set name = 'Costa Coffee',                           area = 'Cluster P'   where id = '11111111-0001-0001-0001-000000000004';
update public.stations set name = 'Nola Open Gym',                          area = 'Cluster P'   where id = '11111111-0001-0001-0001-000000000005';
update public.stations set name = 'Downstairs from Carrefour',              area = 'Cluster P'   where id = '11111111-0001-0001-0001-000000000006';
update public.stations set name = 'Body & Mind Ramp',                       area = 'Cluster P/O' where id = '11111111-0001-0001-0001-000000000007';
update public.stations set name = 'Behind the Football Pitches',            area = 'Cluster O'   where id = '11111111-0001-0001-0001-000000000008';
update public.stations set name = 'Opposite Splendour Fields',              area = 'Cluster Q'   where id = '11111111-0001-0001-0001-000000000009';
update public.stations set name = 'Behind Carrefour (fruit salad gang)',    area = 'Cluster P'   where id = '11111111-0001-0001-0001-000000000010';

-- ── Add the 11th station (Cluster Q - Donner Chef) ───────────────────────────
-- Coordinates are approximate — update via admin panel once confirmed
insert into public.stations (id, name, area, latitude, longitude) values
  ('11111111-0001-0001-0001-000000000011', 'Donner Chef', 'Cluster Q', 25.0758, 55.1467);

-- ── Re-insert cats mapped to validated stations ───────────────────────────────

-- Cluster R
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000001', 'Stella',   'Grey tabby, white chest, very friendly',    '11111111-0001-0001-0001-000000000001', 'active'),
  ('22222222-0002-0002-0002-000000000002', 'Queenie',  'Tortoiseshell, large build, bold',          '11111111-0001-0001-0001-000000000002', 'active'),
  ('22222222-0002-0002-0002-000000000003', 'Bruno',    'Large ginger and white, scarred right ear', '11111111-0001-0001-0001-000000000002', 'active');

-- Cluster Q
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000004', 'Rolo',     'Dark brown tabby, white paws',              '11111111-0001-0001-0001-000000000011', 'active'),
  ('22222222-0002-0002-0002-000000000005', 'Honey',    'Golden tabby, very vocal',                  '11111111-0001-0001-0001-000000000011', 'active'),
  ('22222222-0002-0002-0002-000000000006', 'Ribbon',   'Black and white, ribbon-like white stripe', '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000007', 'Romeo',    'Slim black cat, very shy',                  '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000008', 'Felix',    'Classic black and white, friendly',         '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000009', 'Luna',     'All white, blue eyes, deaf',                '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000010', 'Pearl',    'Pale cream, long-haired',                   '11111111-0001-0001-0001-000000000009', 'active'),
  ('22222222-0002-0002-0002-000000000011', 'Princess', 'Grey, petite, one eye',                     '11111111-0001-0001-0001-000000000009', 'active');

-- Cluster P
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000012', 'Maple',    'Orange tabby, fluffy tail',                 '11111111-0001-0001-0001-000000000004', 'active'),
  ('22222222-0002-0002-0002-000000000013', 'Apricot',  'Pale ginger, fluffy',                       '11111111-0001-0001-0001-000000000004', 'active'),
  ('22222222-0002-0002-0002-000000000014', 'Mango',    'Orange and white, playful',                 '11111111-0001-0001-0001-000000000006', 'active'),
  ('22222222-0002-0002-0002-000000000015', 'Cherry',   'Tortoiseshell, petite, skittish',           '11111111-0001-0001-0001-000000000006', 'active'),
  ('22222222-0002-0002-0002-000000000016', 'Pablo',    'Tuxedo cat, white blaze',                   '11111111-0001-0001-0001-000000000010', 'active'),
  ('22222222-0002-0002-0002-000000000017', 'Pixie',    'Tiny grey female, notched ear (TNR)',       '11111111-0001-0001-0001-000000000010', 'active'),
  ('22222222-0002-0002-0002-000000000018', 'Meeku',    'Calico, small, often seen with Scrappy',    '11111111-0001-0001-0001-000000000005', 'active'),
  ('22222222-0002-0002-0002-000000000019', 'Oscar',    'Ginger tom, chunky build, confident',       '11111111-0001-0001-0001-000000000005', 'active'),
  ('22222222-0002-0002-0002-000000000020', 'Scrappy',  'Scruffy grey and white, very friendly',     '11111111-0001-0001-0001-000000000005', 'active');

-- Cluster P/O and O
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000021', 'Peaches',  'Pale ginger, round face',                   '11111111-0001-0001-0001-000000000007', 'active'),
  ('22222222-0002-0002-0002-000000000022', 'Percy',    'Striped tabby, long whiskers',              '11111111-0001-0001-0001-000000000007', 'active'),
  ('22222222-0002-0002-0002-000000000023', 'Pickle',   'Dark tabby, very skittish',                 '11111111-0001-0001-0001-000000000008', 'active'),
  ('22222222-0002-0002-0002-000000000024', 'Puma',     'All black, sleek, fast',                    '11111111-0001-0001-0001-000000000008', 'active');

-- ── Routes ────────────────────────────────────────────────────────────────────
insert into public.routes (id, name, description) values
  ('33333333-0003-0003-0003-000000000001', 'Cluster R',    'Kirin Hot Pot and Astrolabs'),
  ('33333333-0003-0003-0003-000000000002', 'Cluster Q',    'Donner Chef, Splendour Fields and Opposite Splendour Fields'),
  ('33333333-0003-0003-0003-000000000003', 'Cluster P / O','Costa Coffee, Carrefour, Nola, Body & Mind and Football Pitches');

-- ── Route stations ────────────────────────────────────────────────────────────

-- Cluster R (2 stations)
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000001', 1),  -- Kirin Hot Pot
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000002', 2);  -- Astrolabs

-- Cluster Q (3 stations)
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000011', 1),  -- Donner Chef
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000003', 2),  -- Splendour Fields
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000009', 3);  -- Opposite Splendour Fields

-- Cluster P / O (6 stations)
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000004', 1),  -- Costa Coffee
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000006', 2),  -- Downstairs from Carrefour
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000010', 3),  -- Behind Carrefour
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000005', 4),  -- Nola Open Gym
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000007', 5),  -- Body & Mind Ramp
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000008', 6);  -- Behind Football Pitches
