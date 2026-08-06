-- Clarifies that "Emirates Gold" has no physical feeding box — it's a stop visited by hand
-- during the evening wet-food round, not a station in the same sense as the other 11.

update public.stations
set access_notes = 'No physical feeding box here — cats are fed by hand as a stop during the evening wet-food round. Coordinates are an unverified placeholder; not yet linked to a route.'
where name = 'Emirates Gold';
