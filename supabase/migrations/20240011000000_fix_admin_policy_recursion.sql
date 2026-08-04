-- Fix infinite recursion in admin policies.
-- The "Admin full access" policy on profiles queries profiles to check role,
-- which triggers the policy again → infinite loop.
-- Solution: a SECURITY DEFINER function that reads profiles bypassing RLS.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Recreate admin policies using the non-recursive function
drop policy if exists "Admin full access" on public.profiles;
create policy "Admin full access" on public.profiles
  for all to authenticated using (public.is_admin());

drop policy if exists "Admin full access" on public.stations;
create policy "Admin full access" on public.stations
  for all to authenticated using (public.is_admin());

drop policy if exists "Admin full access" on public.cats;
create policy "Admin full access" on public.cats
  for all to authenticated using (public.is_admin());

drop policy if exists "Admin full access" on public.routes;
create policy "Admin full access" on public.routes
  for all to authenticated using (public.is_admin());

drop policy if exists "Admin full access" on public.route_stations;
create policy "Admin full access" on public.route_stations
  for all to authenticated using (public.is_admin());

drop policy if exists "Admin full access" on public.feeding_rounds;
create policy "Admin full access" on public.feeding_rounds
  for all to authenticated using (public.is_admin());
