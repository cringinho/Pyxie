const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const { getEmoji } = require('../../../utils/appEmojis');
const store = require('../bossStore');
const views = require('../bossViews');

const name = 'py-boss';
const aliases = ['boss', 'chefe', 'py-chefe', 'chefao', 'py-chefao', 'raid', 'py-raid'];

function ephemeral(payload) {
  return { ...payload, flags: MessageFlags.Ephemeral, allowedMentions: { parse: [] } };
}

function isBossInteraction(interaction) {
  return interaction.isButton?.() && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

/** Golpe de quem clicou: a mensagem pública atualiza para todo mundo; o resto vai em privado. */
async function handleBossInteraction(interaction) {
  const lang = getLanguage(interaction);
  if (!interaction.guildId) return interaction.reply(ephemeral({ content: t('boss.guildOnly', lang) }));
  const [, action, stance] = interaction.customId.split(':');
  const userId = interaction.user.id;

  if (action === 'view') {
    return interaction.update(views.buildBossView({ guildId: interaction.guildId, userId, source: interaction }));
  }

  const result = store.attack(interaction.guildId, userId, stance);
  if (!result.ok) {
    const key = result.reason === 'no_attacks' ? 'boss.noAttacks' : result.reason === 'defeated' ? 'boss.defeated' : 'common.actionErrorShort';
    return interaction.reply(ephemeral({ content: t(key, lang) }));
  }

  await interaction.update(views.buildBossView({ guildId: interaction.guildId, userId, source: interaction, notice: views.hitNotice(result, userId, stance, lang) }));
  const status = store.getStatus(interaction.guildId, userId);
  const mine = result.rewards?.find((r) => r.userId === userId);
  const coin = getEmoji('COIN') || '🪙';
  const content = mine
    ? t('boss.killer', lang, { coins: mine.coins, coin, echoes: mine.echoes })
    : t('boss.left', lang, { left: status.attacksLeft, total: status.myDamage });
  await interaction.followUp(ephemeral({ content })).catch(() => null);
  return checkAchievements(interaction);
}

async function checkAchievements(interaction) {
  try {
    await require('../../../services/achievements').notifyNewAchievements(interaction);
  } catch (_) {}
}

module.exports = {
  name,
  // Parte do Mundo Pyxie: some no modo clássico do servidor (/py-setup)
  mmo: true,
  aliases,
  category: 'economia',
  isBossInteraction,
  handleBossInteraction,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription("This week's server boss: everyone fights together, with a ranking and rewards.")
    .setDescriptionLocalizations({
      'pt-BR': 'Chefe da semana do servidor: todo mundo luta junto, com ranking e recompensas.',
    }),
  async executeSlash({ interaction }) {
    if (!interaction.guildId) return interaction.editReply({ content: t('boss.guildOnly', interaction) });
    return interaction.editReply(views.buildBossView({ guildId: interaction.guildId, userId: interaction.user.id, source: interaction }));
  },
  async executePrefix({ message }) {
    if (!message.guildId) return message.reply(t('boss.guildOnly', message));
    return message.reply({ ...views.buildBossView({ guildId: message.guildId, userId: message.author.id, source: message }), allowedMentions: { parse: [], repliedUser: false } });
  },
};
