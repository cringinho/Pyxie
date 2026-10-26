const path = require('path');
const { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { t, getLanguage, formatRemaining } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { PYXIE_COLORS } = require('../../utils/pyxieVoice');
const engine = require('./dungeonEngine');
const store = require('./dungeonStore');
const { FLOORS, ENEMIES, CHARMS, TALENTS, EMPTY_FLAVORS, localized } = require('./dungeonData');

/**
 * Interface Discord das Catacumbas de Veludo: embeds (AGENTS.md §9), botões por fase e a cena
 * pixel-art renderizada a cada passo. Os botões carregam dono, run e step:
 *   dgn:l:<dono>:<tela>                 menu, guia, talentos, hall, mochila, iniciar/continuar
 *   dgn:t:<dono>:<talento>              compra de talento
 *   dgn:a:<dono>:<run>:<step>:<ação>[:<arg>]
 *   dgn:h:<dono>:<run>                  ajuda de quem assiste (qualquer pessoa menos a dona)
 */

const PREFIX = 'dgn';
const LOBBY_THUMB = path.join(__dirname, '..', '..', '..', 'assets', 'pyxie', 'pyxie_pixelart.png');
const RENDER_TIMEOUT_MS = 2000;
const LABEL_MAX = 34;

// Emojis dos botões: Application Emoji do bot + reserva Unicode (usada se o Discord recusar o emoji)
const BUTTON_EMOJIS = {
  attack: ['54416purplepixelknife', '⚔️'],
  guard: ['badge_brick_wall_shield', '🛡️'],
  shield: ['badge_brick_wall_shield', '🛡️'],
  bolt: ['9830moonwand', '🔮'],
  astaroth: ['ASTAROTH_POWER', '🐈‍⬛'],
  potion: ['44332darkpotion', '🧪'],
  open: ['54187box', '🔓'],
  useKey: ['38632pinkkey', '🗝️'],
  poke: ['338372pinkpixelknife', '🪄'],
  pray: ['984953pixelmoon', '🙏'],
  offer: ['goldcoin', '💰'],
  drink: ['8144bluecrystalmoon', '💧'],
  extract: ['goldcoin', '💰'],
  candle: ['DUNGEON_CANDLE', '🕯️'],
  key: ['38632pinkkey', '🗝️'],
  help: ['SPELLBOOK', '📜'],
  talents: ['DUNGEON_MOON', '🌙'],
  hall: ['TROPHY', '🏆'],
  bag: ['BAG', '🎒'],
};

let plainButtonEmojis = false;

/** Depois de uma recusa do Discord (emoji inválido), os botões voltam a usar só Unicode. */
function setPlainButtonEmojis(value) {
  plainButtonEmojis = Boolean(value);
}

/** Emoji do bot no formato <:nome:id>, ou a reserva quando ele não existe no catálogo. */
function appEmoji(ref, fallback) {
  const formatted = ref ? getEmoji(ref) : '';
  return /^<a?:[\w~]+:\d+>$/.test(formatted || '') ? formatted : fallback;
}

function buttonEmoji(key, fallback) {
  const [ref, unicode] = BUTTON_EMOJIS[key] || [null, fallback];
  return plainButtonEmojis ? unicode : appEmoji(ref, unicode);
}

function enemyEmoji(def) {
  return appEmoji(def?.sprite, def?.glyph || '👾');
}

const PHASE_COLORS = {
  explore: PYXIE_COLORS.violet,
  combat: PYXIE_COLORS.crimson,
  event: PYXIE_COLORS.purple,
  reward: PYXIE_COLORS.gold,
  camp: '#f97316',
  dead: '#3b0d2e',
  extracted: PYXIE_COLORS.gold,
  victory: PYXIE_COLORS.gold,
};

// ---------------------------------------------------------------- utilidades
function runTag(run) {
  return String(run.id).slice(-6);
}

function lobbyId(ownerId, what) {
  return `${PREFIX}:l:${ownerId}:${what}`;
}

function talentButtonId(ownerId, talentId) {
  return `${PREFIX}:t:${ownerId}:${talentId}`;
}

function actionId(run, action, arg = null) {
  const base = `${PREFIX}:a:${run.ownerId}:${runTag(run)}:${run.step}:${action}`;
  return arg === null || arg === undefined ? base : `${base}:${arg}`;
}

function parseCustomId(customId) {
  const parts = String(customId || '').split(':');
  if (parts[0] !== PREFIX) return null;
  const [, kind, ownerId] = parts;
  if (kind === 'l') return { kind, ownerId, what: parts[3] };
  if (kind === 't') return { kind, ownerId, talentId: parts[3] };
  if (kind === 'h') return { kind, ownerId, tag: parts[3] };
  if (kind === 'a') {
    return { kind, ownerId, tag: parts[3], step: Number(parts[4]), action: parts[5], arg: parts.length > 6 ? parts[6] : null };
  }
  return null;
}

function clip(label) {
  const text = String(label || '');
  return text.length > LABEL_MAX ? `${text.slice(0, LABEL_MAX - 1)}…` : text;
}

function button({ id, label, emoji, style = ButtonStyle.Secondary, disabled = false }) {
  const b = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(Boolean(disabled));
  if (label) b.setLabel(clip(label));
  if (emoji) b.setEmoji(emoji);
  return b;
}

function rowsOf(buttons, perRow = 3) {
  const rows = [];
  for (let i = 0; i < buttons.length && rows.length < 5; i += perRow) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + perRow)));
  }
  return rows;
}

