-- Group-confirmed corrections to the two provisional Wet Food Round cluster assignments
-- flagged since the cluster redesign:
-- - Ronald removed from the Wet Food Round entirely (no cluster) — no longer a Kirin Hot
--   Pot / Cluster Q match.
-- - Romeo moves to Cluster R (Kirin Hot Pot is one of Cluster R's areas to cover).
-- - Ribbon moves to Cluster R, per her original real-world association there (was
--   provisionally in Cluster O pending confirmation).
update cats set wet_food_cluster_id = null where name = 'Ronald';
update cats set wet_food_cluster_id = (select id from stations where name = 'Cluster R' and kind = 'cluster') where name = 'Romeo';
update cats set wet_food_cluster_id = (select id from stations where name = 'Cluster R' and kind = 'cluster') where name = 'Ribbon';
