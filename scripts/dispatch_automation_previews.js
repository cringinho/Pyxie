#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) dos avisos das automações no canal 1461937203214024891.
 * Uso: node scripts/dispatch_automation_previews.js [pt|en]
 */
const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const { embed } = require('../src/services/autoAlerts');
const { t } = require('../src/utils/i18n');

const U = '`@pessoa`';
const samples = [
  ['newAccount', 'warn', [t('autos.newAccount.body', lang, { user: U, age: '`2` dias' }), `> ${t('autos.newAccount.quarantined', lang, { role: '`@Quarentena`' })}`]],
  ['impersonation', 'danger', [t('autos.impersonation.body', lang, { user: U, name: 'M0deradora', staff: '`@Moderadora`' }), `> ${t('autos.impersonation.hint', lang)}`]],
  ['spam', 'danger', [t('autos.spam.body', lang, { user: U, count: '`3`' }), `> ${t('autos.spam.timeout', lang, { minutes: '`60`' })}`]],
  ['mentions', 'warn', [t('autos.mentions.body', lang, { user: U, count: '`12`', channel: '`#geral`' })]],
  ['canary', 'danger', [t('autos.canary.body', lang, { user: U, count: '`6`', minutes: '`3`' }), `> ${t('autos.canary.alertOnly', lang)}`]],
  ['contrast', 0x8592a8, [t('autos.contrast.body', lang, { role: '`@Noturno`', hex: '1f2a44', ratio: '1.2', min: 3 }), `> ${t('autos.contrast.suggest', lang, { hex: '8592a8', ratio: '3.1' })}`]],
  ['status', 'warn', [t('autos.status.body', lang, { name: 'API', status: 'investigating' }), `> ${t('autos.status.hint', lang)}`, `[${t('autos.status.follow', lang)}](https://discordstatus.com)`]],
];

async function main() {
  let first = true;
  for (const [key, color, lines] of samples) {
    const title = t(`autos.${key}.title`, lang);
    const r = await dispatchHomologationPreview({ commandName: 'Automações', context: `${key} (${lang})`, includeHeader: first, embeds: [embed(lang, { title, lines, color })], allowedMentions: { parse: [] } });
    first = false;
    console.log('[AutomationPreview]', key, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
  // Lote 3: mensagens de texto e o cuidado em crise (DM).
  const texts = [
    ['autos3.break.text', { user: U, minutes: '`2` h' }],
    ['autos3.quiet.start', { mode: t('autos3.quiet.modeSlow', lang), end: '`06:00`' }],
    ['autos3.unanswered.text', { user: U }],
    ['autos3.crisis.channel', { user: U }],
    ['autos3.milestone.text', { count: 500 }],
    ['autos3.ghost.text', { author: U, users: '`@amiga`' }],
    ['autos3.caps.text', { user: U }],
    ['autos3.media.text', { user: U }],
    ['autos3.bump.text', {}],
  ];
  for (const [key, vars] of texts) {
    const r = await dispatchHomologationPreview({ commandName: 'Automações', context: `${key} (${lang})`, content: t(key, lang, vars), allowedMentions: { parse: [] } });
    console.log('[AutomationPreview]', key, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
  // Lembrete de bump 2.0: cartão com botão, versão em texto puro, agradecimento e DM.
  const bumpSvc = require('../src/services/bumpReminder');
  const bumpGuild = { id: '1453890868980482090', name: 'Cringelândia' };
  const bumpCfg = {
    enabled: true,
    cooldownMinutes: 120,
    quietEnabled: false,
    pingMode: 'roles',
    roleIds: ['1453890868980482090'],
    useEmbed: true,
    cardTitle: '',
    customMessage: '',
    showButton: true,
    thanksEnabled: true,
    dmBumper: true,
    countStats: true,
  };
  const bumpState = {
    lastBump: { at: Date.now(), channelId: '1', userId: '214153735281180673', userName: 'dono' },
    reminder: { at: Date.now(), channelId: '1', reminded: false },
    counters: { total: 9, reminders: 4, streak: 3, bestStreak: 5, byUser: {}, byHour: [], byWeekday: [] },
  };
  const bumpCard = bumpSvc.buildReminder(bumpGuild, bumpCfg, bumpState, lang, Date.now());
  const rb = await dispatchHomologationPreview({
    commandName: 'Automações',
    context: `bumpReminder (${lang})`,
    content: bumpCard.content,
    embeds: bumpCard.embeds,
    components: bumpCard.components,
  });
  console.log('[AutomationPreview] bumpReminder', rb.simulated ? 'simulado' : `enviado (${rb.messageId})`);
  const bumpPlain = bumpSvc.buildReminder(bumpGuild, { ...bumpCfg, useEmbed: false, showButton: false }, bumpState, lang);
  const rp = await dispatchHomologationPreview({ commandName: 'Automações', context: `bumpReminder texto (${lang})`, content: bumpPlain.content });
  console.log('[AutomationPreview] bumpReminder texto', rp.simulated ? 'simulado' : `enviado (${rp.messageId})`);
  const bumpThanks = bumpSvc.buildThanks(bumpGuild, bumpCfg, bumpState, lang, { id: '214153735281180673', name: 'dono' });
  const rt = await dispatchHomologationPreview({ commandName: 'Automações', context: `bumpReminder agradecimento (${lang})`, content: bumpThanks.content });
  console.log('[AutomationPreview] bumpReminder agradecimento', rt.simulated ? 'simulado' : `enviado (${rt.messageId})`);
  const bumpDM = bumpSvc.buildDM(bumpGuild, bumpCfg, bumpState, lang);
  const rd = await dispatchHomologationPreview({ commandName: 'Automações', context: `bumpReminder DM (${lang})`, content: bumpDM.content });
  console.log('[AutomationPreview] bumpReminder DM', rd.simulated ? 'simulado' : `enviado (${rd.messageId})`);

  const crisis = embed(lang, {
    title: t('autos3.crisis.dmTitle', lang),
    color: 'ok',
    lines: [t('autos3.crisis.dm', lang, { server: 'Cringelândia' }), t('autos3.crisis.br', lang), t('autos3.crisis.world', lang), `> ${t('autos3.crisis.emergency', lang)}`, t('autos3.crisis.stay', lang)],
  });
  const rc = await dispatchHomologationPreview({ commandName: 'Automações', context: `crisis DM (${lang})`, embeds: [crisis], allowedMentions: { parse: [] } });
  console.log('[AutomationPreview] crisis', rc.simulated ? 'simulado' : `enviado (${rc.messageId})`);
  for (const key of ['invite.notice', 'longPaste.notice']) {
    const r = await dispatchHomologationPreview({ commandName: 'Automações', context: `${key} (${lang})`, content: t(`autos.${key}`, lang, { user: U, lines: '`58`' }), allowedMentions: { parse: [] } });
    console.log('[AutomationPreview]', key, r.simulated ? 'simulado' : `enviado (${r.messageId})`);
  }
}

main().catch((err) => {
  console.error('[AutomationPreview] Falha:', err);
  process.exitCode = 1;
});
