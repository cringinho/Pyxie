import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const COOKIE_NAME = 'mary_token';
const JWT_SECRET = process.env.JWT_SECRET || 'nosso_universo_mary_leh_segredo_jwt_2026_super_blindado';

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
  };
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.select().from(users).where(eq(users.id, decoded.userId)).get();

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado ou sessão expirada.' });
    }

    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }
}
