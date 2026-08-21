-- The evening round's description text was left saying "19 feeding stops" after the
-- Tornado/reconciliation migration added Kirin Hot Pot (evening) and R Stairs, bringing
-- the real count to 21 — visibly inconsistent with the stop count shown right next to it
-- on the home screen.
update routes set description = 'Wet food + water — 21 feeding stops'
where round_type = 'evening';
