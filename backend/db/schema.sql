-- Run in Railway Postgres (or any PostgreSQL)

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text NOT NULL,
  user_name text,
  user_phone text,
  status text DEFAULT 'WAITING',
  position int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id text NOT NULL,
  user_name text,
  price int,
  status text DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_contract
ON contracts(seat_id)
WHERE status = 'ACTIVE';

-- Lock table for waitlist position (prevents duplicate position under concurrent requests)
CREATE TABLE IF NOT EXISTS waitlist_seat_lock (
  seat_id text PRIMARY KEY
);
