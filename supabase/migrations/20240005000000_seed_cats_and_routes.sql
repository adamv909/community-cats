-- Seed cats and routes using the real 10 JLT station IDs
-- Station IDs come from migration 20240002; areas updated in 20240003/20240004

-- ── Cats ──────────────────────────────────────────────────────────────────────
-- Cluster R cats (stations 1–2)
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000001', 'Stella',   'Grey tabby, white chest, very friendly',       '11111111-0001-0001-0001-000000000001', 'active'),
  ('22222222-0002-0002-0002-000000000002', 'Queenie',  'Tortoiseshell, large build, bold',             '11111111-0001-0001-0001-000000000002', 'active'),
  ('22222222-0002-0002-0002-000000000003', 'Bruno',    'Large ginger and white, scarred right ear',    '11111111-0001-0001-0001-000000000002', 'active');

-- Cluster Q cats (stations 3–5)
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000004', 'Ribbon',   'Black and white, ribbon-like white stripe',    '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000005', 'Romeo',    'Slim black cat, very shy',                     '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000006', 'Felix',    'Classic black and white, friendly',            '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000007', 'Luna',     'All white, blue eyes, deaf',                   '11111111-0001-0001-0001-000000000003', 'active'),
  ('22222222-0002-0002-0002-000000000008', 'Rolo',     'Dark brown tabby, white paws',                 '11111111-0001-0001-0001-000000000004', 'active'),
  ('22222222-0002-0002-0002-000000000009', 'Honey',    'Golden tabby, very vocal',                     '11111111-0001-0001-0001-000000000004', 'active'),
  ('22222222-0002-0002-0002-000000000010', 'Pearl',    'Pale cream, long-haired',                      '11111111-0001-0001-0001-000000000005', 'active'),
  ('22222222-0002-0002-0002-000000000011', 'Princess', 'Grey, petite, one eye',                        '11111111-0001-0001-0001-000000000005', 'active'),
  ('22222222-0002-0002-0002-000000000012', 'Maple',    'Orange tabby, fluffy tail',                    '11111111-0001-0001-0001-000000000005', 'active'),
  ('22222222-0002-0002-0002-000000000013', 'Apricot',  'Pale ginger, fluffy',                          '11111111-0001-0001-0001-000000000005', 'active');

-- Cluster P cats (stations 6–10)
insert into public.cats (id, name, description, primary_station_id, status) values
  ('22222222-0002-0002-0002-000000000014', 'Mango',    'Orange and white, playful',                    '11111111-0001-0001-0001-000000000006', 'active'),
  ('22222222-0002-0002-0002-000000000015', 'Cherry',   'Tortoiseshell, petite, skittish',              '11111111-0001-0001-0001-000000000006', 'active'),
  ('22222222-0002-0002-0002-000000000016', 'Pablo',    'Tuxedo cat, white blaze',                      '11111111-0001-0001-0001-000000000007', 'active'),
  ('22222222-0002-0002-0002-000000000017', 'Pixie',    'Tiny grey female, notched ear (TNR)',          '11111111-0001-0001-0001-000000000007', 'active'),
  ('22222222-0002-0002-0002-000000000018', 'Peaches',  'Pale ginger, round face',                      '11111111-0001-0001-0001-000000000008', 'active'),
  ('22222222-0002-0002-0002-000000000019', 'Percy',    'Striped tabby, long whiskers',                 '11111111-0001-0001-0001-000000000008', 'active'),
  ('22222222-0002-0002-0002-000000000020', 'Pickle',   'Dark tabby, very skittish',                    '11111111-0001-0001-0001-000000000009', 'active'),
  ('22222222-0002-0002-0002-000000000021', 'Puma',     'All black, sleek, fast',                       '11111111-0001-0001-0001-000000000009', 'active'),
  ('22222222-0002-0002-0002-000000000022', 'Meeku',    'Calico, small, often seen with Scrappy',       '11111111-0001-0001-0001-000000000010', 'active'),
  ('22222222-0002-0002-0002-000000000023', 'Oscar',    'Ginger tom, chunky build, confident',          '11111111-0001-0001-0001-000000000010', 'active'),
  ('22222222-0002-0002-0002-000000000024', 'Scrappy',  'Scruffy grey and white, very friendly',        '11111111-0001-0001-0001-000000000010', 'active');

-- ── Routes ────────────────────────────────────────────────────────────────────
insert into public.routes (id, name, description) values
  ('33333333-0003-0003-0003-000000000001', 'Cluster R', 'Kirin Hot Pot and Donner Chef area'),
  ('33333333-0003-0003-0003-000000000002', 'Cluster Q', 'Splendour Fields, Costa Coffee and Nola/Open Gym'),
  ('33333333-0003-0003-0003-000000000003', 'Cluster P', 'Nola, Body & Mind, Football Field and south stations');

-- ── Route stations ────────────────────────────────────────────────────────────

-- Cluster R: 2 stations
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000001', 1),
  ('33333333-0003-0003-0003-000000000001', '11111111-0001-0001-0001-000000000002', 2);

-- Cluster Q: 3 stations
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000003', 1),
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000004', 2),
  ('33333333-0003-0003-0003-000000000002', '11111111-0001-0001-0001-000000000005', 3);

-- Cluster P: 5 stations
insert into public.route_stations (route_id, station_id, order_index) values
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000006', 1),
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000007', 2),
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000008', 3),
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000009', 4),
  ('33333333-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000010', 5);
