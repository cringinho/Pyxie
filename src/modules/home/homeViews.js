const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { t, getLanguage } = require('../../utils/i18n');
const { getEmoji } = require('../../utils/appEmojis');
const { emojify } = require('../../utils/emojify');
const { getItem, itemName, rarityInfo } = require('./homeCatalog');
const engine = require('./homeEngine');
const store = require('./homeStore');
const vault = require('../../services/itemVault');
const { renderHome, renderShelf } = require('./homeRenderer');

/**
 * Telas da Casinha (/py-home). Tudo acontece na mesma mensagem: os botões trocam a imagem e o
 * embed. customId: home:<ação>:<dona da casa>[:arg]. Só a dona decora; visitas só curtem.
 */

const PREFIX = 'home';
const BAG_PAGE_SIZE = 15;
const SELECT_PAGE_SIZE = 25;
const COLOR = '#a855f7';
const CUSTOM_EMOJI = /^<a?:\w+:\d+>$/;

let plainButtonEmojis = false;

/** Emoji do bot para o botão, ou Unicode se o Discord recusar emojis (ver respond() no comando). */
function btnEmoji(name, fallback) {
  if (plainButtonEmojis || !name) return fallback;
  const formatted = getEmoji(name);
  return CUSTOM_EMOJI.test(formatted || '') ? formatted : fallback;
}

function setPlainButtonEmojis(value) {
  plainButtonEmojis = Boolean(value);
}

function icon(name, fallback) {
  const formatted = getEmoji(name);
  return CUSTOM_EMOJI.test(formatted || '') ? formatted : fallback;
}

function id(action, ownerId, arg = null) {
  return [PREFIX, action, ownerId, arg].filter((part) => part !== null && part !== undefined).join(':');
}

function button(action, ownerId, label, emoji, style = ButtonStyle.Secondary, arg = null, disabled = false) {
  const b = new ButtonBuilder().setCustomId(id(action, ownerId, arg)).setStyle(style).setDisabled(disabled);
  if (label) b.setLabel(label);
  if (emoji) b.setEmoji(emoji);
  return b;
}

function rarityLabel(entry, lang) {
  return rarityInfo(entry.rarity)[lang === 'en' ? 'en' : 'pt'];
}

function priceLabel(entry, lang) {
  if (entry.price?.beans) return `${entry.price.beans} ${t('home.beans', { lang })}`;
  if (entry.price?.coins) return `${entry.price.coins} ${t('home.coins', { lang })}`;
  return t('home.notForSale', { lang });
}

function footer(source, lang) {
  const guild = source?.guild?.name || t('home.private', { lang });
  return { text: `Pyxie • ${guild}` };
}

function sceneText(home, ownerName, lang, extra = {}) {
  const charm = engine.computeCharm(home);
  const topSet = charm.activeSets[0] ? engine.setName(charm.activeSets[0].id, lang) : null;
  const subtitleParts = [
    t('home.scene.likes', { lang }, { likes: home.likes }),
    t('home.scene.items', { lang }, { items: home.placements.length }),
  ];
  if (topSet) subtitleParts.push(topSet);
  return {
    title: t('home.scene.title', { lang }, { name: ownerName }),
    subtitle: subtitleParts.join(' · '),
    charm: t('home.scene.charm', { lang }, { charm: charm.score }),
    ...extra,
  };
}

async function sceneFile(home, ownerName, lang, options = {}) {
  const png = await renderHome(home, { ...options, text: sceneText(home, ownerName, lang, options.text || {}) });
  return new AttachmentBuilder(png, { name: 'casinha.png' });
}

// ---------------------------------------------------------------------------
// Casinha (dona ou visita)
// ---------------------------------------------------------------------------

/**
 * Quem ainda não tem casinha: chave grátis no Andar 3 das Catacumbas, compra nas condições do
 * casamento ou morar junto com o cônjuge.
 */
