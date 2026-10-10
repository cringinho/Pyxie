const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../../utils/i18n');
const partnershipManager = require('../partnershipManager');

const name = 'py-partner';
const aliases = ['parceria', 'py-parceria', 'partner', 'partnership', 'py-partnership'];
const PANEL_WORDS = new Set(['panel', 'painel']);

async function run(source, wantsPanel, reply) {
  partnershipManager.refresh();

  if (!source.guild) return reply({ content: t('partnerships.guild_only', source) });
  if (!partnershipManager.isConfigured()) return reply({ content: t('partnerships.not_configured', source) });

  if (wantsPanel) {
    if (!source.member?.permissions?.has('ManageGuild')) return reply({ content: t('partnerships.panel_no_perm', source) });
    const res = await partnershipManager.postPanel(source);
    if (!res.ok) return reply({ content: t(res.key, source) });
    return reply({ content: t('partnerships.panel_posted', source, { channel: `<#${res.channelId}>` }) });
  }

  return reply({
    ...partnershipManager.buildIntroView(source),
    content: t('partnerships.footer_hint', source),
  });
}

module.exports = {
  name,
  aliases,
  category: 'social',
  ephemeral: true,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Apply for a partnership or promotion with the community.')
    .setDescriptionLocalizations({
      'pt-BR': 'Solicite uma parceria ou divulgação com a comunidade.',
    })
    .addStringOption((option) =>
      option
        .setName('action')
        .setNameLocalizations({
          'pt-BR': 'acao',
        })
        .setDescription('Staff only: publish the request panel in the request channel')
        .setDescriptionLocalizations({
          'pt-BR': 'Somente staff: publica o painel de solicitações no canal de solicitações',
        })
        .addChoices({ name: 'panel', name_localizations: { 'pt-BR': 'painel' }, value: 'panel' })
        .setRequired(false)
    ),
  async executeSlash({ interaction }) {
    const wantsPanel = (interaction.options.getString('action') || interaction.options.getString('acao')) === 'panel';
    await run(interaction, wantsPanel, (payload) => interaction.editReply(payload));
  },
  async executePrefix({ message, args }) {
    const wantsPanel = PANEL_WORDS.has(String(args?.[0] || '').toLowerCase());
    await run(message, wantsPanel, (payload) => message.reply(payload));
  },
};

