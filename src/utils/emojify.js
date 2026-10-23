const { getEmoji } = require('./appEmojis');

/**
 * Troca emojis Unicode de textos e botões pelos Application Emojis do próprio bot (catálogo do
 * Developer Portal). Cada significado tem um emoji fixo para a Pyxie ficar coerente em todos os
 * minigames. Se o emoji do bot não estiver no catálogo, o Unicode original é mantido.
 */
const UNICODE_TO_APP = {
  '⚔': '54416purplepixelknife',
  '📜': '6449spellbook',
  '🪙': 'COIN',
  '💰': 'goldcoin',
  '❓': '43994starquestionmark',
  '🏷': 'pastelstarturn60',
  '⏱': '48390wizardhourglass',
  '⏳': '48390wizardhourglass',
  '⌛': '48390wizardhourglass',
  '✅': '5707lightpurplecheck',
  '❌': '41077criticalfailure',
  '🏆': 'win',
  '👑': '7225crown',
  '🔥': 'purpleflame',
  '🤝': 'astaroth_blink',
  '💨': '5565cloud',
  '👀': 'astaroth_curious',
  '🙅': 'astaroth_angry',
  '🤖': '712715colorflashrobot',
  '🏰': 'MAP',
  '🎮': '8377gamingcontroller',
  '🏳': 'astaroth_sad',
  '⚠': 'ALERT',
  '🧩': '47995starryquestions',
  '🎴': '9070magiccards',
  '📊': '206204pixeldiamond',
  '📈': '206204pixeldiamond',
  '🏅': '60047prismaticstar',
  '🌟': '267318pixelstaryellow',
  '✨': 'SPARKLES',
  '🌷': 'astaroth_heart_icon',
  '👥': 'astaroth_happy',
};

const CUSTOM = /^<a?:[\w~]+:\d+>$/;
const VS16 = '️';
const keys = Object.keys(UNICODE_TO_APP).sort((a, b) => b.length - a.length);
const PATTERN = new RegExp(`(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})${VS16}?`, 'gu');

/** Emoji do bot para um Unicode, ou null quando não há mapeamento ou o emoji não existe no catálogo. */
function appEmojiFor(unicode) {
  const ref = UNICODE_TO_APP[String(unicode).replace(new RegExp(VS16, 'g'), '')];
  if (!ref) return null;
  const formatted = getEmoji(ref);
  return CUSTOM.test(formatted || '') ? formatted : null;
}

/** Substitui todos os emojis Unicode mapeados de um texto pelos emojis do bot. */
function emojify(text) {
  if (typeof text !== 'string' || text.length === 0) return text;
  return text.replace(PATTERN, (match, base) => appEmojiFor(base) || match);
}

/** Valor para ButtonBuilder#setEmoji: emoji do bot quando existir, senão o Unicode recebido. */
function buttonEmojiFor(unicode) {
  return appEmojiFor(unicode) || unicode;
}

module.exports = { UNICODE_TO_APP, emojify, appEmojiFor, buttonEmojiFor };
