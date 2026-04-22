
-- Enable UUID extension (already enabled in Supabase by default)
-- create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- SPOTS TABLE
-- ─────────────────────────────────────────
create table if not exists public.spots (
  id          uuid primary key default gen_random_uuid(),
  created_by  uuid references auth.users(id) on delete set null,
  name        text not null,
  address     text,
  latitude    float,
  longitude   float,
  opens_at    time,
  closes_at   time,
  chai_price  numeric(8, 2),
  phone       text,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─────────────────────────────────────────
-- SPOT PHOTOS TABLE
-- ─────────────────────────────────────────
create table if not exists public.spot_photos (
  id           uuid primary key default gen_random_uuid(),
  spot_id      uuid references public.spots(id) on delete cascade,
  storage_path text not null,
  uploaded_by  uuid references auth.users(id) on delete set null,
  created_at   timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- Spots: anyone can read, signed-in users can insert, any signed-in user can update
alter table public.spots enable row level security;

create policy "Public read spots"
  on public.spots for select
  using (true);

create policy "Authenticated users can insert spots"
  on public.spots for insert
  with check (auth.uid() = created_by);

create policy "Authenticated users can update any spot"
  on public.spots for update
  using (auth.uid() is not null);

create policy "Only creator can delete their spot"
  on public.spots for delete
  using (auth.uid() = created_by);

-- Spot photos: anyone can read, signed-in users can insert
alter table public.spot_photos enable row level security;

create policy "Public read spot photos"
  on public.spot_photos for select
  using (true);

create policy "Authenticated users can insert photos"
  on public.spot_photos for insert
  with check (auth.uid() = uploaded_by);

-- ─────────────────────────────────────────
-- STORAGE BUCKET
-- ─────────────────────────────────────────
-- Run this separately in the Supabase dashboard > Storage, or via SQL:

insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict do nothing;

-- Allow public read
create policy "Public read spot photos bucket"
  on storage.objects for select
  using (bucket_id = 'spot-photos');

-- Allow authenticated uploads
create policy "Authenticated upload to spot-photos"
  on storage.objects for insert
  with check (bucket_id = 'spot-photos' and auth.uid() is not null);

-- ─────────────────────────────────────────
-- OPTIONAL: updated_at auto-trigger
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger spots_updated_at
  before update on public.spots
  for each row execute function public.set_updated_at();
