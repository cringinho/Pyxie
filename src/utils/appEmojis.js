/**
 * Gerenciador de Emojis da Aplicação (Discord Application Emojis).
 * Permite que o bot utilize emojis personalizados registrados globalmente na sua aplicação Discord
 * (até 2.000 emojis) sem depender de servidores externos ou Nitro, com fallbacks automáticos em Unicode.
 */

const APP_EMOJI_CACHE = new Map();

// Pré-carrega todos os 1.182 Discord Application Emojis catalogados
try {
  const data = require('../data/discordAppEmojis.json');
  const items = Array.isArray(data) ? data : (data.items || []);
  for (const item of items) {
    if (item.name && item.id) {
      const formatted = item.animated ? `<a:${item.name}:${item.id}>` : `<:${item.name}:${item.id}>`;
      APP_EMOJI_CACHE.set(item.name.toLowerCase(), formatted);
    }
  }
} catch (_) {}

// Mapeamento padrão de identificadores para emojis oficiais da aplicação (Discord Dev Portal) e fallbacks Unicode
const EMOJI_DEFINITIONS = {
  // Asas & Identidade da Pyxie
  WINGS: { name: 'pinkeing', aliases: ['asas', 'wings', 'pinkwings'], fallback: '🪽' },
  WINGS_PURPLE: { name: '9194purplewing', aliases: ['asas_roxas', 'purplewing'], fallback: '🪽' },
  BUTTERFLY: { name: '5056purplebutterfly', aliases: ['borboleta', 'butterfly', 'purplebutterfy', '255208butterfly'], fallback: '🦋' },
  ANGEL: { name: 'Angel', aliases: ['anjo', 'angel', '3138angelheart'], fallback: '👼' },
  MELODY: { name: '6735mymelodycuteeyes', aliases: ['melody', 'mymelody', '13038mymelody'], fallback: '🐰' },
  SPELLBOOK: { name: '6449spellbook', aliases: ['grimorio', 'livro_feiticos', '42985spellbook', 'enchantedbook'], fallback: '📖' },

  // Moedas & Economia
  COIN: { name: 'shineygoldcoinsi', aliases: ['moedinha', 'coin'], fallback: '🪙' },
  COIN_PURPLE: { name: 'gifggpurplecoin5', aliases: ['phantom_coin', 'purplecoin'], fallback: '🪙' },
  MAGIC_BEAN: { name: 'peakmagicbean', aliases: ['feijao_magico', 'magic_bean'], fallback: '🌱' },
  DIAMOND: { name: 'diamante', aliases: ['diamond', '9862_holo_diamond'], fallback: '💎' },
  BAG: { name: 'a1backpack', aliases: ['mochila', 'backpack'], fallback: '🎒' },
  TROPHY: { name: 'win', aliases: ['trofeu', 'trophy'], fallback: '🏆' },
  CROWN: { name: 'coroa', aliases: ['crown'], fallback: '<:crown:1551356621316300890>' },
  HEART: { name: 'purpleheartdrip2', aliases: ['coracao', 'heart', '7420_Animated_pink_heart'], fallback: '💖' },
  STAR: { name: 'pastelstarturn60', aliases: ['estrela', 'star', '8881shootingstars', '86300hangingstars'], fallback: '⭐' },
  CHEST: { name: 'bau', aliases: ['chest'], fallback: '<:chest:1551744119670575124>' },

  // Bosque da Pyxie & RPG
  TREE: { name: 'bosque', aliases: ['tree', 'arvore'], fallback: '<:tree:1551356435521339452>' },
  PORTAL: { name: 'mapa', aliases: ['map', 'portao'], fallback: '<:map:1551355962974273546>' },
  MAP: { name: 'mapa', aliases: ['map'], fallback: '<:map:1551355962974273546>' },
  GHOST: { name: 'pinkghost', aliases: ['fantasma', 'ghost'], fallback: '👻' },
  SKULL: { name: 'kikskull', aliases: ['caveira', 'skull'], fallback: '💀' },
  WITCH: { name: 'witchwumpus', aliases: ['bruxa', 'witch'], fallback: '🧙' },
  BOOK: { name: '6449spellbook', aliases: ['livro', 'book', 'book2716'], fallback: '📖' },
  SHIELD: { name: 'shieldsuccess22', aliases: ['escudo', 'shield'], fallback: '🛡️' },
  ZAP: { name: 'zap65', aliases: ['energia', 'zap'], fallback: '⚡' },
  CONTROLLER: { name: 'ykawaiicontrolle', aliases: ['controle', 'game'], fallback: '🎮' },
  CODING: { name: 'coding41', aliases: ['trabalho', 'work'], fallback: '💼' },

  // UI & Notificações
  CHECK: { name: 'shieldsuccess22', aliases: ['check_mark', 'check', '6586_TickYes_RainbowGif', '9434purpleverification'], fallback: '✅' },
  CROSS: { name: 'x_', aliases: ['cross_mark', 'cross', 'erro'], fallback: '❌' },
  HOURGLASS: { name: '48390wizardhourglass', aliases: ['ampulheta', 'hourglass'], fallback: '⏳' },
  GIFT: { name: 'qbgifts48', aliases: ['presente', 'gift', 'acgift70'], fallback: '🎁' },
  SPARKLES: { name: 'purplesparkles', aliases: ['brilhos', 'sparkles', '3679pinksparkles', '5802kuromisparkles'], fallback: '✨' },
  ROCKET: { name: 'slrocket', aliases: ['foguete', 'rocket'], fallback: '🚀' },
  MOON: { name: 'pixdreamsmooncha', aliases: ['lua', 'moon', '8144bluecrystalmoon', '8212crystalmoon', '68511catmoon'], fallback: '🌙' },
  FAIRY: { name: 'fairy', aliases: ['fada', 'fairybadge34', '6461strawberryfairybunny'], fallback: '🧚' },
  MUSHROOM: { name: 'cogumelo', aliases: ['mushroom', 'explore'], fallback: '<:explore:1551356273918746724>' },
  ZOMBIE: { name: 'ardiscordzombie', aliases: ['zumbi', 'zombie'], fallback: '🧟' },
  BAT: { name: '6391purplebat', aliases: ['morcego', 'bat', 'battybk', '18726purplebat', '826348purplebat'], fallback: '🦇' },
  PURPLE_FLAME: { name: 'purpleflame', aliases: ['chama_roxa', 'purple_flame', 'pinkflame'], fallback: '🔥' },
  RING: { name: 'anelrosa', aliases: ['anel', 'ring', 'anelonly', 'pinkanel15'], fallback: '💍' },
  POTION: { name: 'galaxybottle', aliases: ['pocao', 'potion', 'frasco', '35541queerpotion'], fallback: '🧪' },
  ALERT: { name: 'PurpleAlert', aliases: ['alerta', 'alert'], fallback: '⚠️' },
  HAMMER: { name: 'banhammer39', aliases: ['martelo', 'hammer', 'bancute'], fallback: '🔨' },
  PLEAD: { name: 'z3qcprideplead', aliases: ['plead', 'porfavor'], fallback: '🥺' },
  RAGE: { name: '1mzraging', aliases: ['rage', 'furia'], fallback: '💢' },
  BOMB: { name: 'bomb', aliases: ['bomba'], fallback: '💣' },
  MONSTER: { name: 'alienmonsterani', aliases: ['monstro', 'monster'], fallback: '👾' },
  ARROW: { name: '2353arrowrightglow', aliases: ['seta', 'arrow', 'purplearrow', '8857pinkarrow', '9037arrowpink'], fallback: '➡️' },
  KUROMI: { name: '9733kuromiheart', aliases: ['kuromi', 'kuromiwitch', '1014kuromimaid', '5802kuromisparkles'], fallback: '🖤' },
};

