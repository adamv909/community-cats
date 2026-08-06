-- Every seeded cat had photo_url = null, so the station "Cats seen" grid fell back to the
-- generic placeholder icon for all of them. The real photos already exist on the admin's
-- Cat Support directory (dream-team-jlt.vercel.app/cats) — 23 of our 24 seeded cat names
-- matched exactly against that site's real colony names, so we point photo_url at those
-- static assets directly rather than re-hosting copies.
--
-- Caveat: these are Vite content-hashed build assets on a site we don't control. If the
-- admin ever swaps out one of these cats' source photo there, that specific hashed filename
-- changes and this URL 404s — there's no live sync, this is a one-time match. "Stella" has
-- no equivalent name in that directory (likely fictional seed data) and keeps the fallback.

update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-BKpUyP4q.webp' where name = 'Apricot';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-w6drzFiL.webp' where name = 'Bruno';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-fAomvzUu.webp' where name = 'Cherry';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-C3Py1joR.webp' where name = 'Felix';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-CG-6ZSS_.webp' where name = 'Honey';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-CdMpkCq9.webp' where name = 'Luna';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-CgtKohFr.webp' where name = 'Mango';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-X5d7hYbx.webp' where name = 'Maple';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-Jlh22J-m.webp' where name = 'Meeku';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-ClhR0o4E.webp' where name = 'Oscar';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-PD-jjhz8.webp' where name = 'Pablo';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-5ALq9xMn.webp' where name = 'Peaches';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-C_Izl7pg.webp' where name = 'Pearl';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-STmOpZ6b.webp' where name = 'Percy';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-DCrgg5Ul.webp' where name = 'Pickle';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-DdiIl5Bj.webp' where name = 'Pixie';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-2CGYkqgo.webp' where name = 'Princess';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo--9Wqq37H.webp' where name = 'Puma';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-B3P95USP.webp' where name = 'Queenie';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-B5ENzJo1.webp' where name = 'Ribbon';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-DVKFv0Qs.webp' where name = 'Rolo';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-C0TjDdIl.webp' where name = 'Romeo';
update public.cats set photo_url = 'https://dream-team-jlt.vercel.app/assets/photo-Z4HSdBVY.webp' where name = 'Scrappy';