function footerFor(source, lang) {
  const guild = source?.guild;
  return { text: t('dungeon.footer', lang, { server: guild ? guild.name : t('dungeon.private', lang) }) };
}

function enemyName(id, lang) {
  return localized(ENEMIES[id]?.name, lang);
}

function charmName(id, lang, withEmoji = true) {
  const charm = CHARMS[id];
  if (!charm) return id;
  const name = localized(charm.name, lang);
  return withEmoji ? `${getEmoji(charm.emoji)} ${name}` : name;
}

function floorName(floor, lang) {
  return localized(engine.getFloorDef(floor)?.name, lang);
}

/** Traduz uma entrada estruturada do log do motor ({ k, p }) para texto. */
function formatLogEntry(entry, lang) {
  const p = { ...(entry.p || {}) };
  if (p.enemy) {
    p.emoji = enemyEmoji(ENEMIES[p.enemy]);
    p.enemy = enemyName(p.enemy, lang);
  }
  if (p.charm) p.charm = charmName(p.charm, lang);
  if (entry.k === 'floorEnter') {
    p.floorName = floorName(p.floor, lang);
    p.flavor = localized(FLOORS[p.floor - 1]?.flavor, lang);
  }
  if (entry.k === 'emptyRoom') p.flavor = localized(EMPTY_FLAVORS[p.flavor], lang);
  if (entry.k === 'bought') p.item = t(`dungeon.items.${p.item}`, lang);
  return t(`dungeon.log.${entry.k}`, lang, p);
}

function intentTexts(run, lang) {
  const intent = engine.describeIntent(run);
  if (!intent) return { long: '', short: '' };
  const params = {
    dmg: intent.perHit ?? 0,
    hits: intent.hits ?? 1,
    light: intent.light ?? 0,
    poison: intent.poison ?? 0,
    turns: intent.turns ?? 0,
    gold: intent.gold ?? 0,
    value: intent.value ?? 0,
  };
  const lines = [t('dungeon.intent.header', lang), t(`dungeon.intent.${intent.type}`, lang, params)];
  if (intent.distracted) lines.push(t('dungeon.intent.distracted', lang));
  if (intent.dark && intent.perHit !== undefined) lines.push(t('dungeon.intent.dark', lang));
  return { long: lines.join('\n\n'), short: t(`dungeon.intent.short.${intent.type}`, lang, params) };
}

function extractTake(run) {
  return Math.floor(Math.max(0, run.player.gold) * (1 - engine.lanternFee(run.floor)));
}

function trapJumpChance(run) {
  return Math.round(Math.min(0.9, 0.55 + run.player.fleeBonus + run.player.dodge) * 100);
}

function visibleOffers(run) {
  const room = run.map.rooms[run.event.roomKey];
  return (room.stock || [])
    .map((offer, index) => ({ ...offer, index }))
    .filter((o) => !o.sold && !(o.item === 'charm' && engine.hasCharm(run, o.charmId)));
}

// ---------------------------------------------------------------- textos da cena
function buildRenderText(run, lang, settlement = null) {
  const text = {
    floorName: floorName(run.floor, lang),
    floorTag: t('dungeon.render.floorTag', lang, { floor: run.floor }),
    hpLabel: t('dungeon.render.hp', lang),
    lightLabel: t('dungeon.render.light', lang),
    goldLabel: t('dungeon.render.gold', lang),
    sparkLabel: t('dungeon.render.spark', lang),
    potionLabel: t('dungeon.render.potion', lang),
    keyLabel: t('dungeon.render.key', lang),
    darkWarning: t('dungeon.render.dark', lang),
    campTitle: t('dungeon.render.camp', lang),
    rewardTitle: t('dungeon.render.reward', lang),
    victoryTitle: t('dungeon.render.victory', lang),
    deathTitle: t('dungeon.render.death', lang),
    extractedTitle: t('dungeon.render.extracted', lang),
    enemyName: '',
    eventTitle: '',
    intentText: '',
    payoutText: '',
    charmNames: [],
  };
  if (run.combat) {
    text.enemyName = enemyName(run.combat.enemyId, lang);
    text.intentText = intentTexts(run, lang).short;
  }
  if (run.event) text.eventTitle = t(`dungeon.render.${run.event.type}`, lang);
  if (run.reward) text.charmNames = run.reward.options.map((id) => charmName(id, lang, false));
  if (settlement) text.payoutText = `+${settlement.payout}`;
  return text;
}

