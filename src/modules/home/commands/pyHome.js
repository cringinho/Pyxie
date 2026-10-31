const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const { getItem, itemName } = require('../homeCatalog');
const engine = require('../homeEngine');
const store = require('../homeStore');
const views = require('../homeViews');

const name = 'py-home';
const aliases = [
  'home',
  'py-casa',
  'casa',
  'casinha',
  'py-casinha',
  'house',
  'py-house',
  'quarto',
  'py-quarto',
  'room',
  'py-room',
];

/** Sessões de edição em memória (posicionar/arrumar). Expiram em 15 minutos. */
const SESSION_TTL_MS = 15 * 60 * 1000;
const sessions = new Map();

function getSession(userId) {
  const session = sessions.get(userId);
  if (!session || Date.now() - session.at > SESSION_TTL_MS) {
    sessions.delete(userId);
    return null;
  }
  return session;
}

function setSession(userId, session) {
  sessions.set(userId, { ...session, at: Date.now() });
  if (sessions.size > 2000) {
    for (const [key, value] of sessions) if (Date.now() - value.at > SESSION_TTL_MS) sessions.delete(key);
  }
}

function ephemeral(payload) {
  return { ...payload, flags: MessageFlags.Ephemeral };
}

/** Mesmo esquema da dungeon: se o Discord recusar um emoji do bot (50035), refaz com Unicode. */
async function respond(target, method, build) {
  try {
    return await target[method](await build());
  } catch (err) {
    if (err?.code !== 50035 || !/emoji/i.test(String(err?.message || ''))) throw err;
    views.setPlainButtonEmojis(true);
    return target[method](await build());
  }
}

function personFrom(user, member) {
  return { id: user.id, username: user.username, displayName: member?.displayName || user.globalName || user.username };
}

function isHomeInteraction(interaction) {
  return (interaction.isButton() || interaction.isStringSelectMenu())
    && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

function reasonText(reason, lang, params = {}) {
  return t(`home.reasons.${reason}`, { lang }, params);
}

function clampCursor(session, entry) {
  const area = engine.layerOf(entry) === 'wall' ? 'wall' : 'floor';
  const rows = area === 'wall' ? engine.ROOM.wallRows : engine.ROOM.floorRows;
  const [w, h] = entry.footprint;
  session.x = Math.min(Math.max(0, session.x), engine.ROOM.cols - w);
  session.y = Math.min(Math.max(0, session.y), rows - h);
  return session;
}

const DIRS = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] };

async function startPlacing(interaction, owner, itemId, notice = null) {
  const lang = getLanguage(interaction);
  const group = views.groupAvailable(owner.id).find((g) => g.entry.id === itemId);
  if (!group) return respond(interaction, 'update', () => views.buildPickView({ owner, source: interaction, notice: reasonText('not_owned', lang) }));
  const home = store.ensureHome(owner.id);
  const spot = engine.findFreeSpot(home.placements, itemId) || { x: 0, y: 0 };
  const session = clampCursor({ mode: 'place', uid: group.uid, itemId, x: spot.x, y: spot.y, flip: false, moving: false }, group.entry);
  setSession(owner.id, session);
  return respond(interaction, 'update', () => views.buildPlaceView({ owner, source: interaction, session, notice }));
}

