-- Storage bucket for photos of new cats a volunteer photographs mid-round.
-- Cats are already public-read community data (see 20240007), so a public bucket matches
-- the existing security model — only authenticated volunteers can upload.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cat-photos', 'cat-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Authenticated upload cat photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cat-photos');

create policy "Public read cat photos"
  on storage.objects for select
  using (bucket_id = 'cat-photos');
