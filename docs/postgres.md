-- ============================================================
-- Lung Tracker (POC) — Supabase Postgres schema + RLS policies
-- Tables: vitals_entries, activities, events, settings
-- Notes:
-- - Uses auth.users for user_id reference
-- - Row Level Security (RLS) enforces per-user access
-- - Includes helpful indexes for “latest” queries
-- ============================================================

-- 0) Extensions (safe to run; no-op if already enabled)
create extension if not exists "pgcrypto";

-- 1) Tables
-- ------------------------------------------------------------

-- 1.1 Vitals entries
create table if not exists public.vitals_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  measured_at timestamptz not null default now(),

  pulse_bpm integer,
  systolic integer,
  diastolic integer,

  fev1_l double precision,
  fev1_predicted_l double precision,
  fev1_percent double precision,

  pef_l_min double precision,
  pef_predicted_l_min double precision,
  pef_percent double precision,

  notes text,
  source text,

  created_at timestamptz not null default now()
);

-- 1.2 Activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  activity_type text not null,
  performed_at timestamptz not null default now(),

  duration_minutes integer,
  distance_km double precision,
  floors integer,
  symptom_score integer,

  notes text,

  created_at timestamptz not null default now()
);

-- 1.3 Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  event_at timestamptz not null default now(),
  title text not null,
  notes text,

  noticeable_turn boolean default false,
  major_health_update boolean default false,

  created_at timestamptz not null default now()
);

-- 1.4 Settings (1 row per user)
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,

  units text,                -- optional (e.g., "metric")
  locale text,               -- optional (e.g., "en-NL")
  notifications_enabled boolean default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

-- 2) Indexes (performance)
-- ------------------------------------------------------------
-- Latest vitals/activity/event per user by timestamp:
create index if not exists idx_vitals_user_measured_at_desc
  on public.vitals_entries (user_id, measured_at desc);

create index if not exists idx_activities_user_performed_at_desc
  on public.activities (user_id, performed_at desc);

create index if not exists idx_events_user_event_at_desc
  on public.events (user_id, event_at desc);

-- Optional: common filters
create index if not exists idx_activities_user_type_performed_at_desc
  on public.activities (user_id, activity_type, performed_at desc);

-- 3) Row Level Security (RLS)
-- ------------------------------------------------------------

-- Enable RLS
alter table public.vitals_entries enable row level security;
alter table public.activities enable row level security;
alter table public.events enable row level security;
alter table public.settings enable row level security;

-- 3.1 Vitals policies
drop policy if exists "vitals_select_own" on public.vitals_entries;
create policy "vitals_select_own"
on public.vitals_entries
for select
using (auth.uid() = user_id);

drop policy if exists "vitals_insert_own" on public.vitals_entries;
create policy "vitals_insert_own"
on public.vitals_entries
for insert
with check (auth.uid() = user_id);

drop policy if exists "vitals_update_own" on public.vitals_entries;
create policy "vitals_update_own"
on public.vitals_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "vitals_delete_own" on public.vitals_entries;
create policy "vitals_delete_own"
on public.vitals_entries
for delete
using (auth.uid() = user_id);

-- 3.2 Activities policies
drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own"
on public.activities
for select
using (auth.uid() = user_id);

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own"
on public.activities
for insert
with check (auth.uid() = user_id);

drop policy if exists "activities_update_own" on public.activities;
create policy "activities_update_own"
on public.activities
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own"
on public.activities
for delete
using (auth.uid() = user_id);

-- 3.3 Events policies
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own"
on public.events
for select
using (auth.uid() = user_id);

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own"
on public.events
for insert
with check (auth.uid() = user_id);

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own"
on public.events
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own"
on public.events
for delete
using (auth.uid() = user_id);

-- 3.4 Settings policies (one row per user)
drop policy if exists "settings_select_own" on public.settings;
create policy "settings_select_own"
on public.settings
for select
using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.settings;
create policy "settings_insert_own"
on public.settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.settings;
create policy "settings_update_own"
on public.settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "settings_delete_own" on public.settings;
create policy "settings_delete_own"
on public.settings
for delete
using (auth.uid() = user_id);

-- 4) (Optional but recommended) Seed a settings row on first login
-- ------------------------------------------------------------
-- In Supabase, you can do this in the app on signup/login:
-- insert into public.settings (user_id) values (auth.uid()) on conflict do nothing;
--
-- Or you can create an RPC / trigger based on auth events (more complex).
-- For POC, do it from the app.