async function renderScene(run, lang, settlement) {
  try {
    const { renderDungeonScene } = require('./dungeonRenderer');
    const render = renderDungeonScene(run, { lang, text: buildRenderText(run, lang, settlement) });
    const timeout = new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), RENDER_TIMEOUT_MS);
      if (typeof timer.unref === 'function') timer.unref();
    });
    return await Promise.race([render, timeout]);
  } catch (err) {
    console.warn('[dungeon] Falha ao renderizar a cena:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------- tela do run
function phaseTitle(run, lang) {
  if (run.confirmForfeit) return t('dungeon.titles.confirm', lang);
  switch (run.phase) {
    case 'combat': {
      const key = run.combat.boss ? 'boss' : run.combat.guardian ? 'guardian' : 'combat';
      return t(`dungeon.titles.${key}`, lang, { enemy: enemyName(run.combat.enemyId, lang) });
    }
    case 'event':
      return t(`dungeon.titles.${run.event.type}`, lang);
    case 'reward':
    case 'camp':
    case 'victory':
    case 'extracted':
      return t(`dungeon.titles.${run.phase}`, lang);
    case 'dead':
      return t(`dungeon.titles.${run.outcome === 'forfeit' || run.outcome === 'abandoned' ? run.outcome : 'dead'}`, lang);
    default:
      return t('dungeon.titles.explore', lang, { floor: run.floor, floorName: floorName(run.floor, lang) });
  }
}

function phaseBlock(run, lang, settlement) {
  const p = run.player;
  if (run.confirmForfeit) {
    return t('dungeon.confirm.desc', lang, { salvage: Math.floor(p.gold * engine.DEATH_SALVAGE) });
  }
  switch (run.phase) {
    case 'combat': {
      const c = run.combat;
      const parts = [
        t('dungeon.combat.enemyLine', lang, {
          emoji: enemyEmoji(ENEMIES[c.enemyId]),
          enemy: enemyName(c.enemyId, lang),
          hp: c.hp,
          max: c.maxHp,
          shield: c.shield > 0 ? t('dungeon.combat.shield', lang, { value: c.shield }) : '',
        }),
        intentTexts(run, lang).long,
        t('dungeon.combat.hint', lang, { block: 4 + run.floor + p.def, bolt: engine.boltCost(run), swipe: engine.swipeCost(run) }),
      ];
      if (c.guardian) parts.push(t('dungeon.combat.noFlee', lang));
      return parts.join('\n\n');
    }
    case 'event': {
      const ev = run.event;
      if (ev.type === 'chest') {
        return [t('dungeon.events.chest', lang), ev.sniffed ? t('dungeon.events.chestSniffed', lang) : ''].filter(Boolean).join('\n\n');
      }
      if (ev.type === 'treasure') return t('dungeon.events.treasure', lang, { keys: p.keys });
      if (ev.type === 'merchant') {
        const offers = visibleOffers(run).map((o) =>
          o.item === 'charm'
            ? t('dungeon.events.charmOffer', lang, { charm: charmName(o.charmId, lang), price: o.price, desc: localized(CHARMS[o.charmId].desc, lang) })
            : t('dungeon.events.offerLine', lang, { item: t(`dungeon.items.${o.item}`, lang), price: o.price })
        );
        return t('dungeon.events.merchant', lang, {
          gold: p.gold,
          offers: offers.length > 0 ? offers.join('\n\n') : t('dungeon.events.soldOut', lang),
        });
      }
      if (ev.type === 'shrine') {
        return t('dungeon.events.shrine', lang, { hp: Math.ceil(p.maxHp * 0.2), price: engine.shrineOfferPrice(run) });
      }
      if (ev.type === 'fountain') return t('dungeon.events.fountain', lang);
      if (ev.type === 'trap') return t('dungeon.events.trap', lang, { damage: ev.damage, jump: trapJumpChance(run) });
      if (ev.type === 'grave') {
        return [
          t('dungeon.events.grave', lang, { user: `<@${ev.grave.ownerId}>` }),
          Number(ev.grave.lootShare) > 0 && !ev.looted ? t('dungeon.events.graveLoot', lang, { gold: ev.grave.lootShare }) : null,
          ev.grave.revivable && !ev.prayed ? t('dungeon.events.graveRevive', lang) : t('dungeon.events.graveGone', lang),
        ].filter(Boolean).join('\n\n');
      }
      return '';
    }
    case 'reward': {
      const lines = run.reward.options.map((id, index) =>
        t('dungeon.reward.line', lang, { index: index + 1, charm: charmName(id, lang), desc: localized(CHARMS[id].desc, lang) })
      );
      return [t('dungeon.reward.desc', lang), ...lines].join('\n\n');
    }
    case 'camp': {
      const fee = engine.lanternFee(run.floor);
      return t('dungeon.camp.desc', lang, {
        gold: p.gold,
        take: extractTake(run),
        fee: fee > 0 ? t('dungeon.camp.fee', lang, { fee: Math.round(fee * 100) }) : '',
        next: run.floor + 1,
        nextName: floorName(run.floor + 1, lang),
      });
    }
    case 'dead':
    case 'extracted':
    case 'victory':
      return endBlock(run, lang, settlement);
    default:
      return t('dungeon.fields.exploreHint', lang, { cost: engine.moveLightCost(run) });
  }
}

/** Nome e raridade dos itens que a descida rendeu (catálogo da Casinha). */
function dropNames(itemIds, lang) {
  try {
    const { getItem, itemName, rarityInfo } = require('../home/homeCatalog');
    return itemIds
      .map(getItem)
      .filter(Boolean)
      .map((entry) => `**${itemName(entry, lang)}** (${rarityInfo(entry.rarity)[lang === 'en' ? 'en' : 'pt']})`)
      .join(', ');
  } catch (_) {
    return itemIds.join(', ');
  }
}

/** Chegou ao andar da chave da casinha e ainda não tem casa: avisa no fim da descida. */
function hasNewHouseKey(run) {
  try {
    const homeStore = require('../home/homeStore');
    return run.floor >= homeStore.FREE_HOUSE_FLOOR && homeStore.getHomeAccess(run.ownerId).canClaimFree;
  } catch (_) {
    return false;
  }
}

function endBlock(run, lang, settlement) {
  const s = settlement || { gold: run.player.gold, payout: engine.computeGrossPayout(run), echoes: engine.computeEchoes(run), fee: 0, cappedBy: null };
  const outcome = run.outcome || run.phase;
  const key = ['forfeit', 'abandoned', 'extracted', 'victory'].includes(outcome) ? outcome : 'dead';
  const lines = [
    t(`dungeon.end.${key}`, lang, { floor: run.floor }),
    t('dungeon.end.gold', lang, { gold: s.gold }),
    t('dungeon.end.payout', lang, { payout: s.payout }),
  ];
  if (key === 'dead' || key === 'forfeit' || key === 'abandoned') lines.push(t('dungeon.end.salvage', lang));
  if (s.fee > 0) lines.push(t('dungeon.end.fee', lang, { fee: Math.round(s.fee * 100) }));
  if (s.cappedBy === 'run') lines.push(t('dungeon.end.capRun', lang, { cap: store.getSettings().runPayoutCap }));
  if (s.cappedBy === 'daily') lines.push(t('dungeon.end.capDaily', lang));
  lines.push(t('dungeon.end.echoes', lang, { echoes: s.echoes }));
  if (Array.isArray(s.drops) && s.drops.length) lines.push(t('dungeon.end.drops', lang, { items: dropNames(s.drops, lang) }));
  if (s.newBest) lines.push(t('dungeon.end.best', lang, { floor: run.floor }));
  if (settlement && hasNewHouseKey(run)) lines.push(t('dungeon.end.houseKey', lang));
  lines.push(t('dungeon.end.stats', lang, { rooms: run.stats.rooms, kills: run.stats.kills }));
  if (Number.isFinite(settlement?.balance)) lines.push(t('dungeon.end.balance', lang, { balance: settlement.balance }));
  return lines.join('\n\n');
}

const ACTION_STYLE = {
  attack: { emoji: () => buttonEmoji('attack', '⚔️'), style: ButtonStyle.Primary, label: 'attack' },
  guard: { emoji: () => buttonEmoji('guard', '🛡️'), style: ButtonStyle.Secondary, label: 'guard' },
  flee: { emoji: () => '🏃', style: ButtonStyle.Secondary, label: 'flee' },
  poke: { emoji: () => buttonEmoji('poke', '🪄'), style: ButtonStyle.Secondary, label: 'poke' },
  force: { emoji: () => '💪', style: ButtonStyle.Danger, label: 'force' },
  pray: { emoji: () => buttonEmoji('pray', '🙏'), style: ButtonStyle.Primary, label: 'pray' },
  drink: { emoji: () => buttonEmoji('drink', '💧'), style: ButtonStyle.Primary, label: 'drink' },
  jump: { emoji: () => '🦘', style: ButtonStyle.Primary, label: 'jump' },
  shield: { emoji: () => buttonEmoji('shield', '🛡️'), style: ButtonStyle.Secondary, label: 'shield' },
  disarm: { emoji: () => '🔧', style: ButtonStyle.Secondary, label: 'disarm' },
  forfeit: { emoji: () => '🏳️', style: ButtonStyle.Secondary, label: 'forfeit' },
  loot: { emoji: () => buttonEmoji('offer', '💰'), style: ButtonStyle.Success, label: 'loot' },
  revive: { emoji: () => buttonEmoji('pray', '🙏'), style: ButtonStyle.Primary, label: 'revive' },
  forfeit_confirm: { emoji: () => '🏳️', style: ButtonStyle.Danger, label: 'forfeitYes' },
  forfeit_cancel: { emoji: () => '↩️', style: ButtonStyle.Secondary, label: 'forfeitNo' },
};

const MOVE_EMOJI = { w: '⬅️', n: '⬆️', s: '⬇️', e: '➡️' };
const PICK_EMOJI = ['1️⃣', '2️⃣', '3️⃣'];

function itemEmoji(offer) {
  if (offer.item === 'charm') return plainButtonEmojis ? '✨' : appEmoji(CHARMS[offer.charmId]?.emoji, '✨');
  return buttonEmoji(offer.item, { potion: '🧪', candle: '🕯️', key: '🗝️' }[offer.item]);
}

function buildRunComponents(run, lang) {
  const owner = run.ownerId;
  if (engine.isTerminal(run)) {
    return rowsOf([
      button({ id: lobbyId(owner, 'start'), label: t('dungeon.buttons.newRun', lang), emoji: buttonEmoji('candle', '🕯️'), style: ButtonStyle.Primary }),
      button({ id: lobbyId(owner, 'lobby'), label: t('dungeon.buttons.lobby', lang), emoji: '🏰' }),
    ]);
  }

  const actions = engine.getAvailableActions(run);
  const make = (a) => {
    const id = actionId(run, a.id, a.arg);
    const p = run.player;
    if (a.id === 'move') return button({ id, emoji: MOVE_EMOJI[a.arg], disabled: !a.enabled });
    if (a.id === 'potion') {
      return button({ id, label: t('dungeon.buttons.potion', lang, { count: p.potions }), emoji: buttonEmoji('potion', '🧪'), style: ButtonStyle.Success, disabled: !a.enabled });
    }
    if (a.id === 'bolt') {
      return button({ id, label: t('dungeon.buttons.bolt', lang, { cost: engine.boltCost(run) }), emoji: buttonEmoji('bolt', '🔮'), style: ButtonStyle.Primary, disabled: !a.enabled });
    }
    if (a.id === 'astaroth') {
      return button({ id, label: t('dungeon.buttons.astaroth', lang, { cost: engine.swipeCost(run) }), emoji: buttonEmoji('astaroth', '🐈‍⬛'), style: ButtonStyle.Success, disabled: !a.enabled });
    }
    if (a.id === 'open') {
      const isTreasure = run.event?.type === 'treasure';
      return button({
        id,
        label: t(`dungeon.buttons.${isTreasure ? 'useKey' : 'open'}`, lang),
        emoji: isTreasure ? buttonEmoji('useKey', '🗝️') : buttonEmoji('open', '🔓'),
        style: ButtonStyle.Primary,
        disabled: !a.enabled,
      });
    }
    if (a.id === 'leave') {
      const isShop = run.event?.type === 'merchant';
      return button({ id, label: t(`dungeon.buttons.${isShop ? 'leaveShop' : 'leave'}`, lang), emoji: isShop ? '👋' : '🚶' });
    }
    if (a.id === 'buy') {
      const offer = run.map.rooms[run.event.roomKey].stock[Number(a.arg)];
      const item = offer.item === 'charm' ? charmName(offer.charmId, lang, false) : t(`dungeon.items.${offer.item}`, lang);
      return button({ id, label: t('dungeon.buttons.buy', lang, { item, price: offer.price }), emoji: itemEmoji(offer), style: ButtonStyle.Success, disabled: !a.enabled });
    }
    if (a.id === 'offer') {
      return button({ id, label: t('dungeon.buttons.offer', lang, { price: engine.shrineOfferPrice(run) }), emoji: buttonEmoji('offer', '💰'), style: ButtonStyle.Success, disabled: !a.enabled });
    }
    if (a.id === 'pick') {
      const charmId = run.reward.options[Number(a.arg)];
      return button({ id, label: charmName(charmId, lang, false), emoji: PICK_EMOJI[Number(a.arg)], style: ButtonStyle.Primary });
    }
    if (a.id === 'descend') {
      return button({ id, label: t('dungeon.buttons.descend', lang, { floor: run.floor + 1 }), emoji: '⬇️', style: ButtonStyle.Danger });
    }
    if (a.id === 'extract') {
      return button({ id, label: t('dungeon.buttons.extract', lang, { amount: extractTake(run) }), emoji: buttonEmoji('extract', '💰'), style: ButtonStyle.Success });
    }
    const style = ACTION_STYLE[a.id] || { emoji: () => '✨', style: ButtonStyle.Secondary, label: a.id };
    return button({ id, label: t(`dungeon.buttons.${style.label}`, lang), emoji: style.emoji(), style: style.style, disabled: !a.enabled });
  };

  if (run.phase === 'explore' && !run.confirmForfeit) {
    const moves = actions.filter((a) => a.id === 'move').map(make);
    const potion = actions.find((a) => a.id === 'potion');
    const forfeit = actions.find((a) => a.id === 'forfeit');
    const bag = button({ id: lobbyId(owner, 'bag'), label: t('dungeon.buttons.bag', lang), emoji: buttonEmoji('bag', '🎒') });
    return [new ActionRowBuilder().addComponents(moves), new ActionRowBuilder().addComponents([make(potion), bag, make(forfeit)])];
  }
  const rows = rowsOf(actions.map(make), 3);
  // Luta em servidor: quem assiste pode dar uma mãozinha (até engine.MAX_HELPERS pessoas)
  if (run.phase === 'combat' && run.guildId && (run.helpers || []).length < engine.MAX_HELPERS && rows.length < 5) {
    rows.push(
      new ActionRowBuilder().addComponents(
        button({ id: `${PREFIX}:h:${owner}:${runTag(run)}`, label: t('dungeon.buttons.help', lang, { left: engine.MAX_HELPERS - (run.helpers || []).length }), emoji: '🤝' })
      )
    );
  }
  return rows;
}

function buildRunEmbed(run, source, lang, { settlement = null, notice = null } = {}) {
  const p = run.player;
  const lines = [];
  if (notice) lines.push(`> ${notice}`);
  for (const entry of run.log || []) lines.push(formatLogEntry(entry, lang));
  const block = phaseBlock(run, lang, settlement);
  if (block) lines.push(block);
  if (!engine.isTerminal(run)) {
    lines.push(t('dungeon.fields.status', lang, { spark: p.spark, maxSpark: p.maxSpark, potions: p.potions, keys: p.keys, charms: p.charms.length }));
  }

  const embed = new EmbedBuilder()
    .setColor(PHASE_COLORS[run.phase] || PYXIE_COLORS.violet)
    .setTitle(phaseTitle(run, lang))
    .setDescription(lines.join('\n\n').slice(0, 4000))
    .setFooter(footerFor(source, lang))
    .setTimestamp();

  if (!engine.isTerminal(run)) {
    embed.addFields(
      { name: t('dungeon.fields.hp', lang), value: `\`${p.hp}/${p.maxHp}\``, inline: true },
      { name: t('dungeon.fields.light', lang), value: `\`${p.light}/${p.maxLight}\`${engine.isDark(run) ? ' 🌑' : ''}`, inline: true },
      { name: t('dungeon.fields.gold', lang), value: `\`${p.gold}\``, inline: true }
    );
  }
  return embed;
}

/** Mensagem completa do run (embed + botões + cena renderizada). */
async function buildRunView(run, source, options = {}) {
  const lang = getLanguage(source);
  const embed = buildRunEmbed(run, source, lang, options);
  const png = await renderScene(run, lang, options.settlement);
  const files = [];
  if (png) {
    const name = `catacombs-${runTag(run)}-${run.step}.png`;
    files.push(new AttachmentBuilder(png, { name }));
    embed.setImage(`attachment://${name}`);
  }
  return { content: '', embeds: [embed], components: buildRunComponents(run, lang), files, attachments: [] };
}

// ---------------------------------------------------------------- menu (lobby)
function outcomeLabel(outcome, lang) {
  const key = ['forfeit', 'abandoned', 'extracted', 'victory'].includes(outcome) ? outcome : 'dead';
  return t(`dungeon.outcome.${key}`, lang);
}

function buildLobbyView(user, source, { notice = null } = {}) {
  const lang = getLanguage(source);
  const status = store.getLobbyStatus(user.id);
  const s = status.settings;
  const lines = [];
  if (notice) lines.push(`> ${notice}`);
  if (status.abandoned) lines.push(t('dungeon.lobby.abandoned', lang, { payout: status.abandoned.payout }));
  lines.push(
    t('dungeon.lobby.desc', lang, {
      ticket: s.ticket,
      left: status.entriesLeft,
      max: s.dailyEntries,
      runCap: s.runPayoutCap,
      payoutLeft: status.payoutLeft,
    })
  );
  if (status.activeRun) {
    if (status.activeRun.awaitingReturn) lines.push(t('dungeon.lobby.revived', lang));
    lines.push(t('dungeon.lobby.activeRun', lang, { floor: status.activeRun.floor, gold: status.activeRun.player.gold }));
  } else if (status.lastRun) {
    lines.push(
      t('dungeon.lobby.lastRun', lang, {
        outcome: outcomeLabel(status.lastRun.outcome, lang),
        floor: status.lastRun.floor,
        payout: status.lastRun.payout,
        echoes: status.lastRun.echoes,
      })
    );
  }

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.violet)
    .setTitle(t('dungeon.lobby.title', lang))
    .setDescription(lines.join('\n\n'))
    .addFields(
      { name: t('dungeon.lobby.fieldBalance', lang), value: `\`${status.balance}\``, inline: true },
      { name: t('dungeon.lobby.fieldEchoes', lang), value: `\`${status.echoes}\``, inline: true },
      {
        name: t('dungeon.lobby.fieldBest', lang),
        value: status.stats.bestFloor > 0 ? t('dungeon.lobby.bestValue', lang, { floor: status.stats.bestFloor }) : t('dungeon.lobby.bestNone', lang),
        inline: true,
      }
    )
    .setThumbnail('attachment://pyxie_pixelart.png')
    .setFooter(footerFor(source, lang))
    .setTimestamp();

  const main = status.activeRun
    ? button({ id: lobbyId(user.id, 'cont'), label: t('dungeon.lobby.btnContinue', lang), emoji: '▶️', style: ButtonStyle.Success })
    : button({
        id: lobbyId(user.id, 'start'),
        label: t('dungeon.lobby.btnStart', lang, { ticket: s.ticket }),
        emoji: buttonEmoji('candle', '🕯️'),
        style: ButtonStyle.Primary,
        disabled: status.entriesLeft <= 0,
      });

  const components = [
    new ActionRowBuilder().addComponents(
      main,
      button({ id: lobbyId(user.id, 'help'), label: t('dungeon.lobby.btnHelp', lang), emoji: buttonEmoji('help', '📜') })
    ),
    new ActionRowBuilder().addComponents(
      button({ id: lobbyId(user.id, 'tal'), label: t('dungeon.lobby.btnTalents', lang), emoji: buttonEmoji('talents', '🌙') }),
      button({ id: lobbyId(user.id, 'hall'), label: t('dungeon.lobby.btnHall', lang), emoji: buttonEmoji('hall', '🏆') })
    ),
  ];

  return {
    content: '',
    embeds: [embed],
    components,
    files: [new AttachmentBuilder(LOBBY_THUMB, { name: 'pyxie_pixelart.png' })],
    attachments: [],
  };
}

// ---------------------------------------------------------------- telas auxiliares
function buildHelpView(source) {
  const lang = getLanguage(source);
  const s = store.getSettings();
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle(t('dungeon.help.title', lang))
    .setDescription(t('dungeon.help.desc', lang, { ticket: s.ticket, entries: s.dailyEntries, runCap: s.runPayoutCap, dayCap: s.dailyPayoutCap }))
    .setFooter(footerFor(source, lang));
  return { embeds: [embed] };
}

function buildTalentsView(user, source, { notice = null } = {}) {
  const lang = getLanguage(source);
  const status = store.getLobbyStatus(user.id);
  const lines = Object.entries(TALENTS).map(([id, talent]) => {
    const rank = Number(status.talents[id]) || 0;
    const max = talent.costs.length;
    return t('dungeon.talents.line', lang, {
      talent: `${talent.glyph} ${localized(talent.name, lang)}`,
      rank,
      max,
      desc: localized(talent.desc, lang),
      cost: rank >= max ? t('dungeon.talents.maxed', lang) : t('dungeon.talents.cost', lang, { cost: talent.costs[rank] }),
    });
  });
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.lilac)
    .setTitle(t('dungeon.talents.title', lang))
    .setDescription([notice ? `> ${notice}` : '', t('dungeon.talents.desc', lang, { echoes: status.echoes, lines: lines.join('\n\n') })].filter(Boolean).join('\n\n'))
    .setFooter(footerFor(source, lang));

  const buttons = Object.entries(TALENTS).map(([id, talent]) => {
    const rank = Number(status.talents[id]) || 0;
    const maxed = rank >= talent.costs.length;
    const name = localized(talent.name, lang);
    return button({
      id: talentButtonId(user.id, id),
      label: maxed ? t('dungeon.talents.btnMax', lang, { talent: name }) : t('dungeon.talents.btn', lang, { talent: name, cost: talent.costs[rank] }),
      emoji: talent.glyph,
      style: maxed ? ButtonStyle.Secondary : ButtonStyle.Primary,
      disabled: maxed || status.echoes < talent.costs[rank],
    });
  });
  return { embeds: [embed], components: rowsOf(buttons, 3) };
}

