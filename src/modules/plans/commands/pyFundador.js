const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLanguage } = require('../../../utils/i18n');
const founder = require('../../../services/founderProgram');
const plans = require('../../../services/guildPlans');

// Bilíngue no próprio módulo: o resgate é operação de servidor, não texto de jogo.
const TEXT = {
  pt: {
    titleOk: '🎟️  ✦  Chave resgatada!',
    titleFail: '🎟️  ✦  Essa chave não abriu nada',
    alreadyActive: 'Este servidor já tem plano ativo. A chave não foi usada — guarde para outro servidor ou devolva.',
    granted: (plan, until) =>
      `O **${plan}** está liberado por aqui.\n\n### O que muda agora\n- Bônus fixo no \`/py-daily\`\n- Cores e temas do servidor liberados\n\n-# Vai até ${until}. Quando vencer, você decide se continua — eu não cobro nada sozinha.`,
    noCode: 'Faltou a chave. Uso: `/py-fundador chave:FUND-XXXX-XXXX` (ou `py!fundador FUND-XXXX-XXXX`).',
    onlyOwner: 'Só quem manda no servidor pode resgatar isso. Chama o dono — não vou negociar com substituto.',
    invalid: 'Chave inválida. Confere as letras e tenta de novo.',
    used: 'Essa chave já foi usada. Cada vaga é de um servidor só.',
    expiredKey: 'Essa chave venceu (o prazo é de 7 dias). Me chama que eu emito outra — reclamando, mas emito.',
    already: 'Este servidor já é Fundador. Não precisa resgatar de novo.',
    footer: 'Programa Fundador • 20 vagas',
  },
  en: {
    titleOk: '🎟️  ✦  Key redeemed!',
    titleFail: '🎟️  ✦  That key opened nothing',
    alreadyActive: 'This server already has an active plan. The key was not used — save it for another server or hand it back.',
    granted: (plan, until) =>
      `**${plan}** is unlocked here.\n\n### What changes now\n- Fixed bonus on \`/py-daily\`\n- Server colors and themes unlocked\n\n-# Valid until ${until}. When it ends, you decide whether to continue — I do not charge anything on my own.`,
    noCode: 'The key is missing. Use: `/py-founder key:FUND-XXXX-XXXX` (or `py!founder FUND-XXXX-XXXX`).',
    onlyOwner: 'Only the server owner can redeem this. Call the owner — I will not deal with a stand-in.',
    invalid: 'Invalid key. Check the letters and try again.',
    used: 'That key was already used. Each seat belongs to one server only.',
    expiredKey: 'That key expired (7-day limit). Ping me and I will issue another — complaining, but I will.',
    already: 'This server is already a Founder. No need to redeem again.',
    footer: 'Founder Program • 20 seats',
  },
};

const REASONS = { invalid_code: 'invalid', used: 'used', expired_key: 'expiredKey', guild_already_founder: 'already' };

function reply(lang, title, body, color) {
  const text = TEXT[lang] || TEXT.pt;
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(body)
    .setFooter({ text: text.footer })
    .setTimestamp();
}

async function run({ guildId, memberPermissions, authorId, code, lang }) {
  const text = TEXT[lang] || TEXT.pt;

  if (!memberPermissions?.has?.(PermissionFlagsBits.ManageGuild)) {
    return { ok: false, embed: reply(lang, text.titleFail, text.onlyOwner, 0xef4444) };
  }
  const clean = String(code || '').trim().toUpperCase();
  if (!clean) {
    return { ok: false, embed: reply(lang, text.titleFail, text.noCode, 0xf59e0b) };
  }

  // Trava: servidor com plano ativo não consome a chave (evita rebaixar vitalício).
  const current = plans.getPlan(guildId);
  if (current.active) {
    return { ok: false, embed: reply(lang, text.titleFail, text.alreadyActive, 0xf59e0b) };
  }

  const result = founder.redeem(clean, guildId, { by: String(authorId || '') });
  if (!result.ok) {
    const key = REASONS[result.reason] || 'invalid';
    return { ok: false, embed: reply(lang, text.titleFail, TEXT[lang][key] || text.invalid, 0xef4444) };
  }

  const until = new Date(result.paidUntil).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
  return { ok: true, embed: reply(lang, text.titleOk, text.granted('Fundador', until), 0x10b981) };
}

const name = 'py-fundador';
const aliases = ['fundador', 'founder', 'py-founder'];

module.exports = {
  name,
  aliases,
  category: 'social',
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Redeem a Founder Program key for this server.')
    .setDescriptionLocalizations({ 'pt-BR': 'Resgata uma chave do Programa Fundador para este servidor.' })
    .addStringOption((opt) =>
      opt
        .setName('chave')
        .setDescription('Founder key (FUND-XXXX-XXXX)')
        .setDescriptionLocalizations({ 'pt-BR': 'Chave do Fundador (FUND-XXXX-XXXX)' })
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction.guildId);
    const { embed } = await run({
      guildId: interaction.guildId,
      memberPermissions: interaction.memberPermissions,
      authorId: interaction.user.id,
      code: interaction.options.getString('chave'),
      lang,
    });
    await interaction.editReply({ embeds: [embed] });
  },

  async executePrefix({ message, args }) {
    const lang = getLanguage(message.guildId);
    const { embed } = await run({
      guildId: message.guildId,
      memberPermissions: message.memberPermissions,
      authorId: message.author.id,
      code: args[0],
      lang,
    });
    await message.reply({ embeds: [embed], allowedMentions: { parse: [], users: [], roles: [] } });
  },
};
