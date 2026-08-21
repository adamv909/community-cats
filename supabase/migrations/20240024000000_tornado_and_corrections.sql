-- Reconciles the app against the feeding team's corrected spreadsheet
-- (cat_locations_merged_corrected_v2.xlsx). Covers: the Donner Chef -> Tornado
-- rename (both a morning station and, separately, an evening stop), a round of
-- sex/description corrections from the ground team, several station reassignments,
-- and the 8 [MERGE CHECK] items that needed human judgement to resolve (see the
-- session's reconciliation report for full reasoning on each).
--
-- Architectural tightening: primary_station_id is now reserved for genuine morning
-- stations only. Five cats (Penelope, Peter, Shadow, Smudge, Sumi) previously had it
-- pointing at an evening-only location as a convenience default — that's exactly the
-- kind of implicit coupling that caused the earlier cross-round leakage bug. They're
-- moved to the same cat_known_locations model every other evening-only cat already uses.

-- ── 1. Donner Chef -> Tornado (morning) — rename in place, same ID, so
--       route_stations and all historical station_visits/sightings stay correctly
--       attributed. Satisfies "don't retain Donner Chef as an active station."
update stations set name = 'Tornado' where name = 'Donner Chef';

-- ── 2. Evening "Tornado Station" -> "Tornado" — separate, pre-existing ID from the
--       morning station above. Same rename pattern, no route change needed.
update stations set name = 'Tornado' where name = 'Tornado Station';

-- ── 3. Morning station moves (direct, unambiguous picks from the approved list) ──
update cats set primary_station_id = (select id from stations where name = 'Body & Mind Ramp')
where name in ('Cleo', 'Tinker');

update cats set primary_station_id = (select id from stations where name = 'Astrolabs')
where name in ('Felix', 'Luna');

update cats set primary_station_id = (select id from stations where name = 'Costa Coffee')
where name = 'Peaches';

update cats set primary_station_id = (select id from stations where name = 'Splendour Fields')
where name in ('Petunia', 'Sumi');

update cats set primary_station_id = (select id from stations where name = 'Kirin Hot Pot')
where name in ('Queenie', 'Romeo', 'Ronald', 'Bruno', 'Rolo', 'Scrappy');

-- ── 4. Evening stop moves (direct) ──────────────────────────────────────────────
delete from cat_known_locations
where cat_id = (select id from cats where name = 'Oscar')
  and station_id = (select id from stations where name = 'Fruit Salad Station');
insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'Parking — Nola''s / Paddington Nursery')
from cats where name = 'Oscar';

insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'Fountain')
from cats where name = 'Ribbon';

-- ── 5. New evening-only stops (dedicated IDs, same "R Stairs"/"Kirin Hot Pot" name
--       collision with an unrelated morning station is intentional and safe — same
--       pattern already established for Tornado). Placeholder coordinates, clearly
--       flagged unverified, matching every prior new stop.
insert into stations (name, area, latitude, longitude, access_notes, kind) values
  ('Kirin Hot Pot', 'Cluster R', 25.0757, 55.1410, 'Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box. (Distinct entity from the morning station of the same name.)', 'stop'),
  ('R Stairs', 'Cluster R', 25.0757, 55.1410, 'Near the lake. Coordinates are an unverified placeholder — not yet confirmed. Evening wet-food stop only, no feeding box.', 'stop');

-- ── 6. [MERGE CHECK] resolutions ────────────────────────────────────────────────
-- Rolo & Romeo move off Odessa Station onto the new evening Kirin Hot Pot.
delete from cat_known_locations
where cat_id in (select id from cats where name in ('Rolo', 'Romeo'))
  and station_id = (select id from stations where name = 'Odessa Station');

insert into cat_known_locations (cat_id, station_id)
select c.id, (select id from stations where name = 'Kirin Hot Pot' and kind = 'stop')
from cats c where c.name in ('Rolo', 'Romeo', 'Ronald', 'Stella');

insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'R Stairs')
from cats where name = 'Pearl';

-- Penelope & Peter: the "Feeding Station Across the Road" / "Emirates Gold" values in
-- their Morning column were never real morning assignments (see architectural
-- tightening below) — both get a clean evening-only known_location instead.
insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'Feeding Station Across the Road')
from cats where name = 'Penelope';

insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'Emirates Gold')
from cats where name = 'Peter';
-- Meeku's "Car Park Cluster P" morning value is left unresolved — no confirmed feeding
-- box, reported rather than guessed. Her existing Downstairs from Carrefour morning
-- assignment is untouched.

-- ── 7. Architectural tightening: primary_station_id becomes morning-only ───────
-- Shadow and Smudge keep their long-established Emirates Gold evening spot — the
-- "Opposite Splendour Fields" value that appeared in their Morning column in the
-- corrected sheet has no supporting note and no connection to either cat; it's
-- rejected as a likely fill-down artifact (see reconciliation report).
insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'Emirates Gold')
from cats where name in ('Shadow', 'Smudge');

