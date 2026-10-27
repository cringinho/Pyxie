// Cliques nas mensagens do estúdio (customId "pyxs:<ação>:<mensagem>:<botão>") e envio dos formulários
// ("pyxsm:<mensagem>:<botão>"). As mensagens são montadas e enviadas pelo painel (messageStudioStore).
const { PermissionFlagsBits } = require('discord.js');
const store = require('../../services/messageStudioStore');
const studio = require('../../services/messageStudio');
const mentionPrefs = require('../../services/mentionPrefs');
const { t } = require('../../utils/i18n');

const EPHEMERAL = 64;

function findButton(guildId, msgId, btnId) {
  const doc = store.getMessage(guildId, msgId);
  const button = doc?.buttons.find((b) => b.id === btnId);
  return { doc, button };
}

function toDiscordJs(payload, ephemeral) {
  return {
    content: payload.content || undefined,
    embeds: payload.embeds || [],
    components: payload.components || [],
    allowedMentions: { parse: [] },
    flags: (payload.flags || 0) | (ephemeral ? EPHEMERAL : 0),
  };
}

async function handleRole(interaction, button) {
  const role = interaction.guild.roles.cache.get(button.action.roleId);
  const me = interaction.guild.members.me;
  if (!role || role.managed || !me?.permissions.has(PermissionFlagsBits.ManageRoles) || role.position >= me.roles.highest.position) {
    return interaction.reply({ content: t('messageStudio.role_error', interaction), flags: EPHEMERAL });
  }
  const has = interaction.member.roles.cache.has(role.id);
  const add = button.action.mode === 'add' || (button.action.mode === 'toggle' && !has);
  if (add && !has) await interaction.member.roles.add(role, 'Estúdio de mensagens: botão de cargo');
  if (!add && has) await interaction.member.roles.remove(role, 'Estúdio de mensagens: botão de cargo');
  const key = add ? 'messageStudio.role_added' : 'messageStudio.role_removed';
  return interaction.reply({ content: t(key, interaction, { role: role.name }), flags: EPHEMERAL });
}

async function handleModal(interaction, doc, button) {
  const fields = button.action.fields.map((f, i) => ({
    type: 1,
    components: [
      {
        type: 4,
        custom_id: `f${i}`,
        label: f.label || `#${i + 1}`,
        style: f.style === 'paragraph' ? 2 : 1,
        required: f.required,
        max_length: f.style === 'paragraph' ? 1000 : 200,
      },
    ],
  }));
  return interaction.showModal({ custom_id: `pyxsm:${doc.id}:${button.id}`, title: button.action.title.slice(0, 45), components: fields });
}

async function handleModalSubmit(interaction) {
  const [, msgId, btnId] = interaction.customId.split(':');
  const { button } = findButton(interaction.guildId, msgId, btnId);
  if (!button || button.action.type !== 'modal') {
    return interaction.reply({ content: t('messageStudio.not_found', interaction), flags: EPHEMERAL });
  }
  const channel = await interaction.client.channels.fetch(button.action.targetChannelId).catch(() => null);
  if (!channel || channel.guildId !== interaction.guildId || typeof channel.send !== 'function') {
    return interaction.reply({ content: t('messageStudio.modal_error', interaction), flags: EPHEMERAL });
  }
  const answers = button.action.fields.map((f, i) => ({
    name: (f.label || `#${i + 1}`).slice(0, 256),
    value: (interaction.fields.getTextInputValue(`f${i}`) || '—').slice(0, 1024),
  }));
  await channel.send({
    embeds: [
      {
        color: 0x8b5cf6,
        title: `📝 ${button.action.title}`.slice(0, 256),
        description: t('messageStudio.modal_entry_by', interaction, { user: `<@${interaction.user.id}>` }),
        fields: answers,
        timestamp: new Date().toISOString(),
      },
    ],
    allowedMentions: { parse: [] },
  });
  return interaction.reply({ content: t('messageStudio.modal_sent', interaction), flags: EPHEMERAL });
}

async function handleTab(interaction, doc, button) {
  const ctx = {
    user: { id: interaction.user.id, avatarUrl: interaction.user.displayAvatarURL({ size: 256 }) },
    guild: { name: interaction.guild.name, iconUrl: interaction.guild.iconURL({ size: 256 }) || '' },
    botAvatarUrl: interaction.client.user.displayAvatarURL({ size: 256 }),
  };
  const payload = studio.buildPayload(doc, ctx, { tab: button.action.tabId });
  if (button.action.private) return interaction.reply(toDiscordJs(payload, true));
  // Troca a mensagem para todos.
  const { flags, ...rest } = toDiscordJs(payload, false);
  return interaction.update(rest);
}

async function handleInteraction(interaction) {
  if (!interaction.guildId) return;
  if (interaction.isModalSubmit() && interaction.customId.startsWith('pyxsm:')) {
    return handleModalSubmit(interaction);
  }
  if (!interaction.isButton() || !interaction.customId.startsWith('pyxs:')) return;
  const [, type, msgId, btnId] = interaction.customId.split(':');

  if (type === 'silent') {
    const silent = mentionPrefs.toggleSilent(interaction.guildId, interaction.user.id);
    return interaction.reply({ content: t(silent ? 'messageStudio.silent_on' : 'messageStudio.silent_off', interaction), flags: EPHEMERAL });
  }

  const { doc, button } = findButton(interaction.guildId, msgId, btnId);
  if (!doc || !button || button.action.type !== type) {
    return interaction.reply({ content: t('messageStudio.not_found', interaction), flags: EPHEMERAL });
  }
  if (type === 'role') return handleRole(interaction, button);
  if (type === 'modal') return handleModal(interaction, doc, button);
  if (type === 'tab') return handleTab(interaction, doc, button);
  return undefined;
}

module.exports = {
  id: 'message-studio',
  name: { 'pt-BR': 'Estúdio de Mensagens', en: 'Message Studio' },
  description: {
    'pt-BR': 'Mensagens personalizadas por servidor criadas no painel: embeds, formato novo do Discord, botões de cargo, formulários e abas.',
    en: 'Custom per-server messages built in the dashboard: embeds, the new Discord layout, role buttons, forms and tabs.',
  },
  icon: '✉️',
  defaultEnabled: true,
  guildScope: null,
  handleInteraction,

  async onLoad(ctx) {
    ctx.registerListener('interactionCreate', async (interaction) => {
      try {
        await handleInteraction(interaction);
      } catch (err) {
        console.error('[MessageStudio] Erro ao processar interação:', err);
        if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
          interaction.reply({ content: t('messageStudio.generic_error', interaction), flags: EPHEMERAL }).catch(() => {});
        }
      }
    });
  },
};
