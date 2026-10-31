// Oráculo com IA — recurso do plano Premium do servidor.
// Cota diária por servidor (aiQuota), cooldown por pessoa e fallback para as falas do i18n.
// Em crise não há IA: a resposta é o acolhimento com CVV 188 (AGENTS §12).
const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { ORACLE } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const perks = require('../services/guildPerks');
const quota = require('../services/aiQuota');
const oracle = require('../services/oracle');
const { publicUrl } = require('../services/planPayments');

const EPHEMERAL = MessageFlags.Ephemeral;
const color = { answer: 0x8b5cf6, crisis: 0x10b981, warn: 0xf59e0b };

function canUse(guildId, now = Date.now()) {
  const perk = perks.forGuild(guildId, now);
  return { ...perk, allowed: Boolean(perk.active && perk.plan === 'premium') };
}

function card(lang, { title, description, tone, server }) {
  return new EmbedBuilder()
    .setColor(color[tone] || color.answer)
    .setTitle(title)
    .setDescription(String(description).slice(0, 4000))
    .setFooter({ text: t('oracle.footer', lang, { server }) })
    .setTimestamp();
}

/**
 * Núcleo testável: decide plano, cota e pergunta. `chat` injetável para os testes.
 * @returns {Promise<{ok:boolean, reason?:string, answer?:string, crisis?:boolean, remaining?:number, retryMs?:number, line?:string}>}
 */
async function run({ guild, userId, question, source = null, chat = null, now = Date.now() } = {}) {
  if (!guild?.id) return { ok: false, reason: 'guild_only' };
  const access = canUse(guild.id, now);
  if (!access.allowed) return { ok: false, reason: 'premium', plan: access.plan };
  const spot = quota.check(guild.id, userId, { now });
  if (!spot.allowed) return { ok: false, reason: spot.reason, retryMs: spot.retryMs, remaining: spot.remaining };

  const result = await oracle.ask({ question, lang: getLanguage(source), guildName: guild.name, chat, now });
  if (result.crisis) return { ok: true, crisis: true };
  if (!result.ok) return { ok: false, reason: 'provider', line: result.line };
  const used = quota.consume(guild.id, userId, { now });
  return { ok: true, answer: result.answer, remaining: used.remaining };
}

function errorText(result, lang) {
  const messages = {
    premium: t('oracle.premiumOnly', lang, { link: `${publicUrl()}/planos` }),
    cooldown: t('oracle.cooldown', lang, { time: `\`${Math.ceil((result.retryMs || 0) / 60000)}\`` }),
    guild_cap: t('oracle.guildCap', lang),
    user_cap: t('oracle.userCap', lang),
    guild_only: t('oracle.guildOnly', lang),
    provider: t('oracle.provider', lang, { line: result.line || '' }),
  };
  return messages[result.reason] || t('oracle.provider', lang, { line: '' });
}

function buildPayload(result, lang, server) {
  if (result.ok && result.crisis) {
    return {
      embeds: [card(lang, {
        title: t('oracle.crisis.title', lang),
        description: [t('oracle.crisis.body', lang), `> ${t('oracle.crisis.hotline', lang)}`].join('\n\n'),
        tone: 'crisis',
        server,
      })],
    };
  }
  if (result.ok) {
    return {
      embeds: [card(lang, {
        title: t('oracle.title', lang),
        description: [result.answer, `-# ${t('oracle.remaining', lang, { n: result.remaining })}`].join('\n\n'),
        tone: 'answer',
        server,
      })],
    };
  }
  return { content: errorText(result, lang) };
}

async function answer(interaction, result) {
  const lang = getLanguage(interaction);
  const payload = buildPayload(result, lang, interaction.guild?.name || 'Pyxie');
  return interaction.editReply(result.ok ? payload : { ...payload, flags: EPHEMERAL });
}

module.exports = {
  name: ORACLE,
  aliases: ['oracle', 'py-oracle', 'oraculo', 'py-oraculo', 'oráculo'],
  canUse,
  run,
  buildPayload,
  data: new SlashCommandBuilder()
    .setName(ORACLE)
    .setDescription('Ask Pyxie Oracle a free question (Premium server plan).')
    .setDescriptionLocalizations({ 'pt-BR': 'Faça uma pergunta livre ao Oráculo da Pyxie (plano Premium do servidor).' })
    .addStringOption((option) =>
      option
        .setName('question')
        .setNameLocalizations({ 'en-US': 'question', 'en-GB': 'question', 'pt-BR': 'pergunta' })
        .setDescription('What do you want to ask?')
        .setDescriptionLocalizations({ 'pt-BR': 'O que você quer perguntar?' })
        .setRequired(true)
        .setMaxLength(500),
    ),
  async executeSlash({ interaction }) {
    const question = interaction.options.getString('question') || interaction.options.getString('pergunta') || '';
    const result = await run({ guild: interaction.guild, userId: interaction.user.id, question, source: interaction });
    return answer(interaction, result);
  },
  async executePrefix({ message, args }) {
    const question = (args || []).join(' ').trim().slice(0, 500);
    const lang = getLanguage(message);
    const result = await run({ guild: message.guild, userId: message.author.id, question, source: message });
    return message.reply(buildPayload(result, lang, message.guild?.name || 'Pyxie'));
  },
};
