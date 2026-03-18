-- Run in Railway Postgres (or any PostgreSQL)

-- Facilities (source for FacilityListPage, FacilityDetailPage)
CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  price_from int,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Seats per facility (for SeatSelectionPage: list seats by facility)
CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  seat_id text NOT NULL,
  code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(facility_id, seat_id)
);

-- Users: login_id-based auth (must exist before waitlist/contracts user_id FK)
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

-- position: do NOT reorder on cancel (gaps allowed). "앞에 몇 명" = count separately when needed (e.g. WHERE seat_id=? AND status='WAITING' AND created_at < mine).
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text NOT NULL,
  user_id uuid REFERENCES users(id),
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
  user_id uuid REFERENCES users(id),
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

-- Optional seed (run once; facilities and seats for UI to show data)
-- INSERT INTO facilities (id, name, address, price_from) VALUES
--   ('a0000001-0000-0000-0000-000000000001', '강남점 1호점', '서울 강남구 테헤란로 123', 30000000),
--   ('a0000001-0000-0000-0000-000000000002', '서초 본점', '서울 서초구 서초대로 789', 35000000);
-- INSERT INTO seats (facility_id, seat_id, code) VALUES
--   ('a0000001-0000-0000-0000-000000000001', 'S1', 'A-1-001'),
--   ('a0000001-0000-0000-0000-000000000001', 'S2', 'A-1-002'),
--   ('a0000001-0000-0000-0000-000000000001', 'S3', 'A-1-003'),
--   ('a0000001-0000-0000-0000-000000000002', 'S1', 'B-1-001'),
--   ('a0000001-0000-0000-0000-000000000002', 'S2', 'B-1-002');

-- Migration (if tables already exist):
-- ALTER TABLE waitlist_seat_lock ADD COLUMN IF NOT EXISTS current_count int NOT NULL DEFAULT 0;
-- ALTER TABLE contracts ADD COLUMN IF NOT EXISTS waitlist_id uuid REFERENCES waitlist(id);
-- ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
-- ALTER TABLE contracts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);
