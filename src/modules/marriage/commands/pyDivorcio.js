const { getBalance, spendCoins } = require('../../../services/economy');
const { endMarriage, getSpouseId, DIVORCE_COST } = require('../marriageManager');
const { DIVORCE } = require('../../../commands/commandNames');
const { formatCoins, t } = require('../../../utils/i18n');

async function executeDivorce(source, reply) {
  const user = source.user || source.author;
  const spouseId = getSpouseId(user.id);
  if (!spouseId) {
    await reply(t('divorce.notMarried', source));
    return;
  }

  if (getBalance(user.id) < DIVORCE_COST) {
    await reply(
      t('divorce.insufficientCoins', source, {
        cost: formatCoins(DIVORCE_COST, source),
        balance: formatCoins(getBalance(user.id), source),
      })
    );
    return;
  }

  const payment = spendCoins(user.id, DIVORCE_COST);
  if (!payment.spent) {
    await reply(
      t('divorce.insufficientCoins', source, {
        cost: formatCoins(DIVORCE_COST, source),
        balance: formatCoins(getBalance(user.id), source),
      })
    );
    return;
  }

  const result = endMarriage(user.id);
  const lines = [t('divorce.success', source, { cost: formatCoins(DIVORCE_COST, source) })];
  // Separar bens: avisa quantos itens de cada pessoa saíram da casinha do casal
  for (const [personId, count] of Object.entries(result?.separation?.returned || {})) {
    if (count > 0) lines.push(t('divorce.separated', source, { count, user: `<@${personId}>` }));
  }
  await reply({ content: lines.join('\n\n'), allowedMentions: { parse: [] } });
}

module.exports = {
  name: DIVORCE || 'py-divorce',
  executeDivorce,
  aliases: ['divorce', 'divorcio', 'py-divorcio', 'py-divorce', 'separar'],
  DIVORCE_COST,
  // Agora é botão no painel do /py-marriage; o atalho py! continua funcionando.
  data: undefined,
  async executePrefix({ message }) {
    await executeDivorce(message, (content) => message.reply(content));
  },
  async executeSlash({ interaction }) {
    await executeDivorce(interaction, (content) => interaction.editReply(content));
  },
};

