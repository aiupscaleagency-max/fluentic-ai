-- Fluentic AI — Supabase-schema
-- Alla tabeller och funktioner är prefixade med fluentic_ så det inte krockar
-- med andra projekt (t.ex. The Engine som använder engine_-prefix) i samma
-- Supabase-instans. Kör i SQL Editor → New query → paste → RUN.
-- Idempotent — kan köras flera gånger utan att förstöra data.

-- ============================================================
-- fluentic_profiles — användarnas publika profil + medlemskap
-- ============================================================
create table if not exists public.fluentic_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  tier text not null default 'free' check (tier in ('free', 'pro', 'family')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-uppdatera updated_at vid UPDATE
create or replace function public.fluentic_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fluentic_profiles_touch on public.fluentic_profiles;
create trigger fluentic_profiles_touch
  before update on public.fluentic_profiles
  for each row execute procedure public.fluentic_touch_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.fluentic_profiles enable row level security;

-- Läsbar för alla inloggade (för leaderboards mm). Justera om mer privat behövs.
drop policy if exists "fluentic_profiles_select_authenticated" on public.fluentic_profiles;
create policy "fluentic_profiles_select_authenticated"
  on public.fluentic_profiles for select
  to authenticated
  using (true);

-- En användare får bara INSERT:a sin egen rad
drop policy if exists "fluentic_profiles_insert_self" on public.fluentic_profiles;
create policy "fluentic_profiles_insert_self"
  on public.fluentic_profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- En användare får bara UPDATE:a sin egen rad
drop policy if exists "fluentic_profiles_update_self" on public.fluentic_profiles;
create policy "fluentic_profiles_update_self"
  on public.fluentic_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- fluentic_handle_new_user — auto-skapar profilrad vid signup.
-- Triggas av insert på auth.users (Supabase Auth's interna tabell).
-- Vi prefixar funktion + trigger med fluentic_ så det inte krockar med
-- ev. liknande triggers från andra projekt på samma Supabase-instans.
-- ============================================================
create or replace function public.fluentic_handle_new_user()
returns trigger as $$
begin
  insert into public.fluentic_profiles (id, email, name, tier)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists fluentic_on_auth_user_created on auth.users;
create trigger fluentic_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.fluentic_handle_new_user();
