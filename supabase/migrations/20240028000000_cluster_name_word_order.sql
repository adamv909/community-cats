-- Wet Food Round terminology fix: "O Cluster"/"P Cluster"/etc. -> "Cluster O"/"Cluster P".
-- Emirates Gold is unaffected (not part of this naming pattern). Keeps area in sync with
-- name for these rows, same as the prior area/name consistency fix.
update stations set name = 'Cluster O', area = 'Cluster O' where name = 'O Cluster' and kind = 'cluster';
update stations set name = 'Cluster P', area = 'Cluster P' where name = 'P Cluster' and kind = 'cluster';
update stations set name = 'Cluster Q', area = 'Cluster Q' where name = 'Q Cluster' and kind = 'cluster';
update stations set name = 'Cluster R', area = 'Cluster R' where name = 'R Cluster' and kind = 'cluster';
