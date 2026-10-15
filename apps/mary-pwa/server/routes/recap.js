import express from 'express';
import { db } from '../db/index.js';
import { memories, memoryMedia, memoryLikes, wordNodes, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

const MONTH_NAMES = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
};

const ROMANTIC_QUOTES = [
  'Mais um mês provando que o nosso amor é o lugar mais bonito do universo.',
  'Cada segundo ao seu lado é uma lembrança que quero guardar para sempre.',
  'Entre bilhões de galáxias e estrelas, a minha escolha sempre será você.',
  'O tempo passa voando quando estamos rindo, sonhando e amando juntos.',
  'Nosso amor não tem fim, só recomeços mais apaixonados a cada amanhecer.'
];

/**
 * GET /api/recap/months
 * Lista todos os meses disponíveis
 */
router.get('/months', requireAuth, (req, res) => {
  try {
    const rawMemDates = db.select({ date: memories.memoryDate }).from(memories).all();
    const rawMediaDates = db.select({ date: memoryMedia.takenAt }).from(memoryMedia).all();

    const monthsSet = new Set();
    rawMemDates.forEach(m => { if (m.date && m.date.length >= 7) monthsSet.add(m.date.slice(0, 7)); });
    rawMediaDates.forEach(m => { if (m.date && m.date.length >= 7) monthsSet.add(m.date.slice(0, 7)); });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    for (let m = 1; m <= currentMonth; m++) {
      monthsSet.add(`${currentYear}-${String(m).padStart(2, '0')}`);
    }

    const sortedMonths = Array.from(monthsSet).sort().reverse().map(ym => {
      const [y, m] = ym.split('-');
      return { id: ym, label: `${MONTH_NAMES[m] || m} de ${y}` };
    });

    return res.json({ success: true, months: sortedMonths });
  } catch (err) {
    console.error('[Recap:Months] Erro:', err);
    return res.status(500).json({ error: 'Falha ao buscar meses de resumo.' });
  }
});
/**
 * GET /api/recap/:yearMonth
 * Agrega dados e estatísticas para o Pôster e Retrospectiva do mês
 */
router.get('/:yearMonth', requireAuth, (req, res) => {
  try {
    const ym = req.params.yearMonth;
    if (!/^\d{4}-\d{2}$/.test(ym)) {
      return res.status(400).json({ error: 'Formato de mês inválido. Use YYYY-MM.' });
    }

    const [year, month] = ym.split('-');
    const monthName = `${MONTH_NAMES[month] || month} de ${year}`;

    const allMemories = db.select().from(memories).all();
    const monthMemories = allMemories.filter(m => m.memoryDate && m.memoryDate.startsWith(ym));

    const allUsers = db.select().from(users).all();
    const maryUser = allUsers.find(u => u.username === 'mary');
    const lehUser = allUsers.find(u => u.username === 'leh');

    const maryMemories = monthMemories.filter(m => m.authorId === maryUser?.id).length;
    const lehMemories = monthMemories.filter(m => m.authorId === lehUser?.id).length;

    const allMedia = db.select().from(memoryMedia).all();
    const monthMedia = allMedia.filter(m => (m.takenAt && m.takenAt.startsWith(ym)) || (m.createdAt && m.createdAt.startsWith(ym)));

    const monthMemIds = new Set(monthMemories.map(m => m.id));
    const allLikes = db.select().from(memoryLikes).all();
    const monthLikes = allLikes.filter(l => monthMemIds.has(l.memoryId));

    const allWords = db.select().from(wordNodes).all();
    const fullText = monthMemories.map(m => `${m.title} ${m.content}`).join(' ').toLowerCase();

    const wordCounts = allWords.map(w => {
      const regex = new RegExp(`\\b${w.normalizedWord}\\b`, 'gi');
      const matches = fullText.match(regex);
      return {
        word: w.word,
        color: w.color,
        count: matches ? matches.length : 0
      };
    })
      .filter(w => w.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const moodMap = {};
    monthMemories.forEach(m => {
      if (m.mood) moodMap[m.mood] = (moodMap[m.mood] || 0) + 1;
    });
    const topMoods = Object.entries(moodMap)
      .sort((a, b) => b[1] - a[1])
      .map(([mood, count]) => ({ mood, count }));

    let highlightMemory = null;
    if (monthMemories.length > 0) {
      const sortedByLikes = [...monthMemories].sort((a, b) => {
        const likesA = allLikes.filter(l => l.memoryId === a.id).length;
        const likesB = allLikes.filter(l => l.memoryId === b.id).length;
        return likesB - likesA || b.content.length - a.content.length;
      });
      const topMem = sortedByLikes[0];
      const author = allUsers.find(u => u.id === topMem.authorId);
      highlightMemory = {
        id: topMem.id,
        title: topMem.title,
        memoryDate: topMem.memoryDate,
        authorName: author?.nickname || author?.displayName || 'Autor'
      };
    }

    const sortedMedia = [...monthMedia].sort((a, b) => {
      if (b.isFavorite !== a.isFavorite) return b.isFavorite - a.isFavorite;
      return b.id - a.id;
    });
    const collagePhotos = sortedMedia.slice(0, 9).map(m => ({
      id: m.id,
      fileUrl: m.fileUrl,
      thumbUrl: m.thumbUrl,
      caption: m.caption,
      isFavorite: Boolean(m.isFavorite)
    }));

    const monthNum = parseInt(month, 10);
    const quote = ROMANTIC_QUOTES[monthNum % ROMANTIC_QUOTES.length];

    return res.json({
      success: true,
      recap: {
        yearMonth: ym,
        monthName,
        totalMemories: monthMemories.length,
        maryMemories,
        lehMemories,
        totalPhotos: monthMedia.length,
        totalLikes: monthLikes.length,
        topWords: wordCounts,
        topMoods: topMoods.slice(0, 3),
        highlightMemory,
        collagePhotos,
        quote
      }
    });
  } catch (err) {
    console.error('[Recap:Get] Erro:', err);
    return res.status(500).json({ error: 'Falha ao gerar resumo mensal.' });
  }
});


export default router;