async function handleOwnerAction(interaction, action, arg, owner) {
  const lang = getLanguage(interaction);
  const userId = owner.id;

  // Sem casinha ainda: só dá para pegar a chave (Catacumbas) ou comprar
  if (action === 'claim' || action === 'buyhouse') {
    const result = action === 'claim' ? store.claimFreeHome(userId) : store.buyHouse(userId);
    if (!result.ok) {
      const notice = reasonText(result.reason, lang, { floor: store.FREE_HOUSE_FLOOR, price: result.price ?? '', balance: result.balance ?? '' });
      return respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction, notice }));
    }
    await respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction, notice: t(action === 'claim' ? 'home.notices.claimed' : 'home.notices.houseBought', { lang }) }));
    return checkAchievements(interaction);
  }
  if (!store.getHome(userId)) {
    return respond(interaction, 'update', () => views.buildNoHomeView({ owner, source: interaction }));
  }

  switch (action) {
    case 'invite': {
      const spouseId = require('../../../services/marriage').getSpouseId(userId);
      if (!spouseId || !views.canInviteSpouse(userId)) {
        return interaction.reply(ephemeral({ content: reasonText(spouseId ? 'already_together' : 'not_spouse', lang) }));
      }
      return interaction.reply(views.buildInviteMessage({ ownerId: userId, spouseId, source: interaction }));
    }

    case 'home':
      sessions.delete(userId);
      return respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction }));

    case 'pick':
      return respond(interaction, 'update', () => views.buildPickView({ owner, source: interaction, page: Number(arg) || 0 }));

    case 'donate':
      return respond(interaction, 'update', () => views.buildDonateView({ owner, source: interaction }));

    case 'donors':
      return respond(interaction, 'update', () => views.buildDonorsView({ owner, source: interaction }));

    case 'dsel': {
      const cents = Number(interaction.values?.[0] || 0);
      const donation = await require('../../../services/donations')
        .createPixDonation({ userId, cents, name: owner.displayName || owner.username || '', lang })
        .catch(() => ({ ok: false, reason: 'provider' }));
      const notice = donation.ok ? null : t(`home.donate.errors.${donation.reason}`, { lang }, {});
      return respond(interaction, 'update', () => views.buildDonateView({
        owner,
        source: interaction,
        donation: donation.ok ? donation : null,
        notice: notice && !notice.startsWith('home.') ? notice : null,
      }));
    }

    case 'select':
      return startPlacing(interaction, owner, interaction.values?.[0]);

    case 'mv':
    case 'flip': {
      const session = getSession(userId);
      if (!session || session.mode !== 'place') return respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction, notice: t('home.errors.expired', { lang }) }));
      const entry = getItem(session.itemId);
      if (action === 'flip') session.flip = entry.flippable ? !session.flip : false;
      else {
        const [dx, dy] = DIRS[arg] || [0, 0];
        session.x += dx;
        session.y += dy;
        clampCursor(session, entry);
      }
      setSession(userId, session);
      return respond(interaction, 'update', () => views.buildPlaceView({ owner, source: interaction, session }));
    }

    case 'put': {
      const session = getSession(userId);
      if (!session || session.mode !== 'place') return respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction, notice: t('home.errors.expired', { lang }) }));
      const result = session.moving
        ? store.moveItem(userId, session.uid, session.x, session.y, session.flip)
        : store.placeItem(userId, session.uid, session.x, session.y, session.flip);
      if (!result.ok) return respond(interaction, 'update', () => views.buildPlaceView({ owner, source: interaction, session, notice: reasonText(result.reason, lang) }));
      sessions.delete(userId);
      const placed = itemName(getItem(session.itemId), lang);
      await respond(interaction, 'update', () => views.buildHomeView({ owner, viewer: owner, source: interaction, notice: t('home.notices.placed', { lang }, { name: placed }) }));
      return checkAchievements(interaction);
    }

    case 'cancel': {
      const session = getSession(userId);
      sessions.delete(userId);
      if (session?.moving) return startArrange(interaction, owner, session);
      return respond(interaction, 'update', () => views.buildPickView({ owner, source: interaction }));
    }

    case 'arrange':
      return startArrange(interaction, owner, null);

    case 'amv':
    case 'area': {
      const session = getSession(userId) || { mode: 'arrange', area: 'floor', x: 0, y: 0 };
      if (action === 'area') {
        session.area = session.area === 'wall' ? 'floor' : 'wall';
        session.y = 0;
      } else {
        const [dx, dy] = DIRS[arg] || [0, 0];
        const rows = session.area === 'wall' ? engine.ROOM.wallRows : engine.ROOM.floorRows;
        session.x = Math.min(Math.max(0, session.x + dx), engine.ROOM.cols - 1);
        session.y = Math.min(Math.max(0, session.y + dy), rows - 1);
      }
      session.mode = 'arrange';
      setSession(userId, session);
      return respond(interaction, 'update', () => views.buildArrangeView({ owner, source: interaction, session }));
    }

    case 'grab':
    case 'store': {
      const session = getSession(userId);
      if (!session || session.mode !== 'arrange') return startArrange(interaction, owner, null);
      const home = store.ensureHome(userId);
      const target = engine.findPlacementAt(home.placements, session.area, session.x, session.y);
      if (!target) return respond(interaction, 'update', () => views.buildArrangeView({ owner, source: interaction, session, notice: t('home.arrange.empty', { lang }) }));
      if (action === 'store') {
        const result = store.storeItem(userId, target.uid);
        const notice = result.ok
          ? t('home.notices.stored', { lang }, { name: itemName(getItem(target.itemId), lang) })
          : reasonText(result.reason, lang);
        return respond(interaction, 'update', () => views.buildArrangeView({ owner, source: interaction, session, notice }));
      }
      const placeSession = {
        mode: 'place',
        moving: true,
        uid: target.uid,
        itemId: target.itemId,
        x: target.x,
        y: target.y,
        flip: Boolean(target.flip),
        returnArea: session.area,
      };
      setSession(userId, placeSession);
      return respond(interaction, 'update', () => views.buildPlaceView({ owner, source: interaction, session: placeSession }));
    }

    case 'shop':
      return respond(interaction, 'update', () => views.buildShopView({ owner, source: interaction }));

    case 'sel_buy':
      return respond(interaction, 'update', () => views.buildShopView({ owner, source: interaction, selected: interaction.values?.[0] }));

    case 'buy': {
      const result = store.buyItem(userId, arg);
      if (!result.ok) {
        const notice = reasonText(result.reason, lang, { price: result.price ?? '', balance: result.balance ?? '' });
        return respond(interaction, 'update', () => views.buildShopView({ owner, source: interaction, selected: arg, notice }));
      }
      const notice = t('home.notices.bought', { lang }, { name: itemName(result.entry, lang) });
      if (engine.isPlaceable(result.entry)) {
        await startPlacing(interaction, owner, result.entry.id, notice);
      } else {
        await respond(interaction, 'update', () => views.buildSurfaceView({ owner, source: interaction, notice }));
      }
      return checkAchievements(interaction);
    }

    case 'bag':
      return respond(interaction, 'update', () => views.buildBagView({ owner, source: interaction, page: Number(arg) || 0 }));

    case 'surface':
      return respond(interaction, 'update', () => views.buildSurfaceView({ owner, source: interaction }));

    case 'sel_surface': {
      const itemId = interaction.values?.[0];
      const result = store.applySurface(userId, itemId);
      const notice = result.ok
        ? t('home.notices.surface', { lang }, { name: itemName(getItem(itemId), lang) })
        : reasonText(result.reason, lang);
      return respond(interaction, 'update', () => views.buildSurfaceView({ owner, source: interaction, notice }));
    }

    default:
      return interaction.reply(ephemeral({ content: t('home.errors.invalid', { lang }) }));
  }
}