const HALL_SCOPES = { hall: 'all', halla: 'all', hallw: 'week', hallg: 'guild' };

/**
 * Rankings das Catacumbas: de sempre (andar mais fundo), da semana (zera segunda 00:00 BRT) e do
 * servidor (quem desceu a partir daqui). Os botões trocam a lista na mesma mensagem.
 */
function buildHallView(source, { what = 'hall', ownerId = null, now = Date.now() } = {}) {
  const lang = getLanguage(source);
  const guildId = source?.guildId || source?.guild?.id || null;
  // 'hall' abre a lista (botão do menu); dentro dela, as abas usam halla/hallw/hallg
  const scopeKey = HALL_SCOPES[what] && what !== 'hall' && (what !== 'hallg' || guildId) ? what : 'halla';
  const scope = HALL_SCOPES[scopeKey];
  const ranked = store.getLeaderboard({ scope: scope === 'guild' ? 'week' : scope, guildId: scope === 'guild' ? guildId : null, now });
  const top = ranked.slice(0, 10);
  const lineKey = scope === 'all' ? 'dungeon.hall.line' : 'dungeon.hall.lineWeek';
  const lines = top.map((entry, index) =>
    t(lineKey, lang, { pos: index + 1, user: `<@${entry.userId}>`, floor: entry.bestFloor, victories: entry.victories, payout: entry.coins, kills: entry.kills })
  );
  const viewerId = ownerId || source?.user?.id || source?.author?.id || null;
  const position = viewerId ? ranked.findIndex((entry) => entry.userId === String(viewerId)) + 1 : 0;

  const titleKey = { all: 'dungeon.hall.title', week: 'dungeon.hall.titleWeek', guild: 'dungeon.hall.titleGuild' }[scope];
  const descKey = { all: 'dungeon.hall.desc', week: 'dungeon.hall.descWeek', guild: 'dungeon.hall.descGuild' }[scope];
  const parts = [t(descKey, lang, { lines: lines.length > 0 ? lines.join('\n\n') : t('dungeon.hall.empty', lang), server: source?.guild?.name || '' })];
  if (position > 10) parts.push(t('dungeon.hall.you', lang, { pos: position }));
  if (scope !== 'all') parts.push(t('dungeon.hall.weekReset', lang));

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold)
    .setTitle(t(titleKey, lang))
    .setDescription(parts.join('\n\n'))
    .setFooter(footerFor(source, lang));

  const payload = { embeds: [embed], allowedMentions: { parse: [] } };
  if (viewerId) {
    const tabs = [
      ['halla', 'btnAll', buttonEmoji('hall', '🏆')],
      ['hallw', 'btnWeek', '📅'],
      ...(guildId ? [['hallg', 'btnGuild', '🏰']] : []),
    ].map(([id, label, emoji]) =>
      button({
        id: lobbyId(viewerId, id),
        label: t(`dungeon.hall.${label}`, lang),
        emoji,
        style: id === scopeKey ? ButtonStyle.Primary : ButtonStyle.Secondary,
        disabled: id === scopeKey,
      })
    );
    payload.components = [new ActionRowBuilder().addComponents(...tabs)];
  }
  return payload;
}

