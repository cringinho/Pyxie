import express from 'express';
import { db } from '../db/index.js';
import { favoriteVerses } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/verses/favorite
 * Salva um versículo bíblico como favorito com nota pessoal opcional
 */
router.post('/favorite', requireAuth, async (req, res) => {
  try {
    const { reference, text, bookName, chapter, verse, note } = req.body;

    if (!reference || !text) {
      return res.status(400).json({ error: 'Referência e texto são obrigatórios.' });
    }

    const now = new Date().toISOString();

    const insertResult = db.insert(favoriteVerses).values({
      reference: String(reference).trim(),
      text: String(text).trim(),
      bookName: String(bookName || '').trim(),
      chapter: Number(chapter) || 1,
      verse: Number(verse) || 1,
      savedBy: req.user.id,
      note: note ? String(note).trim().slice(0, 500) : null,
      createdAt: now
    }).run();

    const saved = db.select().from(favoriteVerses).where(eq(favoriteVerses.id, Number(insertResult.lastInsertRowid))).get();

    return res.status(201).json({
      success: true,
      message: 'Versículo guardado no coração e nos favoritos! ✨',
      verse: saved
    });
  } catch (err) {
    console.error('[Verses:Favorite] Erro ao favoritar:', err);
    return res.status(500).json({ error: 'Falha ao salvar versículo favorito.' });
  }
});

/**
 * GET /api/verses/favorites
 * Lista todos os versículos favoritados
 */
router.get('/favorites', requireAuth, (req, res) => {
  try {
    const list = db.select()
      .from(favoriteVerses)
      .orderBy(desc(favoriteVerses.id))
      .all();

    return res.json({
      success: true,
      favorites: list
    });
  } catch (err) {
    console.error('[Verses:Get] Erro ao listar favoritos:', err);
    return res.status(500).json({ error: 'Falha ao buscar versículos favoritos.' });
  }
});

/**
 * DELETE /api/verses/favorites/:id
 * Remove um versículo dos favoritos
 */
router.delete('/favorites/:id', requireAuth, (req, res) => {
  try {
    const verseId = Number(req.params.id);
    db.delete(favoriteVerses).where(eq(favoriteVerses.id, verseId)).run();

    return res.json({
      success: true,
      message: 'Versículo removido dos favoritos.'
    });
  } catch (err) {
    console.error('[Verses:Delete] Erro ao remover versículo:', err);
    return res.status(500).json({ error: 'Falha ao remover versículo.' });
  }
});

export default router;
