const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { randomInt } = require('node:crypto');
const { COINFLIP } = require('./commandNames');
const { getBalance, spendCoins, addCoins } = require('../services/economy');
const { getLanguage, t } = require('../utils/i18n');
const { getEmoji } = require('../utils/appEmojis');

const coinIcon = () => getEmoji('COIN') || '🪙';
const SIDE_EMOJI = { cara: '🪙', coroa: '👑' };

// Nerf (AGENTS §5): a moeda paga 1.8x (casa com 10% de vantagem), tem teto de aposta,
// limite de 10% do saldo e pausa de 20 s entre jogadas — não serve para farmar moedinhas.
const MIN_BET = 10;
const MAX_BET = 5000;
const BALANCE_SHARE = 0.1;
const PAYOUT_MULTIPLIER = 1.8;
const COOLDOWN_MS = 20 * 1000;
const lastFlipAt = new Map();

const betCap = (balance) => Math.max(MIN_BET, Math.min(MAX_BET, Math.floor((Number(balance) || 0) * BALANCE_SHARE)));

function flipCoin(userChoice, bet, userId, source = null, now = Date.now()) {
  const lang = getLanguage(source);
  const balance = getBalance(userId);

  const waited = now - (lastFlipAt.get(userId) || 0);
  if (waited < COOLDOWN_MS) {
    const seconds = Math.ceil((COOLDOWN_MS - waited) / 1000);
    return { success: false, cooldownMs: COOLDOWN_MS - waited, error: t('coinflip.cooldown', lang, { time: `\`${seconds}\`` }) };
  }

  if (balance < MIN_BET) {
    return { success: false, error: t('coinflip.noFunds', lang, { balance, bet: MIN_BET, coin: coinIcon() }) };
  }

  const cap = betCap(balance);
  const asked = Math.max(MIN_BET, Math.floor(Number(bet) || MIN_BET));
  const safeBet = Math.min(asked, cap);
  const capped = asked > safeBet;

  const normalizedChoice = String(userChoice).toLowerCase().trim();
  const choice = normalizedChoice.startsWith('cor') || normalizedChoice.startsWith('tail') ? 'coroa' : 'cara';
  const outcome = randomInt(0, 2) === 0 ? 'cara' : 'coroa';
  const won = choice === outcome;
  const payout = won ? Math.floor(safeBet * PAYOUT_MULTIPLIER) : 0;

  // A aposta sai da carteira sob a trava da economia; se não der, nada acontece
  const spent = spendCoins(userId, safeBet);
  if (!spent.spent) {
    return {
      success: false,
      error: t('coinflip.noFunds', lang, { balance: getBalance(userId), bet: safeBet, coin: coinIcon() }),
    };
  }
  const newBalance = won ? addCoins(userId, payout) : spent.balance;
  lastFlipAt.set(userId, now);
  if (lastFlipAt.size > 5000) lastFlipAt.delete(lastFlipAt.keys().next().value);

  const sideName = (side) => t(side === 'cara' ? 'coinflip.heads' : 'coinflip.tails', lang);
  const lines = [
    t(won ? 'coinflip.winBody' : 'coinflip.loseBody', lang, { bet: safeBet, coin: coinIcon() }),
    t('coinflip.pick', lang, { pickEmoji: SIDE_EMOJI[choice], pick: sideName(choice) }),
    t('coinflip.result', lang, { resultEmoji: SIDE_EMOJI[outcome], result: sideName(outcome) }),
    capped ? t('coinflip.capped', lang, { bet: safeBet, cap }) : '',
    t('coinflip.balance', lang, { balance: Number(newBalance).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR'), coin: coinIcon() }),
  ].filter(Boolean);
  const embed = new EmbedBuilder()
    .setColor(won ? '#10b981' : '#ef4444')
    .setTitle(t(won ? 'coinflip.winTitle' : 'coinflip.loseTitle', lang, { side: sideName(outcome) }))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('coinflip.footer', lang, { bet: safeBet }) });

  return { success: true, won, outcome, bet: safeBet, asked, capped, cap, payout, newBalance, embed };
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
        .setMaxValue(5000)
        .setRequired(true)
    ),
  flipCoin,
  betCap,
  PAYOUT_MULTIPLIER,
  COOLDOWN_MS,
  _resetCoinflipCooldowns: () => lastFlipAt.clear(),
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
      return message.reply(t('coinflip.usage', message, { example: isEn ? 'py!coinflip heads 50' : 'py!coinflip cara 50' }));
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
