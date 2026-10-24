const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
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

/**
 * Abre uma thread pública no canal para a descida não poluir o chat. Só funciona em canal de
 * texto de servidor onde a Pyxie pode criar threads; em DM, dentro de outra thread ou sem
 * permissão, a descida continua na própria mensagem.
 */
function canOpenThread(interaction) {
  const channel = interaction.channel;
  if (!interaction.guildId || !channel || channel.isThread?.() || typeof channel.threads?.create !== 'function') return false;
  const me = interaction.guild?.members?.me;
  const perms = me && typeof channel.permissionsFor === 'function' ? channel.permissionsFor(me) : null;
  const needed = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.SendMessagesInThreads];
  return Boolean(perms?.has?.(needed));
}

async function openRunThread(interaction, lang) {
  if (!canOpenThread(interaction)) return null;
  const channel = interaction.channel;
  try {
    const user = interaction.member?.displayName || interaction.user.globalName || interaction.user.username;
    const thread = await channel.threads.create({
      name: t('dungeon.thread.name', lang, { user }).slice(0, 100),
      autoArchiveDuration: 60,
      reason: t('dungeon.thread.reason', lang),
    });
    await thread.members?.add?.(interaction.user.id).catch(() => null);
    return thread;
  } catch (err) {
    console.warn('[dungeon] Não deu para abrir a thread da descida:', err.message);
    return null;
  }
}

/** Mensagem nova da descida dentro da thread (sem os campos que só existem em edições). */
async function sendRunToThread(thread, run, source) {
  return respond(thread, 'send', async () => {
    const { attachments, ...payload } = await views.buildRunView(run, source);
    return payload;
  });
}

/** Thread da descida, se ainda existir e der para escrever nela (reabre se estiver arquivada). */
async function fetchRunThread(interaction, run) {
  if (!run?.threadId || !interaction.client?.channels?.fetch) return null;
  try {
    const thread = await interaction.client.channels.fetch(run.threadId);
    if (!thread?.isThread?.() || thread.locked) return null;
    if (thread.archived) await thread.setArchived(false).catch(() => null);
    return thread;
  } catch (_) {
    return null;
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
  if (what === 'hall') return interaction.reply(ephemeral(views.buildHallView(interaction, { what, ownerId: user.id })));
  // Abas do ranking (de sempre, semana, servidor) trocam a lista na mesma mensagem privada
  if (what === 'halla' || what === 'hallw' || what === 'hallg') return interaction.update(views.buildHallView(interaction, { what, ownerId: user.id }));
  if (what === 'lobby') return respond(interaction, 'update', () => views.buildLobbyView(user, interaction));

  if (what === 'bag') {
    const run = store.getActiveRun(user.id);
    if (!run) return replyError(interaction, 'missing');
    return interaction.reply(ephemeral(views.buildBagView(run, interaction)));
  }

  if (what === 'cont') {
    const run = store.getActiveRun(user.id);
    if (!run) return respond(interaction, 'update', () => views.buildLobbyView(user, interaction, { notice: t('dungeon.errors.missing', lang) }));
    return continueRun(interaction, run);
  }

  if (what === 'start') {
    const result = store.startRun(user.id, { lang, guildId: interaction.guildId });
    if (result.reason === 'active') return continueRun(interaction, result.run);
    if (result.ok && canOpenThread(interaction)) {
      // A cena leva um tempinho para renderizar: confirma o clique antes de abrir a thread
      await interaction.deferUpdate();
      const thread = await openRunThread(interaction, lang);
      if (thread) {
        store.setRunThread(user.id, result.run.id, thread.id);
        try {
          await sendRunToThread(thread, result.run, interaction);
          return interaction.editReply(views.buildThreadNotice(thread, interaction));
        } catch (err) {
          console.warn('[dungeon] Falha ao mandar a descida na thread:', err.message);
          store.setRunThread(user.id, result.run.id, null);
          await thread.delete().catch(() => null);
        }
      }
      return respond(interaction, 'editReply', () => views.buildRunView(result.run, interaction));
    }
    if (result.ok) return respond(interaction, 'update', () => views.buildRunView(result.run, interaction));
    if (result.reason === 'limit') return interaction.reply(ephemeral({ content: views.limitMessage(interaction) }));
    if (result.reason === 'coins') {
      return replyError(interaction, 'coins', { ticket: store.getSettings().ticket, balance: result.balance });
    }
    return replyError(interaction, 'save');
  }
  return replyError(interaction, 'invalid');
}

/** Volta para a descida em andamento: na thread dela, se existir; senão, na própria mensagem. */
async function continueRun(interaction, run) {
  const thread = await fetchRunThread(interaction, run);
  if (thread && interaction.channelId !== thread.id) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await sendRunToThread(thread, run, interaction);
    return interaction.editReply({ content: t('dungeon.thread.here', getLanguage(interaction), { thread: `<#${thread.id}>` }) });
  }
  return respond(interaction, 'update', () => views.buildRunView(run, interaction));
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
  openRunThread,
  canOpenThread,
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
