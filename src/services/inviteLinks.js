const { PermissionsBitField, PermissionFlagsBits: P } = require('discord.js');

/**
 * Links oficiais de instalação da Pyxie.
 *
 * O convite padrão pede só o que os sistemas usam de fato, em vez de Administrador:
 * falar, mandar embeds e imagens, reagir, apagar as próprias mensagens de evento,
 * criar canais de ticket, entregar o cargo automático de boas-vindas e abrir/fechar a thread
 * de cada descida nas Catacumbas.
 */

const DEFAULT_CLIENT_ID = '1543650200718155897';

const PERMISSION_PRESETS = {
  // Todos os sistemas (tickets, cargo automático, drops sazonais)
  full: [
    P.ViewChannel,
    P.SendMessages,
    P.SendMessagesInThreads,
    P.CreatePublicThreads,
    P.ManageThreads,
    P.EmbedLinks,
    P.AttachFiles,
    P.ReadMessageHistory,
    P.UseExternalEmojis,
    P.AddReactions,
    P.ManageMessages,
    P.ManageChannels,
    P.ManageRoles,
  ],
  // Só jogos, economia e tarot: nenhuma permissão de gerenciamento (as Catacumbas abrem thread)
  basic: [
    P.ViewChannel,
    P.SendMessages,
    P.SendMessagesInThreads,
    P.CreatePublicThreads,
    P.EmbedLinks,
    P.AttachFiles,
    P.ReadMessageHistory,
    P.UseExternalEmojis,
    P.AddReactions,
  ],
  admin: [P.Administrator],
};

function getClientId() {
  return process.env.DISCORD_CLIENT_ID || DEFAULT_CLIENT_ID;
}

function permissionsFor(preset) {
  const flags = PERMISSION_PRESETS[preset] || PERMISSION_PRESETS.full;
  return new PermissionsBitField(flags).bitfield.toString();
}

/** Convite para adicionar a Pyxie a um servidor. */
function buildGuildInviteUrl(preset = 'full') {
  const params = new URLSearchParams({
    client_id: getClientId(),
    permissions: permissionsFor(preset),
    integration_type: '0',
    scope: 'bot applications.commands',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/** Instalação na conta do usuário (User App): comandos em qualquer servidor, grupo ou DM. */
function buildUserInstallUrl() {
  const params = new URLSearchParams({
    client_id: getClientId(),
    integration_type: '1',
    scope: 'applications.commands',
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function resolvePreset(value) {
  const preset = String(value || '').toLowerCase();
  return Object.prototype.hasOwnProperty.call(PERMISSION_PRESETS, preset) ? preset : 'full';
}

module.exports = {
  PERMISSION_PRESETS,
  permissionsFor,
  buildGuildInviteUrl,
  buildUserInstallUrl,
  resolvePreset,
};
