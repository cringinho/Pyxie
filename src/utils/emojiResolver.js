const fs = require('fs');
const path = require('path');

const EMOJI_PATH = path.join(__dirname, '../data/emojis.json');

const FALLBACKS = {
  // 1. Economia & Loja
  coins: '🪙',
  magic_bean: '🌱',
  daily_bonus: '🎁',
  weekend_bonus: '🔥',
  work_career: '💼',
  shop_chest: '📦',
  shop_gem: '💎',

  // 2. Místico & Tarot
  tarot_card: '🔮',
  tarotAlbum: '📖',
  grimorio: '📖',

  // 3. Social & Romance
  ship_heart: '💖',
  marriage_ring: '💍',
  divorce: '💔',
  trade: '🤝',

  // 4. Jogos & Sorte
  fortune_cookie: '🥠',
  dice: '🎲',
  jokenpo: '✂️',
  coinflip: '🪙',
  likely: '❓',

  // 5. Sistema & Utilidades
  websiteHome: '🦋',
  websiteSocial: '💑',
  helpCommands: '📖',
  userProfile: '👤',
  ranking: '🏆',
  status_success: '✅',
  status_fail: '❌',
};

function getEmojiConfig() {
  try {
    if (!fs.existsSync(EMOJI_PATH)) return {};
    return JSON.parse(fs.readFileSync(EMOJI_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function resolveEmoji(client, slot, format = 'discord') {
  const config = getEmojiConfig();
  const emojiId = config[slot];
  const fallback = FALLBACKS[slot] || '✨';

  if (!emojiId) return fallback;

  const appEmoji = client?.application?.emojis?.cache?.get(emojiId) 
                || client?.emojis?.cache?.get(emojiId);

  if (format === 'discord') {
    if (appEmoji) return appEmoji.toString();
    return `<:_:${emojiId}>`;
  }

  if (format === 'url') {
    const ext = appEmoji?.animated ? 'gif' : 'png';
    return `https://cdn.discordapp.com/emojis/${emojiId}.${ext}`;
  }

  if (format === 'web') {
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
    return `<img src="${url}" class="pyxie-inline-emoji" alt="${slot}" style="width:1.2em; height:1.2em; vertical-align:middle;" />`;
  }

  return fallback;
}

module.exports = { resolveEmoji, FALLBACKS, getEmojiConfig };

