-- Stella never had a reliable photo match on the external directory site — the group has
-- now supplied a real photo directly, uploaded to the cat-photos storage bucket.
update cats set photo_url = 'https://wictmnkcgfdzscavfibx.supabase.co/storage/v1/object/public/cat-photos/22222222-0002-0002-0002-000000000001.jpg'
where name = 'Stella';
