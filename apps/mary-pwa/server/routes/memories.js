import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { memories, memoryMedia, memoryLikes, memoryConnections, users, wordNodes } from '../db/schema.js';
import { eq, desc, inArray, or } from 'drizzle-orm';
import { requireAuth, sanitizeUser } from '../middlewares/auth.js';
import { sendPushToPartner } from '../pushService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsMemoriesDir = path.resolve(__dirname, '../uploads/memories');
const thumbsMemoriesDir = path.resolve(__dirname, '../uploads/memories/thumbs');

if (!fs.existsSync(thumbsMemoriesDir)) {
  fs.mkdirSync(thumbsMemoriesDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
    cb(null, true);
  }
});

const router = express.Router();

/**
 * GET /api/memories
 * Lista relatos com imagens, likes/reações, conexões do grafo e guarda de Cápsula do Tempo
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const rawMemories = db.select()
      .from(memories)
      .orderBy(desc(memories.memoryDate), desc(memories.id))
      .all();

    if (rawMemories.length === 0) {
      return res.json({ success: true, memories: [] });
    }

    const memoryIds = rawMemories.map(m => m.id);

    const allMedia = db.select()
      .from(memoryMedia)
      .where(inArray(memoryMedia.memoryId, memoryIds))
      .all();

    const allLikes = db.select({
      id: memoryLikes.id,
      memoryId: memoryLikes.memoryId,
      userId: memoryLikes.userId,
      reaction: memoryLikes.reaction,
      createdAt: memoryLikes.createdAt,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl
    })
      .from(memoryLikes)
      .leftJoin(users, eq(memoryLikes.userId, users.id))
      .where(inArray(memoryLikes.memoryId, memoryIds))
      .all();

    const allConnections = db.select()
      .from(memoryConnections)
      .where(or(
        inArray(memoryConnections.sourceMemoryId, memoryIds),
        inArray(memoryConnections.targetMemoryId, memoryIds)
      ))
      .all();

    const allUsers = db.select().from(users).all();
    const userMap = new Map(allUsers.map(u => [u.id, sanitizeUser(u)]));
    const now = new Date();

    const formatted = rawMemories.map((m) => {
      const author = userMap.get(m.authorId) || { displayName: 'Desconhecido', nickname: '' };
      const mediaList = allMedia.filter(med => med.memoryId === m.id);
      const likesList = allLikes.filter(l => l.memoryId === m.id);
      const connectionsList = allConnections.filter(c => c.sourceMemoryId === m.id || c.targetMemoryId === m.id);

      const isLocked = Boolean(m.isCapsule) && m.unlockAt && new Date(m.unlockAt) > now;

      let safeTags = [];
      try {
        safeTags = m.tags ? JSON.parse(m.tags) : [];
      } catch (e) {
        safeTags = typeof m.tags === 'string' ? m.tags.split(',').map(s => s.trim()) : [];
      }

      return {
        id: m.id,
        authorId: m.authorId,
        author,
        title: m.title,
        content: isLocked
          ? `🔒 Esta cápsula do tempo está selada com amor e só será aberta em ${new Date(m.unlockAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`
          : m.content,
        memoryDate: m.memoryDate,
        mood: m.mood,
        tags: safeTags,
        location: m.location,
        isCapsule: Boolean(m.isCapsule),
        unlockAt: m.unlockAt,
        isLocked,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        media: isLocked ? [] : mediaList,
        likes: likesList,
        connectionsCount: connectionsList.length,
        connections: connectionsList
      };
    });

    return res.json({ success: true, memories: formatted });
  } catch (err) {
    console.error('[Memories:Get] Erro ao listar:', err);
    return res.status(500).json({ error: 'Falha ao buscar relatos.' });
  }
});

/**
 * POST /api/memories
 * Cria relato com upload múltiplo de imagens comprimidas com Sharp (.webp)
 */
