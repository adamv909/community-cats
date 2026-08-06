-- Best-effort remap of primary_station_id using real location text scraped from the admin's
-- Cat Support directory (dream-team-jlt.vercel.app/cats). Cross-checking our seeded
-- assignments against it showed several cats in the wrong cluster entirely (Bruno, Maple,
-- Pearl, Pickle, Puma, Queenie, Ribbon), not just missing photos.
--
-- Confidence varies per cat — some match a station name directly (Pablo/Costa Coffee,
-- Percy+Pixie/Nola Open Gym, Apricot+Cherry+Mango/"fruit salad gang"), others only had a
-- cluster with no specific landmark and are a low-confidence guess (Pearl, Ribbon, Puma).
-- This is a starting point for manual sanity-check, not a final answer — see conversation
-- for the per-cat confidence/reasoning table.
--
-- Left unchanged (no confident match, or already correct):
--   Peaches  — "Soon Restaurant" not one of our stations
--   Scrappy  — "Saba Tower 3" not one of our stations
--   Felix, Luna — bio says "between Clusters R and Q", genuinely ambiguous
--   Honey    — already Donner Chef (Cluster Q), matches
--   Rolo     — real directory marks him MISSING (last seen June 2026), not an active
--              feeding cat at all; left as-is pending a decision on is_active
--   Stella   — no matching name in the real directory; likely fictional seed data

update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000010' where name = 'Apricot';   -- Behind Carrefour (fruit salad gang) — explicit gang membership
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000011' where name = 'Bruno';     -- Donner Chef — low confidence, no Q-cluster Carrefour station exists
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000010' where name = 'Cherry';    -- Behind Carrefour (fruit salad gang) — explicit gang membership
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000010' where name = 'Mango';     -- Behind Carrefour (fruit salad gang) — "original of the fruit salad gang"
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000011' where name = 'Maple';     -- Donner Chef — grouped with Honey/Princess (same "Baker Street" phrase)
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000006' where name = 'Meeku';     -- Downstairs from Carrefour — "carpark down from Carrefour"
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000006' where name = 'Oscar';     -- Downstairs from Carrefour — identical bio text to Meeku
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000004' where name = 'Pablo';     -- Costa Coffee — direct name match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000002' where name = 'Pearl';     -- Astrolabs — low confidence, cluster-only match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000005' where name = 'Percy';     -- Nola Open Gym — direct match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000003' where name = 'Pickle';    -- Splendour Fields — named-landmark match (cluster label conflicts)
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000005' where name = 'Pixie';     -- Nola Open Gym — direct match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000011' where name = 'Princess';  -- Donner Chef — grouped with Honey/Maple
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000006' where name = 'Puma';      -- Downstairs from Carrefour — low confidence, cluster-only match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000009' where name = 'Queenie';   -- Opposite Splendour Fields — low confidence, grouped with Romeo
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000002' where name = 'Ribbon';    -- Astrolabs — low confidence, cluster-only match
update public.cats set primary_station_id = '11111111-0001-0001-0001-000000000009' where name = 'Romeo';     -- Opposite Splendour Fields — grouped with Queenie (same "Al Maya" phrase)
