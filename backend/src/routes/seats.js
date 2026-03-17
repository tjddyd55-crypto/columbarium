import { Router } from 'express';
import { query } from '../db/index.js';

export const seatsRouter = Router();

/** Seat status: 1) ACTIVE contract → ACTIVE, 2) waitlist WAITING count > 0 → WAITING, 3) else AVAILABLE.
 *  When auth: only the user who has ACTIVE waitlist for this seat can create contract (enforced in contracts POST). */
seatsRouter.get('/:seatId/status', async (req, res, next) => {
  try {
    const { seatId } = req.params;
    const [contractRes, waitlistRes] = await Promise.all([
      query("SELECT id FROM contracts WHERE seat_id = $1 AND status = 'ACTIVE' LIMIT 1", [seatId]),
      query("SELECT COUNT(*)::int AS c FROM waitlist WHERE seat_id = $1 AND status = 'WAITING'", [seatId]),
    ]);
    const hasActive = contractRes.rows.length > 0;
    const waitingCount = waitlistRes.rows[0]?.c ?? 0;
    const status = hasActive ? 'ACTIVE' : (waitingCount > 0 ? 'WAITING' : 'AVAILABLE');
    res.json({ status, waitingCount });
  } catch (e) {
    next(e);
  }
});
