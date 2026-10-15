-- Remove Ronald, Pickle, and Sumi from the active Wet Food Round. Cat records and all
-- historical station_visits/sightings are untouched -- only the cluster assignment that
-- controls future rounds is cleared. Ronald already had no cluster assignment.
update cats set wet_food_cluster_id = null where name in ('Ronald', 'Pickle', 'Sumi');
