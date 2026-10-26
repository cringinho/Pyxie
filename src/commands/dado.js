const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { DICE } = require('./commandNames');
const { getLanguage, t } = require('../utils/i18n');
const { PYXIE_COLORS } = require('../utils/pyxieVoice');
const { getThemeEmoji } = require('../utils/themeEmojis');

function rollDice(sides = 6, count = 1) {
  const safeSides = Math.min(100, Math.max(2, Number(sides) || 6));
  const safeCount = Math.min(10, Math.max(1, Number(count) || 1));

  const rolls = [];
  for (let i = 0; i < safeCount; i++) {
    rolls.push(Math.floor(Math.random() * safeSides) + 1);
  }

  const total = rolls.reduce((acc, curr) => acc + curr, 0);

  return {
    sides: safeSides,
    count: safeCount,
    rolls,
    total,
  };
}

function buildDiceEmbed(user, result, source = null) {
  const lang = getLanguage(source);
  const isD20 = result.sides === 20 && result.count === 1;
  const isNat20 = isD20 && result.rolls[0] === 20;
  const isNat1 = isD20 && result.rolls[0] === 1;

  let color = PYXIE_COLORS.purple || '#9b5de5';
  if (isNat20) color = '#facc15';
  if (isNat1) color = '#ef4444';

  const rollsStr = result.rolls.length > 1
    ? `\`${result.rolls.join('\` + \`')}\` = **${result.total}**`
    : `**${result.total}**`;

  const lines = [
    t('dice.body', lang, { user: user.displayName || user.username }),
    t('dice.result', lang, { result: rollsStr }),
  ];
  if (isNat20) lines.push(t('dice.nat20', lang));
  if (isNat1) lines.push(t('dice.nat1', lang));

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(t('dice.title', lang, { dice: getThemeEmoji('dice'), count: result.count, sides: result.sides }))
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: t('dice.footer', lang, { total: result.total }) });
}

module.exports = {
  name: DICE,
  aliases: ['dado', 'py-dado', 'rolar', 'dice', 'py-dice', 'roll'],
  data: new SlashCommandBuilder()
    .setName(DICE)
    .setDescription('Roll RPG polyhedral dice (d4, d6, d8, d10, d12, d20, d100).')
    .setDescriptionLocalizations({
      'pt-BR': 'Role dados mágicos de RPG (d4, d6, d8, d10, d12, d20, d100).',
    })
    .addIntegerOption((option) =>
      option
        .setName('sides')
        .setNameLocalizations({
          'en-US': 'sides',
          'en-GB': 'sides',
          'pt-BR': 'lados',
        })
        .setDescription('Number of sides on the dice (e.g. 6, 20, 100).')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantidade de lados do dado (ex: 6, 20, 100).',
        })
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setNameLocalizations({
          'en-US': 'amount',
          'en-GB': 'amount',
          'pt-BR': 'quantidade',
        })
        .setDescription('How many dice to roll (1 to 10).')
        .setDescriptionLocalizations({
          'pt-BR': 'Quantos dados rolar (1 a 10).',
        })
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),
  async executePrefix({ message, args }) {
    let sides = 6;
    let count = 1;

    const diceArg = args[0];
    if (diceArg) {
      if (/^(\d+)d(\d+)$/i.test(diceArg)) {
        const match = diceArg.match(/^(\d+)d(\d+)$/i);
        count = Number(match[1]);
        sides = Number(match[2]);
      } else if (/^\d+$/.test(diceArg)) {
        sides = Number(diceArg);
      }
    }

    if (args[1] && /^\d+$/.test(args[1])) {
      count = Number(args[1]);
    }

    const result = rollDice(sides, count);
    const embed = buildDiceEmbed(message.author, result, message);
    await message.reply({ embeds: [embed] });
  },
  async executeSlash({ interaction }) {
    const sides = interaction.options.getInteger('sides') || interaction.options.getInteger('lados') || 6;
    const count = interaction.options.getInteger('amount') || interaction.options.getInteger('quantidade') || 1;

    const result = rollDice(sides, count);
    const embed = buildDiceEmbed(interaction.user, result, interaction);
    await interaction.editReply({ embeds: [embed] });
  },
};
