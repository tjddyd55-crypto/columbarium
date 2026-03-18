import { Router } from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

export const myRouter = Router();

myRouter.use(requireAuth);

myRouter.get('/waitlist', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, seat_id, user_name, user_phone, status, position, created_at FROM waitlist WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

myRouter.get('/contracts', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT id, seat_id, user_name, price, status, created_at FROM contracts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});
