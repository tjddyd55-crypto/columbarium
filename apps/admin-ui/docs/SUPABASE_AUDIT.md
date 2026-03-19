# Supabase DB Audit Report

## 1️⃣ Connection & Config

| Check | Status | Note |
|-------|--------|------|
| `/src/lib/supabase.ts` exists | ✅ | `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` |
| Env vars in code | ✅ | Uses `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `.env` file | ⚠️ | **Not found in repo** (gitignored). You must create `.env` from `.env.example` and set real values. |
| Run audit script | ✅ | `node scripts/audit-db.mjs` (requires `.env`) |

**If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is undefined in the app:** environment is broken. Create `.env` with:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 2️⃣ Table Existence & Test Queries

When `.env` is set, the audit script runs:

- `supabase.from("waitlist").select("*").limit(1)`
- `supabase.from("contracts").select("*").limit(1)`
- `supabase.from("waitlist").select("*", { count: "exact", head: true })`
- `supabase.from("waitlist").insert([{ seat_id: "AUDIT-TEST", ... }])`

If you see **"relation does not exist"** → run the migration in Supabase SQL Editor (`supabase/schema.sql`).

---

## 3️⃣ Table Structure (Schema)

### waitlist (required columns)

| Column | Type | In schema |
|--------|------|-----------|
| id | uuid | ✅ primary key default gen_random_uuid() |
| seat_id | text | ✅ not null |
| user_name | text | ✅ |
| user_phone | text | ✅ |
| status | text | ✅ default 'WAITING' |
| position | int | ✅ |
| created_at | timestamp | ✅ timestamptz default now() |

### contracts (required columns)

| Column | Type | In schema |
|--------|------|-----------|
| id | uuid | ✅ primary key default gen_random_uuid() |
| seat_id | text | ✅ not null |
| user_name | text | ✅ |
| price | int | ✅ |
| status | text | ✅ default 'PENDING' |
| created_at | timestamp | ✅ timestamptz default now() |

**Schema file:** `supabase/schema.sql` — run in Supabase → SQL Editor.

---

## 4️⃣ Insert Test & RLS

If **insert fails** with permission/RLS errors:

1. Supabase Dashboard → Table Editor → select `waitlist` / `contracts`.
2. If RLS is **enabled**, add a policy or temporarily allow all for development:

```sql
-- Temporary dev policy (replace with proper policies later)
create policy "allow all waitlist"
on waitlist for all
using (true) with check (true);

create policy "allow all contracts"
on contracts for all
using (true) with check (true);
```

3. Or disable RLS for these tables during dev (not for production).

---

## 5️⃣ Count Query

The app uses:

```ts
const { count } = await supabase
  .from("waitlist")
  .select("*", { count: "exact", head: true })
  .eq("seat_id", seatId)
  .eq("status", "WAITING");
```

If `count` is always `null` → check RLS or policy that blocks select.

---

## 6️⃣ Current Run Result (this machine)

- **.env:** missing → connection not tested.
- **Tables / insert / count:** not run (no credentials).

**To get a full ✅:**

1. Create `.env` from `.env.example` and set real Supabase URL and anon key.
2. Run migration: Supabase Dashboard → SQL Editor → paste and run `supabase/schema.sql`.
3. Run: `node scripts/audit-db.mjs`.
4. If insert/select fail, add RLS policies (see above) and re-run the script.

---

## 7️⃣ Final Checklist

| Item | Status |
|------|--------|
| ✅ connection config (code) | OK |
| ❌ env file | Create `.env` |
| ⏳ tables exist | Run schema.sql then re-audit |
| ⏳ insert works | Re-run audit after .env + migration |
| ⏳ select/count works | Re-run audit after .env + migration |
| ⏳ RLS | Configure if enabled |

**Do not continue development** until: tables exist, insert works, select works (all verified by `node scripts/audit-db.mjs` with exit code 0).
