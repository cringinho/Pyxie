#!/usr/bin/env node
// Prévias de homologação (AGENTS.md §11) dos embeds que mudaram ao levar ao painel a agenda,
// as mensagens periódicas e o acolhimento. Sem pings: o despachante põe menções entre crases.
// Uso: node scripts/dispatch_dashboard_modules_previews.js   (PYXIE_ENV_FILE aponta outro .env)
const path = require('node:path');
require('dotenv').config({ path: process.env.PYXIE_ENV_FILE || path.join(__dirname, '..', '.env') });
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { CRINGELANDIA_GUILD_ID } = require('../src/config');
const periodic = require('../src/services/periodicMessages');
const welcomeFlow = require('../src/services/welcomeFlow');
const { buildCheckinPayload } = require('../src/services/welcomeCheckinService');
const { buildAgendaEmbed } = require('../src/commands/agenda');

const OTHER = '111111111111111111';
const cringe = { id: CRINGELANDIA_GUILD_ID, name: 'Cringelândia', memberCount: 512 };
const other = { id: OTHER, name: 'Cozy Corner', memberCount: 87 };
const member = (guild) => ({
  id: '123456789012345678',
  guild,
  displayName: 'Lua',
  user: { username: 'lua', bot: false, displayAvatarURL: () => 'https://cdn.discordapp.com/embed/avatars/2.png' },
  toString: () => '<@123456789012345678>',
});
const pause = () => new Promise((r) => setTimeout(r, 700));

async function send(commandName, context, payload) {
  await dispatchHomologationPreview({ commandName, context, content: payload.content || '', embeds: payload.embeds, components: payload.components || [] });
  await pause();
}

async function run() {
  await send('Guia de apoio', 'PT · Cringelândia, todos os sites, a cada 12h', periodic.buildBumpGuide(cringe, periodic.getConfig(CRINGELANDIA_GUILD_ID).bumpGuide));
  await send('Support guide', 'EN · other server, default sites', periodic.buildBumpGuide(other, periodic.defaultsFor(OTHER).bumpGuide));
  await send('/py-agenda', 'PT · agenda da Cringelândia calculada da config', { embeds: [buildAgendaEmbed(cringe, Date.now(), 'pt')] });
  await send('/py-agenda', 'EN · empty schedule', { embeds: [buildAgendaEmbed(other, Date.now(), 'en')] });
  await send('Boas-vindas', 'PT · formato guia (Cringelândia, igual ao antigo)', welcomeFlow.buildWelcomeMessage(member(cringe), welcomeFlow.getView(CRINGELANDIA_GUILD_ID)));
  await send('Welcome', 'EN · custom layout with default text', welcomeFlow.buildWelcomeMessage(member(other), { ...welcomeFlow.getView(OTHER), imageUrl: '' }));
  await send('Acolhimento 24h', 'PT · lote da Cringelândia', buildCheckinPayload({ userIds: ['123456789012345678', '987654321098765432'], templateIndex: 0 }));
  await send('24h check-in', 'EN · batch in another server', buildCheckinPayload({ userIds: ['123456789012345678'], templateIndex: 3, guild: other, channelId: '222222222222222222' }));
  console.log('Prévias enviadas.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
