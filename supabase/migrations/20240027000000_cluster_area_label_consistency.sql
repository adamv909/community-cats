-- The 5 new cluster stations had area='Cluster O' (old station-naming convention) while
-- their name='O Cluster' (the new convention) — the shared report generator groups by
-- .area, so the shared report showed "Cluster O" while the app itself shows "O Cluster".
-- Aligning area to match name so both surfaces are consistent for the same cluster.
update stations set area = name where kind = 'cluster';