/**
 * Inicializa e sincroniza o cache com os Application Emojis do bot.
 * @param {import('discord.js').Client} client
 */
async function syncApplicationEmojis(client) {
  try {
    if (!client) return;
    const fs = require('node:fs');
    const path = require('node:path');
    const emojiMap = new Map();

    // 1. Fetch Application Emojis directly from Discord API
    if (client.application?.emojis) {
      try {
        const appEmojis = await client.application.emojis.fetch();
        APP_EMOJI_CACHE.clear();
        for (const [id, emoji] of appEmojis) {
          APP_EMOJI_CACHE.set(emoji.name.toLowerCase(), emoji.toString());
          emojiMap.set(String(id), {
            id: String(id),
            name: emoji.name,
            animated: Boolean(emoji.animated),
          });
        }
      } catch (e) {
        console.warn('[appEmojis] Erro ao buscar Application Emojis:', e.message);
      }
    }

    // 2. Collect Guild Emojis from client cache
    if (client.emojis?.cache) {
      for (const [id, emoji] of client.emojis.cache) {
        if (!APP_EMOJI_CACHE.has(emoji.name.toLowerCase())) {
          APP_EMOJI_CACHE.set(emoji.name.toLowerCase(), emoji.toString());
        }
        if (!emojiMap.has(String(id))) {
          emojiMap.set(String(id), {
            id: String(id),
            name: emoji.name,
            animated: Boolean(emoji.animated),
          });
        }
      }
    }

    // 3. Persist updated catalog to src/data/discordAppEmojis.json
    if (emojiMap.size > 0) {
      const catalogPath = path.join(__dirname, '..', 'data', 'discordAppEmojis.json');
      const payload = { items: Array.from(emojiMap.values()) };
      fs.writeFileSync(catalogPath, JSON.stringify(payload, null, 2), 'utf8');
    }
  } catch (error) {
    console.warn('[appEmojis] Aviso ao sincronizar emojis:', error.message);
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

