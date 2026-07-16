-- Run this whole file once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).

-- 1. PROFILES: one row per login, linked to Supabase's built-in auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Owner', 'Staff')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz default now()
);

-- 2. ITEMS: the things being tracked
create table items (
  id text primary key,
  name text not null,
  unit text not null,
  qty numeric not null default 0,
  threshold numeric not null default 0
);

-- 3. TRANSACTIONS: every add/reduce, forever (this is the audit log)
create table transactions (
  id bigint generated always as identity primary key,
  item_id text not null references items(id),
  type text not null check (type in ('IN', 'OUT')),
  qty numeric not null,
  user_name text not null,
  remarks text,
  created_at timestamptz default now()
);

-- Seed starting inventory (matches the demo)
insert into items (id, name, unit, qty, threshold) values
  ('cement', 'Portland Cement', 'bags', 40, 50),
  ('hb4', 'Hollow Blocks 4"', 'pcs', 620, 300),
  ('hb6', 'Hollow Blocks 6"', 'pcs', 340, 300),
  ('sand', 'Washed Sand', 'cu.m', 12, 10),
  ('gravel', 'Gravel 3/4"', 'cu.m', 8, 10);

-- 4. Row Level Security: only logged-in, active accounts can touch data
alter table profiles enable row level security;
alter table items enable row level security;
alter table transactions enable row level security;

-- Anyone logged in can read their own profile (needed to know their role)
create policy "read own profile" on profiles
  for select using (auth.uid() = id);

-- The Owner can read every profile, to show the Admin user list
create policy "owner reads all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Owner')
  );

-- The Owner can update profiles (used to revoke/restore staff)
create policy "owner updates profiles" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'Owner')
  );

-- Any signed-in, active account can view and update stock
create policy "active users read items" on items
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.status = 'active')
  );

create policy "active users update items" on items
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.status = 'active')
  );

-- Any signed-in, active account can read and log transactions
create policy "active users read transactions" on transactions
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.status = 'active')
  );

create policy "active users insert transactions" on transactions
  for insert with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.status = 'active')
  );

-- ---------------------------------------------------------------------
-- After running this file:
-- 1. Go to Authentication -> Users -> Add user, create the owner's
--    login (any email format works, e.g. owner@bantaystock.local).
-- 2. Copy that user's UID, then run:
--      insert into profiles (id, name, role, status)
--      values ('paste-the-uid-here', 'Owner Account', 'Owner', 'active');
-- Staff accounts after that can be created from the app's Admin tab —
-- you won't need to touch SQL again for those.
-- ---------------------------------------------------------------------