function buildNoHomeView({ owner, source, notice = null }) {
  const lang = getLanguage(source);
  const access = store.getHomeAccess(owner.id);
  const lines = [
    notice ? `> ${notice}` : null,
    t('home.nohome.intro', { lang }),
    t('home.nohome.dungeon', { lang }, { floor: access.freeFloor, best: access.bestFloor }),
    t('home.nohome.buy', { lang }, { coins: access.price.coins, beans: access.price.beans, coin: icon('COIN', '🪙'), bean: icon('MAGIC_BEAN', '🌱') }),
    t('home.nohome.marry', { lang }),
    access.canClaimFree ? t('home.nohome.ready', { lang }, { floor: access.freeFloor }) : null,
  ].filter(Boolean);
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.nohome.title', { lang }))
    .setDescription(lines.join('\n\n'))
    .setFooter(footer(source, lang));
  const row = new ActionRowBuilder().addComponents(
    button('claim', owner.id, t('home.btn.claim', { lang }), '🗝️', access.canClaimFree ? ButtonStyle.Success : ButtonStyle.Secondary, null, !access.canClaimFree),
    button('buyhouse', owner.id, t('home.btn.buyHouse', { lang }), btnEmoji('73584mushroomhouses', '🏡'), ButtonStyle.Primary)
  );
  return { content: null, embeds: [embed], components: [row], files: [], attachments: [], allowedMentions: { parse: [] } };
}

/** Convite para o cônjuge morar junto (só o cônjuge aceita). */
function buildInviteMessage({ ownerId, spouseId, source }) {
  const lang = getLanguage(source);
  return {
    content: t('home.invite.message', { lang }, { spouse: `<@${spouseId}>`, owner: `<@${ownerId}>` }),
    components: [
      new ActionRowBuilder().addComponents(
        button('movein', ownerId, t('home.invite.btnAccept', { lang }), '🏡', ButtonStyle.Success, spouseId),
        button('stay', ownerId, t('home.invite.btnDecline', { lang }), null, ButtonStyle.Secondary, spouseId)
      ),
    ],
    allowedMentions: { users: [String(spouseId)], parse: [] },
  };
}

