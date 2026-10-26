const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { t, getLanguage } = require('../../../utils/i18n');
const battlePass = require('../../../services/battlePass');
const views = require('../passViews');

const name = 'py-pass';
const aliases = ['pass', 'passe', 'py-passe', 'battlepass', 'battle-pass', 'passe-batalha', 'py-passe-batalha', 'bp'];

function isPassInteraction(interaction) {
  return interaction.isButton?.() && String(interaction.customId || '').startsWith(`${views.PREFIX}:`);
}

async function handlePassInteraction(interaction) {
  const lang = getLanguage(interaction);
  const [, action, viewerId, arg] = interaction.customId.split(':');
  if (interaction.user.id !== viewerId) {
    return interaction.reply({ content: t('pass.notYours', lang), flags: MessageFlags.Ephemeral });
  }
  const base = { viewerId, source: interaction };
  if (action === 'home') return interaction.update(await views.buildPassView(base));
  if (action === 'page') return interaction.update(views.buildLevelsView({ ...base, page: Number(arg) || 0 }));
  if (action === 'claim') {
    const result = battlePass.claimAll(viewerId);
    await interaction.update(await views.buildPassView({ ...base, notice: views.claimNotice(result, lang) }));
    if (result.delivered.length) {
      try {
        await require('../../../services/achievements').notifyNewAchievements(interaction);
      } catch (_) {}
    }
    return null;
  }
  return interaction.reply({ content: t('pass.claimNothing', lang), flags: MessageFlags.Ephemeral });
}

function forSend(payload) {
  const { attachments, ...rest } = payload;
  return rest;
}

module.exports = {
  name,
  aliases,
  category: 'economia',
  // O botão do Premium leva um link assinado da própria pessoa: a tela abre em privado
  ephemeral: true,
  isPassInteraction,
  handlePassInteraction,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Monthly Pyxie Pass: 50 levels, free and Premium rewards.')
    .setDescriptionLocalizations({ 'pt-BR': 'Passe mensal da Pyxie: 50 níveis com recompensas grátis e Premium.' }),
  async executeSlash({ interaction }) {
    return interaction.editReply(await views.buildPassView({ viewerId: interaction.user.id, source: interaction }));
  },
  async executePrefix({ message }) {
    // No chat público o link assinado não aparece: a pessoa recebe o Passe por DM
    const payload = forSend(await views.buildPassView({ viewerId: message.author.id, source: message }));
    try {
      await message.author.send({ ...payload, allowedMentions: { parse: [] } });
      return message.reply({ content: t('pass.sentDm', getLanguage(message)), allowedMentions: { parse: [], repliedUser: false } });
    } catch (_) {
      return message.reply({ content: t('pass.useSlash', getLanguage(message)), allowedMentions: { parse: [], repliedUser: false } });
    }
  },
};
