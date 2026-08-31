-- Now that it's grouped under Cluster R rather than Q, "Q Fountain" is renamed to just
-- "Fountain" — a separate entity/id from the existing "Fountain" area under Cluster O,
-- same same-name-different-entity pattern already used for Tornado and Kirin Hot Pot.
update stations set name = 'Fountain' where name = 'Q Fountain' and kind = 'stop';
