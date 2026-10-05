const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { ADMIN } = require('./commandNames');
const { OWNER_SNOWFLAKE, createOwnerMagicToken } = require('../services/adminAuth');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');
const { applyPyxieEmotion } = require('../utils/pyxieEmotions');

function buildDenialView(guildOrSource = null) {
  const isEn = getLanguage(guildOrSource) === 'en';
  const text = t('admin.onlyOwner', guildOrSource, { owner: `<@${OWNER_SNOWFLAKE}>` });
  const denyEmbed = new EmbedBuilder()
    .setColor('#ef4444')
    .setTitle(isEn ? '⛔ ✦ Restricted Access!' : '⛔ ✦ Acesso Restrito!')
    .setDescription(text)
    .setFooter({ text: pyxieFooter(isEn ? 'Nice try, mortal...' : 'A Pyxie está de olho... Boa tentativa!', guildOrSource) })
    .setTimestamp();

  const { attachment } = applyPyxieEmotion(denyEmbed, 'PROHIBITED');
  return {
    content: text,
    embeds: [denyEmbed],
    files: attachment ? [attachment] : [],
    ephemeral: true,
  };
}

function buildAdminView(userId, guildOrSource = null) {
  if (userId !== OWNER_SNOWFLAKE) {
    return buildDenialView(guildOrSource);
  }

  const tokenResult = createOwnerMagicToken(userId);
  if (!tokenResult.success) {
    return {
      content: `❌ ${tokenResult.error}`,
      ephemeral: true,
    };
  }

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.crimson || '#ef4444')
    .setTitle(t('admin.title', guildOrSource))
    .setDescription(`${t('admin.desc', guildOrSource)}\n\n🔗 **Link de Acesso Direto:**\n[Abrir Painel Administrativo](${tokenResult.url})\n*(Válido por 15 minutos • Sessão de 12h)*`)
    .setFooter({ text: pyxieFooter(t('admin.footer', guildOrSource)) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('admin.btnOpen', guildOrSource))
      .setEmoji('🛡️')
      .setStyle(ButtonStyle.Link)
      .setURL(tokenResult.url),
    new ButtonBuilder()
      .setCustomId(`admin_modules_view:${userId}`)
      .setLabel(t('admin.btnModules', guildOrSource))
      .setEmoji('🧩')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row], ephemeral: true };
}

function buildModulesView(userId, guildOrSource = null) {
  if (userId !== OWNER_SNOWFLAKE) {
    return buildDenialView(guildOrSource);
  }

  const moduleManager = require('../services/moduleManager');
  const modules = moduleManager.getAllModules();
  const isEn = getLanguage(guildOrSource) === 'en';

  const lines = modules.map((m) => {
    const statusText = m.enabled
      ? `🟢 **${t('admin.moduleActive', guildOrSource)}**`
      : `⚪ **${t('admin.moduleInactive', guildOrSource)}**`;
    const name = isEn ? (m.nameLocalized?.en || m.name) : (m.nameLocalized?.['pt-BR'] || m.name);
    const desc = isEn ? (m.descriptionLocalized?.en || m.description) : (m.descriptionLocalized?.['pt-BR'] || m.description);
    const cmdList = m.commands.map((c) => `\`${c.name}\``).join(', ') || 'Nenhum';
    return `${m.icon} **${name}** (v${m.version}) — ${statusText}\n> *${desc}*\n> 🏷️ **Categoria:** \`${m.category}\` • ⌨️ **${t('admin.moduleCommands', guildOrSource)}** ${cmdList}`;
  });

  const embed = new EmbedBuilder()
    .setColor('#8b5cf6')
    .setTitle(t('admin.modulesTitle', guildOrSource))
    .setDescription(
      t('admin.modulesDesc', guildOrSource, {
        list: lines.length > 0 ? lines.join('\n\n') : '*Nenhum módulo encontrado em src/modules/.*',
      })
    )
    .setFooter({ text: pyxieFooter('Pyxie Modular Cog Engine') })
    .setTimestamp();

  const buttonRows = [];
  if (modules.length > 0) {
    const row = new ActionRowBuilder();
    for (const m of modules.slice(0, 5)) {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`admin_mod_toggle:${m.id}:${userId}`)
          .setLabel(`${m.enabled ? 'Desativar' : 'Ativar'} ${m.name}`)
          .setEmoji(m.icon || '🧩')
          .setStyle(m.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
      );
    }
    buttonRows.push(row);
  }

  return { embeds: [embed], components: buttonRows, ephemeral: true };
}

module.exports = {
  name: ADMIN,
  ephemeral: true,
  aliases: ['admin', 'painel', 'py-admin', 'dashboard', 'paineldono', 'owner'],
  buildAdminView,
  buildModulesView,
  data: new SlashCommandBuilder()
    .setName(ADMIN)
    .setDescription('Access Pyxie\'s secure owner administration dashboard.')
    .setDescriptionLocalizations({
      'pt-BR': 'Acesse o painel seguro de administração exclusivo do criador da Pyxie.',
    }),
  async executePrefix({ message, args }) {
    if (args && (args[0] === 'modulos' || args[0] === 'modules')) {
      const view = buildModulesView(message.author.id, message);
      await message.reply(view);
      return;
    }
    const view = buildAdminView(message.author.id, message);
    await message.reply(view);
  },
  async executeSlash({ interaction }) {
    const view = buildAdminView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
};

