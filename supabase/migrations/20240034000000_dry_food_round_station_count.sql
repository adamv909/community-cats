-- The Dry Food Round grew from 11 to 13 stations after adding dedicated Meeku and
-- Scrappy stops; the route's description text was hardcoded to the old count.
update routes set description = 'Dry food + water — all 13 stations' where round_type = 'morning';
