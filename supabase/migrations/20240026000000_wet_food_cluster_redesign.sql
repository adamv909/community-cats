-- Redesigns the Wet Food (evening) round from 21 individual stops to 5 geographical
-- clusters (O, P, Q, R, Emirates Gold). Each cluster has a lightweight "areas to cover"
-- checklist (the old stop names, now just navigation prompts) and one consolidated cat
-- list. Cats are now tracked at cluster level via a new wet_food_cluster_id column,
-- separate from primary_station_id (Dry Food Round) which is untouched.
--
-- Nothing historical is deleted: the 21 old stop rows and every existing
-- cat_known_locations row stay in the database exactly as they were — they simply stop
-- being referenced by the Wet Food Round's route_stations.
--
-- Renames "Morning Round"/"Evening Round" to "Dry Food Round"/"Wet Food Round" (data
-- only — round_type stays 'morning'/'evening' internally, nothing displays that value
-- directly). Retires Mango and Puma (adopted) via the existing is_active/status
-- mechanism, same as every other status change this session.

-- ── 1. Schema: cluster grouping + cat cluster assignment ────────────────────────
alter table stations add column if not exists cluster_id uuid references stations(id);
alter table stations drop constraint if exists stations_kind_check;
alter table stations add constraint stations_kind_check check (kind in ('station', 'stop', 'cluster'));
alter table cats add column if not exists wet_food_cluster_id uuid references stations(id);

-- ── 2. The 5 cluster rows (kind='cluster', cluster_id null — they ARE the clusters) ──
insert into stations (name, area, latitude, longitude, access_notes, kind) values
  ('O Cluster', 'Cluster O', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Wet Food Round cluster — see areas to cover within it.', 'cluster'),
  ('P Cluster', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Wet Food Round cluster — see areas to cover within it.', 'cluster'),
  ('Q Cluster', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Wet Food Round cluster — see areas to cover within it.', 'cluster'),
  ('R Cluster', 'Cluster R', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Wet Food Round cluster — see areas to cover within it.', 'cluster'),
  ('Emirates Gold', 'Emirates Gold', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Wet Food Round cluster — see areas to cover within it.', 'cluster');

-- ── 3. Emirates Gold's two areas: rename one existing stop, add one new dual-entity ──
update stations set name = 'Over the Road' where name = 'Feeding Station Across the Road';

insert into stations (name, area, latitude, longitude, access_notes, kind) values
  ('Opposite Splendour Fields', 'Emirates Gold', 25.0757, 55.1410, 'Coordinates are an unverified placeholder. Evening wet-food area only, no feeding box. (Distinct entity from the morning station of the same name.)', 'stop');

-- ── 4. Group existing area-stops under their cluster ─────────────────────────────
update stations set cluster_id = (select id from stations where name = 'O Cluster')
where name in ('Kulcha King / Bridge', 'Fountain', 'Gazebo', 'Football Station');

update stations set cluster_id = (select id from stations where name = 'P Cluster')
where name in (
  'Fruit Salad Station', 'Carrefour / Nola''s Area', 'Parking — Nola''s / Paddington Nursery',
  'Nola''s', 'Soon Restaurant / Outdoor Gym', 'Costa / Soon',
  'In Front of Splendor Fields Restaurant' -- reclassified from its old Cluster Q grouping per the new mapping
);

update stations set cluster_id = (select id from stations where name = 'Q Cluster')
where name in (
  'Tornado', 'Q Parking', 'Q Fountain', 'Upstairs by Q Carrefour', 'Odessa Station',
  'Splendor Fields Station / Running Track'
) and kind = 'stop';

update stations set cluster_id = (select id from stations where name = 'R Cluster')
where name in ('Kirin Hot Pot', 'R Stairs') and kind = 'stop';

update stations set cluster_id = (select id from stations where name = 'Emirates Gold' and kind = 'cluster')
where name in ('Opposite Splendour Fields', 'Over the Road') and kind = 'stop';

-- ── 5. Rebuild Wet Food Round's route_stations: 21 stops -> 5 clusters ───────────
delete from route_stations
where route_id = (select id from routes where round_type = 'evening');

with evening_route as (select id from routes where round_type = 'evening'),
ordered_clusters (name, idx) as (
  values ('O Cluster', 1), ('P Cluster', 2), ('Q Cluster', 3), ('R Cluster', 4), ('Emirates Gold', 5)
)
insert into route_stations (route_id, station_id, order_index)
select (select id from evening_route), s.id, o.idx
from ordered_clusters o join stations s on s.name = o.name and s.kind = 'cluster';

-- ── 6. Rename rounds (data only) ─────────────────────────────────────────────────
update routes set name = 'Dry Food Round', description = 'Dry food + water — all 11 stations'
where round_type = 'morning';
update routes set name = 'Wet Food Round', description = 'Wet food + water — 5 clusters'
where round_type = 'evening';

-- ── 7. Retire adopted cats — existing is_active/status mechanism, no hard delete ──
update cats set status = 'homed', is_active = false where name in ('Mango', 'Puma');

-- ── 8. Cat -> Wet Food Round cluster assignments ─────────────────────────────────
-- Ribbon and Ronald's placements below are the group's current best-guess pending
-- confirmation (see session notes) — ordinary UPDATE statements, trivially editable
-- in a follow-up migration once corrected, no special handling needed.
update cats set wet_food_cluster_id = (select id from stations where name = 'O Cluster')
where name in ('Cleo', 'Dolly', 'Oriel', 'Ozzy', 'Primrose', 'Ribbon', 'Robin', 'Tinker');

update cats set wet_food_cluster_id = (select id from stations where name = 'P Cluster')
where name in (
  'Apricot', 'Blacky', 'Cherry', 'Fluffy Tail', 'Meeku', 'Oscar', 'Pablo', 'Paulo',
  'Peaches', 'Percy', 'Petunia', 'Pickle', 'Pixie', 'Puffer', 'Sumi'
);

update cats set wet_food_cluster_id = (select id from stations where name = 'Q Cluster')
where name in (
  'Bruno', 'Casper', 'Felix', 'Honey', 'Luna', 'Maple', 'Paige', 'Pari', 'Peno',
  'Piper', 'Princess', 'Queenie', 'Rolo', 'Romeo', 'Ronald', 'Scrappy'
);

update cats set wet_food_cluster_id = (select id from stations where name = 'R Cluster')
where name in ('Pearl', 'Stella');

update cats set wet_food_cluster_id = (select id from stations where name = 'Emirates Gold' and kind = 'cluster')
where name in ('Peter', 'Penelope', 'Shadow', 'Smudge');