router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      content,
      memoryDate,
      mood,
      tags,
      location,
      isCapsule,
      unlockAt,
      connectedMemoryIds,
      customWords
    } = req.body;

    if (!title || !content || !memoryDate) {
      return res.status(400).json({ error: 'Título, conteúdo e data do relato são obrigatórios.' });
    }

    const now = new Date().toISOString();

    let parsedTags = '[]';
    if (tags) {
      if (Array.isArray(tags)) parsedTags = JSON.stringify(tags);
      else if (typeof tags === 'string') {
        try {
          parsedTags = JSON.stringify(JSON.parse(tags));
        } catch (e) {
          parsedTags = JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean));
        }
      }
    }

    // 1. Inserir relato
    const insertResult = db.insert(memories).values({
      authorId: req.user.id,
      title: String(title).trim(),
      content: String(content).trim(),
      memoryDate: String(memoryDate).trim(),
      mood: mood ? String(mood).trim() : null,
      tags: parsedTags,
      location: location ? String(location).trim() : null,
      isCapsule: isCapsule === 'true' || isCapsule === true || isCapsule === 1 ? 1 : 0,
      unlockAt: unlockAt ? String(unlockAt).trim() : null,
      createdAt: now,
      updatedAt: now
    }).run();

    const memoryId = Number(insertResult.lastInsertRowid);

    // 2. Processar imagens anexadas com Sharp
    const savedMedia = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const timestamp = Date.now();
        const mainFilename = `memory_${memoryId}_${i}_${timestamp}.webp`;
        const thumbFilename = `thumb_${memoryId}_${i}_${timestamp}.webp`;

        const mainPath = path.join(uploadsMemoriesDir, mainFilename);
        const thumbPath = path.join(thumbsMemoriesDir, thumbFilename);

        const metadata = await sharp(file.buffer).metadata();

        await sharp(file.buffer)
          .rotate()
          .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(mainPath);

        await sharp(file.buffer)
          .rotate()
          .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(thumbPath);

        const mediaInsert = db.insert(memoryMedia).values({
          memoryId,
          uploadedBy: req.user.id,
          albumName: 'Relatos',
          caption: null,
          fileUrl: `/api/uploads/memories/${mainFilename}`,
          thumbUrl: `/api/uploads/memories/thumbs/${thumbFilename}`,
          width: metadata.width || 800,
          height: metadata.height || 600,
          isFavorite: 0,
          takenAt: String(memoryDate).trim(),
          createdAt: now
        }).run();

        savedMedia.push({
          id: Number(mediaInsert.lastInsertRowid),
          fileUrl: `/api/uploads/memories/${mainFilename}`,
          thumbUrl: `/api/uploads/memories/thumbs/${thumbFilename}`
        });
      }
    }

    // 3. Vincular memórias conectadas
    if (connectedMemoryIds) {
      let ids = [];
      try {
        ids = Array.isArray(connectedMemoryIds) ? connectedMemoryIds : JSON.parse(connectedMemoryIds);
      } catch (e) {
        ids = String(connectedMemoryIds).split(',').map(s => Number(s.trim())).filter(Boolean);
      }

      for (const targetId of ids) {
        if (targetId && Number(targetId) !== memoryId) {
          db.insert(memoryConnections).values({
            sourceMemoryId: memoryId,
            targetMemoryId: Number(targetId),
            label: 'Conectado',
            createdAt: now
          }).run();
        }
      }
    }

    // 4. Cadastrar palavras customizadas no grafo
    if (customWords) {
      let wordsArr = [];
      try {
        wordsArr = Array.isArray(customWords) ? customWords : JSON.parse(customWords);
      } catch (e) {
        wordsArr = String(customWords).split(',').map(s => s.trim()).filter(Boolean);
      }

      for (const wordStr of wordsArr) {
        const clean = String(wordStr).trim();
        const norm = clean.toLowerCase();
        if (clean.length > 1) {
          const exists = db.select().from(wordNodes).where(eq(wordNodes.normalizedWord, norm)).get();
          if (!exists) {
            db.insert(wordNodes).values({
              word: clean,
              normalizedWord: norm,
              meaningOrNote: `Criada no relato "${title}"`,
              color: '#EC4899',
              iconName: 'Sparkles',
              createdBy: req.user.id,
              isCustom: 1,
              createdAt: now
            }).run();
          }
        }
      }
    }

    const created = db.select().from(memories).where(eq(memories.id, memoryId)).get();
    // Dispara notificação push para o parceiro
    sendPushToPartner(req.user.id, {
      title: '💌 Nova Memória no Universo!',
      body: `${req.user.nickname || req.user.displayName} adicionou: "${title}"`,
      url: '/?tab=feed'
    }).catch(() => null);


    let returnedTags = [];
    try {
      returnedTags = JSON.parse(parsedTags);
    } catch (e) {
      returnedTags = [];
    }

    return res.status(201).json({
      success: true,
      message: 'Relato gravado no Universo com sucesso! ✨',
      memory: {
        ...created,
        tags: returnedTags,
        media: savedMedia,
        author: sanitizeUser(req.user),
        likes: [],
        connectionsCount: 0,
        connections: []
      }
    });
  } catch (err) {
    console.error('[Memories:Create] Erro ao criar relato:', err);
    return res.status(500).json({ error: err.message || 'Falha ao salvar relato.' });
  }
});

