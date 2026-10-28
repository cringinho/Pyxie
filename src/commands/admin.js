const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { ADMIN } = require('./commandNames');
const { OWNER_SNOWFLAKE } = require('../services/adminAuth');
const { getPublicUrl } = require('../services/discordOAuth');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

function buildAdminView(userId, guildOrSource = null) {
  if (userId !== OWNER_SNOWFLAKE) {
    return {
      content: t('admin.onlyOwner', guildOrSource, { owner: `<@${OWNER_SNOWFLAKE}>` }),
      ephemeral: true,
    };
  }

  // O painel do dono agora é o /dashboard (login com Discord), sem link mágico.
  const panel = { url: `${getPublicUrl()}/dashboard#/global/health` };

  const embed = new EmbedBuilder()
    .setColor(PYXIE_COLORS.crimson || '#ef4444')
    .setTitle(t('admin.title', guildOrSource))
    .setDescription(`${t('admin.desc', guildOrSource)}\n\n🔗 [${t('admin.btnOpen', guildOrSource)}](${panel.url})`)
    .setFooter({ text: pyxieFooter(t('admin.footer', guildOrSource)) })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel(t('admin.btnOpen', guildOrSource))
      .setEmoji('🛡️')
      .setStyle(ButtonStyle.Link)
      .setURL(panel.url),
    new ButtonBuilder()
      .setCustomId(`admin_modules_view:${userId}`)
      .setLabel(t('admin.btnModules', guildOrSource))
      .setEmoji('🧩')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`admin_seasonal_view:${userId}`)
      .setLabel(getLanguage(guildOrSource) === 'en' ? 'Seasonal' : 'Sazonal')
      .setEmoji('🎃')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row], ephemeral: true };
}