async function startArrange(interaction, owner, previous) {
  const session = { mode: 'arrange', area: previous?.returnArea || previous?.area || 'floor', x: previous?.x || 0, y: previous?.y || 0 };
  const rows = session.area === 'wall' ? engine.ROOM.wallRows : engine.ROOM.floorRows;
  session.y = Math.min(session.y, rows - 1);
  setSession(owner.id, session);
  return respond(interaction, 'update', () => views.buildArrangeView({ owner, source: interaction, session }));
}

/** Avisa conquistas novas sem atrapalhar a tela da casinha (mensagem privada). */
async function checkAchievements(interaction) {
  try {
    const achievements = require('../../../services/achievements');
    await achievements.notifyNewAchievements(interaction);
  } catch (err) {
    console.warn('[home] Falha ao verificar conquistas:', err.message);
  }
}

async function handleHomeInteraction(interaction) {
  const [, action, ownerId, arg] = String(interaction.customId).split(':');
  const lang = getLanguage(interaction);
  const viewer = personFrom(interaction.user, interaction.member);

  // Ações que qualquer pessoa pode usar
  if (action === 'open') {
    if (viewer.id !== ownerId) return interaction.reply(ephemeral({ content: t('home.errors.notYours', { lang }) }));
    return respond(interaction, 'update', () => views.buildHomeView({ owner: viewer, viewer, source: interaction }));
  }
  if (action === 'rank') return interaction.reply(ephemeral(views.buildRankView({ source: interaction })));
  // Convite para morar junto: só o cônjuge convidado responde
  if (action === 'movein' || action === 'stay') {
    if (viewer.id !== arg) return interaction.reply(ephemeral({ content: t('home.invite.notForYou', { lang }) }));
    if (action === 'stay') return interaction.update({ content: t('home.invite.declined', { lang }), components: [], allowedMentions: { parse: [] } });
    const result = store.moveIn(ownerId, viewer.id);
    const content = result.ok
      ? t('home.invite.accepted', { lang }, { spouse: `<@${viewer.id}>`, owner: `<@${ownerId}>` })
      : reasonText(result.reason, lang);
    if (!result.ok) return interaction.reply(ephemeral({ content }));
    return interaction.update({ content, components: [], allowedMentions: { parse: [] } });
  }
  if (action === 'like') {
    const result = store.likeHome(viewer.id, ownerId);
    const content = result.ok
      ? t('home.notices.liked', { lang }, { likes: result.likes })
      : reasonText(result.reason, lang);
    await interaction.reply(ephemeral({ content }));
    return result.ok ? checkAchievements(interaction) : null;
  }

  // Daqui para baixo, só a dona da casa
  if (viewer.id !== ownerId) return interaction.reply(ephemeral({ content: t('home.errors.notYours', { lang }) }));
  return handleOwnerAction(interaction, action, arg, viewer);
}

