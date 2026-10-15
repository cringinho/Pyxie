import express from 'express';
import { db } from '../db/index.js';
import { memories, memoryMedia, memoryConnections, wordNodes, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middlewares/auth.js';
import { analyzeMemoriesWords, normalizeWord } from '../utils/wordAnalyzer.js';

const router = express.Router();

/**
 * GET /api/graph/data
 * Retorna dados completos para os dois modos do Grafo (Memórias e Palavras)
 */
router.get('/data', requireAuth, (req, res) => {
  try {
    const rawMemories = db.select().from(memories).orderBy(memories.memoryDate).all();
    const allMedia = db.select().from(memoryMedia).all();
    const allUsers = db.select().from(users).all();
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    // 1. Memory Nodes
    const memoryNodes = rawMemories.map((m) => {
      const author = userMap.get(m.authorId);
      const mediaList = allMedia.filter(med => med.memoryId === m.id);
      let parsedTags = [];
      try {
        parsedTags = m.tags ? JSON.parse(m.tags) : [];
      } catch (e) {
        parsedTags = typeof m.tags === 'string' ? m.tags.split(',') : [];
      }

      return {
        id: `mem-${m.id}`,
        memoryId: m.id,
        title: m.title,
        memoryDate: m.memoryDate,
        mood: m.mood,
        tags: parsedTags,
        location: m.location,
        authorName: author?.nickname || author?.displayName || 'Autor',
        authorUsername: author?.username || 'mary',
        thumbUrl: mediaList[0]?.thumbUrl || mediaList[0]?.fileUrl || null,
        photoCount: mediaList.length
      };
    });

    // 2. Memory Direct Edges (de memory_connections)
    const rawConnections = db.select().from(memoryConnections).all();
    const memoryEdges = rawConnections.map(c => ({
      id: `edge-conn-${c.id}`,
      source: `mem-${c.sourceMemoryId}`,
      target: `mem-${c.targetMemoryId}`,
      label: c.label || 'Momento Conectado',
      type: 'smoothstep',
      animated: true
    }));

    // 3. Registered Words & Suggestions (com wordAnalyzer)
    const rawWordNodes = db.select().from(wordNodes).all();
    const { registeredWords, suggestedWords } = analyzeMemoriesWords(rawMemories, rawWordNodes);

    // 4. Co-ocorrências entre palavras (ligações entre palavras que aparecem juntas)
    const wordCoOccurrences = [];
    for (let i = 0; i < registeredWords.length; i++) {
      for (let j = i + 1; j < registeredWords.length; j++) {
        const w1 = registeredWords[i];
        const w2 = registeredWords[j];
        const sharedMemories = w1.memoryIds.filter(id => w2.memoryIds.includes(id));
        if (sharedMemories.length > 0) {
          wordCoOccurrences.push({
            id: `edge-word-${w1.id}-${w2.id}`,
            source: `word-${w1.id}`,
            target: `word-${w2.id}`,
            sharedCount: sharedMemories.length,
            memoryIds: sharedMemories
          });
        }
      }
    }

    return res.json({
      success: true,
      memoryNodes,
      memoryEdges,
      registeredWords,
      suggestedWords,
      wordCoOccurrences
    });
  } catch (err) {
    console.error('[Graph:Data] Erro:', err);
    return res.status(500).json({ error: 'Falha ao processar dados do grafo.' });
  }
});

/**
 * POST /api/graph/words
 * Cadastra uma nova palavra ou aprova uma sugestão
 */
router.post('/words', requireAuth, (req, res) => {
  try {
    const { word, color = '#EC4899', meaningOrNote = null, iconName = 'Sparkles' } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({ error: 'A palavra é obrigatória.' });
    }

    const clean = String(word).trim();
    const norm = normalizeWord(clean);

    const existing = db.select().from(wordNodes).where(eq(wordNodes.normalizedWord, norm)).get();
    if (existing) {
      return res.json({
        success: true,
        word: existing,
        message: 'Esta palavra já estava registrada no grafo!'
      });
    }

    const insertResult = db.insert(wordNodes).values({
      word: clean,
      normalizedWord: norm,
      meaningOrNote: meaningOrNote ? String(meaningOrNote).trim() : null,
      color: String(color || '#EC4899').trim(),
      iconName: String(iconName || 'Sparkles').trim(),
      createdBy: req.user.id,
      isCustom: 1,
      createdAt: new Date().toISOString()
    }).run();

    const created = db.select().from(wordNodes).where(eq(wordNodes.id, Number(insertResult.lastInsertRowid))).get();

    return res.status(201).json({
      success: true,
      message: `Palavra "${clean}" eternizada no grafo! ✨`,
      word: created
    });
  } catch (err) {
    console.error('[Graph:WordCreate] Erro:', err);
    return res.status(500).json({ error: 'Falha ao registrar palavra.' });
  }
});

/**
 * DELETE /api/graph/words/:id
 * Remove uma palavra do grafo
 */
router.delete('/words/:id', requireAuth, (req, res) => {
  try {
    const wordId = Number(req.params.id);
    db.delete(wordNodes).where(eq(wordNodes.id, wordId)).run();

    return res.json({
      success: true,
      message: 'Palavra removida do grafo.'
    });
  } catch (err) {
    console.error('[Graph:WordDelete] Erro:', err);
    return res.status(500).json({ error: 'Falha ao remover palavra.' });
  }
});

export default router;