async function buildHomeView({ owner, viewer, source, notice = null }) {
  const lang = getLanguage(source);
  const isOwner = owner.id === viewer.id;
  const home = store.getHome(owner.id);
  if (!home && isOwner) return buildNoHomeView({ owner, source, notice });
  if (!home) {
    return {
      content: t('home.errors.noHome', { lang }, { name: owner.displayName || owner.username }),
      embeds: [],
      components: [new ActionRowBuilder().addComponents(button('open', viewer.id, t('home.btn.myHome', { lang }), btnEmoji('73584mushroomhouses', '🏡')))],
      files: [],
      attachments: [],
    };
  }
  const ownerName = owner.displayName || owner.username;
  const charm = engine.computeCharm(home);
  const sets = charm.activeSets.map((s) => `**${engine.setName(s.id, lang)}** \`${s.count}\``).join(' · ') || t('home.view.noSets', { lang });

  const homeOwnerId = store.getHomeOwnerId(owner.id);
  const people = [homeOwnerId, ...home.residents];
  const lines = [
    notice ? `> ${notice}` : null,
    isOwner ? t('home.view.introOwner', { lang }) : t('home.view.introVisitor', { lang }, { name: ownerName }),
    home.residents.length ? t('home.view.shared', { lang }, { people: people.map((p) => `<@${p}>`).join(lang === 'en' ? ' and ' : ' e ') }) : null,
    t('home.view.charmHeader', { lang }),
    t('home.view.charmLine', { lang }, { charm: charm.score, best: Math.max(home.bestCharm, charm.score) }),
    t('home.view.setsLine', { lang }, { sets }),
    t('home.view.socialLine', { lang }, { likes: home.likes, visits: home.visits }),
    isOwner ? t('home.view.tipOwner', { lang }, { min: engine.SET_BONUS_MIN }) : t('home.view.tipVisitor', { lang }),
  ].filter(Boolean);

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.view.title', { lang }, { icon: icon('73584mushroomhouses', '🏡'), name: ownerName }))
    .setDescription(emojify(lines.join('\n\n')))
    .setImage('attachment://casinha.png')
    .setFooter(footer(source, lang));

  const rows = isOwner
    ? [
        new ActionRowBuilder().addComponents(
          button('pick', owner.id, t('home.btn.decorate', { lang }), btnEmoji('handwithplant', '🛋️'), ButtonStyle.Primary, 0),
          button('arrange', owner.id, t('home.btn.arrange', { lang }), '🧹'),
          button('shop', owner.id, t('home.btn.shop', { lang }), btnEmoji('Pink_bag', '🛍️'), ButtonStyle.Success),
        ),
        new ActionRowBuilder().addComponents(
          button('bag', owner.id, t('home.btn.bag', { lang }), btnEmoji('54936emptybox', '🎒'), ButtonStyle.Secondary, 0),
          button('surface', owner.id, t('home.btn.surface', { lang }), '🎨'),
          button('rank', owner.id, t('home.btn.rank', { lang }), btnEmoji('win', '🏆')),
          ...(canInviteSpouse(owner.id) ? [button('invite', owner.id, t('home.btn.invite', { lang }), '💞', ButtonStyle.Success)] : []),
        ),
      ]
    : [
        new ActionRowBuilder().addComponents(
          button('like', owner.id, t('home.btn.like', { lang }), btnEmoji('heart', '💜'), ButtonStyle.Success),
          button('rank', owner.id, t('home.btn.rank', { lang }), btnEmoji('win', '🏆')),
          button('open', viewer.id, t('home.btn.myHome', { lang }), btnEmoji('73584mushroomhouses', '🏡')),
        ),
      ];

  return {
    content: null,
    embeds: [embed],
    components: rows,
    files: [await sceneFile(home, ownerName, lang)],
    attachments: [],
    allowedMentions: { parse: [] },
  };
}

/** Dona da própria casa, casada, e o cônjuge ainda não mora junto. */
function canInviteSpouse(userId) {
  if (store.getHomeOwnerId(userId) !== String(userId) || !store.getOwnHome(userId)) return false;
  let spouseId = null;
  try {
    spouseId = require('../../services/marriage').getSpouseId(String(userId));
  } catch (_) {
    spouseId = null;
  }
  return Boolean(spouseId) && !store.livingTogether(userId, spouseId);
}

// ---------------------------------------------------------------------------
// Escolher item da mochila para colocar
// ---------------------------------------------------------------------------

function groupAvailable(userId) {
  const groups = new Map();
  for (const instance of store.getAvailableInstances(userId)) {
    const entry = getItem(instance.itemId);
    if (!groups.has(entry.id)) groups.set(entry.id, { entry, count: 0, uid: instance.uid, serial: instance.serial });
    groups.get(entry.id).count += 1;
  }
  return [...groups.values()].sort((a, b) => rarityInfo(b.entry.rarity).order - rarityInfo(a.entry.rarity).order || itemName(a.entry).localeCompare(itemName(b.entry)));
}

