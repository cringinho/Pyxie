import express from 'express';
import { db } from '../db/index.js';
import { users, coupleSettings } from '../db/schema.js';
import { eq, ne } from 'drizzle-orm';
import { requireAuth, sanitizeUser } from '../middlewares/auth.js';

const router = express.Router();

/**
 * GET /api/couple
 * Retorna dados sincronizados de ambos os parceiros (Mary e Leandro) e dados de relacionamento
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const me = sanitizeUser(req.user);

    // O parceiro é o outro usuário do sistema ('mary' se for 'leh', ou 'leh' se for 'mary')
    const partnerRaw = db.select()
      .from(users)
      .where(ne(users.id, req.user.id))
      .get();

    const partner = sanitizeUser(partnerRaw);
    const settings = db.select().from(coupleSettings).get();

    return res.json({
      success: true,
      me,
      partner,
      settings: settings || {
        anniversaryDate: '2026-01-30',
        specialDatesJson: '[]'
      }
    });
  } catch (err) {
    console.error('[Couple:Get] Erro ao buscar dados do casal:', err);
    return res.status(500).json({ error: 'Falha ao buscar dados do casal.' });
  }
});

export default router;
