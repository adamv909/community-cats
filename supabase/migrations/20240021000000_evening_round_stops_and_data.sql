-- Evening wet-food round: replaces the placeholder "same 11 stations as morning" setup
-- with the real, finer-grained set of evening feeding stops supplied by the group leader,
-- and adds the structured cat fields (sex, feeding instructions, safety notes) needed to
-- carry per-cat operational warnings through to the round UI.
--
-- Cross-referenced against the existing cat DB and the external directory site before
-- writing this: Blackie/Fluffy/Paolo/Buster all resolve to existing cats (Blacky, Fluffy
-- Tail, Paulo, Robin — name variants, not new cats). Shadow and Sumi are genuinely new;
-- the external site does have an unrelated already-homed cat also named "Shadow", so no
-- photo is assigned to either (see fetchCatsByStation / CatCard changes in the same PR).

-- ── 1. Structured cat fields ─────────────────────────────────────────────
alter table cats add column if not exists sex text;
alter table cats add column if not exists feeding_instructions text;
alter table cats add column if not exists safety_notes text;

-- ── 2. Station "kind" — box station (morning) vs. hand-fed stop (evening) ─
alter table stations add column if not exists kind text not null default 'station';
alter table stations add constraint stations_kind_check check (kind in ('station', 'stop'));

