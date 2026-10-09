const fs = require('node:fs');
const path = require('node:path');
const { AttachmentBuilder } = require('discord.js');

const ASSET_SEARCH_DIRS = [
  path.join(__dirname, '../../assets/pyxie'),
  path.join(__dirname, '../../public/assets/pyxie'),
];

const EMOTION_MAP = {
  VICTORY: {
    default: 'sticker/sticker_win_victory.png',
    pose: 'emojis/pyxie_pose_victory.png',
  },
  CONQUEST: {
    default: 'sticker/sticker_win_victory.png',
    pose: 'emojis/pyxie_pose_victory.png',
  },
  COOLDOWN: {
    default: 'sticker/sticker_sad.png',
    face: 'emojis/pyxie_sad_face.png',
  },
  DEFEAT: {
    default: 'sticker/sticker_sad.png',
    face: 'emojis/pyxie_sad_face.png',
  },
  SAD: {
    default: 'sticker/sticker_sad.png',
    face: 'emojis/pyxie_sad_face.png',
  },
  DENIED: {
    default: 'sticker/sticker_angry.png',
    shy: 'emojis/pyxie_shy_angry.png',
    stare: 'emojis/pyxie_hmm_stare.png',
  },
  PROHIBITED: {
    default: 'sticker/sticker_angry.png',
    shy: 'emojis/pyxie_shy_angry.png',
    stare: 'emojis/pyxie_hmm_stare.png',
  },
  ANGRY: {
    default: 'sticker/sticker_angry.png',
    shy: 'emojis/pyxie_shy_angry.png',
  },
  WATCHING: {
    default: 'emojis/pyxie_hmm_stare.png',
    confused: 'emojis/astaroth_confused.png',
  },
  SUSPICIOUS: {
    default: 'emojis/pyxie_hmm_stare.png',
  },
  HAPPY: {
    default: 'sticker/sticker_happy.png',
    smile: 'sticker/sticker_smile.png',
  },
  WORRIED: {
    default: 'sticker/sticker_worried.png',
  },
};

/**
 * Resolve o caminho físico absoluto de um asset da Pyxie.
 */
function resolveAssetPath(subpath) {
  if (!subpath) return null;
  for (const baseDir of ASSET_SEARCH_DIRS) {
    const fullPath = path.join(baseDir, subpath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Retorna a URL pública do asset para uso no website ou dashboards.
 */
function getPyxieWebAssetUrl(subpath) {
  const baseUrl = process.env.PANEL_PUBLIC_URL || 'https://pyxie.com.br';
  const cleanSubpath = String(subpath).replace(/\\/g, '/');
  return `${baseUrl}/assets/pyxie/${cleanSubpath}`;
}

/**
 * Cria um AttachmentBuilder a partir do asset solicitado.
 */
function createEmotionAttachment(subpath, customName = null) {
  const absPath = resolveAssetPath(subpath);
  if (!absPath) return null;
  const fileName = customName || path.basename(subpath);
  return new AttachmentBuilder(absPath, { name: fileName });
}

/**
 * Aplica visualmente a emoção ao Embed do Discord (como Thumbnail) e gera o Attachment correspondente.
 * @param {import('discord.js').EmbedBuilder} embed Embed alvo
 * @param {string} emotionKey Chave da emoção (VICTORY, COOLDOWN, DEFEAT, DENIED, WATCHING, etc.)
 * @param {object} [options] Opções adicionais (variant: 'pose'|'face'|'shy'|'stare', etc.)
 * @returns {{ embed: import('discord.js').EmbedBuilder, attachment: import('discord.js').AttachmentBuilder|null, fileName: string|null }}
 */
function applyPyxieEmotion(embed, emotionKey, options = {}) {
  if (!embed) return { embed, attachment: null, fileName: null };

  const key = String(emotionKey || '').toUpperCase().trim();
  const config = EMOTION_MAP[key] || EMOTION_MAP.HAPPY;

  let subpath = config.default;
  if (options.variant && config[options.variant]) {
    subpath = config[options.variant];
  } else if (options.pose && config.pose) {
    subpath = config.pose;
  } else if (options.face && config.face) {
    subpath = config.face;
  } else if (options.shy && config.shy) {
    subpath = config.shy;
  } else if (options.stare && config.stare) {
    subpath = config.stare;
  }

  const attachment = createEmotionAttachment(subpath);
  if (attachment) {
    const fileName = attachment.name;
    embed.setThumbnail(`attachment://${fileName}`);
    return { embed, attachment, fileName };
  }

  return { embed, attachment: null, fileName: null };
}

module.exports = {
  EMOTION_MAP,
  resolveAssetPath,
  getPyxieWebAssetUrl,
  createEmotionAttachment,
  applyPyxieEmotion,
};
