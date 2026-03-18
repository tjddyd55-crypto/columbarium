import { Router } from 'express';
import { query } from '../db/index.js';

export const facilitiesRouter = Router();

facilitiesRouter.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, address, price_from, image_url FROM facilities ORDER BY name'
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});

facilitiesRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, name, address, price_from, image_url FROM facilities WHERE id = $1 LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    res.json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

facilitiesRouter.get('/:id/seats', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT seat_id, code FROM seats WHERE facility_id = $1 ORDER BY seat_id',
      [id]
    );
    res.json(result.rows);
  } catch (e) {
    next(e);
  }
});
