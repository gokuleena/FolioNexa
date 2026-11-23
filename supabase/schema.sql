-- FolioNexa independent Supabase schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  slug text unique not null,
  data jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Anyone can view published profiles" on public.profiles for select using (is_published = true);
create index if not exists profiles_slug_idx on public.profiles(slug);
-- Private media bucket; create it in Supabase Storage and apply owner-only policies before production uploads.
