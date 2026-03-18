import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SALT_ROUNDS = 10;

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** POST /api/auth/signup — login_id unique, password hashed */
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { login_id, password, name, birth_date, phone, email, address } = req.body || {};
    if (!login_id || !password || !phone) {
      return res.status(400).json({ error: 'login_id, password, phone are required' });
    }
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'name is required' });
    }
    const existing = await query(
      'SELECT id FROM users WHERE login_id = $1 LIMIT 1',
      [login_id.trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'login_id already exists' });
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const insert = await query(
      `INSERT INTO users (login_id, password, name, birth_date, phone, email, address, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'USER')
       RETURNING id, login_id, name, role`,
      [
        login_id.trim(),
        hashed,
        (name || '').trim(),
        birth_date || null,
        (phone || '').trim(),
        email ? String(email).trim() : null,
        address ? String(address).trim() : null,
      ]
    );
    const row = insert.rows[0];
    const token = signToken({ id: row.id, login_id: row.login_id, role: row.role });
    res.status(201).json({
      token,
      user: { id: row.id, login_id: row.login_id, name: row.name, role: row.role },
    });
  } catch (e) {
    next(e);
  }
});

/** POST /api/auth/login — login_id + password, return JWT */
authRouter.post('/login', async (req, res, next) => {
  try {
    const { login_id, password } = req.body || {};
    if (!login_id || !password) {
      return res.status(400).json({ error: 'login_id and password are required' });
    }
    const result = await query(
      'SELECT id, login_id, name, role, password FROM users WHERE login_id = $1 LIMIT 1',
      [login_id.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid login_id or password' });
    }
    const row = result.rows[0];
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid login_id or password' });
    }
    const token = signToken({ id: row.id, login_id: row.login_id, role: row.role });
    res.json({
      token,
      user: { id: row.id, login_id: row.login_id, name: row.name, role: row.role },
    });
  } catch (e) {
    next(e);
  }
});
