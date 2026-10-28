#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) do escudo de links e do guardião do servidor no canal
 * 1461937203214024891. Menções vão entre crases e nada notifica ninguém.
 * Uso: node scripts/dispatch_security_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const alerts = require('../src/services/securityAlerts');

const G = '1453890868980482090';
const USER = '214153735281180673';
const hit = { host: 'xn--dscord-6ve.com', unicodeHost: 'dіscord.com', imitates: 'discord.com', reason: 'homograph' };
const base = { guildId: G, serverName: 'Cringelândia', panelUrl: 'https://pyxie.com.br/dashboard#/guild/1453890868980482090/security' };

async function main() {
  const name = lang === 'pt' ? 'Segurança' : 'Security';
  const send = async (context, payload, includeHeader = false) => {
    const r = await dispatchHomologationPreview({ commandName: name, context: `${context} (${lang})`, includeHeader, ...payload });
    console.log('[SecurityPreview]', context, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  };
  const asText = (p, title) => ({ embeds: [{ color: 0x8b5cf6, title, description: p.content }] });

  await send('Aviso no canal (apagou)', asText(alerts.linkChannelNotice(lang, { userId: USER, imitates: hit.imitates, deleted: true }), '💬 Canal'), true);
  await send('Aviso no canal (só avisar)', asText(alerts.linkChannelNotice(lang, { userId: USER, imitates: hit.imitates, deleted: false }), '💬 Canal'));
  await send('DM para quem mandou', asText(alerts.linkAuthorDm(lang, { serverName: 'Cringelândia', imitates: hit.imitates, host: hit.host }), '✉️ DM'));
  await send('Registro da staff', alerts.linkStaffLog(lang, { serverName: 'Cringelândia', userId: USER, channelId: '1453890869538197567', hit, deleted: true }));
  await send('Cargo: alerta', alerts.roleAlert(lang, { ...base, roleId: '1453890868980482091', roleName: 'Moderação', names: ['Administrator', 'BanMembers'], executorId: USER, reverted: false, viaDm: false }));
  await send('Cargo: desfeito sozinho', alerts.roleAlert(lang, { ...base, roleId: '1453890868980482091', roleName: 'Moderação', names: ['Administrator'], executorId: USER, reverted: true, viaDm: false }));
  await send('Canal: alerta por DM', alerts.channelAlert(lang, { ...base, channelId: '1453890869538197567', categoryName: 'Staff', executorId: null, locked: false, viaDm: true }));
}

main().catch((err) => {
  console.error('[SecurityPreview] Falha:', err);
  process.exitCode = 1;
});
