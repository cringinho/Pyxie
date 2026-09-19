/**
 * Gerenciador de Emojis da Aplicação (Discord Application Emojis).
 * Permite que o bot utilize emojis personalizados registrados globalmente na sua aplicação Discord
 * (até 2.000 emojis) sem depender de servidores externos ou Nitro, com fallbacks automáticos em Unicode.
 */

const APP_EMOJI_CACHE = new Map();

// Mapeamento padrão de identificadores para emojis oficiais da aplicação (Discord Dev Portal) e fallbacks Unicode
const EMOJI_DEFINITIONS = {
  // Moedas & Economia
  COIN: { name: 'shineygoldcoinsi', fallback: '🪙' },
  COIN_PURPLE: { name: 'gifggpurplecoin5', fallback: '🪙' },
  MAGIC_BEAN: { name: 'peakmagicbean', fallback: '🌱' },
  DIAMOND: { name: 'diamante', fallback: '💎' },
  BAG: { name: 'a1backpack', fallback: '🎒' },
  TROPHY: { name: 'win', fallback: '🏆' },
  CROWN: { name: 'Crown', fallback: '👑' },
  HEART: { name: 'purpleheartdrip2', fallback: '💖' },
  STAR: { name: 'pastelstarturn60', fallback: '⭐' },
  CHEST: { name: 'rarecrate', fallback: '📦' },

  // Bosque da Pyxie & RPG
  TREE: { name: 'emojitree38', fallback: '🌲' },
  PORTAL: { name: 'portalframe98', fallback: '🌀' },
  GHOST: { name: 'pinkghost', fallback: '👻' },
  SKULL: { name: 'kikskull', fallback: '💀' },
  WITCH: { name: 'witchwumpus', fallback: '🧙' },
  BOOK: { name: 'book2716', fallback: '📖' },
  SHIELD: { name: 'shieldsuccess22', fallback: '🛡️' },
  ZAP: { name: 'zap65', fallback: '⚡' },
  CONTROLLER: { name: 'ykawaiicontrolle', fallback: '🎮' },
  CODING: { name: 'coding41', fallback: '💼' },

  // UI & Notificações
  CHECK: { name: 'shieldsuccess22', fallback: '✅' },
  CROSS: { name: 'x_', fallback: '❌' },
  HOURGLASS: { name: 'ampulheta', fallback: '⏳' },
  GIFT: { name: 'qbgifts48', fallback: '🎁' },
  SPARKLES: { name: 'purplesparkles', fallback: '✨' },
  ROCKET: { name: 'slrocket', fallback: '🚀' },
  MOON: { name: 'pixdreamsmooncha', fallback: '🌙' },
  FAIRY: { name: 'fairy', fallback: '🧚' },
};

/**
 * Inicializa e sincroniza o cache com os Application Emojis do bot.
 * @param {import('discord.js').Client} client
 */
async function syncApplicationEmojis(client) {
  try {
    if (!client?.application) return;
    const appEmojis = await client.application.emojis.fetch();
    APP_EMOJI_CACHE.clear();
    for (const [id, emoji] of appEmojis) {
      APP_EMOJI_CACHE.set(emoji.name.toLowerCase(), emoji.toString());
    }
  } catch (error) {
    // Caso o bot não tenha permissões ou a feature não esteja configurada, usa fallbacks silenciosamente
  }
}

/**
 * Obtém a representação em string do emoji (Application Emoji ou Fallback Unicode).
 * @param {keyof typeof EMOJI_DEFINITIONS | string} emojiKey
 * @returns {string}
 */
function getEmoji(emojiKey) {
  const def = EMOJI_DEFINITIONS[emojiKey];
  if (!def) return typeof emojiKey === 'string' ? emojiKey : '✨';

  const cached = APP_EMOJI_CACHE.get(def.name.toLowerCase());
  return cached || def.fallback;
}

module.exports = {
  EMOJI_DEFINITIONS,
  syncApplicationEmojis,
  getEmoji,
};

