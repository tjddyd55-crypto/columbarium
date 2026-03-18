import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

/** Set req.user from Authorization Bearer token if present. No 401. */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, login_id: payload.login_id, role: payload.role };
  } catch {
    // ignore invalid token
  }
  next();
}

/** Require valid JWT. 401 if missing or invalid. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, login_id: payload.login_id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
