// Painel único do casamento: /py-marriage (ou py!casamento) abre botões para tudo do módulo.
// Cada botão chama a mesma função que os subcomandos antigos usavam. Só quem abriu usa o painel.
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} = require('discord.js');
const { getSpouseId } = require('./marriageManager');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;
const PREFIX = 'mh:';

const btn = (action, ownerId, source, emoji, style = ButtonStyle.Secondary) =>
  new ButtonBuilder().setCustomId(`${PREFIX}${action}:${ownerId}`).setLabel(t(`marriage.hub.btn.${action}`, source)).setEmoji(emoji).setStyle(style);

function buildHub(source) {
  const user = source.user || source.author;
  const spouseId = getSpouseId(user.id);
  const embed = new EmbedBuilder()
    .setColor(0xec4899)
    .setTitle(t('marriage.hub.title', source))
    .setDescription(spouseId ? t('marriage.hub.married', source, { partner: `<@${spouseId}>` }) : t('marriage.hub.single', source))
    .setFooter({ text: t('marriage.hub.footer', source) });
  if (!spouseId) {
    return {
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new UserSelectMenuBuilder().setCustomId(`${PREFIX}propose:${user.id}`).setPlaceholder(t('marriage.hub.pickPartner', source)).setMaxValues(1)
        ),
      ],
      allowedMentions: { parse: [] },
    };
  }
  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(
        btn('status', user.id, source, '📊', ButtonStyle.Primary),
        btn('affection', user.id, source, '💞'),
        btn('date', user.id, source, '🌙'),
        btn('bond', user.id, source, '🔗'),
        btn('house', user.id, source, '🏡')
      ),
      new ActionRowBuilder().addComponents(
        btn('cultivate', user.id, source, '🌳'),
        btn('unlock', user.id, source, '🫘'),
        btn('claim', user.id, source, '💰'),
        btn('deposit', user.id, source, '🏦')
      ),
      new ActionRowBuilder().addComponents(
        btn('children', user.id, source, '👶'),
        btn('newchild', user.id, source, '🍼'),
        btn('childwork', user.id, source, '💼'),
        btn('childclaim', user.id, source, '🪙')
      ),
      new ActionRowBuilder().addComponents(btn('divorce', user.id, source, '💔', ButtonStyle.Danger)),
    ],
    allowedMentions: { parse: [] },
  };
}

function isHubInteraction(interaction) {
  return typeof interaction?.customId === 'string' && interaction.customId.startsWith(PREFIX);
}

function textModal(id, title, label, numeric) {
  return new ModalBuilder()
    .setCustomId(id)
    .setTitle(title)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('value').setLabel(label).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(numeric ? 9 : 40)
      )
    );
}

// Respostas saem como mensagem nova, igual aos comandos antigos. A primeira preenche a resposta adiada.
const replier = (interaction) => {
  let first = true;
  return (content) => {
    const payload = typeof content === 'string' ? { content } : content;
    if (first && interaction.deferred) {
      first = false;
      return interaction.editReply(payload);
    }
    return interaction.followUp(payload);
  };
};

// Botões que abrem formulário ou confirmação respondem na hora; o resto pode demorar (imagens).
const IMMEDIATE = new Set(['deposit', 'childwork', 'childclaim', 'divorce', 'divorceyes']);

async function handleHubInteraction(interaction) {
  const [, action, ownerId] = interaction.customId.split(':');
  if (interaction.user.id !== ownerId) {
    return interaction.reply({ content: t('marriage.hub.notYours', interaction), flags: EPHEMERAL });
  }
  const casamento = require('./commands/pyCasamento').handlers;
  const filho = require('./commands/pyFilho').handlers;
  if (!IMMEDIATE.has(action)) await interaction.deferReply();
  const reply = replier(interaction);

  // Formulários (modais) que pedem um valor
  if (interaction.isModalSubmit?.()) {
    const value = interaction.fields.getTextInputValue('value').trim();
    if (action === 'depositform') return casamento.handleVault(interaction, 'deposit', Math.max(0, parseInt(value.replace(/\D/g, ''), 10) || 0), reply);
    if (action === 'childworkform') return filho.handleWork(interaction, value, reply);
    if (action === 'childclaimform') return filho.handleClaim(interaction, value, reply);
    return null;
  }

  if (action === 'propose' && interaction.isUserSelectMenu?.()) {
    const target = interaction.users.first();
    const source = Object.create(interaction, { options: { value: { getUser: () => target } } });
    return casamento.handlePropose(source, reply);
  }

  switch (action) {
    case 'status':
      return casamento.handleStatus(interaction, reply);
    case 'affection':
      return casamento.handleAffection(interaction, reply);
    case 'date':
      return casamento.handleDateNight(interaction, reply);
    case 'bond':
      return casamento.handleBond(interaction, reply);
    case 'house':
      return casamento.handleHouse(interaction, reply);
    case 'cultivate':
      return casamento.handleTree(interaction, 'cultivate', reply);
    case 'unlock':
      return casamento.handleTree(interaction, 'buy', reply);
    case 'claim':
      return casamento.handleVault(interaction, 'claim', 0, reply);
    case 'deposit':
      return interaction.showModal(textModal(`${PREFIX}depositform:${ownerId}`, t('marriage.hub.depositTitle', interaction), t('marriage.hub.depositLabel', interaction), true));
    case 'children':
      return filho.handleList(interaction, reply);
    case 'newchild':
      return casamento.handleChildProposal(interaction, reply);
    case 'childwork':
      return interaction.showModal(textModal(`${PREFIX}childworkform:${ownerId}`, t('marriage.hub.childWorkTitle', interaction), t('marriage.hub.childLabel', interaction), false));
    case 'childclaim':
      return interaction.showModal(textModal(`${PREFIX}childclaimform:${ownerId}`, t('marriage.hub.childClaimTitle', interaction), t('marriage.hub.childLabel', interaction), false));
    case 'divorce':
      return interaction.reply({
        content: t('marriage.hub.divorceConfirm', interaction),
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`${PREFIX}divorceyes:${ownerId}`).setLabel(t('marriage.hub.divorceYes', interaction)).setEmoji('💔').setStyle(ButtonStyle.Danger)
          ),
        ],
        flags: EPHEMERAL,
      });
    case 'divorceyes':
      await interaction.update({ content: t('marriage.hub.divorceDone', interaction), components: [] });
      return require('./commands/pyDivorcio').executeDivorce(interaction, (c) => interaction.followUp(typeof c === 'string' ? { content: c } : c));
    default:
      return null;
  }
}

module.exports = { buildHub, isHubInteraction, handleHubInteraction };
