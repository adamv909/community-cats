-- Add food_level to station_visits to record dry food level on arrival (morning rounds)
alter table public.station_visits
  add column if not exists food_level text
    check (food_level in ('empty', 'medium', 'full'));
