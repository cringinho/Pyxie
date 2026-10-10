const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
  getMarriage,
  sendChildToWork,
  claimChildReward,
} = require('../marriageManager');
const { formatCoins, t } = require('../../../utils/i18n');

function buildChildrenListEmbed(marriage, source) {
  const children = marriage.children || [];
  const embed = new EmbedBuilder()
    .setColor('#e60067')
    .setTitle(t('marriage.childrenListTitle', source))
    .setTimestamp()
    .setFooter({ text: 'Pyxie • Marriage & Family Core' });

  if (children.length === 0) {
    embed.setDescription(t('marriage.noChildrenYet', source));
    return embed;
  }

  const lines = children.map((c, index) => {
    const genderIcon = c.gender === 'male' ? '👦' : '👧';
    const ageDays = Math.max(0, Math.floor((Date.now() - (c.bornAt || Date.now())) / 86400000));
    const ageText = t('marriage.childAgeDays', source, { days: ageDays });
    
    let statusText = '';
    if (c.status === 'working') {
      const now = Date.now();
      if (now < c.busyUntil) {
        const timeTag = `<t:${Math.floor(c.busyUntil / 1000)}:R>`;
        statusText = t('marriage.childStatusWorking', source, { time: timeTag });
      } else {
        statusText = t('marriage.childStatusReady', source, { reward: formatCoins(c.pendingReward || 50, source) });
      }
    } else {
      statusText = t('marriage.childStatusIdle', source);
    }

    return `**${index + 1}. ${genderIcon} ${c.name}** (\`${c.id}\`)\n• ${ageText}\n• ${statusText}`;
  });

  embed.setDescription(lines.join('\n\n'));
  return embed;
}

async function handleList(source, reply) {
  const user = source.user || source.author;
  const marriage = getMarriage(user.id);
  if (!marriage) {
    return reply(t('marriage.notMarried', source));
  }
  return reply({ embeds: [buildChildrenListEmbed(marriage, source)] });
}

async function handleWork(source, identifier, reply) {
  const user = source.user || source.author;
  if (!identifier) {
    return reply(t('marriage.childSpecifyName', source));
  }

  const result = sendChildToWork(user.id, identifier);
  if (!result.success) {
    if (result.reason === 'not_married') {
      return reply(t('marriage.notMarried', source));
    }
    if (result.reason === 'child_not_found') {
      return reply(t('marriage.childNotFound', source));
    }
    if (result.reason === 'job_locked') {
      const timeTag = `<t:${Math.floor(result.busyUntil / 1000)}:R>`;
      return reply(t('marriage.childJobLocked', source, { name: result.child.name, time: timeTag }));
    }
    if (result.reason === 'ready_to_claim') {
      return reply(t('marriage.childReadyToClaim', source, { name: result.child.name }));
    }
    return reply(t('marriage.genericError', source));
  }

  const timeTag = `<t:${Math.floor(result.busyUntil / 1000)}:R>`;
  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle(t('marriage.childInternshipStartedTitle', source))
    .setDescription(
      t('marriage.childInternshipStartedDesc', source, {
        name: result.child.name,
        reward: formatCoins(result.reward, source),
        time: timeTag,
      })
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  return reply({ embeds: [embed] });
}

async function handleClaim(source, identifier, reply) {
  const user = source.user || source.author;
  if (!identifier) {
    return reply(t('marriage.childSpecifyName', source));
  }

  const result = claimChildReward(user.id, identifier);
  if (!result.success) {
    if (result.reason === 'not_married') {
      return reply(t('marriage.notMarried', source));
    }
    if (result.reason === 'child_not_found') {
      return reply(t('marriage.childNotFound', source));
    }
    if (result.reason === 'not_working') {
      return reply(t('marriage.childNotWorking', source, { name: result.child.name }));
    }
    if (result.reason === 'job_locked') {
      const timeTag = `<t:${Math.floor(result.busyUntil / 1000)}:R>`;
      return reply(t('marriage.childJobLocked', source, { name: result.child.name, time: timeTag }));
    }
    return reply(t('marriage.genericError', source));
  }

  const embed = new EmbedBuilder()
    .setColor('#00E676')
    .setTitle(t('marriage.childClaimTitle', source))
    .setDescription(
      t('marriage.childClaimDesc', source, {
        name: result.child.name,
        reward: formatCoins(result.reward, source),
      })
    )
    .setFooter({ text: 'Pyxie • Marriage & Family Core' })
    .setTimestamp();

  return reply({ embeds: [embed] });
}

module.exports = {
  name: 'py-child',
  aliases: ['child', 'filho', 'py-filho', 'children', 'filhos', 'py-children', 'py-filhos'],
  data: new SlashCommandBuilder()
    .setName('py-child')
    .setDescription('Manage your marriage children, internships and rewards.')
    .setDescriptionLocalizations({
      'pt-BR': 'Gerencie os filhos do casal, estágios de 24h e recompensas.',
    })
    .addSubcommand((sub) =>
      sub
        .setName('listar')
        .setNameLocalizations({
          'en-US': 'list',
          'en-GB': 'list',
          'pt-BR': 'listar',
        })
        .setDescription('List all children of your marriage')
        .setDescriptionLocalizations({
          'pt-BR': 'Lista todos os filhos do seu casamento',
        })
    )
    .addSubcommand((sub) =>
      sub
        .setName('estagiar')
        .setNameLocalizations({
          'en-US': 'work',
          'en-GB': 'work',
          'pt-BR': 'estagiar',
        })
        .setDescription('Send a child to a 24-hour internship for coins')
        .setDescriptionLocalizations({
          'pt-BR': 'Envia um filho para um estágio de 24 horas por moedas',
        })
        .addStringOption((opt) =>
          opt
            .setName('filho')
            .setNameLocalizations({
              'en-US': 'child',
              'en-GB': 'child',
              'pt-BR': 'filho',
            })
            .setDescription('Name or ID of the child')
            .setDescriptionLocalizations({
              'pt-BR': 'Nome ou ID do filho',
            })
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('resgatar')
        .setNameLocalizations({
          'en-US': 'claim',
          'en-GB': 'claim',
          'pt-BR': 'resgatar',
        })
        .setDescription('Claim coins from a completed internship')
        .setDescriptionLocalizations({
          'pt-BR': 'Resgata as moedas de um estágio concluído',
        })
        .addStringOption((opt) =>
          opt
            .setName('filho')
            .setNameLocalizations({
              'en-US': 'child',
              'en-GB': 'child',
              'pt-BR': 'filho',
            })
            .setDescription('Name or ID of the child')
            .setDescriptionLocalizations({
              'pt-BR': 'Nome ou ID do filho',
            })
            .setRequired(true)
        )
    ),

  async executePrefix({ message, args = [] }) {
    const sub = (args[0] || '').toLowerCase();
    const target = args.slice(1).join(' ').trim();

    if (sub === 'estagiar' || sub === 'work') {
      return handleWork(message, target, (content) => message.reply(content));
    }
    if (sub === 'resgatar' || sub === 'claim') {
      return handleClaim(message, target, (content) => message.reply(content));
    }
    return handleList(message, (content) => message.reply(content));
  },

  async executeSlash({ interaction }) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getString('filho') || interaction.options.getString('child');

    if (sub === 'estagiar' || sub === 'work') {
      return handleWork(interaction, target, (content) => interaction.editReply(content));
    }
    if (sub === 'resgatar' || sub === 'claim') {
      return handleClaim(interaction, target, (content) => interaction.editReply(content));
    }
    return handleList(interaction, (content) => interaction.editReply(content));
  },
};
