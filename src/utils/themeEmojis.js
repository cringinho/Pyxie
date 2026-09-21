const fs = require('node:fs');
const path = require('node:path');

const THEME_FILE = path.join(__dirname, '..', 'data', 'themeEmojis.json');
const APP_EMOJIS_FILE = path.join(__dirname, '..', 'data', 'discordAppEmojis.json');

// Cache em memória para resolução ultra-rápida
const APP_EMOJI_BY_ID = new Map();
const APP_EMOJI_BY_NAME = new Map();

function loadAppEmojisCatalog() {
  try {
    if (fs.existsSync(APP_EMOJIS_FILE)) {
      const raw = fs.readFileSync(APP_EMOJIS_FILE, 'utf8');
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : (data.items || []);
      for (const item of items) {
        if (item.id && item.name) {
          const entry = {
            id: String(item.id),
            name: item.name,
            animated: Boolean(item.animated),
            format: item.animated ? `<a:${item.name}:${item.id}>` : `<:${item.name}:${item.id}>`,
            url: `https://cdn.discordapp.com/emojis/${item.id}.${item.animated ? 'gif' : 'png'}`,
          };
          APP_EMOJI_BY_ID.set(entry.id, entry);
          APP_EMOJI_BY_NAME.set(entry.name.toLowerCase(), entry);
        }
      }
    }
  } catch (err) {
    console.warn('[themeEmojis] Aviso ao carregar catálogo de emojis:', err.message);
  }
}

loadAppEmojisCatalog();

function getThemeConfig() {
  try {
    if (fs.existsSync(THEME_FILE)) {
      const raw = fs.readFileSync(THEME_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed && parsed.themes ? parsed.themes : {};
    }
  } catch (err) {
    console.warn('[themeEmojis] Aviso ao ler themeEmojis.json:', err.message);
  }
  return {};
}

/**
 * Resolve o objeto completo de um emoji por ID snowflake.
 * @param {string} emojiId
 * @param {string} [fallback='✨']
 * @returns {{ id: string, name: string, animated: boolean, format: string, url: string }}
 */
function resolveEmojiById(emojiId, fallback = '✨') {
  if (!emojiId) {
    return { id: null, name: 'fallback', animated: false, format: fallback, url: null };
  }
  const cached = APP_EMOJI_BY_ID.get(String(emojiId));
  if (cached) return cached;

  // Fallback seguro se não estiver no JSON local
  const format = `<:emoji_${emojiId}:${emojiId}>`;
  const url = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
  return { id: String(emojiId), name: `emoji_${emojiId}`, animated: false, format, url };
}

/**
 * Obtém os dados de um emoji temático por chave de assunto.
 * @param {string} themeKey - Chave configurada em src/data/themeEmojis.json
 * @param {Object} [options={}]
 * @param {boolean|'random'} [options.variant=false] - Se true ou 'random', escolhe aleatoriamente entre as variações da paleta
 * @param {number} [options.index] - Índice específico da lista de variações
 * @param {string} [options.fallback] - Fallback unicode personalizado
 * @returns {{ id: string, name: string, animated: boolean, format: string, url: string }}
 */
function getThemeEmojiData(themeKey, options = {}) {
  const themes = getThemeConfig();
  const theme = themes[themeKey];

  if (!theme) {
    const fallback = options.fallback || '✨';
    return { id: null, name: 'unknown', animated: false, format: fallback, url: null };
  }

  let selectedId = theme.primaryId;

  const hasSecondaries = Array.isArray(theme.secondaryIds) && theme.secondaryIds.length > 0;
  if (hasSecondaries && (options.variant === true || options.variant === 'random' || options.random === true)) {
    const pool = [theme.primaryId, ...theme.secondaryIds];
    selectedId = pool[Math.floor(Math.random() * pool.length)];
  } else if (hasSecondaries && typeof options.index === 'number') {
    const pool = [theme.primaryId, ...theme.secondaryIds];
    const idx = Math.max(0, Math.min(pool.length - 1, options.index));
    selectedId = pool[idx];
  }

  const resolved = resolveEmojiById(selectedId, theme.fallback || options.fallback || '✨');
  return resolved;
}

/**
 * Retorna o emoji formatado para o Discord (`<a:nome:id>` ou `<:nome:id>`).
 * @param {string} themeKey
 * @param {Object} [options={}]
 * @returns {string}
 */
function getThemeEmoji(themeKey, options = {}) {
  const data = getThemeEmojiData(themeKey, options);
  return data.format || options.fallback || '✨';
}

/**
 * Retorna a URL direta do CDN do emoji (GIF ou PNG) para uso na Web e Embeds.
 * @param {string} themeKey
 * @param {Object} [options={}]
 * @returns {string|null}
 */
function getThemeEmojiUrl(themeKey, options = {}) {
  const data = getThemeEmojiData(themeKey, options);
  return data.url || null;
}

/**
 * Retorna o badge roxo de perfil de usuário configurado.
 * @param {Object} [options={}]
 * @returns {string}
 */
function getUserProfileBadge(options = {}) {
  return getThemeEmoji('userProfile', options);
}

/**
 * Formata um valor de moedas com o novo emoji temático padrão.
 * @param {number|string} amount
 * @param {Object} [options={}]
 * @returns {string}
 */
function formatThemedCoins(amount, options = {}) {
  const emoji = getThemeEmoji('coins', options);
  const val = Number(amount) || 0;
  return `${val.toLocaleString('pt-BR')} ${emoji}`;
}

module.exports = {
  getThemeConfig,
  resolveEmojiById,
  getThemeEmojiData,
  getThemeEmoji,
  getThemeEmojiUrl,
  getUserProfileBadge,
  formatThemedCoins,
};

