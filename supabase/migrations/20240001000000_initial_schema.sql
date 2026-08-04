-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase Auth — one row per user
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role         text not null default 'volunteer'
                 check (role in ('volunteer', 'admin')),
  is_active    bool not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Stations ──────────────────────────────────────────────────────────────────
create table public.stations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  area         text not null,
  latitude     float8 not null,
  longitude    float8 not null,
  access_notes text,
  is_active    bool not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Cats ──────────────────────────────────────────────────────────────────────
create table public.cats (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  photo_url          text,
  description        text,
  primary_station_id uuid references public.stations(id) on delete set null,
  status             text not null default 'active'
                       check (status in ('active', 'missing', 'homed', 'hospital', 'deceased')),
  health_notes       text,
  last_seen_at       timestamptz,
  is_active          bool not null default true,
  is_provisional     bool not null default false,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── Cat known locations ───────────────────────────────────────────────────────
create table public.cat_known_locations (
  cat_id     uuid not null references public.cats(id) on delete cascade,
  station_id uuid not null references public.stations(id) on delete cascade,
  primary key (cat_id, station_id)
);

-- ── Routes ────────────────────────────────────────────────────────────────────
create table public.routes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  is_active   bool not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Route stations (ordered) ──────────────────────────────────────────────────
create table public.route_stations (
  id          uuid primary key default gen_random_uuid(),
  route_id    uuid not null references public.routes(id) on delete cascade,
  station_id  uuid not null references public.stations(id) on delete cascade,
  order_index int not null,
  unique (route_id, order_index)
);

-- ── Feeding rounds ────────────────────────────────────────────────────────────
create table public.feeding_rounds (
  id           uuid primary key,  -- Generated client-side for offline support
  route_id     uuid references public.routes(id) on delete set null,
  volunteer_id uuid not null references public.profiles(id) on delete restrict,
  started_at   timestamptz not null,
  completed_at timestamptz,
  status       text not null default 'in_progress'
                 check (status in ('in_progress', 'completed', 'abandoned')),
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Station visits ────────────────────────────────────────────────────────────
create table public.station_visits (
  id               uuid primary key,  -- Generated client-side
  feeding_round_id uuid not null references public.feeding_rounds(id) on delete cascade,
  station_id       uuid not null references public.stations(id) on delete restrict,
  visited_at       timestamptz not null,
  completed_at     timestamptz,
  food_topped_up   bool not null default false,
  water_topped_up  bool not null default false,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Sightings ─────────────────────────────────────────────────────────────────
create table public.sightings (
  id                  uuid primary key,  -- Generated client-side
  station_visit_id    uuid not null references public.station_visits(id) on delete cascade,
  cat_id              uuid not null references public.cats(id) on delete restrict,
  station_id          uuid not null references public.stations(id) on delete restrict,
  volunteer_id        uuid not null references public.profiles(id) on delete restrict,
  seen_at             timestamptz not null,
  notes               text,
  photo_url           text,
  has_welfare_concern bool not null default false,
  welfare_notes       text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index on public.cats (primary_station_id);
create index on public.cats (status);
create index on public.route_stations (route_id, order_index);
create index on public.feeding_rounds (volunteer_id, status);
create index on public.station_visits (feeding_round_id);
create index on public.sightings (station_visit_id);
create index on public.sightings (cat_id);
create index on public.sightings (has_welfare_concern) where has_welfare_concern = true;

-- ── Updated_at trigger ────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.stations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.cats
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.routes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.feeding_rounds
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.station_visits
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.sightings
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
-- All tables are locked down — only authenticated group members can access data

alter table public.profiles        enable row level security;
alter table public.stations        enable row level security;
alter table public.cats            enable row level security;
alter table public.cat_known_locations enable row level security;
alter table public.routes          enable row level security;
alter table public.route_stations  enable row level security;
alter table public.feeding_rounds  enable row level security;
alter table public.station_visits  enable row level security;
alter table public.sightings       enable row level security;

-- Authenticated users can read all core data
create policy "Authenticated read" on public.profiles
  for select to authenticated using (true);
create policy "Authenticated read" on public.stations
  for select to authenticated using (true);
create policy "Authenticated read" on public.cats
  for select to authenticated using (true);
create policy "Authenticated read" on public.cat_known_locations
  for select to authenticated using (true);
create policy "Authenticated read" on public.routes
  for select to authenticated using (true);
create policy "Authenticated read" on public.route_stations
  for select to authenticated using (true);
create policy "Authenticated read" on public.feeding_rounds
  for select to authenticated using (true);
create policy "Authenticated read" on public.station_visits
  for select to authenticated using (true);
create policy "Authenticated read" on public.sightings
  for select to authenticated using (true);

-- Volunteers can write their own feeding data
create policy "Volunteer insert round" on public.feeding_rounds
  for insert to authenticated
  with check (volunteer_id = auth.uid());

create policy "Volunteer update own round" on public.feeding_rounds
  for update to authenticated
  using (volunteer_id = auth.uid());

create policy "Volunteer insert visit" on public.station_visits
  for insert to authenticated
  with check (
    exists (
      select 1 from public.feeding_rounds r
      where r.id = feeding_round_id and r.volunteer_id = auth.uid()
    )
  );

create policy "Volunteer update own visit" on public.station_visits
  for update to authenticated
  using (
    exists (
      select 1 from public.feeding_rounds r
      where r.id = feeding_round_id and r.volunteer_id = auth.uid()
    )
  );

create policy "Volunteer insert sighting" on public.sightings
  for insert to authenticated
  with check (volunteer_id = auth.uid());

create policy "Volunteer update own sighting" on public.sightings
  for update to authenticated
  using (volunteer_id = auth.uid());

-- Volunteers can add provisional cats
create policy "Volunteer insert provisional cat" on public.cats
  for insert to authenticated
  with check (is_provisional = true and created_by = auth.uid());

-- Admins can do everything
create policy "Admin full access" on public.profiles
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin full access" on public.stations
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin full access" on public.cats
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin full access" on public.routes
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin full access" on public.route_stations
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admin full access" on public.feeding_rounds
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ── Auto-create profile on signup ─────────────────────────────────────────────
-- When a new user signs in via magic link, this creates their profile row automatically
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'volunteer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
