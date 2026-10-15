import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  COOKIE_NAME,
  generateToken,
  getAuthCookieOptions,
  requireAuth,
  sanitizeUser
} from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Restrito estritamente a 'leh' ou 'mary'
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Informe usuário e senha.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    if (cleanUsername !== 'leh' && cleanUsername !== 'mary') {
      return res.status(401).json({ error: 'Usuário não autorizado neste Universo.' });
    }

    const user = db.select().from(users).where(eq(users.username, cleanUsername)).get();
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const token = generateToken(user);
    res.cookie(COOKIE_NAME, token, getAuthCookieOptions());

    return res.json({
      success: true,
      message: `Bem-vindo(a) de volta, ${user.displayName}!`,
      user: sanitizeUser(user),
      token
    });
  } catch (err) {
    console.error('[Auth:Login] Erro:', err);
    return res.status(500).json({ error: 'Falha interna durante a autenticação.' });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados da sessão ativa
 */
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    authenticated: true,
    user: req.user
  });
});

/**
 * POST /api/auth/logout
 * Limpa cookie da sessão
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({
    success: true,
    message: 'Sessão encerrada com sucesso.'
  });
});

export default router;
