const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const store = require('../dungeonStore');
const views = require('../dungeonViews');

const name = 'py-dungeon';
const aliases = [
  'dungeon',
  'masmorra',
  'py-masmorra',
  'catacumbas',
  'py-catacumbas',
  'catacombs',
  'py-catacombs',
  'cripta',
  'py-cripta',
  'crypt',
  'py-crypt',
];

function ephemeral(payload) {
  return { ...payload, flags: MessageFlags.Ephemeral };
}

/**
 * Responde com os emojis do bot nos botões. Se o Discord recusar algum emoji (50035, por exemplo
 * um emoji apagado do Developer Portal), refaz a mensagem só com Unicode e tenta de novo.
 */
async function respond(target, method, build) {
  try {
    return await target[method](await build());
  } catch (err) {
    if (err?.code !== 50035 || !/emoji/i.test(String(err?.message || ''))) throw err;
    views.setPlainButtonEmojis(true);
    return target[method](await build());
  }
}

function isDungeonInteraction(interaction) {
  return interaction.isButton() && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

async function replyError(interaction, key, params = {}) {
  return interaction.reply(ephemeral({ content: t(`dungeon.errors.${key}`, getLanguage(interaction), params) }));
}

async function handleLobbyButton(interaction, what) {
  const user = interaction.user;
  const lang = getLanguage(interaction);

  if (what === 'help') return interaction.reply(ephemeral(views.buildHelpView(interaction)));
  if (what === 'tal') return respond(interaction, 'reply', () => ephemeral(views.buildTalentsView(user, interaction)));
  if (what === 'hall') return interaction.reply(ephemeral(views.buildHallView(interaction)));
  if (what === 'lobby') return respond(interaction, 'update', () => views.buildLobbyView(user, interaction));

  if (what === 'bag') {
    const run = store.getActiveRun(user.id);
    if (!run) return replyError(interaction, 'missing');
    return interaction.reply(ephemeral(views.buildBagView(run, interaction)));
  }

  if (what === 'cont') {
    const run = store.getActiveRun(user.id);
    if (!run) return respond(interaction, 'update', () => views.buildLobbyView(user, interaction, { notice: t('dungeon.errors.missing', lang) }));
    return respond(interaction, 'update', () => views.buildRunView(run, interaction));
  }

  if (what === 'start') {
    const result = store.startRun(user.id, { lang });
    if (result.ok || result.reason === 'active') return respond(interaction, 'update', () => views.buildRunView(result.run, interaction));
    if (result.reason === 'limit') return interaction.reply(ephemeral({ content: views.limitMessage(interaction) }));
    if (result.reason === 'coins') {
      return replyError(interaction, 'coins', { ticket: store.getSettings().ticket, balance: result.balance });
    }
    return replyError(interaction, 'save');
  }
  return replyError(interaction, 'invalid');
}

async function handleTalentButton(interaction, talentId) {
  const lang = getLanguage(interaction);
  const result = store.buyTalent(interaction.user.id, talentId);
  let notice;
  if (result.ok) {
    const { TALENTS } = require('../dungeonData');
    const talentName = TALENTS[talentId].name[lang] || TALENTS[talentId].name.pt;
    notice = t('dungeon.talents.bought', lang, { talent: talentName, rank: result.rank, echoes: result.echoes });
  } else if (result.reason === 'echoes') {
    notice = t('dungeon.talents.noEchoes', lang, { cost: result.cost, echoes: result.echoes });
  } else if (result.reason === 'max') {
    notice = t('dungeon.talents.maxReached', lang);
  } else {
    notice = t('dungeon.errors.save', lang);
  }
  return respond(interaction, 'update', () => views.buildTalentsView(interaction.user, interaction, { notice }));
}

async function handleActionButton(interaction, parsed) {
  const user = interaction.user;
  const lang = getLanguage(interaction);
  const active = store.getActiveRun(user.id);
  if (!active) {
    return respond(interaction, 'update', () => views.buildLobbyView(user, interaction, { notice: t('dungeon.errors.missing', lang) }));
  }
  // Botão de um run anterior ou de um passo antigo: atualiza a tela para o estado real
  if (views.runTag(active) !== parsed.tag) {
    return respond(interaction, 'update', () => views.buildRunView(active, interaction, { notice: t('dungeon.errors.stale', lang) }));
  }

  const result = store.performAction(user.id, active.id, parsed.step, parsed.action, parsed.arg);
  if (result.ok) {
    const settlement = result.settlement ? { ...result.settlement, balance: result.balance } : null;
    return respond(interaction, 'update', () => views.buildRunView(result.run, interaction, { settlement }));
  }
  if (result.reason === 'stale') {
    return respond(interaction, 'update', () => views.buildRunView(result.run, interaction, { notice: t('dungeon.errors.stale', lang) }));
  }
  if (result.reason === 'missing') {
    return respond(interaction, 'update', () => views.buildLobbyView(user, interaction, { notice: t('dungeon.errors.missing', lang) }));
  }
  if (result.reason === 'save') return replyError(interaction, 'save');
  return replyError(interaction, result.reason === 'disabled' ? 'disabled' : 'invalid');
}

async function handleDungeonInteraction(interaction) {
  const parsed = views.parseCustomId(interaction.customId);
  if (!parsed) return;
  if (parsed.ownerId !== interaction.user.id) return replyError(interaction, 'notYours');
  if (parsed.kind === 'l') return handleLobbyButton(interaction, parsed.what);
  if (parsed.kind === 't') return handleTalentButton(interaction, parsed.talentId);
  if (parsed.kind === 'a') return handleActionButton(interaction, parsed);
}

module.exports = {
  name,
  // Parte do Mundo Pyxie: some no modo clássico do servidor (/py-setup)
  mmo: true,
  aliases,
  category: 'economia',
  description: 'Velvet Catacombs: a long, hard roguelike dungeon. Pay 50 coins, dive deep and escape rich.',
  descriptionLocalizations: {
    'pt-BR': 'Catacumbas de Veludo: masmorra roguelike longa e difícil. Pague 50 moedas e fuja com o tesouro.',
  },
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Velvet Catacombs: a long, hard roguelike dungeon. Pay 50 coins, dive deep and escape rich.')
    .setDescriptionLocalizations({
      'pt-BR': 'Catacumbas de Veludo: masmorra roguelike longa e difícil. Pague 50 moedas e fuja com o tesouro.',
    }),
  isDungeonInteraction,
  handleDungeonInteraction,
  respond,
  async executeSlash({ interaction }) {
    await respond(interaction, 'editReply', () => views.buildLobbyView(interaction.user, interaction));
  },
  async execute(interaction) {
    return this.executeSlash({ interaction });
  },
  async executePrefix({ message }) {
    await respond(message, 'reply', () => ({
      ...views.buildLobbyView(message.author, message),
      allowedMentions: { parse: [], repliedUser: false },
    }));
  },
};
