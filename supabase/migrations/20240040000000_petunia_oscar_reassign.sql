-- Move Petunia and Oscar to their corrected Dry Food Round stations.
update cats set primary_station_id = (select id from stations where name = 'Costa Coffee' and kind = 'station')
where name = 'Petunia';

update cats set primary_station_id = (select id from stations where name = 'Behind Carrefour (fruit salad gang)' and kind = 'station')
where name = 'Oscar';
