import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { memoryMedia, memories, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../middlewares/auth.js';
import { sendPushToPartner } from '../pushService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsGalleryDir = path.resolve(__dirname, '../uploads/gallery');
const thumbsGalleryDir = path.resolve(__dirname, '../uploads/gallery/thumbs');

if (!fs.existsSync(thumbsGalleryDir)) {
  fs.mkdirSync(thumbsGalleryDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 15 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
    cb(null, true);
  }
});

const router = express.Router();

/**
 * GET /api/gallery
 * Retorna fotos da galeria com filtros
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const { month, albumName, isFavorite, type } = req.query;

    let allMedia = db.select({
      id: memoryMedia.id,
      memoryId: memoryMedia.memoryId,
      uploadedBy: memoryMedia.uploadedBy,
      albumName: memoryMedia.albumName,
      caption: memoryMedia.caption,
      fileUrl: memoryMedia.fileUrl,
      thumbUrl: memoryMedia.thumbUrl,
      width: memoryMedia.width,
      height: memoryMedia.height,
      isFavorite: memoryMedia.isFavorite,
      takenAt: memoryMedia.takenAt,
      createdAt: memoryMedia.createdAt,
      uploaderUsername: users.username,
      uploaderDisplayName: users.displayName,
      uploaderNickname: users.nickname,
      uploaderAvatarUrl: users.avatarUrl,
      memoryTitle: memories.title,
      memoryDate: memories.memoryDate
    })
      .from(memoryMedia)
      .leftJoin(users, eq(memoryMedia.uploadedBy, users.id))
      .leftJoin(memories, eq(memoryMedia.memoryId, memories.id))
      .orderBy(desc(memoryMedia.takenAt), desc(memoryMedia.id))
      .all();

    if (month && month.length === 7) {
      allMedia = allMedia.filter(m => (m.takenAt && m.takenAt.startsWith(month)) || (m.createdAt && m.createdAt.startsWith(month)));
    }
    if (albumName && albumName !== 'all') {
      allMedia = allMedia.filter(m => m.albumName === albumName);
    }
    if (isFavorite === 'true' || isFavorite === '1') {
      allMedia = allMedia.filter(m => Boolean(m.isFavorite));
    }
    if (type === 'standalone') {
      allMedia = allMedia.filter(m => !m.memoryId);
    } else if (type === 'memories') {
      allMedia = allMedia.filter(m => Boolean(m.memoryId));
    }

    const rawAlbums = db.select({ albumName: memoryMedia.albumName }).from(memoryMedia).all();
    const albumSet = new Set(rawAlbums.map(a => a.albumName).filter(Boolean));
    ['Nossas Fotos', 'Prints & Memes', 'Saídas', 'Gatinhos', 'Geral'].forEach(a => albumSet.add(a));

    return res.json({
      success: true,
      media: allMedia,
      albums: Array.from(albumSet)
    });
  } catch (err) {
    console.error('[Gallery:Get] Erro ao listar galeria:', err);
    return res.status(500).json({ error: 'Falha ao buscar fotos da galeria.' });
  }
});

/**
 * POST /api/gallery/upload
 * Upload de fotos avulsas para a galeria
 */
router.post('/upload', requireAuth, upload.array('images', 15), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhuma imagem foi selecionada.' });
    }

    const { albumName = 'Nossas Fotos', caption = null, takenAt } = req.body;
    const effectiveDate = takenAt || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const savedItems = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const timestamp = Date.now();
      const mainFilename = `gallery_${timestamp}_${i}.webp`;
      const thumbFilename = `thumb_${timestamp}_${i}.webp`;

      const mainPath = path.join(uploadsGalleryDir, mainFilename);
      const thumbPath = path.join(thumbsGalleryDir, thumbFilename);

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

      const insertResult = db.insert(memoryMedia).values({
        memoryId: null,
        uploadedBy: req.user.id,
        albumName: String(albumName).trim(),
        caption: caption ? String(caption).trim() : null,
        fileUrl: `/api/uploads/gallery/${mainFilename}`,
        thumbUrl: `/api/uploads/gallery/thumbs/${thumbFilename}`,
        width: metadata.width || 800,
        height: metadata.height || 600,
        isFavorite: 0,
        takenAt: effectiveDate,
        createdAt: now
      }).run();

      savedItems.push({
        id: Number(insertResult.lastInsertRowid),
        fileUrl: `/api/uploads/gallery/${mainFilename}`,
        thumbUrl: `/api/uploads/gallery/thumbs/${thumbFilename}`,
        albumName,
        caption
      });
    }
    sendPushToPartner(req.user.id, {
      title: '📸 Novas Fotos na Galeria!',
      body: `${req.user.nickname || req.user.displayName} adicionou ${savedItems.length} novas fotos ao álbum "${albumName}"!`,
      url: '/?tab=gallery'
    }).catch(() => null);


    return res.status(201).json({
      success: true,
      message: `${savedItems.length} fotos salvas com sucesso na galeria!`,
      uploaded: savedItems
    });
  } catch (err) {
    console.error('[Gallery:Upload] Erro ao enviar fotos:', err);
    return res.status(500).json({ error: err.message || 'Falha ao processar imagens.' });
  }
});

/**
 * PATCH /api/gallery/:id/favorite
 * Alterna favorito da foto
 */
router.patch('/:id/favorite', requireAuth, (req, res) => {
  try {
    const mediaId = Number(req.params.id);
    const media = db.select().from(memoryMedia).where(eq(memoryMedia.id, mediaId)).get();

    if (!media) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }

    const newFavorite = media.isFavorite ? 0 : 1;

    db.update(memoryMedia)
      .set({ isFavorite: newFavorite })
      .where(eq(memoryMedia.id, mediaId))
      .run();

    return res.json({
      success: true,
      isFavorite: Boolean(newFavorite),
      message: newFavorite ? 'Adicionada aos favoritos do casal ❤️' : 'Removida dos favoritos'
    });
  } catch (err) {
    console.error('[Gallery:Favorite] Erro:', err);
    return res.status(500).json({ error: 'Falha ao atualizar favorito.' });
  }
});

export default router;