function buildModulesView(userId, guildOrSource = null) {
  if (userId !== OWNER_SNOWFLAKE) {
    return {
      content: t('admin.onlyOwner', guildOrSource, { owner: `<@${OWNER_SNOWFLAKE}>` }),
      ephemeral: true,
    };
  }

  const moduleManager = require('../services/moduleManager');
  const modules = moduleManager.getAllModules();
  const isEn = getLanguage(guildOrSource) === 'en';

  const lines = modules.map((m) => {
    const statusText = m.enabled
      ? `🟢 **${t('admin.moduleActive', guildOrSource)}**`
      : `⚪ **${t('admin.moduleInactive', guildOrSource)}**`;
    const name = isEn ? (m.nameLocalized?.en || m.name) : (m.nameLocalized?.['pt-BR'] || m.name);
    const cmdList = m.commands.map((c) => `\`${c.name}\``).join(', ') || '—';
    // Compacto: com 20+ módulos a descrição completa passa do limite de 4.096 do embed (ela está no /dashboard).
    return `${m.icon} **${name}** — ${statusText}\n-# ⌨️ ${t('admin.moduleCommands', guildOrSource)} ${cmdList}`;
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

function extractSnowflake(arg) {
  if (!arg) return null;
  const match = String(arg).match(/\d{17,20}/);
  return match ? match[0] : null;
}

function buildSeasonalRestrictionsView(userId, guildOrSource = null, args = []) {
  if (userId !== OWNER_SNOWFLAKE) {
    return {
      content: t('admin.onlyOwner', guildOrSource, { owner: `<@${OWNER_SNOWFLAKE}>` }),
      ephemeral: true,
    };
  }

  const seasonalManager = require('../modules/seasonal/seasonalManager');
  const sub = (args[0] || '').toLowerCase();
  const targetId = extractSnowflake(args[1]);

  let feedback = '';

  if (sub === 'excluir-user' || sub === 'exclude-user') {
    if (!targetId) {
      feedback = `> ${t('admin.seasonalMissingTarget', guildOrSource)}\n\n`;
    } else {
      seasonalManager.excludeUser(targetId);
      feedback = `> ${t('admin.seasonalUserExcluded', guildOrSource, { user: `<@${targetId}> (\`${targetId}\`)` })}\n\n`;
    }
  } else if (sub === 'incluir-user' || sub === 'unexclude-user') {
    if (!targetId) {
      feedback = `> ${t('admin.seasonalMissingTarget', guildOrSource)}\n\n`;
    } else {
      seasonalManager.unexcludeUser(targetId);
      feedback = `> ${t('admin.seasonalUserUnexcluded', guildOrSource, { user: `<@${targetId}> (\`${targetId}\`)` })}\n\n`;
    }
  } else if (sub === 'excluir-cargo' || sub === 'exclude-role') {
    if (!targetId) {
      feedback = `> ${t('admin.seasonalMissingTarget', guildOrSource)}\n\n`;
    } else {
      seasonalManager.excludeRole(targetId);
      feedback = `> ${t('admin.seasonalRoleExcluded', guildOrSource, { role: `<@&${targetId}> (\`${targetId}\`)` })}\n\n`;
    }
  } else if (sub === 'incluir-cargo' || sub === 'unexclude-role') {
    if (!targetId) {
      feedback = `> ${t('admin.seasonalMissingTarget', guildOrSource)}\n\n`;
    } else {
      seasonalManager.unexcludeRole(targetId);
      feedback = `> ${t('admin.seasonalRoleUnexcluded', guildOrSource, { role: `<@&${targetId}> (\`${targetId}\`)` })}\n\n`;
    }
  } else if (sub === 'zerar' || sub === 'reset') {
    if (!targetId) {
      feedback = `> ${t('admin.seasonalMissingTarget', guildOrSource)}\n\n`;
    } else {
      seasonalManager.resetUserSeasonalBalance(targetId);
      feedback = `> ${t('admin.seasonalUserReset', guildOrSource, { user: `<@${targetId}> (\`${targetId}\`)` })}\n\n`;
    }
  }

  const { excludedUserIds, excludedRoleIds } = seasonalManager.getRestrictions();
  const cfg = seasonalManager.loadConfig();

  const userListText = excludedUserIds.length > 0
    ? excludedUserIds.map((id) => `• <@${id}> (\`${id}\`)`).join('\n')
    : t('admin.seasonalNoUsers', guildOrSource);

  const roleListText = excludedRoleIds.length > 0
    ? excludedRoleIds.map((id) => `• <@&${id}> (\`${id}\`)`).join('\n')
    : t('admin.seasonalNoRoles', guildOrSource);

  const isEn = getLanguage(guildOrSource) === 'en';
  const embed = new EmbedBuilder()
    .setColor('#f59e0b')
    .setTitle(t('admin.seasonalRestrictionsTitle', guildOrSource))
    .setDescription(
      t('admin.seasonalRestrictionsDesc', guildOrSource, {
        feedback,
        eventName: cfg.eventName || 'Sazonal',
        status: cfg.active ? (isEn ? '🟢 Active' : '🟢 Ativo') : (isEn ? '⚪ Inactive' : '⚪ Inativo'),
        users: userListText,
        roles: roleListText,
      })
    )
    .setFooter({ text: pyxieFooter(t('admin.seasonalFooter', guildOrSource)) })
    .setTimestamp();

  return { embeds: [embed], ephemeral: true };
}

module.exports = {
  name: ADMIN,
  ephemeral: true,
  aliases: ['admin', 'py-admin', 'dashboard', 'paineldono', 'owner'],
  buildAdminView,
  buildModulesView,
  buildSeasonalRestrictionsView,
  // Desde a central única, o /py-admin não é mais slash: py!admin abre a Área do dono no /py-setup.
  data: undefined,
  async executePrefix({ message, args }) {
    if (args && (args[0] === 'modulos' || args[0] === 'modules')) {
      const view = buildModulesView(message.author.id, message);
      await message.reply(view);
      return;
    }
    if (args && (args[0] === 'sazonal' || args[0] === 'seasonal')) {
      const view = buildSeasonalRestrictionsView(message.author.id, message, args.slice(1));
      await message.reply(view);
      return;
    }
    const { buildOwnerSection } = require('./setup');
    await message.reply(buildOwnerSection(message.author.id, message, getLanguage(message)));
  },
  async executeSlash({ interaction }) {
    const menu = interaction.options?.getString ? interaction.options.getString('menu') : null;
    if (menu === 'modules') {
      const view = buildModulesView(interaction.user.id, interaction);
      await interaction.editReply(view);
      return;
    }
    if (menu === 'seasonal') {
      const view = buildSeasonalRestrictionsView(interaction.user.id, interaction);
      await interaction.editReply(view);
      return;
    }
    const view = buildAdminView(interaction.user.id, interaction);
    await interaction.editReply(view);
  },
};

