const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} = require('discord.js');
const { LIKELY } = require('./commandNames');
const { getLanguage } = require('../utils/i18n');
const { PYXIE_COLORS, pyxieFooter } = require('../utils/pyxieVoice');

const SCENARIOS_PT = [
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
  'confundir açúcar com sal na hora de cozinhar um prato especial',
];

const SCENARIOS_EN = [
  'forget where their phone is while currently talking on it',
  'fall asleep during an important voice meeting and snore on the microphone',
  'spend their entire paycheck on takeout food on the first day of the month',
  'get lost in a completely straight shopping mall corridor',
  'send an embarrassing message to the family group thinking it was a private DM',
  'burst out laughing at a completely serious or inappropriate moment',
  'trip over their own feet in public and pretend they were jogging',
  'spend 3 hours picking a movie and fall asleep within the first 10 minutes',
  'adopt 5 stray cats in a single week without hesitation',
  'forget their best friend\'s birthday despite three phone calendar alarms',
  'reply "you too!" when the waiter says "enjoy your meal"',
  'accidentally like a 5-year-old photo on someone\'s profile at 3 AM',
  'invent a wild conspiracy theory about everyday household objects',
  'hop into a stranger\'s car thinking it was their rideshare',
  'stay up until dawn reading random Wikipedia articles about ancient bread',
  'pour the milk before the cereal and fiercely defend it',
  'buy something totally useless online just because it was 70% off',
  'talk to pets as if they were distinguished scholars fluent in English',
  'survive a zombie apocalypse purely through the sheer power of sarcasm',
  'become an accidental viral meme overnight without even knowing why',
  'try to fix a simple squeak and end up breaking three other appliances',
  'completely forget what they were saying halfway through the sentence',
  'pretend to understand a conversation just to avoid asking "what?" a third time',
  'tear up while watching an emotional butter or soda commercial',
  'have 80 browser tabs open and swear they will read every single one',
  'burn through every single Pyxie coin trying to hatch a rare shiny pet',
  'lock themselves out of the house because the keys were left in the outside handle',
  'sing loudly with headphones on assuming nobody else can hear them',
  'stay in pajamas all day long while pretending to be intensely productive',
  'mistake sugar for salt while cooking a special gourmet recipe',
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

function buildPollEmbed(poll, lang = 'pt') {
  const isEn = lang === 'en';
  const countA = [...poll.votes.values()].filter((v) => v === 0).length;
  const countB = [...poll.votes.values()].filter((v) => v === 1).length;
  const total = countA + countB;

  const percentA = total > 0 ? Math.round((countA / total) * 100) : 0;
  const percentB = total > 0 ? Math.round((countB / total) * 100) : 0;

  const bar = (pct) => {
    const filled = Math.round(pct / 10);
    return '█'.repeat(filled) + '░'.repeat(10 - filled);
  };

  const title = isEn ? '🎯 ✦ Who is most likely to...' : '🎯 ✦ Quem é mais provável de...';
  const desc = isEn
    ? `### > *"...${poll.scenario}?"*\n\nVote using the buttons below! Results close in 60 seconds.`
    : `### > *"...${poll.scenario}?"*\n\nVotem nos botões abaixo! O resultado encerra em 60 segundos.`;

  const votesSuffix = isEn ? 'votes' : 'votos';
  const footerText = isEn
    ? `Total votes recorded: ${total} • Voting open`
    : `Total de votos registrados: ${total} • Votação aberta`;

  return new EmbedBuilder()
    .setColor(PYXIE_COLORS.purple)
    .setTitle(title)
    .setDescription(desc)
    .addFields(
      {
        name: `👈 ${poll.candidateA.displayName}`,
        value: `\`${bar(percentA)}\` **${percentA}%** (${countA} ${votesSuffix})`,
        inline: true,
      },
      {
        name: `👉 ${poll.candidateB.displayName}`,
        value: `\`${bar(percentB)}\` **${percentB}%** (${countB} ${votesSuffix})`,
        inline: true,
      }
    )
    .setFooter(pyxieFooter(footerText))
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

function startLikelyPoll({ guild, candidateA, candidateB, scenario, channel, lang = 'pt' }) {
  const pollId = `prv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const scenariosPool = lang === 'en' ? SCENARIOS_EN : SCENARIOS_PT;
  const chosenScenario = scenario || scenariosPool[Math.floor(Math.random() * scenariosPool.length)];

  const poll = {
    id: pollId,
    scenario: chosenScenario,
    candidateA,
    candidateB,
    votes: new Map(), // userId => 0 | 1
    expiresAt: Date.now() + 60000,
    lang,
  };

  activePolls.set(pollId, poll);

  // Encerramento em 60 segundos
  setTimeout(async () => {
    const finishedPoll = activePolls.get(pollId);
    if (!finishedPoll) return;
    activePolls.delete(pollId);

    const isEn = finishedPoll.lang === 'en';
    const countA = [...finishedPoll.votes.values()].filter((v) => v === 0).length;
    const countB = [...finishedPoll.votes.values()].filter((v) => v === 1).length;
    const total = countA + countB;

    let winnerText = isEn
      ? 'It is a cosmic tie of votes!'
      : 'Houve um empate cósmico de votos!';
    let winner = null;

    if (countA > countB) {
      winner = finishedPoll.candidateA;
      winnerText = isEn
        ? `👑 **${winner.displayName}** was elected with **${countA} votes**!`
        : `👑 **${winner.displayName}** foi eleito(a) com **${countA} votos**!`;
    } else if (countB > countA) {
      winner = finishedPoll.candidateB;
      winnerText = isEn
        ? `👑 **${winner.displayName}** was elected with **${countB} votes**!`
        : `👑 **${winner.displayName}** foi eleito(a) com **${countB} votos**!`;
    }

    const title = isEn
      ? '🏆 ✦ Voting Closed: Who is most likely?'
      : '🏆 ✦ Votação Encerrada: Quem é mais provável?';

    const desc = isEn
      ? `The community has spoken on who is most likely to:\n> **"...${finishedPoll.scenario}?"**\n\n` +
        `### ${winnerText}\n\n` +
        `📊 **Final Tally:**\n` +
        `• **${finishedPoll.candidateA.displayName}:** ${countA} vote(s)\n` +
        `• **${finishedPoll.candidateB.displayName}:** ${countB} vote(s)`
      : `A comunidade decidiu sobre quem é mais provável de:\n> **"...${finishedPoll.scenario}"**\n\n` +
        `### ${winnerText}\n\n` +
        `📊 **Placar Final:**\n` +
        `• **${finishedPoll.candidateA.displayName}:** ${countA} voto(s)\n` +
        `• **${finishedPoll.candidateB.displayName}:** ${countB} voto(s)`;

    const endEmbed = new EmbedBuilder()
      .setColor('#facc15')
      .setTitle(title)
      .setDescription(desc)
      .setFooter(pyxieFooter(isEn ? `Voting concluded with ${total} participant(s)` : `Votação finalizada com ${total} participante(s)`))
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
    embed: buildPollEmbed(poll, lang),
    components: buildPollComponents(pollId, candidateA, candidateB),
  };
}

function isLikelyInteraction(interaction) {
  return interaction.isButton() && interaction.customId.startsWith('prv:vote:');
}

async function handleLikelyInteraction(interaction) {
  const [, , pollId, rawIndex] = interaction.customId.split(':');
  const poll = activePolls.get(pollId);
  const lang = poll?.lang || getLanguage(interaction);
  const isEn = lang === 'en';

  if (!poll) {
    return interaction.reply({
      content: isEn ? '❌ This voting poll has already ended.' : '❌ Esta votação já foi encerrada.',
      ephemeral: true,
    });
  }

  const candidateIdx = Number(rawIndex);
  const candidate = candidateIdx === 0 ? poll.candidateA : poll.candidateB;

  poll.votes.set(interaction.user.id, candidateIdx);

  await interaction.reply({
    content: isEn
      ? `🗳️ Your vote for **${candidate.displayName}** has been registered!`
      : `🗳️ Seu voto foi registrado em **${candidate.displayName}**!`,
    ephemeral: true,
  });

  // Atualiza embed da enquete ao vivo
  await interaction.message.edit({
    embeds: [buildPollEmbed(poll, lang)],
  }).catch(() => null);
}

module.exports = {
  name: LIKELY,
  aliases: ['provavel', 'py-provavel', 'quememaisprovavel', 'votacao', 'likely', 'py-likely', 'whois', 'mostlikely'],
  data: new SlashCommandBuilder()
    .setName(LIKELY)
    .setDescription('Start a "Who is most likely to..." voting poll with two server members.')
    .setDescriptionLocalizations({
      'pt-BR': 'Inicie uma votação divertida de "Quem é mais provável de..." com dois membros.',
    })
    .addUserOption((option) =>
      option
        .setName('member1')
        .setNameLocalizations({
          'en-US': 'member1',
          'en-GB': 'member1',
          'pt-BR': 'membro1',
        })
        .setDescription('Optional first member for the poll.')
        .setDescriptionLocalizations({
          'pt-BR': 'Primeiro membro opcional da votação.',
        })
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName('member2')
        .setNameLocalizations({
          'en-US': 'member2',
          'en-GB': 'member2',
          'pt-BR': 'membro2',
        })
        .setDescription('Optional second member for the poll.')
        .setDescriptionLocalizations({
          'pt-BR': 'Segundo membro opcional da votação.',
        })
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('situation')
        .setNameLocalizations({
          'en-US': 'situation',
          'en-GB': 'situation',
          'pt-BR': 'situacao',
        })
        .setDescription('Optional custom situation.')
        .setDescriptionLocalizations({
          'pt-BR': 'Situação personalizada opcional.',
        })
        .setRequired(false)
    ),
  isLikelyInteraction,
  handleLikelyInteraction,
  async executePrefix({ message, args }) {
    const lang = getLanguage(message);
    const isEn = lang === 'en';

    const mentions = [...message.mentions.members.values()];
    const candidates = pickTwoMembers(message.guild, mentions[0] || null, mentions[1] || null);

    if (!candidates) {
      return message.reply(
        isEn
          ? '❌ Not enough members in the server to start this voting poll.'
          : '❌ Não há membros suficientes no servidor para iniciar esta votação.'
      );
    }

    const { poll, embed, components } = startLikelyPoll({
      guild: message.guild,
      candidateA: candidates[0],
      candidateB: candidates[1],
      channel: message.channel,
      lang,
    });

    const sent = await message.reply({ embeds: [embed], components });
    poll.message = sent;
  },
  async executeSlash({ interaction }) {
    const lang = getLanguage(interaction);
    const isEn = lang === 'en';

    const user1 =
      interaction.options.getUser('member1') ||
      interaction.options.getUser('membro1');
    const user2 =
      interaction.options.getUser('member2') ||
      interaction.options.getUser('membro2');
    const situation =
      interaction.options.getString('situation') ||
      interaction.options.getString('situacao');

    const member1 = user1 ? await interaction.guild.members.fetch(user1.id).catch(() => null) : null;
    const member2 = user2 ? await interaction.guild.members.fetch(user2.id).catch(() => null) : null;

    const candidates = pickTwoMembers(interaction.guild, member1, member2);
    if (!candidates) {
      return interaction.editReply(
        isEn
          ? '❌ Not enough members in the server to start this voting poll.'
          : '❌ Não há membros suficientes no servidor para iniciar esta votação.'
      );
    }

    const { poll, embed, components } = startLikelyPoll({
      guild: interaction.guild,
      candidateA: candidates[0],
      candidateB: candidates[1],
      scenario: situation,
      channel: interaction.channel,
      lang,
    });

    const sent = await interaction.editReply({ embeds: [embed], components });
    poll.message = sent;
  },
};
