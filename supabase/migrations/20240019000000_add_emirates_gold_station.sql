-- "Emirates Gold" isn't a data error — it's a real evening (wet food) feeding spot that
-- doesn't happen to be one of our 11 existing stations. Penelope, Peter, and Smudge all
-- independently reference it in the admin's directory. Added as a station so those three
-- cats have a home rather than sitting unassigned — deliberately NOT linked to any route
-- yet (no route_stations row), since the coordinates below are an unverified placeholder
-- and the actual morning/evening round integration is being deferred until the group
-- leader's data comes back and the morning round is sorted.

with new_station as (
  insert into public.stations (name, area, latitude, longitude, access_notes)
  values (
    'Emirates Gold',
    'Unconfirmed — no cluster stated for any cat seen there',
    25.1955, 55.2750,
    'Coordinates are an unverified placeholder, not the real location — need confirming. Wet food evening feeding spot; not yet linked to a route.'
  )
  returning id
)
update public.cats set primary_station_id = (select id from new_station)
where name in ('Penelope', 'Peter', 'Smudge');