async function buildPickView({ owner, source, page = 0, notice = null }) {
  const lang = getLanguage(source);
  const home = store.ensureHome(owner.id);
  const groups = groupAvailable(owner.id);
  const pages = Math.max(1, Math.ceil(groups.length / SELECT_PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  const slice = groups.slice(current * SELECT_PAGE_SIZE, (current + 1) * SELECT_PAGE_SIZE);

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.pick.title', { lang }, { icon: icon('handwithplant', '🛋️') }))
    .setDescription(emojify([
      notice ? `> ${notice}` : null,
      groups.length ? t('home.pick.desc', { lang }) : t('home.pick.empty', { lang }),
      t('home.pick.limits', { lang }, { max: engine.LIMITS.placements, pets: engine.LIMITS.pets, placed: home.placements.length }),
    ].filter(Boolean).join('\n\n')))
    .setImage('attachment://casinha.png')
    .setFooter(footer(source, lang));

  const rows = [];
  if (slice.length) {
    rows.push(new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(id('select', owner.id, current))
        .setPlaceholder(t('home.pick.placeholder', { lang }))
        .addOptions(slice.map(({ entry, count, serial }) => ({
          label: `${itemName(entry, lang)}${count > 1 ? ` ×${count}` : ''}`.slice(0, 100),
          description: `${rarityLabel(entry, lang)} · ${t(`home.kinds.${entry.kind}`, { lang })}${serial ? ` · #${serial}` : ''}`.slice(0, 100),
          value: entry.id,
        }))),
    ));
  }
  const nav = new ActionRowBuilder().addComponents(button('home', owner.id, t('home.btn.back', { lang }), '↩️'));
  if (pages > 1) {
    nav.addComponents(
      button('pick', owner.id, '◀', null, ButtonStyle.Secondary, current - 1, current === 0),
      button('pick', owner.id, `${current + 1}/${pages}`, null, ButtonStyle.Secondary, `p${current}`, true),
      button('pick', owner.id, '▶', null, ButtonStyle.Secondary, current + 1, current >= pages - 1),
    );
  }
  nav.addComponents(button('shop', owner.id, t('home.btn.shop', { lang }), btnEmoji('Pink_bag', '🛍️'), ButtonStyle.Success));
  rows.push(nav);

  return {
    content: null,
    embeds: [embed],
    components: rows,
    files: [await sceneFile(home, owner.displayName || owner.username, lang, { edit: true })],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Posicionar (colocar item novo ou mover um que já está no quarto)
// ---------------------------------------------------------------------------

function cursorState(home, session) {
  const entry = getItem(session.itemId);
  const check = engine.validatePlacement(home.placements, session.itemId, session.x, session.y, session.moving ? session.uid : null);
  return { entry, check };
}

async function buildPlaceView({ owner, source, session, notice = null }) {
  const lang = getLanguage(source);
  const home = store.ensureHome(owner.id);
  const { entry, check } = cursorState(home, session);
  const area = engine.layerOf(entry) === 'wall' ? 'wall' : 'floor';
  const status = check.ok ? t('home.place.fits', { lang }) : t(`home.reasons.${check.reason}`, { lang });

  const embed = new EmbedBuilder()
    .setColor(check.ok ? '#22c55e' : '#ef4444')
    .setTitle(t('home.place.title', { lang }, { icon: icon('handwithplant', '🛋️') }))
    .setDescription(emojify([
      notice ? `> ${notice}` : null,
      t('home.place.item', { lang }, { name: itemName(entry, lang), rarity: rarityLabel(entry, lang), w: entry.footprint[0], h: entry.footprint[1] }),
      t('home.place.where', { lang }, { area: t(`home.areas.${area}`, { lang }), x: session.x + 1, y: session.y + 1 }),
      `> ${status}`,
      t('home.place.help', { lang }),
    ].filter(Boolean).join('\n\n')))
    .setImage('attachment://casinha.png')
    .setFooter(footer(source, lang));

  const pad = new ActionRowBuilder().addComponents(
    button('mv', owner.id, '​', '⬅️', ButtonStyle.Secondary, 'l'),
    button('mv', owner.id, '​', '⬆️', ButtonStyle.Secondary, 'u'),
    button('mv', owner.id, '​', '⬇️', ButtonStyle.Secondary, 'd'),
    button('mv', owner.id, '​', '➡️', ButtonStyle.Secondary, 'r'),
    button('flip', owner.id, '​', '↔️', ButtonStyle.Secondary, null, !entry.flippable),
  );
  const actions = new ActionRowBuilder().addComponents(
    button('put', owner.id, t('home.btn.put', { lang }), btnEmoji('5707lightpurplecheck', '✅'), ButtonStyle.Success, null, !check.ok),
    button('cancel', owner.id, t('home.btn.cancel', { lang }), btnEmoji('41077criticalfailure', '❌'), ButtonStyle.Danger),
  );

  return {
    content: null,
    embeds: [embed],
    components: [pad, actions],
    files: [await sceneFile(home, owner.displayName || owner.username, lang, {
      edit: true,
      hidden: session.moving ? session.uid : null,
      ghost: { itemId: session.itemId, x: session.x, y: session.y, flip: session.flip },
      cursor: { area, x: session.x, y: session.y, size: entry.footprint, state: check.ok ? 'valid' : 'invalid' },
      text: { label: itemName(entry, lang) },
    })],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Arrumar: cursor sobre o quarto para mover ou guardar o que já está lá
// ---------------------------------------------------------------------------

async function buildArrangeView({ owner, source, session, notice = null }) {
  const lang = getLanguage(source);
  const home = store.ensureHome(owner.id);
  const target = engine.findPlacementAt(home.placements, session.area, session.x, session.y);
  const targetEntry = target ? getItem(target.itemId) : null;

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.arrange.title', { lang }))
    .setDescription(emojify([
      notice ? `> ${notice}` : null,
      t('home.place.where', { lang }, { area: t(`home.areas.${session.area}`, { lang }), x: session.x + 1, y: session.y + 1 }),
      targetEntry
        ? t('home.arrange.target', { lang }, { name: itemName(targetEntry, lang), rarity: rarityLabel(targetEntry, lang) })
        : t('home.arrange.empty', { lang }),
      t('home.arrange.help', { lang }),
    ].filter(Boolean).join('\n\n')))
    .setImage('attachment://casinha.png')
    .setFooter(footer(source, lang));

  const pad = new ActionRowBuilder().addComponents(
    button('amv', owner.id, '​', '⬅️', ButtonStyle.Secondary, 'l'),
    button('amv', owner.id, '​', '⬆️', ButtonStyle.Secondary, 'u'),
    button('amv', owner.id, '​', '⬇️', ButtonStyle.Secondary, 'd'),
    button('amv', owner.id, '​', '➡️', ButtonStyle.Secondary, 'r'),
    button('area', owner.id, t(session.area === 'wall' ? 'home.btn.toFloor' : 'home.btn.toWall', { lang }), '🔀'),
  );
  const actions = new ActionRowBuilder().addComponents(
    button('grab', owner.id, t('home.btn.move', { lang }), '✋', ButtonStyle.Primary, null, !target),
    button('store', owner.id, t('home.btn.store', { lang }), btnEmoji('54936emptybox', '📦'), ButtonStyle.Secondary, null, !target),
    button('home', owner.id, t('home.btn.done', { lang }), btnEmoji('5707lightpurplecheck', '✅'), ButtonStyle.Success),
  );

  return {
    content: null,
    embeds: [embed],
    components: [pad, actions],
    files: [await sceneFile(home, owner.displayName || owner.username, lang, {
      edit: true,
      cursor: { area: session.area, x: session.x, y: session.y, size: [1, 1], state: 'select' },
      text: { label: targetEntry ? itemName(targetEntry, lang) : '' },
    })],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Loja do dia
// ---------------------------------------------------------------------------

async function buildShopView({ owner, source, selected = null, notice = null }) {
  const lang = getLanguage(source);
  const shop = engine.getDailyShop();
  const entries = shop.items.map(getItem).filter(Boolean);
  const economy = require('../../services/economy');
  const account = economy.getUserAccount(owner.id);
  const coinIcon = icon('COIN', '🪙');
  const beanIcon = icon('MAGIC_BEAN', '🌱');

  const list = entries.map((entry, index) => {
    const price = entry.price?.beans ? `${beanIcon} \`${entry.price.beans}\`` : `${coinIcon} \`${entry.price.coins}\``;
    return t('home.shop.line', { lang }, { n: index + 1, name: itemName(entry, lang), rarity: rarityLabel(entry, lang), price });
  });

  const embed = new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(t('home.shop.title', { lang }, { icon: icon('Pink_bag', '🛍️') }))
    .setDescription(emojify([
      notice ? `> ${notice}` : null,
      t('home.shop.intro', { lang }),
      t('home.shop.balance', { lang }, { coins: account.coins, beans: account.magicBeans, coinIcon, beanIcon }),
      list.join('\n\n'),
      t('home.shop.rotation', { lang }),
    ].filter(Boolean).join('\n\n')))
    .setImage('attachment://loja.png')
    .setFooter(footer(source, lang))
    .setTimestamp();

  const rows = [new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(id('sel_buy', owner.id))
      .setPlaceholder(t('home.shop.placeholder', { lang }))
      .addOptions(entries.map((entry) => ({
        label: itemName(entry, lang).slice(0, 100),
        description: `${rarityLabel(entry, lang)} · ${priceLabel(entry, lang)}`.slice(0, 100),
        value: entry.id,
        default: entry.id === selected,
      }))),
  )];
  const nav = new ActionRowBuilder().addComponents(button('home', owner.id, t('home.btn.back', { lang }), '↩️'));
  if (selected) {
    const entry = getItem(selected);
    nav.addComponents(button('buy', owner.id, t('home.btn.buy', { lang }, { name: itemName(entry, lang) }).slice(0, 80), btnEmoji('5707lightpurplecheck', '✅'), ButtonStyle.Success, selected));
  }
  rows.push(nav);

  const png = await renderShelf(entries.map((entry) => ({
    itemId: entry.id,
    sublabel: entry.price?.beans ? `🌱 ${entry.price.beans}` : `🪙 ${entry.price.coins}`,
  })), { title: t('home.shop.shelfTitle', { lang }), lang });

  return {
    content: null,
    embeds: [embed],
    components: rows,
    files: [new AttachmentBuilder(png, { name: 'loja.png' })],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Mochila (tudo que a pessoa possui, inclusive o que está à mostra)
// ---------------------------------------------------------------------------

async function buildBagView({ owner, source, page = 0 }) {
  const lang = getLanguage(source);
  const home = store.ensureHome(owner.id);
  const placed = new Set(home.placements.map((p) => p.uid));
  const groups = new Map();
  for (const instance of vault.listInstances(owner.id)) {
    const entry = getItem(instance.itemId);
    if (!groups.has(entry.id)) groups.set(entry.id, { entry, count: 0, shown: 0, serials: [] });
    const group = groups.get(entry.id);
    group.count += 1;
    if (placed.has(instance.uid)) group.shown += 1;
    if (instance.serial) group.serials.push(instance.serial);
  }
  const sorted = [...groups.values()].sort((a, b) => rarityInfo(b.entry.rarity).order - rarityInfo(a.entry.rarity).order || itemName(a.entry, lang).localeCompare(itemName(b.entry, lang)));
  const pages = Math.max(1, Math.ceil(sorted.length / BAG_PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  const slice = sorted.slice(current * BAG_PAGE_SIZE, (current + 1) * BAG_PAGE_SIZE);
  const stats = vault.getCollectionStats(owner.id);

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.bag.title', { lang }, { icon: icon('54936emptybox', '🎒') }))
    .setDescription(emojify([
      t('home.bag.summary', { lang }, { total: stats.total, distinct: stats.distinct }),
      t('home.bag.rarities', { lang }, {
        legendary: stats.byRarity.legendary,
        mythic: stats.byRarity.mythic,
        epic: stats.byRarity.epic,
      }),
      t('home.bag.hint', { lang }),
    ].join('\n\n')))
    .setImage('attachment://mochila.png')
    .setFooter(footer(source, lang));

  const nav = new ActionRowBuilder().addComponents(button('home', owner.id, t('home.btn.back', { lang }), '↩️'));
  if (pages > 1) {
    nav.addComponents(
      button('bag', owner.id, '◀', null, ButtonStyle.Secondary, current - 1, current === 0),
      button('bag', owner.id, `${current + 1}/${pages}`, null, ButtonStyle.Secondary, `p${current}`, true),
      button('bag', owner.id, '▶', null, ButtonStyle.Secondary, current + 1, current >= pages - 1),
    );
  }

  const png = await renderShelf(slice.map(({ entry, count, shown, serials }) => ({
    itemId: entry.id,
    sublabel: serials.length
      ? `#${serials.sort((a, b) => a - b).slice(0, 3).join(' #')}`
      : t('home.bag.count', { lang }, { count, shown }),
  })), { title: t('home.bag.shelfTitle', { lang }, { page: current + 1, pages }), lang });

  return {
    content: null,
    embeds: [embed],
    components: [nav],
    files: [new AttachmentBuilder(png, { name: 'mochila.png' })],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Parede e piso
// ---------------------------------------------------------------------------

async function buildSurfaceView({ owner, source, notice = null }) {
  const lang = getLanguage(source);
  const home = store.ensureHome(owner.id);
  const owned = [...new Set(vault.listInstances(owner.id).map((it) => it.itemId))]
    .map(getItem)
    .filter((entry) => entry && ['wallpaper', 'flooring'].includes(entry.kind))
    .sort((a, b) => a.kind.localeCompare(b.kind) || rarityInfo(b.rarity).order - rarityInfo(a.rarity).order);

  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(t('home.surface.title', { lang }))
    .setDescription(emojify([
      notice ? `> ${notice}` : null,
      t('home.surface.current', { lang }, {
        wallpaper: itemName(getItem(home.wallpaper), lang),
        flooring: itemName(getItem(home.flooring), lang),
      }),
      t('home.surface.desc', { lang }),
    ].filter(Boolean).join('\n\n')))
    .setImage('attachment://casinha.png')
    .setFooter(footer(source, lang));

  const rows = [new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(id('sel_surface', owner.id))
      .setPlaceholder(t('home.surface.placeholder', { lang }))
      .addOptions(owned.slice(0, 25).map((entry) => ({
        label: itemName(entry, lang).slice(0, 100),
        description: `${t(`home.kinds.${entry.kind}`, { lang })} · ${rarityLabel(entry, lang)}`.slice(0, 100),
        value: entry.id,
        default: entry.id === home.wallpaper || entry.id === home.flooring,
      }))),
  ), new ActionRowBuilder().addComponents(button('home', owner.id, t('home.btn.back', { lang }), '↩️'))];

  return {
    content: null,
    embeds: [embed],
    components: rows,
    files: [await sceneFile(home, owner.displayName || owner.username, lang)],
    attachments: [],
  };
}

// ---------------------------------------------------------------------------
// Ranking das casinhas mais charmosas
// ---------------------------------------------------------------------------

function buildRankView({ source }) {
  const lang = getLanguage(source);
  const board = store.getLeaderboard(10);
  const medals = ['🥇', '🥈', '🥉'];
  const lines = board.map((row, index) => t('home.rank.line', { lang }, {
    pos: medals[index] || `\`${index + 1}.\``,
    user: `<@${row.userId}>`,
    charm: row.charm,
    likes: row.likes,
  }));
  const embed = new EmbedBuilder()
    .setColor('#fbbf24')
    .setTitle(t('home.rank.title', { lang }, { icon: icon('win', '🏆') }))
    .setDescription(emojify([t('home.rank.intro', { lang }), lines.join('\n\n') || t('home.rank.empty', { lang })].join('\n\n')))
    .setFooter(footer(source, lang));
  return { embeds: [embed], allowedMentions: { parse: [] } };
}

module.exports = {
  PREFIX,
  buildNoHomeView,
  buildInviteMessage,
  canInviteSpouse,
  setPlainButtonEmojis,
  buildHomeView,
  buildPickView,
  buildPlaceView,
  buildArrangeView,
  buildShopView,
  buildBagView,
  buildSurfaceView,
  buildRankView,
  groupAvailable,
};