// ---------------------------------------------------------------- threads e inatividade
/** Mensagem que fica no canal quando a descida vai para a thread. */
function buildThreadNotice(thread, source) {
  const lang = getLanguage(source);
  const url = `https://discord.com/channels/${thread.guildId || source?.guildId}/${thread.id}`;
  return {
    content: t('dungeon.thread.started', lang, { thread: `<#${thread.id}>` }),
    embeds: [],
    files: [],
    attachments: [],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(url).setLabel(t('dungeon.thread.btnGo', lang)).setEmoji('🕯️')
      ),
    ],
    allowedMentions: { parse: [] },
  };
}

/** DM para quem morreu: outra pessoa rezou no túmulo e a descida voltou. */
function buildReviveNoticeView(notice) {
  const lang = notice.lang === 'en' ? 'en' : 'pt';
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.gold)
    .setTitle(t('dungeon.revive.title', lang))
    .setDescription(t('dungeon.revive.body', lang, { user: `<@${notice.prayerId}>`, floor: notice.floor }))
    .setFooter({ text: t('dungeon.idle.footer', lang) })
    .setTimestamp(notice.at || Date.now());
  return { embeds: [embed], allowedMentions: { parse: [] } };
}

/** Resumo de game over por inatividade (vai por DM; sem DM aberta, vai na thread). */
function buildIdleSummaryView(notice) {
  const lang = notice.lang === 'en' ? 'en' : 'pt';
  const s = notice.settlement || {};
  const lines = [
    t('dungeon.idle.intro', lang, { minutes: notice.idleMinutes, floor: notice.floor }),
    t('dungeon.idle.summaryHeader', lang),
    t('dungeon.end.gold', lang, { gold: s.gold || 0 }),
    t('dungeon.end.payout', lang, { payout: s.payout || 0 }),
    t('dungeon.end.salvage', lang),
    t('dungeon.end.echoes', lang, { echoes: s.echoes || 0 }),
  ];
  if (Array.isArray(s.drops) && s.drops.length) lines.push(t('dungeon.end.drops', lang, { items: dropNames(s.drops, lang) }));
  if (s.newBest) lines.push(t('dungeon.end.best', lang, { floor: notice.floor }));
  lines.push(t('dungeon.end.stats', lang, { rooms: notice.rooms || 0, kills: notice.kills || 0 }), t('dungeon.idle.tip', lang));
  const embed = new EmbedBuilder()
    .setColor(PHASE_COLORS.dead)
    .setTitle(t('dungeon.idle.title', lang))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('dungeon.idle.footer', lang) })
    .setTimestamp(notice.endedAt || Date.now());
  return { embeds: [embed] };
}

