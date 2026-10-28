// Embeds das automações (AGENTS.md §9): título curto com um emoji, blocos separados por \n\n,
// rodapé com setFooter. Alertas da staff vão para o canal de alertas da Segurança (ou DM do dono).
const { EmbedBuilder } = require('discord.js');
const { t, getLanguage } = require('../utils/i18n');
const safety = require('./guildSafety');
const { resolveDestination } = require('./securityAlerts');

const COLORS = { danger: 0xef4444, warn: 0xf59e0b, ok: 0x10b981, info: 0x8b5cf6 };
const NO_PING = { parse: [], users: [], roles: [], repliedUser: false };

function embed(lang, { title, lines, color = 'info' }) {
  return new EmbedBuilder()
    .setColor(COLORS[color] || color)
    .setTitle(title)
    .setDescription(lines.filter(Boolean).join('\n\n').slice(0, 4000))
    .setFooter({ text: t('autos.footer', lang) })
    .setTimestamp();
}

async function staffAlert(guild, { title, lines, color, components = [] }) {
  const dest = await resolveDestination(guild, safety.getConfig(guild.id)).catch(() => null);
  if (!dest) return null;
  const lang = getLanguage(guild.id);
  return dest.target.send({ embeds: [embed(lang, { title, lines, color })], components, allowedMentions: NO_PING }).catch(() => null);
}

module.exports = { embed, staffAlert, COLORS, NO_PING };
