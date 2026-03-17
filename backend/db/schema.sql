-- Run in Railway Postgres (or any PostgreSQL)

-- position: do NOT reorder on cancel (gaps allowed). "앞에 몇 명" = count separately when needed (e.g. WHERE seat_id=? AND status='WAITING' AND created_at < mine).
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text NOT NULL,
  user_name text,
  user_phone text,
  status text DEFAULT 'WAITING',
  position int,
  created_at timestamptz DEFAULT now()
);

-- waitlist_id: links to the ACTIVE waitlist row; when auth is added, enforce "only this waitlist user can create contract".
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text NOT NULL,
  waitlist_id uuid REFERENCES waitlist(id),
  user_name text,
  price int,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_contract
ON contracts(seat_id)
WHERE status = 'ACTIVE';

-- Lock table for waitlist position (prevents duplicate position under concurrent requests).
-- current_count: future perf fix — use count++ on insert instead of SELECT COUNT(*) when data grows (avoid full scan).
CREATE TABLE IF NOT EXISTS waitlist_seat_lock (
  seat_id text PRIMARY KEY,
  current_count int NOT NULL DEFAULT 0
);

-- Users: login_id-based auth
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  birth_date date,
  phone text NOT NULL,
  email text,
  address text,
  role text DEFAULT 'USER',
  created_at timestamptz DEFAULT now()
);

-- Migration (if tables already exist):
-- ALTER TABLE waitlist_seat_lock ADD COLUMN IF NOT EXISTS current_count int NOT NULL DEFAULT 0;
-- ALTER TABLE contracts ADD COLUMN IF NOT EXISTS waitlist_id uuid REFERENCES waitlist(id);
