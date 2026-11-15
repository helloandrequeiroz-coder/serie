-- Série — estrutura do banco. Cole no Supabase: SQL Editor → New query → Run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  weight numeric,
  height numeric,
  goal text,
  weekly_target int default 4,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plans jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date timestamptz not null,
  data jsonb not null,
  created_at timestamptz default now()
);
create index if not exists sessions_user_date on public.sessions (user_id, date desc);

alter table public.profiles   enable row level security;
alter table public.user_plans enable row level security;
alter table public.sessions   enable row level security;

-- cada pessoa só lê e escreve os próprios dados
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own plans" on public.user_plans;
create policy "own plans" on public.user_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sessions" on public.sessions;
create policy "own sessions" on public.sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
