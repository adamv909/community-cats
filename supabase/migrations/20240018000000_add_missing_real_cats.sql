-- Adds the 24 real stray cats that exist on the admin's Cat Support directory but had
-- no record in our system at all (we only had the 22 that happened to share a name with
-- our original fictional seed data, plus Rolo and Stella which aren't real active strays).
-- Station assignments use the same best-effort matching as the previous remap — see
-- conversation for full per-cat confidence/reasoning. Cats currently fostered/homed per
-- their bio (Olive, Pumpkin 2, Sushi) are added with no station so they don't wrongly
-- appear on an active feeding round. Penelope, Peter, and Smudge share a real location
-- ("Emirates Gold") that isn't one of our 11 stations at all — left unassigned rather
-- than force a guess; may be a genuinely missing station.

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Blacky', 'Blacky was first spotted in 2019. He was unfortunately dumped. When we eventually caught him for neutering it turned out he had a microchip but we couldn''t find his previous owners. He does hang out with the other male cats in this area.', 'https://dream-team-jlt.vercel.app/assets/photo-C9KMdirA.webp', '11111111-0001-0001-0001-000000000006', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Casper', 'Casper is one of the new colony who arrived at the end of October 2025. He is very scared, so we have been unable to get too close to him. We are trying to gain his trust.', 'https://dream-team-jlt.vercel.app/assets/photo-Bo2bzMnw.webp', '11111111-0001-0001-0001-000000000003', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Cleo', 'Cleo was first spotted in 2019. She was generally a lone spirit but she does love a chin rub and gets on OK with Tinker. She had some dental issues, but has recovered well.', 'https://dream-team-jlt.vercel.app/assets/photo-Dr90xY7y.webp', '11111111-0001-0001-0001-000000000008', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Dolly', 'Dolly is a feisty cat who will certainly hold her own with the other cats in the area! She was first seen in 2019 and when she spent the night inside before her neutering, she literally ran around the walls of the small bathroom!', 'https://dream-team-jlt.vercel.app/assets/photo-HnIseYZx.webp', '11111111-0001-0001-0001-000000000007', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Fluffy Tail', 'Fluffy Tail is also an old timer in JLT and is super fluffy (hence the name!). She gets on well with most of the cats around.', 'https://dream-team-jlt.vercel.app/assets/photo-BMFQlsDd.webp', '11111111-0001-0001-0001-000000000010', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Olive', 'Olive is a very special senior cat who spent her life on the streets before moving into foster care in May 2024 when she fell ill. She is incredibly affectionate and loves human company and cuddles. Olive has a few manageable medical conditions, including hyperthyroidism (controlled with daily medication) and the need for regular check‑ups following tumour removal. She enjoys a good quality of life and is a very happy girl. With her foster travelling frequently, we would love to find Olive a forever home where she can receive the consistent care and love she deserves.', 'https://dream-team-jlt.vercel.app/assets/photo-DsqanJK_.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Oriel', 'Oriel was first spotted in September 2024. He had a bad abscess on his neck in January 2025 and had to be admitted to the vets for a few days. He is a little shy but is good friends with Ozzy and enjoys being a mascot for the football players with Ozzy!', 'https://dream-team-jlt.vercel.app/assets/photo-CSAGS-d3.webp', '11111111-0001-0001-0001-000000000008', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Ozzy', 'Ozzy was first spotted in November 2023. Called Ozzy because he was a bit of a ''wild child'' hissing at everyone. He was tipped which was very handy as we couldn’t get close. Over the years he has definitely mellowed a bit. He loved attention now and will literally come running for food! Him and his mate ‘Oriel’ are mascots for the football players and have their own feeding station!', 'https://dream-team-jlt.vercel.app/assets/photo-NghTrrjm.webp', '11111111-0001-0001-0001-000000000008', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Paige', 'Paige is one of the new colony dumped in October 2025. She had some dental issues in January 2026, but fortunately we were able to treat her. She loved being inside and it was a shame to release her. She hangs around with her colony and her bestie ''Princess'' who looks very similar to her.', 'https://dream-team-jlt.vercel.app/assets/photo-BgMnGAb3.webp', '11111111-0001-0001-0001-000000000011', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Pari', 'Pari is one of the new colony dumped in October 2025. She is still very timid and shy but getting more brave with the feeders now.', 'https://dream-team-jlt.vercel.app/assets/photo-DquH_72v.webp', '11111111-0001-0001-0001-000000000011', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Paulo', 'Paulo was originally known as Poppy until we realized he was actually a he! Now 3 and a half years old and fully grown but still petite for a male, you can find him in the park in Cluster P, greeting visitors or hopping onto benches in search of a cosy lap. He''s incredibly affectionate and confident, often choosing people himself and settling in for cuddles. With his beautifully silky soft fur and calm, gentle nature, he makes a favourite with both humans and other cats. Easygoing and social despite being a little fussy with his food, Paulo would fit beautifully into a loving home.', 'https://dream-team-jlt.vercel.app/assets/photo-DggA37rG.webp', '11111111-0001-0001-0001-000000000006', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Penelope', 'Penelope was first spotted across the road by Emirates Gold in August 2023 and she’s been there ever since. It’s a quiet little spot, so she absolutely loves when her feeders come to visit. She adores people and will never say no to a cuddle, always soaking up every bit of love and attention she can get.', 'https://dream-team-jlt.vercel.app/assets/photo-D0m3BJYS.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Peno', 'Peno was first spotted at the end of January 2025 and then wasn’t seen for a month. He now makes a bit more of a regular appearance on the feeding rounds. Getting a little less scared with time.', 'https://dream-team-jlt.vercel.app/assets/photo-5MmZ0QEB.webp', '11111111-0001-0001-0001-000000000003', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Peter', 'Peter first appeared in July 2023, originally known as simply ‘Tabby’. Despite his big, sturdy build, he was incredibly shy at the start. Now he enjoys gentle pets, though still a little cautious with new people. Don’t let his soft side fool you though … his favourite hobby is picking fights with the other kitties!', 'https://dream-team-jlt.vercel.app/assets/photo-C6Zyv0KK.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Petunia', 'Petunia first arrived in our area in April 2025. She’s incredibly friendly, so we believe she was once someone’s pet. It took her a little time to find a safe space, but she now has a regular spot and absolutely loves her food and being petted by the feeders. She’s very affectionate and likes to follow us around … even crossing the road at times, which can be a little nerve‑wracking!.', 'https://dream-team-jlt.vercel.app/assets/photo-TH6RFD-j.webp', '11111111-0001-0001-0001-000000000004', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Piper', 'Piper has found his home now in Cluster Q and it doesn''t matter who was there before, namely Peaches who had to relocate! While he can be a bit intimidating with the newer cats, he stands his ground. He is super friendly with dogs and very affectionate and has built up a small fan base of regular visitors who keep an eye out for him.', 'https://dream-team-jlt.vercel.app/assets/photo-DamueFDk.webp', '11111111-0001-0001-0001-000000000011', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Primrose', 'Primrose was first spotted in September 2022. She is a bit of a loaner and was extremely timid at first. One of our feeders spent loads of time getting her used to us and now she is a loving part of our community cat group. She isn’t a fussy eater (unlike a lot of the others) and she can usually be found in the same area.', 'https://dream-team-jlt.vercel.app/assets/photo-DJ0D-Lps.webp', '11111111-0001-0001-0001-000000000005', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Puffer', 'Puffer is a very vocal cat that we first spotted in October 2022. He is very vocal and actually a bit of a bully with the other male cats around. He has been in some cat-fights over the years, hence the vet visits!', 'https://dream-team-jlt.vercel.app/assets/photo-CPIAJOLt.webp', '11111111-0001-0001-0001-000000000006', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Pumpkin 2', 'Pumpkin appeared with the Cluster P “fruit salad gang” in May 2026. A friendly, affectionate kitten, he was taken to the vet for a check-up and given a clean bill of health. It quickly became clear that Pumpkin was destined for life indoors, and he has settled wonderfully into foster care.', 'https://dream-team-jlt.vercel.app/assets/photo-DjTVJz-K.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Robin', 'Robin formerly known as Buster because he had a poorly leg has been around since 2018 at least! He has the most gorgeous eyes and during COVID he enjoyed being overfed by the community of people allowed out for their daily walks. One feeder actually thought it was a different cat because of the sure size of him – except for those lovely eyes! He had some hospital visits because he was bullied by another cat (who has since relocated to Cluster E) and really suited being inside to recuperate. We tried and tried to find him a home, but with no luck…. Yet!', 'https://dream-team-jlt.vercel.app/assets/photo-DBEHmLkV.webp', '11111111-0001-0001-0001-000000000007', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Ronald', 'Ronald is another recently dumped cat who has joined our group in February this year. He’s very friendly and affectionate, and we would love to find him a safe, loving home. We didin''t see him much at first, which suggests he was finding his way around and choosing where he felt most safe. He gets on with the other cats in his area.', 'https://dream-team-jlt.vercel.app/assets/photo-B7JbNwZN.webp', '11111111-0001-0001-0001-000000000009', 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Smudge', 'Smudge was first seen in the park in late 2024, a soft cautious little boy finding his way. After a few weeks he disappeared without a trace, only to be spotted again in January 2025 across the road by Emirates Gold, where he has been ever since. He’s a gentle soul who takes time to trust, but once he does, he’s truly special.', 'https://dream-team-jlt.vercel.app/assets/photo-BHcViNHp.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Sushi', 'Sushi appeared near the busy road by Cluster S and the metro station in May 2025, tiny, alone and vulnerable. Thankfully, he was rescued and found his way into foster care, where he has embraced indoor life and blossomed. While he''s safe for now, his foster home is only temporary, and this sweet boy deserves a forever family of his very own.', 'https://dream-team-jlt.vercel.app/assets/photo-CA5t1_Pa.webp', null, 'active', true, false);

insert into public.cats (name, description, photo_url, primary_station_id, status, is_active, is_provisional)
values ('Tinker', 'Tinker is an original resident who has been around for years and you''ll find her by the busy bridge in Cluster O, patiently sitting and soaking up as much attention as she can from passersby. She knows her feeders well and loves the gentle affection from visitors to her area. She is a sweet, calm, and affectionate girl with a gentle nature who loves pets and gets on well with other cats. Her sister Binker was adopted after recovering from a hip injury, but Tinker is still waiting for her chance to be chosen. All she wants is a loving home where she can feel safe and finally belong.', 'https://dream-team-jlt.vercel.app/assets/photo-B1q1GvSn.webp', '11111111-0001-0001-0001-000000000008', 'active', true, false);
