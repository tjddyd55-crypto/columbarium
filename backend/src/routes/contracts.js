import { Router } from 'express';
import { query } from '../db/index.js';

export const contractsRouter = Router();

// When auth is added: allow contract creation only if the requesting user is the ACTIVE waitlist for this seat (check contract.waitlist_id = current ACTIVE waitlist.id).
contractsRouter.post('/', async (req, res, next) => {
  try {
    const { seat_id, waitlist_id, user_name, price } = req.body || {};
    if (!seat_id) {
      return res.status(400).json({ error: 'seat_id required' });
    }
    const existing = await query(
      "SELECT id FROM contracts WHERE seat_id = $1 AND status = 'ACTIVE' LIMIT 1",
      [seat_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'ACTIVE contract already exists for this seat' });
    }
    const insert = await query(
      `INSERT INTO contracts (seat_id, waitlist_id, user_name, price, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING id`,
      [seat_id, waitlist_id ?? null, user_name ?? null, price ?? null]
    );
    res.status(201).json(insert.rows[0]);
  } catch (e) {
    next(e);
  }
});

contractsRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM contracts ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

contractsRouter.get('/:seatId', async (req, res, next) => {
  try {
    const { seatId } = req.params;
    const result = await query(
      "SELECT id FROM contracts WHERE seat_id = $1 AND status = 'ACTIVE' LIMIT 1",
      [seatId]
    );
    res.json({ hasActive: result.rows.length > 0 });
  } catch (e) {
    next(e);
  }
});

contractsRouter.patch('/:id/activate', async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(
      'UPDATE contracts SET status = $1 WHERE id = $2',
      ['ACTIVE', id]
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
