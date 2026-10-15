-- Smudge, Shadow, Penelope, and Peter already belong to the Wet Food Round under
-- Emirates Gold (wet_food_cluster_id, untouched here) -- this adds their Dry Food Round
-- assignment to Opposite Splendour Fields on the same cat record, so they appear in both
-- rounds without any duplicate cat identity.
update cats set primary_station_id = (select id from stations where name = 'Opposite Splendour Fields' and kind = 'station')
where name in ('Smudge', 'Shadow', 'Penelope', 'Peter');
