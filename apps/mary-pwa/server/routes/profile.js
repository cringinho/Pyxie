import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, sanitizeUser } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.resolve(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Multer configurado em memória para pós-processamento com Sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB máximo para upload
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
 * POST /api/profile/avatar
 * Upload com recorte 400x400 cover, compressão WebP (quality 85) e remoção de avatar antigo
 */
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    const currentUserId = req.user.id;
    const currentUser = db.select().from(users).where(eq(users.id, currentUserId)).get();

    // 1. Apagar avatar antigo do disco para economizar espaço na VM
    if (currentUser?.avatarUrl && currentUser.avatarUrl.startsWith('/api/uploads/avatars/')) {
      const oldFilename = path.basename(currentUser.avatarUrl);
      const oldFilePath = path.join(avatarsDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log(`[Profile] Avatar antigo removido: ${oldFilename}`);
        } catch (cleanupErr) {
          console.warn('[Profile] Aviso ao remover avatar antigo:', cleanupErr.message);
        }
      }
    }

    // 2. Processar e comprimir nova imagem com Sharp (WebP 400x400 cover)
    const newFilename = `avatar_${currentUser.username}_${Date.now()}.webp`;
    const newFilePath = path.join(avatarsDir, newFilename);

    await sharp(req.file.buffer)
      .rotate() // Respeita rotação EXIF de fotos do smartphone
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(newFilePath);

    const publicAvatarUrl = `/api/uploads/avatars/${newFilename}`;
    const now = new Date().toISOString();

    // 3. Persistir no SQLite
    db.update(users)
      .set({
        avatarUrl: publicAvatarUrl,
        updatedAt: now
      })
      .where(eq(users.id, currentUserId))
      .run();

    const updatedUser = db.select().from(users).where(eq(users.id, currentUserId)).get();

    return res.json({
      success: true,
      message: 'Foto de perfil atualizada com sucesso!',
      avatarUrl: publicAvatarUrl,
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('[Profile:Avatar] Erro:', err);
    return res.status(500).json({ error: err.message || 'Falha ao processar a imagem de perfil.' });
  }
});

/**
 * PATCH /api/profile
 * Atualiza campos customizáveis de perfil (displayName, nickname, bio, moodStatus, theme, bannerColor)
 */
router.patch('/', requireAuth, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { displayName, nickname, bio, moodStatus, theme, bannerColor } = req.body;

    const updates = {
      updatedAt: new Date().toISOString()
    };

    if (typeof displayName === 'string' && displayName.trim().length > 0) {
      updates.displayName = displayName.trim().slice(0, 50);
    }
    if (typeof nickname === 'string') {
      updates.nickname = nickname.trim().slice(0, 50);
    }
    if (typeof bio === 'string') {
      updates.bio = bio.trim().slice(0, 300);
    }
    if (typeof moodStatus === 'string') {
      updates.moodStatus = moodStatus.trim().slice(0, 100);
    }
    if (typeof theme === 'string') {
      updates.theme = theme.trim().slice(0, 50);
    }
    if (typeof bannerColor === 'string') {
      updates.bannerColor = bannerColor.trim().slice(0, 20);
    }

    db.update(users).set(updates).where(eq(users.id, currentUserId)).run();

    const updatedUser = db.select().from(users).where(eq(users.id, currentUserId)).get();

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('[Profile:Patch] Erro:', err);
    return res.status(500).json({ error: 'Falha ao atualizar informações do perfil.' });
  }
});

export default router;
