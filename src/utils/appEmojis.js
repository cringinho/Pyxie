/**
 * Gerenciador de Emojis da Aplicação (Discord Application Emojis).
 * Permite que o bot utilize emojis personalizados registrados globalmente na sua aplicação Discord
 * (até 2.000 emojis) sem depender de servidores externos ou Nitro, com fallbacks automáticos em Unicode.
 */

const APP_EMOJI_CACHE = new Map();

// Mapeamento padrão de identificadores para emojis oficiais da aplicação (Discord Dev Portal) e fallbacks Unicode
const EMOJI_DEFINITIONS = {
  // Moedas & Economia
  COIN: { name: 'shineygoldcoinsi', aliases: ['moedinha', 'coin'], fallback: '🪙' },
  COIN_PURPLE: { name: 'gifggpurplecoin5', aliases: ['phantom_coin', 'purplecoin'], fallback: '🪙' },
  MAGIC_BEAN: { name: 'peakmagicbean', aliases: ['feijao_magico', 'magic_bean'], fallback: '🌱' },
  DIAMOND: { name: 'diamante', aliases: ['diamond'], fallback: '💎' },
  BAG: { name: 'a1backpack', aliases: ['mochila', 'backpack'], fallback: '🎒' },
  TROPHY: { name: 'win', aliases: ['trofeu', 'trophy'], fallback: '🏆' },
  CROWN: { name: 'Crown', aliases: ['coroa', 'crown'], fallback: '👑' },
  HEART: { name: 'purpleheartdrip2', aliases: ['coracao', 'heart'], fallback: '💖' },
  STAR: { name: 'pastelstarturn60', aliases: ['estrela', 'star'], fallback: '⭐' },
  CHEST: { name: 'rarecrate', aliases: ['bau', 'chest'], fallback: '📦' },

  // Bosque da Pyxie & RPG
  TREE: { name: 'emojitree38', aliases: ['arvore', 'tree'], fallback: '🌲' },
  PORTAL: { name: 'portalframe98', aliases: ['portal'], fallback: '🌀' },
  GHOST: { name: 'pinkghost', aliases: ['fantasma', 'ghost'], fallback: '👻' },
  SKULL: { name: 'kikskull', aliases: ['caveira', 'skull'], fallback: '💀' },
  WITCH: { name: 'witchwumpus', aliases: ['bruxa', 'witch'], fallback: '🧙' },
  BOOK: { name: 'book2716', aliases: ['livro', 'book'], fallback: '📖' },
  SHIELD: { name: 'shieldsuccess22', aliases: ['escudo', 'shield'], fallback: '🛡️' },
  ZAP: { name: 'zap65', aliases: ['energia', 'zap'], fallback: '⚡' },
  CONTROLLER: { name: 'ykawaiicontrolle', aliases: ['controle', 'game'], fallback: '🎮' },
  CODING: { name: 'coding41', aliases: ['trabalho', 'work'], fallback: '💼' },

  // UI & Notificações
  CHECK: { name: 'shieldsuccess22', aliases: ['check_mark', 'check'], fallback: '✅' },
  CROSS: { name: 'x_', aliases: ['cross_mark', 'cross', 'erro'], fallback: '❌' },
  HOURGLASS: { name: 'ampulheta', aliases: ['hourglass'], fallback: '⏳' },
  GIFT: { name: 'qbgifts48', aliases: ['presente', 'gift'], fallback: '🎁' },
  SPARKLES: { name: 'purplesparkles', aliases: ['brilhos', 'sparkles'], fallback: '✨' },
  ROCKET: { name: 'slrocket', aliases: ['foguete', 'rocket'], fallback: '🚀' },
  MOON: { name: 'pixdreamsmooncha', aliases: ['lua', 'moon'], fallback: '🌙' },
  FAIRY: { name: 'fairy', aliases: ['fada'], fallback: '🧚' },
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
  if (!def) {
    if (typeof emojiKey === 'string') {
      const direct = APP_EMOJI_CACHE.get(emojiKey.toLowerCase());
      if (direct) return direct;
      return emojiKey;
    }
    return '✨';
  }

  const names = [def.name, ...(def.aliases || [])];
  for (const n of names) {
    const cached = APP_EMOJI_CACHE.get(n.toLowerCase());
    if (cached) return cached;
  }
  return def.fallback;
}

module.exports = {
  EMOJI_DEFINITIONS,
  syncApplicationEmojis,
  getEmoji,
};