function buildBagView(run, source) {
  const lang = getLanguage(source);
  const p = run.player;
  const charms = p.charms.map((id) => t('dungeon.bag.charmLine', lang, { charm: charmName(id, lang), desc: localized(CHARMS[id].desc, lang) }));
  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle(t('dungeon.bag.title', lang))
    .setDescription(
      t('dungeon.bag.desc', lang, {
        charms: charms.length > 0 ? charms.join('\n\n') : t('dungeon.bag.none', lang),
        atk: p.atk,
        def: p.def,
        crit: Math.round(p.crit * 100),
        lightCost: engine.moveLightCost(run),
        heal: engine.potionHealAmount(run),
      })
    )
    .setFooter(footerFor(source, lang));
  return { embeds: [embed] };
}

function limitMessage(source) {
  const lang = getLanguage(source);
  const status = store.getLobbyStatus(source.user?.id || source.author?.id);
  return t('dungeon.errors.limit', lang, { max: status.settings.dailyEntries, time: formatRemaining(status.resetInMs, lang) });
}

module.exports = {
  PREFIX,
  setPlainButtonEmojis,
  appEmoji,
  parseCustomId,
  actionId,
  lobbyId,
  runTag,
  formatLogEntry,
  buildRenderText,
  buildRunEmbed,
  buildRunComponents,
  buildRunView,
  buildLobbyView,
  buildHelpView,
  buildTalentsView,
  buildHallView,
  buildThreadNotice,
  buildIdleSummaryView,
  buildReviveNoticeView,
  buildBagView,
  limitMessage,
};