/**
 * POST /api/memories/:id/like
 * Alterna ou atualiza o like / reação do usuário no relato
 */
router.post('/:id/like', requireAuth, (req, res) => {
  try {
    const memoryId = Number(req.params.id);
    const userId = req.user.id;
    const { reaction = 'heart' } = req.body;

    const validReactions = ['heart', 'sparkle', 'kuromi', 'fire', 'emotional'];
    const chosenReaction = validReactions.includes(reaction) ? reaction : 'heart';

    const existingLike = db.select()
      .from(memoryLikes)
      .where(eq(memoryLikes.memoryId, memoryId))
      .all()
      .find(l => l.userId === userId);

    let action = 'added';

    if (existingLike) {
      if (existingLike.reaction === chosenReaction) {
        // Mesmo like -> remove (toggle)
        db.delete(memoryLikes).where(eq(memoryLikes.id, existingLike.id)).run();
        action = 'removed';
      } else {
        // Reação diferente -> atualiza
        db.update(memoryLikes)
          .set({ reaction: chosenReaction })
          .where(eq(memoryLikes.id, existingLike.id))
          .run();
        action = 'updated';
      }
    } else {
      db.insert(memoryLikes).values({
        memoryId,
        userId,
        reaction: chosenReaction,
        createdAt: new Date().toISOString()
      }).run();
      action = 'added';
    }

    const updatedLikes = db.select({
      id: memoryLikes.id,
      memoryId: memoryLikes.memoryId,
      userId: memoryLikes.userId,
      reaction: memoryLikes.reaction,
      username: users.username,
      displayName: users.displayName,
      nickname: users.nickname,
      avatarUrl: users.avatarUrl
    })
      .from(memoryLikes)
      .leftJoin(users, eq(memoryLikes.userId, users.id))
      .where(eq(memoryLikes.memoryId, memoryId))
      .all();

    // Dispara push para o autor da memória caso seja uma reação positiva
    if (action === 'added' || action === 'updated') {
      const memoryItem = db.select().from(memories).where(eq(memories.id, memoryId)).get();
      if (memoryItem && memoryItem.authorId !== req.user.id) {
        sendPushToPartner(req.user.id, {
          title: '❤️ Reação no seu relato!',
          body: `${req.user.nickname || req.user.displayName} amou o seu relato "${memoryItem.title}"!`,
          url: '/?tab=feed'
        }).catch(() => null);
      }
    }

    return res.json({
      success: true,
      action,
      likes: updatedLikes,
      userReaction: action === 'removed' ? null : chosenReaction
    });
  } catch (err) {
    console.error('[Memories:Like] Erro ao alternar like:', err);
    return res.status(500).json({ error: 'Falha ao processar reação.' });
  }
});

/**
 * DELETE /api/memories/:id
 * Remove relato e arquivos anexados
 */
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const memoryId = Number(req.params.id);
    const memory = db.select().from(memories).where(eq(memories.id, memoryId)).get();

    if (!memory) {
      return res.status(404).json({ error: 'Relato não encontrado.' });
    }

    if (memory.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para apagar este relato.' });
    }

    const mediaFiles = db.select().from(memoryMedia).where(eq(memoryMedia.memoryId, memoryId)).all();
    for (const m of mediaFiles) {
      try {
        const mainPath = path.join(uploadsMemoriesDir, path.basename(m.fileUrl));
        const thumbPath = path.join(thumbsMemoriesDir, path.basename(m.thumbUrl || ''));
        if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      } catch (fileErr) {
        console.warn('[Memories:Delete] Aviso ao remover arquivo:', fileErr.message);
      }
    }

    db.delete(memories).where(eq(memories.id, memoryId)).run();

    return res.json({ success: true, message: 'Relato removido com sucesso.' });
  } catch (err) {
    console.error('[Memories:Delete] Erro ao deletar relato:', err);
    return res.status(500).json({ error: 'Falha ao excluir relato.' });
  }
});

export default router;