-- ── 3. New evening-only stops (no existing station cleanly represents these —
--       the source data splits several existing single stations, e.g. "Donner Chef"
--       and "Nola Open Gym", across multiple distinct evening stops) ─────────────
insert into stations (name, area, latitude, longitude, access_notes, kind) values
  ('Kulcha King / Bridge', 'Cluster O', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Fountain', 'Cluster O', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Gazebo', 'Cluster O', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Parking — Nola''s / Paddington Nursery', 'Cluster P', 25.0757, 55.1410, 'Enter between Nola''s and Paddington Nursery and check along the right-hand side. Coordinates are an unverified placeholder. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Nola''s', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Soon Restaurant / Outdoor Gym', 'Cluster P', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Tornado Station', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Q Parking', 'Cluster Q', 25.0757, 55.1410, 'Enter the parking from the Tornado Barber side. The cat is in the building on the left, inside the doors. Coordinates are an unverified placeholder. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Q Fountain', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Upstairs by Q Carrefour', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Odessa Station', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('In Front of Splendor Fields Restaurant', 'Cluster Q', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop'),
  ('Feeding Station Across the Road', 'Across the Road', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop');

-- ── 4. New cats ───────────────────────────────────────────────────────────
-- Shadow: distinct from the unrelated already-homed "Shadow" on the external directory
-- site — no reliable photo available, left blank per the task's own instruction.
insert into cats (name, description, health_notes, primary_station_id, status, is_active, is_provisional)
values (
  'Shadow', 'Plain black', 'Missing part of her foot',
  (select id from stations where name = 'Emirates Gold'),
  'active', true, false
);

insert into cats (name, description, primary_station_id, status, is_active, is_provisional)
values (
  'Sumi', 'Fluffy grey and white',
  (select id from stations where name = 'In Front of Splendor Fields Restaurant'),
  'active', true, false
);

-- ── 5. Structured fields on existing cats (only where explicitly given) ────
update cats set feeding_instructions = 'Leave food and water even if she is not present.' where name = 'Meeku';
update cats set feeding_instructions = 'Dry food only — do not give wet food, despite this being the evening wet food round.' where name = 'Paulo';
update cats set safety_notes = 'Can be a little aggressive. Exercise caution.' where name = 'Pablo';
update cats set health_notes = 'Has some skin issues.' where name = 'Puffer';

update cats set sex = 'male' where name in ('Percy', 'Piper', 'Maple', 'Honey', 'Casper', 'Romeo');

-- ── 6. Penelope: the group leader's data separates her from Emirates Gold into her own
--       stop — correcting a placeholder from the earlier Emirates Gold migration. Emirates
--       Gold isn't part of the morning round, so this has no effect there.
update cats set primary_station_id = (select id from stations where name = 'Feeding Station Across the Road')
where name = 'Penelope';

-- ── 7. Evening-round known locations for existing cats whose evening stop differs from
--       their morning primary_station_id (left untouched, so the morning round is
--       unaffected). Cats whose evening stop already equals their existing primary
--       don't need a row here — fetchCatsByStation checks both.
insert into cat_known_locations (cat_id, station_id)
select c.id, s.id from cats c, stations s where c.name = 'Tinker' and s.name = 'Kulcha King / Bridge'
union all select c.id, s.id from cats c, stations s where c.name = 'Cleo' and s.name = 'Kulcha King / Bridge'
union all select c.id, s.id from cats c, stations s where c.name = 'Dolly' and s.name = 'Fountain'
union all select c.id, s.id from cats c, stations s where c.name = 'Robin' and s.name = 'Fountain'
union all select c.id, s.id from cats c, stations s where c.name = 'Primrose' and s.name = 'Gazebo'
union all select c.id, s.id from cats c, stations s where c.name = 'Oscar' and s.name = 'Behind Carrefour (fruit salad gang)'
union all select c.id, s.id from cats c, stations s where c.name = 'Mango' and s.name = 'Downstairs from Carrefour'
union all select c.id, s.id from cats c, stations s where c.name = 'Meeku' and s.name = 'Parking — Nola''s / Paddington Nursery'
union all select c.id, s.id from cats c, stations s where c.name = 'Paulo' and s.name = 'Nola''s'
union all select c.id, s.id from cats c, stations s where c.name = 'Pixie' and s.name = 'Nola''s'
union all select c.id, s.id from cats c, stations s where c.name = 'Pickle' and s.name = 'Soon Restaurant / Outdoor Gym'
union all select c.id, s.id from cats c, stations s where c.name = 'Percy' and s.name = 'Soon Restaurant / Outdoor Gym'
union all select c.id, s.id from cats c, stations s where c.name = 'Peaches' and s.name = 'Costa Coffee'
union all select c.id, s.id from cats c, stations s where c.name = 'Paige' and s.name = 'Tornado Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Pari' and s.name = 'Tornado Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Princess' and s.name = 'Tornado Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Piper' and s.name = 'Tornado Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Scrappy' and s.name = 'Q Parking'
union all select c.id, s.id from cats c, stations s where c.name = 'Luna' and s.name = 'Q Fountain'
union all select c.id, s.id from cats c, stations s where c.name = 'Felix' and s.name = 'Q Fountain'
union all select c.id, s.id from cats c, stations s where c.name = 'Bruno' and s.name = 'Upstairs by Q Carrefour'
union all select c.id, s.id from cats c, stations s where c.name = 'Queenie' and s.name = 'Upstairs by Q Carrefour'
union all select c.id, s.id from cats c, stations s where c.name = 'Romeo' and s.name = 'Odessa Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Rolo' and s.name = 'Odessa Station'
union all select c.id, s.id from cats c, stations s where c.name = 'Maple' and s.name = 'Splendour Fields'
union all select c.id, s.id from cats c, stations s where c.name = 'Honey' and s.name = 'Splendour Fields'
union all select c.id, s.id from cats c, stations s where c.name = 'Petunia' and s.name = 'In Front of Splendor Fields Restaurant';

-- ── 8. Rebuild Evening Round's route_stations to the real evening stop order ────
delete from route_stations
where route_id = (select id from routes where round_type = 'evening');

with evening_route as (
  select id from routes where round_type = 'evening'
),
ordered_stops (name, idx) as (
  values
    ('Kulcha King / Bridge', 1),
    ('Fountain', 2),
    ('Gazebo', 3),
    ('Behind the Football Pitches', 4),
    ('Behind Carrefour (fruit salad gang)', 5),
    ('Downstairs from Carrefour', 6),
    ('Parking — Nola''s / Paddington Nursery', 7),
    ('Nola''s', 8),
    ('Soon Restaurant / Outdoor Gym', 9),
    ('Costa Coffee', 10),
    ('Tornado Station', 11),
    ('Q Parking', 12),
    ('Q Fountain', 13),
    ('Upstairs by Q Carrefour', 14),
    ('Odessa Station', 15),
    ('Splendour Fields', 16),
    ('In Front of Splendor Fields Restaurant', 17),
    ('Feeding Station Across the Road', 18),
    ('Emirates Gold', 19)
)
insert into route_stations (route_id, station_id, order_index)
select (select id from evening_route), s.id, o.idx
from ordered_stops o
join stations s on s.name = o.name;

-- ── 9. Route description ─────────────────────────────────────────────────
update routes set description = 'Wet food + water — 19 feeding stops'
where round_type = 'evening';
