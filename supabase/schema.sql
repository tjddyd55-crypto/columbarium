-- Run this in Supabase SQL Editor

-- waitlist table
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  seat_id text not null,
  user_name text,
  user_phone text,
  status text default 'WAITING', -- WAITING / ACTIVE / CANCELLED
  position int,
  created_at timestamp with time zone default now()
);

-- contracts table
create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  seat_id text not null,
  user_name text,
  price int,
  status text default 'PENDING', -- PENDING / ACTIVE / COMPLETED
  created_at timestamp with time zone default now()
);

-- Prevent duplicate active contract per seat (one ACTIVE contract per seat_id)
create unique index if not exists unique_active_contract
on contracts(seat_id)
where status = 'ACTIVE';

-- Optional: enable RLS and add policies as needed later
-- alter table waitlist enable row level security;
-- alter table contracts enable row level security;

-- If RLS blocks insert/select, run the following in SQL Editor (dev only):
-- create policy "allow all" on waitlist for all using (true) with check (true);
-- create policy "allow all" on contracts for all using (true) with check (true);
