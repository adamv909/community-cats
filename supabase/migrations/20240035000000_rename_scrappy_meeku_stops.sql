-- Scrappy's and Meeku's dedicated Dry Food Round stops are actually "Q Parking" and
-- "P Parking" -- confirmed against cat_known_locations, which ties Scrappy to the
-- existing "Q Parking" evening stop (Cluster Q) and Meeku to the existing
-- "Parking -- Nola's / Paddington Nursery" evening stop (Cluster P). Renaming the two
-- dry-food stops to match; this creates a second, distinct "Q Parking" entity
-- (kind='station' vs the existing kind='stop'), same same-name-different-entity pattern
-- already used for Tornado, Kirin Hot Pot, and Fountain this session.
update stations set name = 'Q Parking', area = 'Cluster Q'
where name = 'Scrappy' and kind = 'station' and requires_wet_food = true;

update stations set name = 'P Parking'
where name = 'Meeku' and kind = 'station' and requires_wet_food = true;
