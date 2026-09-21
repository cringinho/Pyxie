const { getThemeEmoji } = require('./themeEmojis');

const APP_EMOJIS = {
  WINGS: '<a:pinkeing:1548444149785694238>',
  WINGS_PURPLE: '<:9194purplewing:1551356206684307556>',
  BUTTERFLY: getThemeEmoji('websiteHome'),
  SPELLBOOK: '<a:6449spellbook:1551355882447704124>',
  HEART: '<a:purpleheartdrip2:1548444199970545756>',
  COIN: getThemeEmoji('coins'),
  COIN_SHINY: '<a:shineygoldcoinsi:1548444230588956683>',
  COIN_PURPLE: '<a:gifggpurplecoin5:1548443977429028955>',
  COIN_STATIC: '<:goldcoin:1548443982483292261>',
  CHEST: '<:rarecrate:1548444209328033913>',
  GIFT: getThemeEmoji('dailyBonus'),
  PRIZE: '<a:prizedraw:1548444183776329798>',
  MAGIC_BEAN: '<:peakmagicbean:1548444143431323719>',
  BACKPACK: '<:a1backpack:1548443778359103579>',
  SPARKLES: '<a:purplesparkles:1548444202621214840>',
  PORTAL: '<a:portalframe98:1548444170488778954>',
  CONTROLLER: '<a:ykawaiicontrolle:1548444319730499664>',
  WIN: '<a:win:1548444305507487754>',
  ARROW: '<a:2353arrowrightglow:1551355397208805446>',
  KUROMI: '<a:9733kuromiheart:1551356277194625224>',
  TAROT: getThemeEmoji('tarot'),
  TAROT_ALBUM: getThemeEmoji('tarotAlbum'),
  DICE: getThemeEmoji('dice'),
  USER_PROFILE: getThemeEmoji('userProfile'),
  GRIMORIO: getThemeEmoji('grimorio'),
  SHIP: getThemeEmoji('ship'),
  WEEKEND_BONUS: getThemeEmoji('weekendBonus'),
  HELP: getThemeEmoji('helpCommands'),
};

function getAnimatedEmoji(guild, preferredNames = [], fallback = '✨') {
  const emojis = guild?.emojis?.cache;
  if (!emojis) return fallback;
  const emojiList = typeof emojis.find === 'function' ? emojis : [...emojis.values()];

  const preferred = emojiList.find((emoji) =>
    emoji.animated && preferredNames.some((name) => emoji.name?.toLowerCase().includes(name.toLowerCase()))
  );
  return preferred ? preferred.toString() : fallback;
}

function serializeGuildEmojis(guild) {
  return [...(guild?.emojis?.cache?.values() || [])]
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
    .map((emoji) => ({
      name: emoji.name,
      id: emoji.id,
      animated: emoji.animated,
      available: emoji.available,
      managed: emoji.managed,
      format: emoji.toString(),
      url: emoji.imageURL({ extension: emoji.animated ? 'gif' : 'png', size: 4096 }),
    }));
}

module.exports = { APP_EMOJIS, getAnimatedEmoji, serializeGuildEmojis };