/** Primeira mensagem: sem os campos de edição (content null, attachments) que só servem para update. */
function forSend(payload) {
  const { content, attachments, ...rest } = payload;
  return content ? { content, ...rest } : rest;
}

async function showHome(source, target, method, user, member, targetUser, targetMember) {
  const viewer = personFrom(user, member);
  const owner = targetUser && targetUser.id !== user.id && !targetUser.bot ? personFrom(targetUser, targetMember) : viewer;
  if (owner.id !== viewer.id) store.recordVisit(viewer.id, owner.id);
  return respond(target, method, async () => forSend(await views.buildHomeView({ owner, viewer, source })));
}

module.exports = {
  name,
  // Parte do Mundo Pyxie: some no modo clássico do servidor (/py-setup)
  mmo: true,
  aliases,
  category: 'economia',
  isHomeInteraction,
  handleHomeInteraction,
  _sessions: sessions,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Your pixel art cozy room: decorate, buy furniture and pets, and visit friends.')
    .setDescriptionLocalizations({
      'pt-BR': 'Sua casinha em pixel art: decore, compre móveis e pets e visite os amigos.',
    })
    .addUserOption((option) => option
      .setName('user')
      .setNameLocalizations({ 'pt-BR': 'pessoa' })
      .setDescription('Visit someone else’s room.')
      .setDescriptionLocalizations({ 'pt-BR': 'Visite a casinha de outra pessoa.' })
      .setRequired(false)),

  async executeSlash({ interaction }) {
    const target = interaction.options.getUser('user');
    const targetMember = interaction.options.getMember?.('user') || null;
    return showHome(interaction, interaction, 'editReply', interaction.user, interaction.member, target, targetMember);
  },

  async executePrefix({ message }) {
    const target = message.mentions?.users?.first() || null;
    const targetMember = target ? message.mentions.members?.get(target.id) : null;
    return showHome(message, message, 'reply', message.author, message.member, target, targetMember);
  },
};