insert into cat_known_locations (cat_id, station_id)
select id, (select id from stations where name = 'In Front of Splendor Fields Restaurant')
from cats where name = 'Sumi';

update cats set primary_station_id = null where name in ('Penelope', 'Peter', 'Shadow', 'Smudge');
-- Sumi's primary_station_id was already updated to Splendour Fields in step 3.

-- ── 8. Sex corrections (only where explicitly given). Percy/Piper/Maple/Honey/
--       Casper/Romeo already got 'male' from the original evening-round migration
--       (20240021) — verified against the corrected sheet, no change needed there.
update cats set sex = 'male' where name in (
  'Apricot', 'Blacky', 'Bruno', 'Cherry', 'Felix', 'Mango', 'Oriel', 'Oscar', 'Ozzy',
  'Pablo', 'Paulo', 'Peno', 'Peter', 'Pickle', 'Puffer', 'Robin', 'Rolo', 'Ronald',
  'Scrappy', 'Smudge'
);
update cats set sex = 'female' where name in (
  'Cleo', 'Dolly', 'Fluffy Tail', 'Luna', 'Meeku', 'Paige', 'Pari', 'Peaches', 'Pearl',
  'Penelope', 'Petunia', 'Pixie', 'Primrose', 'Princess', 'Queenie', 'Ribbon', 'Stella',
  'Sumi', 'Tinker'
);

-- ── 9. Description corrections — short field-ID text from the ground team,
--       replacing the long web-bio text imported earlier this session. (Olive,
--       Pumpkin 2, and Sushi's "changes" in the corrected sheet were an 80-character
--       truncation artifact, not real edits — their original bios are left as-is.)
update cats set description = 'Black' where name = 'Blacky';
update cats set description = 'White with tabby patches, blue eyes' where name = 'Bruno';
update cats set description = 'White' where name = 'Casper';
update cats set description = 'Tabby, petite, skittish' where name = 'Cherry';
update cats set description = 'Tabby & White' where name = 'Cleo';
update cats set description = 'Calico, feisty' where name = 'Dolly';
update cats set description = 'Black with white and fluffy!' where name = 'Fluffy Tail';
update cats set description = 'Calico, petite, super soft' where name = 'Luna';
update cats set description = 'Orange tabby, a little wobby, friendly' where name = 'Maple';
update cats set description = 'Grey & white, hides under the cars, very scared' where name = 'Meeku';
update cats set description = 'Ginger & White, big build' where name = 'Oriel';
update cats set description = 'Ginger and a little white' where name = 'Ozzy';
update cats set description = 'White with black patches, a little scratchy at times' where name = 'Pablo';
update cats set description = 'Tortoishell' where name = 'Paige';
update cats set description = 'White with some tabby patches' where name = 'Pari';
update cats set description = 'Black & White' where name = 'Paulo';
update cats set description = 'Pale cream, long-haired, folded ear' where name = 'Pearl';
update cats set description = 'Calico' where name = 'Penelope';
update cats set description = 'White with some black' where name = 'Peno';
update cats set description = 'Tabby' where name = 'Peter';
update cats set description = 'Tortoiseshell, petite' where name = 'Petunia';
update cats set description = 'Petite, ginger & white, friends with Percy' where name = 'Pickle';
update cats set description = 'White & Tabby' where name = 'Piper';
update cats set description = 'Tiny white with grey patches, female' where name = 'Pixie';
update cats set description = 'Tabby' where name = 'Primrose';
update cats set description = 'Tortoiseshell, petite, friends with Paige' where name = 'Princess';
update cats set description = 'Black which a white patch, scarred skin' where name = 'Puffer';
update cats set description = 'Tabby which a kink in her tail' where name = 'Queenie';
update cats set description = 'Light tabby' where name = 'Ribbon';
update cats set description = 'White, with tabby patches, lovely green eyes' where name = 'Robin';
update cats set description = 'Dark brown tabby, white paws, very shy' where name = 'Rolo';
update cats set description = 'Ginger & white, very friendly' where name = 'Romeo';
update cats set description = 'Tuxedo cat' where name = 'Ronald';
update cats set description = 'Black cat' where name = 'Smudge';
update cats set description = 'Tortoishell' where name = 'Tinker';

-- ── 10. Evening route_stations: shift everything down by 2, insert the new
--        Cluster R block at the start (mirrors the morning route leading with R).
--        Two-step offset avoids colliding with the unique (route_id, order_index)
--        constraint mid-update (a single +2 update hits it: row 1 -> 3 collides with
--        the existing row 3 before that row has been shifted itself).
update route_stations
set order_index = order_index + 1000
where route_id = (select id from routes where round_type = 'evening');
update route_stations
set order_index = order_index - 998
where route_id = (select id from routes where round_type = 'evening');

insert into route_stations (route_id, station_id, order_index)
select (select id from routes where round_type = 'evening'),
       (select id from stations where name = 'Kirin Hot Pot' and kind = 'stop'), 1;
insert into route_stations (route_id, station_id, order_index)
select (select id from routes where round_type = 'evening'),
       (select id from stations where name = 'R Stairs'), 2;
