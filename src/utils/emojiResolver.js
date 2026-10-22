/**
 * emojiResolver.js
 * Utilitário universal para resolução, parsing e renderização de emojis do Discord
 * Converte tokens <:nome:id> e <a:nome:id> em tags HTML <img> otimizadas com CDN do Discord
 * e provê a função canônica resolveEmoji(client, slotId, mode).
 */

const { getEmoji } = require('./appEmojis');
const { getThemeEmojiUrl } = require('./themeEmojis');

// Regex para emojis customizados estáticos <:nome:id> e animados <a:nome:id>
const DISCORD_EMOJI_REGEX = /<(a)?:([a-zA-Z0-9_~]+):([0-9]{17,21})>/g;

/**
 * Retorna a URL da CDN oficial do Discord para um dado emoji ID
 * @param {string} emojiId Snowflake ID do emoji
 * @param {boolean} [isAnimated=false]
 * @param {number} [size=32]
 */
function getDiscordEmojiUrl(emojiId, isAnimated = false, size = 32) {
  if (!emojiId) return '';
  const ext = isAnimated ? 'gif' : 'webp';
  return `https://cdn.discordapp.com/emojis/${emojiId}.${ext}?size=${size}&quality=lossless`;
}

/**
 * Converte qualquer token de emoji do Discord dentro de uma string em uma tag <img> HTML
 * @param {string} text Texto que pode conter emojis do Discord (<:nome:id>)
 * @param {Object} [options]
 * @param {number} [options.size=20] Tamanho em px (width e height)
 * @param {string} [options.extraClass=''] Classes CSS adicionais
 * @returns {string} String com tags <img> HTML inline
 */
function parseDiscordEmojisToHtml(text, options = {}) {
  if (!text || typeof text !== 'string') return '';
  const size = options.size || 20;
  const extraClass = options.extraClass ? ` ${options.extraClass}` : '';

  return text.replace(DISCORD_EMOJI_REGEX, (_match, animated, name, id) => {
    const isAnim = Boolean(animated);
    const url = getDiscordEmojiUrl(id, isAnim, Math.max(32, size));
    const cleanAlt = String(name).replace(/"/g, '&quot;');
    return `<img src="${url}" alt="${cleanAlt}" title="${cleanAlt}" class="pyxie-inline-emoji${extraClass}" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;display:inline-block;margin:0 2px;flex-shrink:0;" loading="lazy" onerror="this.style.display='none'" />`;
  });
}

/**
 * Remove tokens de emojis brutos de uma string, deixando apenas texto limpo
 * @param {string} text
 * @returns {string}
 */
function stripDiscordEmojis(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(DISCORD_EMOJI_REGEX, '').replace(/\s+/g, ' ').trim();
}

/**
 * Extrai o primeiro ID de emoji customizado encontrado em uma string
 * @param {string} text
 * @returns {{ id: string, name: string, animated: boolean } | null}
 */
function extractFirstEmoji(text) {
  if (!text || typeof text !== 'string') return null;
  const match = new RegExp(DISCORD_EMOJI_REGEX.source).exec(text);
  if (!match) return null;
  return {
    animated: Boolean(match[1]),
    name: match[2],
    id: match[3],
    url: getDiscordEmojiUrl(match[3], Boolean(match[1]), 64),
  };
}

/**
 * Resolve canonicamente um slot de emoji ou token para os ambientes Discord ou Web
 * @param {import('discord.js').Client|null} client Cliente Discord ativo
 * @param {string} slotId Identificador do slot ou chave de emoji
 * @param {'discord'|'web'} [mode='discord'] Modo de saída
 * @returns {string} Tag formatada para Discord (<:nome:id>) ou URL CDN/Unicode para Web
 */
function resolveEmoji(client, slotId, mode = 'discord') {
  if (!slotId) return mode === 'web' ? '' : '✨';

  // 1. Se já for um token formatado <:nome:id> ou <a:nome:id>
  const first = extractFirstEmoji(String(slotId));
  if (first) {
    if (mode === 'web') {
      return getDiscordEmojiUrl(first.id, first.animated, 32);
    }
    return first.animated ? `<a:${first.name}:${first.id}>` : `<:${first.name}:${first.id}>`;
  }

  // 2. Se o cliente possuir cache de emojis da aplicação ou guildas
  if (client) {
    const cleanSlot = String(slotId).toLowerCase();
    const found =
      client.emojis?.cache?.find((e) => e.name?.toLowerCase() === cleanSlot || e.id === slotId) ||
      client.application?.emojis?.cache?.find((e) => e.name?.toLowerCase() === cleanSlot || e.id === slotId);

    if (found) {
      if (mode === 'web') {
        return getDiscordEmojiUrl(found.id, found.animated, 32);
      }
      return found.toString();
    }
  }

  // 3. Resolução via appEmojis.js
  let resolved = null;
  try {
    resolved = getEmoji(slotId);
  } catch (_) {
    resolved = slotId;
  }

  if (mode === 'discord') {
    return resolved || '✨';
  }

  // 4. Modo Web: Se resolved for tag customizada do Discord, converte para URL
  if (resolved) {
    const parsed = extractFirstEmoji(resolved);
    if (parsed) {
      return getDiscordEmojiUrl(parsed.id, parsed.animated, 32);
    }
  }

  // Verifica se há URL configurada no themeEmojis
  try {
    const themeUrl = getThemeEmojiUrl(slotId);
    if (themeUrl) return themeUrl;
  } catch (_) {}

  if (typeof resolved === 'string' && (resolved.startsWith('http://') || resolved.startsWith('https://'))) {
    return resolved;
  }

  // Fallback em unicode nativo
  return resolved || '';
}

module.exports = {
  getDiscordEmojiUrl,
  parseDiscordEmojisToHtml,
  stripDiscordEmojis,
  extractFirstEmoji,
  resolveEmoji,
  DISCORD_EMOJI_REGEX,
};
