-- Q Fountain moves from Cluster Q's "areas to cover" to Cluster R's, along with the two
-- cats historically tied to it (via the pre-cluster-redesign cat_known_locations data):
-- Luna and Felix.
update stations set cluster_id = (select id from stations where name = 'Cluster R' and kind = 'cluster')
where name = 'Q Fountain' and kind = 'stop';

update cats set wet_food_cluster_id = (select id from stations where name = 'Cluster R' and kind = 'cluster')
where name in ('Luna', 'Felix');
