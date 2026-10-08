const { SlashCommandBuilder } = require('discord.js');
const professions = require('../services/professions');
const { getUserAccount, setProfession } = require('../services/economy');
const { formatCoins } = require('./economyHelpers');
const { PROFESSION } = require('./commandNames');
const { t } = require('../utils/i18n');

function getProfessionChoices() {
  return Object.entries(professions).map(([value, profession]) => ({ name: profession.label, value }));
}

function getReply(result, professionKey, source = null) {
  const professionLabel = t(`profession.labels.${professionKey}`, source) || professions[professionKey]?.label || professionKey;
  if (!result.changed && result.reason === 'same') {
    return t('profession.sameProfession', source, { profession: professionLabel });
  }
  if (!result.changed && result.reason === 'insufficient') {
    return t('profession.switchCost', source, { cost: formatCoins(50, source), balance: formatCoins(result.balance, source) });
  }
  return result.charged === 0
    ? t('profession.freeSuccess', source, { profession: professionLabel })
    : t('profession.paidSuccess', source, { profession: professionLabel, cost: formatCoins(50, source) });
}

const PROFESSION_ALIASES = {
  gamedev: 'desenvolvedor_jogos',
  game_dev: 'desenvolvedor_jogos',
  'desenvolvedor de jogos': 'desenvolvedor_jogos',
  'desenvolvedor-jogos': 'desenvolvedor_jogos',
  desenvolvedorjogos: 'desenvolvedor_jogos',
  jogos: 'desenvolvedor_jogos',
  games: 'desenvolvedor_jogos',
  'animador de festa': 'animador_festa',
  'animador-festa': 'animador_festa',
  animadorfesta: 'animador_festa',
  animador: 'animador_festa',
  recreador: 'animador_festa',
  callcenter: 'telemarketing',
  'call center': 'telemarketing',
  sac: 'telemarketing',
  atendente: 'telemarketing',
  psicologa: 'psicologo',
  terapeuta: 'psicologo',
  dubladora: 'dublador',
  voz: 'dublador',
  advogado: 'advogada',
  advogada: 'advogada',
  lawyer: 'advogada',
  attorney: 'advogada',
  jurista: 'advogada',
};

function resolveProfession(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (professions[normalized]) return normalized;
  if (PROFESSION_ALIASES[normalized]) return PROFESSION_ALIASES[normalized];
  const underscored = normalized.replace(/[\s-]+/g, '_');
  if (professions[underscored]) return underscored;
  return null;
}

async function execute(source, reply, value) {
  const key = resolveProfession(value);
  if (!key) {
    const list = Object.keys(professions).map((k) => t(`profession.labels.${k}`, source) || professions[k].label).join(', ');
    return reply(t('profession.invalid', source, { list }));
  }
  const result = setProfession(source.user?.id || source.author.id, key);
  await reply(getReply(result, key, source));
}

module.exports = {
  name: PROFESSION,
  aliases: ['profession', 'profissao', 'profissão', 'py-profissao', 'py-profession', 'career', 'job'],
  resolveProfession,
  data: new SlashCommandBuilder()
    .setName(PROFESSION)
    .setDescription('Choose or change your profession.')
    .setDescriptionLocalizations({
      'pt-BR': 'Escolhe ou troca sua profissão.',
    })
    .addStringOption((option) =>
      option
        .setName('profession')
        .setNameLocalizations({
          'en-US': 'profession',
          'en-GB': 'profession',
          'pt-BR': 'profissao',
        })
        .setDescription('Desired profession to choose.')
        .setDescriptionLocalizations({
          'pt-BR': 'Profissão desejada para escolher.',
        })
        .setRequired(true)
        .addChoices(...getProfessionChoices())
    ),
  async executePrefix({ message, args }) {
    await execute(message, (content) => message.reply(content), args[0]);
  },
  async executeSlash({ interaction }) {
    const chosen = interaction.options.getString('profession') || interaction.options.getString('profissao');
    await execute(interaction, (content) => interaction.editReply(content), chosen);
  },
};