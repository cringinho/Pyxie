const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { LIKELY } = require('./commandNames');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

const SCENARIOS = [
  'esquecer onde guardou o celular enquanto conversa nele',
  'dormir no meio de uma call importante e roncar no microfone',
  'gastar todo o salário no primeiro dia do mês em comida',
  'se perder em um shopping reto de linha reta',
  'mandar mensagem no grupo da família achando que era no privado',
  'rir em um momento totalmente sério ou inapropriado',
  'tropeçar no próprio pé enquanto anda na rua e fingir que estava correndo',
  'ficar 3 horas escolhendo um filme e dormir nos primeiros 10 minutos',
  'adotar 5 gatos de rua em uma única semana',
  'esquecer o aniversário do melhor amigo mesmo com lembrete no celular',
  'responder "você também" quando o garçom diz "bom apetite"',
  'acidentalmente curtir uma foto de 5 anos atrás do perfil de alguém',
  'criar uma teoria da conspiração mirabolante sobre coisas bobas',
  'entrar no carro de um estranho achando que é o carro do aplicativo',
  'passar a madrugada inteira pesquisando curiosidades aleatórias na internet',
  'colocar o cereal antes do leite e achar que está certo',
  'comprar algo totalmente inútil na internet só porque estava na promoção',
  'falar com animais de estimação como se fossem pessoas que entendem tudo',
  'sobreviver a um apocalipse zumbi usando apenas a força do sarcasmo',
  'virar meme nacional sem nem saber o motivo',
  'tentar consertar algo e quebrar mais três coisas no processo',
  'esquecer o que ia dizer no meio da frase',
  'fingir que entendeu uma conversa só para não pedir para repetir pela terceira vez',
  'chorar assistindo um comercial emocionante de margarina ou refrigerante',
  'ter mais de 50 abas abertas no navegador e jurar que vai usar todas',
  'gastar moedas do bot Pyxie até a última gota tentando chocar um shiny',
  'ficar preso(a) no lado de fora de casa por esquecer a chave na maçaneta',
  'cantar alto com fone de ouvido achando que ninguém está escutando',
  'passar o dia inteiro de pijama fingindo que está super produtivo(a)',
  'confundir açúcar com sal na hora de cozinhar um prato especial'
];

const activePolls = new Map();

function buildPollComponents(pollId, candidateA, candidateB, disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`prv:vote:${pollId}:0`)
        .setLabel(candidateA.displayName.slice(0, 40))
        .setEmoji('👈')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`prv:vote:${pollId}:1`)
        .setLabel(candidateB.displayName.slice(0, 40))
        .setEmoji('👉')
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled)
    ),
  ];
}

function buildPollEmbed(poll) {
  const countA = [...poll.votes.values()].filter((v) => v === 0).length;
  const countB = [...poll.votes.values()].filter((v) => v === 1).length;
  const total = countA + countB;

  const percentA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((countB / total) * 100) : 0;

  const bar = (pct) => {
    const filled = Math.round(pct / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle('🎯 ✦ Quem é mais provável de...')
    .setDescription(`### > *"...${poll.scenario}?"*\n\nVotem nos botões abaixo! O resultado encerra em 60 segundos.`)
    .addFields(
      {
        name: `👈 ${poll.candidateA.displayName}`,
        value: `\`${bar(percentA)}\` **${percentA}%** (${countA} votos)`,
        inline: true,
      },
      {
        name: `👉 ${poll.candidateB.displayName}`,
        value: `\`${bar(percentB)}\` **${percentB}%** (${countB} votos)`,
        inline: true,
      }
    )
    .setFooter(pyxieFooter(`Total de votos registrados: ${total} • Votação aberta`))
    .setTimestamp();
}

function pickTwoMembers(guild, customA = null, customB = null) {
  if (customA && customB && customA.id !== customB.id) {
    return [customA, customB];
  }

  const humans = guild.members.cache.filter((m) => !m.user.bot && (!customA || m.id !== customA.id));
  if (humans.size < 2) {
    return null;
  }

  const list = [...humans.values()];
  const memberA = customA || list[Math.floor(Math.random() * list.length)];
  let memberB = customB;

  while (!memberB || memberB.id === memberA.id) {
    memberB = list[Math.floor(Math.random() * list.length)];
  }

  return [memberA, memberB];
}

function startLikelyPoll({ guild, candidateA, candidateB, scenario, channel, messageReplyTarget }) {
  const pollId = `prv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const chosenScenario = scenario || SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  const poll = {
    id: pollId,
    scenario: chosenScenario,
    candidateA,
    candidateB,
    votes: new Map(), // userId => 0 | 1
    expiresAt: Date.now() + 60000,
  };

  activePolls.set(pollId, poll);

  // Encerramento em 60 segundos
  setTimeout(async () => {
    const finishedPoll = activePolls.get(pollId);
    if (!finishedPoll) return;
    activePolls.delete(pollId);

    const countA = [...finishedPoll.votes.values()].filter((v) => v === 0).length;
    const countB = [...finishedPoll.votes.values()].filter((v) => v === 1).length;
    const total = countA + countB;

    let winnerText = 'Houve um empate cósmico de votos!';
    let winner = null;

    if (countA > countB) {
      winner = finishedPoll.candidateA;
      winnerText = `👑 **${winner.displayName}** foi eleito(a) com **${countA} votos**!`;
    } else if (countB > countA) {
      winner = finishedPoll.candidateB;
      winnerText = `👑 **${winner.displayName}** foi eleito(a) com **${countB} votos**!`;
    }

    const endEmbed = new EmbedBuilder()
      .setColor('#facc15')
      .setTitle('🏆 ✦ Votação Encerrada: Quem é mais provável?')
      .setDescription(
        `A comunidade decidiu sobre quem é mais provável de:\n> **"...${finishedPoll.scenario}"**\n\n` +
        `### ${winnerText}\n\n` +
        `📊 **Placar Final:**\n` +
        `• **${finishedPoll.candidateA.displayName}:** ${countA} voto(s)\n` +
        `• **${finishedPoll.candidateB.displayName}:** ${countB} voto(s)`
      )
      .setFooter(pyxieFooter(`Votação finalizada com ${total} participante(s)`))
      .setTimestamp();

    if (finishedPoll.message) {
      await finishedPoll.message.edit({
        embeds: [endEmbed],
        components: buildPollComponents(pollId, finishedPoll.candidateA, finishedPoll.candidateB, true),
      }).catch(() => null);
    }
  }, 60000);

  return {
    pollId,
    poll,
    embed: buildPollEmbed(poll),
    components: buildPollComponents(pollId, candidateA, candidateB),
  };
}

function isLikelyInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('prv:vote:');
}

async function handleLikelyInteraction(interaction) {
  const [, , pollId, rawIndex] = interaction.customId.split(':');
  const poll = activePolls.get(pollId);

  if (!poll) {
    return interaction.reply({
      content: '❌ Esta votação já foi encerrada.',
      ephemeral: true,
    });
  }

  const candidateIdx = Number(rawIndex);
  const candidate = candidateIdx === 0 ? poll.candidateA : poll.candidateB;

  poll.votes.set(interaction.user.id, candidateIdx);

  await interaction.reply({
    content: `🗳️ Seu voto foi registrado em **${candidate.displayName}**!`,
    ephemeral: true,
  });

  // Atualiza embed da enquete ao vivo
  await interaction.message.edit({
    embeds: [buildPollEmbed(poll)],
  }).catch(() => null);
}

module.exports = {
  name: LIKELY,
  aliases: ['provavel', 'py-provavel', 'quememaisprovavel', 'votacao'],
  data: new SlashCommandBuilder()
    .setName(LIKELY)
    .setDescription('Start a "Who is most likely to..." voting poll with two server members.')
    .setDescriptionLocalizations({
      'pt-BR': 'Inicie uma votação divertida de "Quem é mais provável de..." com dois membros.',
    })
    .addUserOption((option) =>
      option
        .setName('membro1')
        .setDescription('Optional first member for the poll.')
        .setDescriptionLocalizations({
          'pt-BR': 'Primeiro membro opcional da votação.',
        })
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName('membro2')
        .setDescription('Optional second member for the poll.')
        .setDescriptionLocalizations({
          'pt-BR': 'Segundo membro opcional da votação.',
        })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('situacao')
        .setDescription('Optional custom situation.')
        .setDescriptionLocalizations({
          'pt-BR': 'Situação personalizada opcional.',
        })
        .setRequired(false)
    ),
  isLikelyInteraction,
  handleLikelyInteraction,
  async executePrefix({ message, args }) {
    const mentions = [...message.mentions.members.values()];
    const candidates = pickTwoMembers(message.guild, mentions[0] || null, mentions[1] || null);

    if (!candidates) {
      return message.reply('❌ Não há membros suficientes no servidor para iniciar esta votação.');
    }

    const { poll, embed, components } = startLikelyPoll({
      guild: message.guild,
      candidateA: candidates[0],
      candidateB: candidates[1],
      channel: message.channel,
    });

    const sent = await message.reply({ embeds: [embed], components });
    poll.message = sent;
  },
  async executeSlash({ interaction }) {
    const user1 = interaction.options.getUser('membro1');
    const user2 = interaction.options.getUser('membro2');
    const situation = interaction.options.getString('situacao');

    const member1 = user1 ? await interaction.guild.members.fetch(user1.id).catch(() => null) : null;
    const member2 = user2 ? await interaction.guild.members.fetch(user2.id).catch(() => null) : null;

    const candidates = pickTwoMembers(interaction.guild, member1, member2);
    if (!candidates) {
      return interaction.editReply('❌ Não há membros suficientes no servidor para iniciar esta votação.');
    }

    const { poll, embed, components } = startLikelyPoll({
      guild: interaction.guild,
      candidateA: candidates[0],
      candidateB: candidates[1],
      scenario: situation,
      channel: interaction.channel,
    });

    const sent = await interaction.editReply({ embeds: [embed], components });
    poll.message = sent;
  },
};
