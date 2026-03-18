import { Router } from 'express';
import { query, runInTransaction } from '../db/index.js';

export const waitlistRouter = Router();

/** Prevents position race: use transaction + lock row per seat_id so concurrent requests serialize.
 *  Position: we do NOT reorder on cancel (gaps allowed); "앞에 몇 명" is computed separately when needed. */
waitlistRouter.post('/', async (req, res, next) => {
  try {
    const { seat_id, user_name, user_phone } = req.body || {};
    if (!seat_id) {
      return res.status(400).json({ error: 'seat_id required' });
    }
    const row = await runInTransaction(async (client) => {
      await client.query(
        'INSERT INTO waitlist_seat_lock (seat_id) VALUES ($1) ON CONFLICT (seat_id) DO NOTHING',
        [seat_id]
      );
      await client.query(
        'SELECT seat_id FROM waitlist_seat_lock WHERE seat_id = $1 FOR UPDATE',
        [seat_id]
      );
      // Future: use waitlist_seat_lock.current_count (increment in tx) instead of COUNT(*) when data grows.
      const countResult = await client.query(
        'SELECT COUNT(*)::int AS c FROM waitlist WHERE seat_id = $1 AND status = $2',
        [seat_id, 'WAITING']
      );
      const position = (countResult.rows[0]?.c ?? 0) + 1;
      const user_id = req.user?.id ?? null;
      const insertResult = await client.query(
        `INSERT INTO waitlist (seat_id, user_id, user_name, user_phone, status, position)
         VALUES ($1, $2, $3, $4, 'WAITING', $5)
         RETURNING id`,
        [seat_id, user_id, user_name ?? null, user_phone ?? null, position]
      );
      return insertResult.rows[0];
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

waitlistRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM waitlist ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

waitlistRouter.get('/:seatId', async (req, res, next) => {
  try {
    const { seatId } = req.params;
    const result = await query(
      'SELECT COUNT(*)::int AS c FROM waitlist WHERE seat_id = $1 AND status = $2',
      [seatId, 'WAITING']
    );
    const count = result.rows[0]?.c ?? 0;
    res.json({ count });
  } catch (e) {
    next(e);
  }
});

waitlistRouter.patch('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(
      'UPDATE waitlist SET status = $1 WHERE id = $2',
      ['ACTIVE', id]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
