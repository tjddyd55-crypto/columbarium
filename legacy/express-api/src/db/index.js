import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set; DB operations will fail.');
}

export const pool = connectionString
  ? new Pool({ connectionString })
  : null;

export async function query(text, params) {
  if (!pool) throw new Error('Database not configured');
  return pool.query(text, params);
}

/** Run multiple queries in a single transaction. callback(client) receives a pg.Client. */
export async function runInTransaction(callback) {
  if (!pool) throw new Error('Database not configured');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
