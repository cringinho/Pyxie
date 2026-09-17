const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { COINFLIP } = require('./commandNames');
const { getBalance, spendCoins, addCoins } = require('../services/economy');
const { getLanguage } = require('../utils/i18n');
const { pyxieFooter } = require('../utils/pyxieVoice');

function flipCoin(userChoice, bet, userId, source = null) {
  const lang = getLanguage(source);
  const isEn = lang === 'en';

  const safeBet = Math.max(10, Number(bet) || 10);
  const balance = getBalance(userId);

  if (balance < safeBet) {
    return {
      success: false,
      error: isEn
        ? `❌ You don't have enough coins! Your current balance is **${balance} Coins 💰**.`
        : `❌ Você não possui saldo suficiente! Seu saldo atual é **${balance} Moedas 💰**.`,
    };
  }

  const normalizedChoice = String(userChoice).toLowerCase().trim();
  const choice = (normalizedChoice.startsWith('cor') || normalizedChoice.startsWith('tail')) ? 'coroa' : 'cara';

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

  const choiceLabel = isEn ? (choice === 'cara' ? 'HEADS' : 'TAILS') : choice.toUpperCase();
  const outcomeLabel = isEn ? (outcome === 'cara' ? 'HEADS' : 'TAILS') : outcome.toUpperCase();

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter(pyxieFooter(isEn ? `Bet: ${safeBet} Coins • Heads or Tails` : `Aposta: ${safeBet} Moedas • Cara ou Coroa`));

  if (won) {
    embed
      .setColor('#10b981')
      .setTitle(isEn ? `🪙 ✦ It's ${outcomeLabel}! You Won!` : `🪙 ✦ Deu ${outcomeLabel}! Você Venceu!`)
      .setDescription(
        isEn
          ? `*The magic coin spun through the air with stellar sparks and landed face up!*\n\n` +
            `🎲 **Result:** **${outcomeLabel} ${outcomeEmoji}**\n` +
            `🎯 **Your Pick:** **${choiceLabel} ${choiceEmoji}**\n\n` +
            `🎉 **Congratulations!** You predicted correctly and won **+${safeBet} Coins 💰**!\n` +
            `💳 **New Balance:** **${newBalance} Coins**`
          : `*A moeda mágica girou no ar, cintilou com faíscas estelares e pousou com a face voltada para cima!*\n\n` +
            `🎲 **Resultado:** **${outcomeLabel} ${outcomeEmoji}**\n` +
            `🎯 **Sua Escolha:** **${choiceLabel} ${choiceEmoji}**\n\n` +
            `🎉 **Parabéns!** Você acertou e faturou **+${safeBet} Moedas 💰**!\n` +
            `💳 **Novo Saldo:** **${newBalance} Moedas**`
      );
  } else {
    embed
      .setColor('#ef4444')
      .setTitle(isEn ? `🪙 ✦ It's ${outcomeLabel}! Better luck next time...` : `🪙 ✦ Deu ${outcomeLabel}! Não foi dessa vez...`)
      .setDescription(
        isEn
          ? `*The coin spun in the air and whimsically landed on the other side!*\n\n` +
            `🎲 **Result:** **${outcomeLabel} ${outcomeEmoji}**\n` +
            `🎯 **Your Pick:** **${choiceLabel} ${choiceEmoji}**\n\n` +
            `💀 You lost **${safeBet} Coins** to Pyxie's cauldron!\n` +
            `💳 **New Balance:** **${newBalance} Coins**`
          : `*A moeda mágica girou no ar e caprichosamente caiu na outra face!*\n\n` +
            `🎲 **Resultado:** **${outcomeLabel} ${outcomeEmoji}**\n` +
            `🎯 **Sua Escolha:** **${choiceLabel} ${choiceEmoji}**\n\n` +
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
        .setName('side')
        .setNameLocalizations({
          'en-US': 'side',
          'en-GB': 'side',
          'pt-BR': 'lado',
        })
        .setDescription('Choose Heads (Cara) or Tails (Coroa).')
        .setDescriptionLocalizations({
          'pt-BR': 'Escolha Cara ou Coroa.',
        })
        .setRequired(true)
        .addChoices(
          { name: '🪙 Heads / Cara', value: 'cara' },
          { name: '👑 Tails / Coroa', value: 'coroa' }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName('bet')
        .setNameLocalizations({
          'en-US': 'bet',
          'en-GB': 'bet',
          'pt-BR': 'aposta',
        })
        .setDescription('Amount of coins to bet (minimum 10).')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade de moedas para apostar (mínimo 10).',
        })
        .setMinValue(10)
        .setRequired(true)
    ),
  async executePrefix({ message, args }) {
    const choiceArg = args[0]?.toLowerCase();
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
      const isEn = getLanguage(message) === 'en';
      return message.reply(isEn
        ? '❌ Provide your choice and bet amount! Example: `py!coinflip heads 50`'
        : '❌ Informe sua escolha e o valor da aposta! Exemplo: `py!coinflip cara 50`');
    }

    const result = flipCoin(choice, bet, message.author.id, message);
    if (!result.success) {
      return message.reply(result.error);
    }

    await message.reply({ embeds: [result.embed] });
  },
  async executeSlash({ interaction }) {
    const choice = interaction.options.getString('side') || interaction.options.getString('lado') || 'cara';
    const bet = interaction.options.getInteger('bet') || interaction.options.getInteger('aposta') || 10;

    const result = flipCoin(choice, bet, interaction.user.id, interaction);
    if (!result.success) {
      return interaction.editReply(result.error);
    }

    await interaction.editReply({ embeds: [result.embed] });
  },
};
