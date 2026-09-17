const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { COINFLIP } = require('./commandNames');
const { getBalance, spendCoins, addCoins } = require('../services/economy');
const { pyxieFooter } = require('../utils/pyxieVoice');

function flipCoin(userChoice, bet, userId) {
  const safeBet = Math.max(10, Number(bet) || 10);
  const balance = getBalance(userId);

  if (balance < safeBet) {
    return {
      success: false,
      error: `❌ Você não possui saldo suficiente! Seu saldo atual é **${balance} Moedas 💰**.`,
    };
  }

  const normalizedChoice = String(userChoice).toLowerCase().trim();
  const choice = normalizedChoice.startsWith('cor') ? 'coroa' : 'cara';

  const outcome = Math.random() < 0.5 ? 'cara' : 'coroa';
  const won = choice === outcome;

  let newBalance = balance;
  if (won) {
    newBalance = addCoins(userId, safeBet);
  } else {
    const spentRes = spendCoins(userId, safeBet);
    newBalance = spentRes.balance;
  }

  const choiceEmoji = choice === 'cara' ? '🪙' : '👑';
  const outcomeEmoji = outcome === 'cara' ? '🪙' : '👑';

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter(pyxieFooter(`Aposta: ${safeBet} Moedas • Cara ou Coroa`));

  if (won) {
    embed
      .setColor('#10b981')
      .setTitle(`🪙 ✦ Deu ${outcome.toUpperCase()}! Você Venceu!`)
      .setDescription(
        `*A moeda mágica girou no ar, cintilou com faíscas estelares e pousou com a face voltada para cima!*\n\n` +
        `🎲 **Resultado:** **${outcome.toUpperCase()} ${outcomeEmoji}**\n` +
        `🎯 **Sua Escolha:** **${choice.toUpperCase()} ${choiceEmoji}**\n\n` +
        `🎉 **Parabéns!** Você acertou e faturou **+${safeBet} Moedas 💰**!\n` +
        `💳 **Novo Saldo:** **${newBalance} Moedas**`
      );
  } else {
    embed
      .setColor('#ef4444')
      .setTitle(`🪙 ✦ Deu ${outcome.toUpperCase()}! Não foi dessa vez...`)
      .setDescription(
        `*A moeda mágica girou no ar e caprichosamente caiu na outra face!*\n\n` +
        `🎲 **Resultado:** **${outcome.toUpperCase()} ${outcomeEmoji}**\n` +
        `🎯 **Sua Escolha:** **${choice.toUpperCase()} ${choiceEmoji}**\n\n` +
        `💀 Você perdeu **${safeBet} Moedas** para a Pyxie!\n` +
        `💳 **Novo Saldo:** **${newBalance} Moedas**`
      );
  }

  return { success: true, won, outcome, newBalance, embed };
}

module.exports = {
  name: COINFLIP,
  aliases: ['coinflip', 'py-coinflip', 'caraoucoroa', 'py-caraoucoroa', 'moeda', 'py-moeda', 'flip'],
  data: new SlashCommandBuilder()
    .setName(COINFLIP)
    .setDescription('Bet your coins on a Cara ou Coroa (Heads or Tails) coin flip against Pyxie.')
    .setDescriptionLocalizations({
      'pt-BR': 'Aposte suas moedas em um cara ou coroa contra a Pyxie.',
    })
    .addStringOption((option) =>
      option
        .setName('lado')
        .setDescription('Choose Cara (Heads) or Coroa (Tails).')
        .setDescriptionLocalizations({
          'pt-BR': 'Escolha Cara ou Coroa.',
        })
        .setRequired(true)
        .addChoices(
          { name: '🪙 Cara', value: 'cara' },
          { name: '👑 Coroa', value: 'coroa' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('aposta')
        .setDescription('Amount of coins to bet (minimum 10).')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade de moedas para apostar (mínimo 10).',
        })
        .setMinValue(10)
        .setRequired(true)
    ),
  async executePrefix({ message, args }) {
    // py!coinflip cara 50 ou py!caraoucoroa coroa 100
    const choiceArg = args[0]?.toLowerCase();
    const betArg = args[1] || args[0];

    let choice = 'cara';
    let bet = 10;

    if (choiceArg && (choiceArg.includes('cor') || choiceArg.includes('tail'))) {
      choice = 'coroa';
    } else if (choiceArg && (choiceArg.includes('car') || choiceArg.includes('head'))) {
      choice = 'cara';
    }

    const foundBet = args.find((a) => /^\d+$/.test(a));
    if (foundBet) {
      bet = Number(foundBet);
    } else {
      return message.reply('❌ Informe sua escolha e o valor da aposta! Exemplo: `py!coinflip cara 50`');
    }

    const result = flipCoin(choice, bet, message.author.id);
    if (!result.success) {
      return message.reply(result.error);
    }

    await message.reply({ embeds: [result.embed] });
  },
  async executeSlash({ interaction }) {
    const choice = interaction.options.getString('lado');
    const bet = interaction.options.getInteger('aposta');

    const result = flipCoin(choice, bet, interaction.user.id);
    if (!result.success) {
      return interaction.editReply(result.error);
    }

    await interaction.editReply({ embeds: [result.embed] });
  },
};
