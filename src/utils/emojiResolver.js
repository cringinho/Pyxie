/**
 * emojiResolver.js
 * Utilitário universal para resolução, parsing e renderização de emojis do Discord
 * Converte tokens <:nome:id> e <a:nome:id> em tags HTML <img> otimizadas com CDN do Discord.
 */

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

module.exports = {
  getDiscordEmojiUrl,
  parseDiscordEmojisToHtml,
  stripDiscordEmojis,
  extractFirstEmoji,
  DISCORD_EMOJI_REGEX,
};
