-- Run this whole file once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- Already have a project running the OLD version of this schema
-- (no prices, no POS)? Don't re-run this whole file — instead run
-- just the "MIGRATING AN EXISTING PROJECT" block near the bottom.

-- 1. PROFILES: one row per login, linked to Supabase's built-in auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Owner', 'Staff')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz default now()
);

-- 2. ITEMS: the things being tracked, now with a selling price
create table items (
  id text primary key,
  name text not null,
  unit text not null,
  qty numeric not null default 0,
  threshold numeric not null default 0,
  price numeric not null default 0
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

-- 4. SALES: one row per POS checkout (the receipt header)
create table sales (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  staff_name text not null,
  subtotal numeric not null,
  total numeric not null,
  cash_tendered numeric,
  change_due numeric,
  created_at timestamptz default now()
);

-- 5. SALE_ITEMS: each line on a receipt
-- item_name/item_unit are copied at sale time so a receipt still reads
-- correctly even if the item is later renamed or removed.
create table sale_items (
  id bigint generated always as identity primary key,
  sale_id uuid not null references sales(id) on delete cascade,
  item_id text references items(id),
  item_name text not null,
  item_unit text not null,
  qty numeric not null,
  unit_price numeric not null,
  line_total numeric not null
);

-- Seed starting inventory with sample prices (edit freely later)
insert into items (id, name, unit, qty, threshold, price) values
  ('cement', 'Portland Cement', 'bags', 40, 50, 255),
  ('hb4', 'Hollow Blocks 4"', 'pcs', 620, 300, 12),
  ('hb6', 'Hollow Blocks 6"', 'pcs', 340, 300, 16),
  ('sand', 'Washed Sand', 'cu.m', 12, 10, 950),
  ('gravel', 'Gravel 3/4"', 'cu.m', 8, 10, 1050);

-- 6. Row Level Security: only logged-in, active accounts can touch data

alter table profiles enable row level security;
alter table items enable row level security;
alter table transactions enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Helper function: checks "is this user the Owner?" using SECURITY
-- DEFINER so the check doesn't re-trigger RLS on profiles itself
-- (querying profiles from inside a profiles policy causes infinite
-- recursion and a 500 error otherwise).
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'Owner'
  );
$$;

-- Same idea for "is this user logged in AND active?" — used by every
-- other table's policies so they don't need to re-check profiles
-- directly (which would hit the same recursion problem).
create or replace function public.is_active_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and status = 'active'
  );
$$;

create policy "read own profile" on profiles
  for select using (auth.uid() = id);

create policy "owner reads all profiles" on profiles
  for select using (public.is_owner());

create policy "owner updates profiles" on profiles
  for update using (public.is_owner());

create policy "active users read items" on items
  for select using (public.is_active_user());

create policy "active users update items" on items
  for update using (public.is_active_user());

create policy "active users read transactions" on transactions
  for select using (public.is_active_user());

create policy "active users insert transactions" on transactions
  for insert with check (public.is_active_user());

create policy "active users read sales" on sales
  for select using (public.is_active_user());

create policy "active users insert sales" on sales
  for insert with check (public.is_active_user());

create policy "active users read sale_items" on sale_items
  for select using (public.is_active_user());

create policy "active users insert sale_items" on sale_items
  for insert with check (public.is_active_user());

-- ---------------------------------------------------------------------
-- After running this file (fresh project only):
-- 1. Go to Authentication -> Users -> Add user, create the owner's
--    login (any email format works, e.g. owner@yourbusiness.local).
-- 2. Copy that user's UID, then run:
--      insert into profiles (id, name, role, status)
--      values ('paste-the-uid-here', 'Owner Account', 'Owner', 'active');
-- Staff accounts after that can be created from the app's Admin tab —
-- you won't need to touch SQL again for those.
-- ---------------------------------------------------------------------


-- =======================================================================
-- MIGRATING AN EXISTING PROJECT (already has profiles/items/transactions
-- from the pre-POS version)? Run ONLY this block instead of the file
-- above — it adds what's new without touching your existing data.
-- =======================================================================
--
-- alter table items add column if not exists price numeric not null default 0;
--
-- create table if not exists sales (
--   id uuid primary key default gen_random_uuid(),
--   buyer_name text not null,
--   staff_name text not null,
--   subtotal numeric not null,
--   total numeric not null,
--   cash_tendered numeric,
--   change_due numeric,
--   created_at timestamptz default now()
-- );
--
-- create table if not exists sale_items (
--   id bigint generated always as identity primary key,
--   sale_id uuid not null references sales(id) on delete cascade,
--   item_id text references items(id),
--   item_name text not null,
--   item_unit text not null,
--   qty numeric not null,
--   unit_price numeric not null,
--   line_total numeric not null
-- );
--
-- alter table sales enable row level security;
-- alter table sale_items enable row level security;
--
-- create or replace function public.is_active_user()
-- returns boolean language sql security definer set search_path = public stable
-- as $$ select exists (select 1 from profiles where id = auth.uid() and status = 'active') $$;
--
-- create policy "active users read sales" on sales for select using (public.is_active_user());
-- create policy "active users insert sales" on sales for insert with check (public.is_active_user());
-- create policy "active users read sale_items" on sale_items for select using (public.is_active_user());
-- create policy "active users insert sale_items" on sale_items for insert with check (public.is_active_user());
--
-- update items set price = 255 where id = 'cement';
-- update items set price = 12  where id = 'hb4';
-- update items set price = 16  where id = 'hb6';
-- update items set price = 950 where id = 'sand';
-- update items set price = 1050 where id = 'gravel';
-- =======================================================================
