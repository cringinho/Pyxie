const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Central do servidor (/py-setup): modo do Mundo Pyxie (completo, teste de 7 dias, clássico),
 * módulos por servidor, canais permitidos, procura dos membros e o bloqueio dos comandos.
 * O estado vai para um diretório temporário (PYXIE_DATA_DIR).
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-setup-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const guildFeatures = require('../src/services/guildFeatures');
const setup = require('../src/commands/setup');
const setCommand = require('../src/commands/set');
const { commands } = require('../src/commands');
const { t } = require('../src/utils/i18n');

const DAY = 24 * 60 * 60 * 1000;
const G = 'guild_setup_test';
const now = Date.UTC(2026, 9, 24, 15, 0, 0);

console.log('⚙️ Iniciando testes da Central do servidor (/py-setup)...');

// 1. Padrão: Mundo Pyxie ligado, DMs sempre liberadas
assert.equal(guildFeatures.getMmoState(G, now), 'full');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: 'py-dungeon', now }).allowed, true);
guildFeatures.setMmoMode(G, 'classic', { by: 'admin1', now });
assert.equal(guildFeatures.getMmoState(G, now), 'classic');
assert.deepEqual(
  guildFeatures.checkCommandAccess({ guildId: G, command: 'py-dungeon', now }),
  { allowed: false, reason: 'classic', group: 'mmo' }
);
assert.equal(guildFeatures.checkCommandAccess({ guildId: null, command: 'py-dungeon', now }).allowed, true, 'DM continua liberada');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: 'py-daily', now }).allowed, true, 'Moedinhas do diário seguem no clássico');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: { name: 'py-nova', mmo: true }, now }).reason, 'classic', 'Comandos marcados com mmo: true entram no grupo');
console.log('  ✅ 1. Modo clássico bloqueia o Mundo Pyxie e mantém o resto.');

// 2. Teste de 7 dias: uma vez por servidor, volta ao clássico sozinho
const trial = guildFeatures.startMmoTrial(G, { by: 'admin1', now });
assert.equal(trial.ok, true);
assert.equal(trial.until, now + 7 * DAY);
assert.equal(guildFeatures.getMmoState(G, now + DAY), 'trial');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: 'py-home', now: now + DAY }).allowed, true);
assert.equal(guildFeatures.startMmoTrial(G, { now: now + DAY }).reason, 'trial_running');
assert.equal(guildFeatures.getMmoState(G, now + 8 * DAY), 'classic', 'O teste acaba sozinho');
assert.equal(guildFeatures.startMmoTrial(G, { now: now + 8 * DAY }).reason, 'trial_used');
guildFeatures.setMmoMode(G, 'full', { now: now + 8 * DAY });
assert.equal(guildFeatures.getMmoState(G, now + 8 * DAY), 'full');
assert.equal(guildFeatures.startMmoTrial(G, { now: now + 8 * DAY }).reason, 'already_full');
console.log('  ✅ 2. Teste de 7 dias único, com fim automático.');

// 3. Módulos por servidor
guildFeatures.setGroupEnabled(G, 'games', false);
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: 'py-quiz', now }).reason, 'disabled');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: { name: undefined, aliases: ['math', 'matematica'] }, now }).reason, 'disabled', 'Grupo achado pelo apelido');
assert.equal(guildFeatures.setGroupEnabled(G, 'mmo', false), null, 'O Mundo Pyxie só muda pelo modo');
guildFeatures.setGroupEnabled(G, 'games', true);
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, command: 'py-quiz', now }).allowed, true);
console.log('  ✅ 3. Minigames, casamento e tarot ligam e desligam por servidor.');

// 4. Canais permitidos (threads herdam o canal pai)
guildFeatures.setGroupChannels(G, 'mmo', ['111111', 'lixo', '111111']);
assert.deepEqual(guildFeatures.getGuildFeatures(G).channels.mmo, ['111111'], 'Ids inválidos e repetidos saem');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, channel: { id: '222222' }, command: 'py-dungeon', now }).reason, 'channel');
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, channel: { id: '111111' }, command: 'py-dungeon', now }).allowed, true);
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, channel: { id: '333333', parentId: '111111' }, command: 'py-dungeon', now }).allowed, true);
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, channel: { id: '222222' }, command: 'py-tarot', now }).allowed, true, 'Tarot não é limitado por canal');
guildFeatures.setGroupChannels(G, 'mmo', []);
assert.equal(guildFeatures.checkCommandAccess({ guildId: G, channel: { id: '222222' }, command: 'py-dungeon', now }).allowed, true);
console.log('  ✅ 4. Canais do RPG/MMO e threads.');

// 5. Procura: pessoas diferentes nos últimos 7 dias
const D = 'guild_demand_test';
guildFeatures.setMmoMode(D, 'classic', { now });
assert.equal(guildFeatures.recordMmoDemand(D, 'u1', now), 1);
assert.equal(guildFeatures.recordMmoDemand(D, 'u1', now + 1000), 1, 'A mesma pessoa conta uma vez');
assert.equal(guildFeatures.recordMmoDemand(D, 'u2', now + 2000), 2);
assert.equal(guildFeatures.getMmoDemand(D, now + 8 * DAY), 0, 'Pedidos antigos saem da janela');
console.log('  ✅ 5. Procura dos membros com janela de 7 dias.');

// 6. Todo nome dos grupos aponta para um comando de verdade
const knownNames = new Set();
const moduleCommands = [];
for (const dir of fs.readdirSync(path.join(__dirname, '..', 'src', 'modules'))) {
  try {
    moduleCommands.push(...(require(`../src/modules/${dir}`).commands || []));
  } catch (_) {}
}
for (const cmd of [...commands, ...moduleCommands]) {
  [cmd.name, cmd.data?.name, ...(cmd.aliases || [])].filter(Boolean).forEach((n) => knownNames.add(n));
}
for (const [group, def] of Object.entries(guildFeatures.FEATURE_GROUPS)) {
  for (const n of def.names) assert.ok(knownNames.has(n), `${group}: ${n} não é um comando`);
}
assert.equal(guildFeatures.getCommandGroup(moduleCommands.find((c) => c.name === 'py-dungeon')), 'mmo');
assert.equal(guildFeatures.getCommandGroup(moduleCommands.find((c) => c.name === 'py-home')), 'mmo');
console.log('  ✅ 6. Grupos ligados a comandos reais.');

// 7. Painel: todas as seções em PT e EN dentro dos limites do Discord e do padrão de embeds
const guild = { id: G, name: 'Servidor Teste', iconURL: () => null, channels: { cache: new Map() } };
const wordCount = (s) => s.trim().split(/\s+/).length;
for (const lang of ['pt', 'en']) {
  for (const section of setup.SECTIONS) {
    const view = setup.buildSetupView(guild, section, lang, { now });
    assert.equal(view.embeds.length, 1, `${section}/${lang}`);
    const data = view.embeds[0].data;
    assert.ok(/^\p{Extended_Pictographic}/u.test(data.title), `Título começa com emoji: ${data.title}`);
    assert.ok(wordCount(data.title) <= 9, `Título curto: ${data.title}`);
    assert.ok(data.description.length <= 4096);
    assert.ok(!/━|═|-{6,}/.test(data.description), 'Sem divisores ASCII');
    assert.ok(view.components.length <= 5);
    const json = view.components.map((row) => row.toJSON());
    for (const row of json) {
      assert.ok(row.components.length <= 5);
      for (const comp of row.components) {
        if (comp.label) assert.ok(comp.label.length <= 80, comp.label);
        for (const opt of comp.options || []) {
          assert.ok(opt.label.length <= 100 && (!opt.description || opt.description.length <= 100), opt.label);
        }
      }
    }
  }
}
const overviewPt = setup.buildSetupDashboard(guild, 'pt');
assert.ok(overviewPt.embeds[0].data.title.includes('Painel de Configuração'));
assert.ok(setup.buildSetupDashboard(guild, 'en').embeds[0].data.title.includes('Server Configuration Panel'));
console.log('  ✅ 7. Seções do painel em PT/EN dentro dos limites.');

// 8. Vitrine para quem administra e aviso com contagem para os membros
const C = 'guild_classic_view';
guildFeatures.setMmoMode(C, 'classic', { now });
const adminMember = { id: 'adm', permissions: { has: () => true } };
const plainMember = { id: 'm1', user: { id: 'm1' }, permissions: { has: () => false } };
const source = { guildId: C, guild: { id: C, name: 'Clássico' }, lang: 'pt' };
const access = guildFeatures.checkCommandAccess({ guildId: C, command: 'py-dungeon', now });
const adminView = setup.handleAccessDenied(access, source, adminMember, now);
assert.ok(adminView.embeds.length === 1 && adminView.components.length === 1, 'Admin recebe a vitrine com botões');
const ids = adminView.components[0].toJSON().components.map((c) => c.custom_id);
assert.deepEqual(ids, ['setup:mmo:full', 'setup:mmo:trial']);
assert.equal(guildFeatures.getMmoDemand(C, now), 0, 'Admin não conta como procura');
const memberView = setup.handleAccessDenied(access, source, plainMember, now);
assert.ok(!memberView.embeds, 'Membro não vê a vitrine');
assert.ok(memberView.content.includes('**1**'));
assert.equal(guildFeatures.getMmoDemand(C, now), 1);
const channelView = setup.handleAccessDenied({ allowed: false, reason: 'channel', group: 'mmo', channels: ['999999'] }, source, plainMember, now);
assert.ok(channelView.content.includes('<#999999>'));
assert.deepEqual(memberView.allowedMentions, { parse: [] });
console.log('  ✅ 8. Vitrine só para quem administra; membros entram na contagem.');

// 9. Botões do painel
function mockInteraction({ customId, values = null, admin = true, ephemeralMessage = true }) {
  const calls = { update: [], reply: [], editReply: [], followUp: [] };
  return {
    calls,
    interaction: {
      customId,
      values,
      guildId: C,
      guild: { ...guild, id: C },
      locale: 'pt-BR',
      lang: 'pt',
      user: { id: admin ? 'adm' : 'm1' },
      member: admin ? adminMember : plainMember,
      message: { flags: { has: (f) => ephemeralMessage && f === 64 } },
      deferred: false,
      replied: false,
      update: async (p) => calls.update.push(p),
      reply: async (p) => calls.reply.push(p),
      editReply: async (p) => calls.editReply.push(p),
      followUp: async (p) => calls.followUp.push(p),
    },
  };
}

(async () => {
  const denied = mockInteraction({ customId: 'setup:mmo:full', admin: false });
  await setup.handleSetupInteraction(denied.interaction);
  assert.equal(denied.calls.reply.length, 1);
  assert.equal(denied.calls.reply[0].content, t('setup.adminOnlyAction', 'pt'));
  assert.equal(guildFeatures.getMmoState(C, now), 'classic', 'Quem não administra não muda nada');

  const trialClick = mockInteraction({ customId: 'setup:mmo:trial' });
  assert.ok(setup.isSetupInteraction(trialClick.interaction));
  await setup.handleSetupInteraction(trialClick.interaction);
  assert.equal(trialClick.calls.update.length, 1, 'No painel privado a mensagem é atualizada');
  assert.equal(guildFeatures.getMmoState(C), 'trial');

  // Vindo do aviso público de comando bloqueado, a resposta vai em privado
  guildFeatures.setMmoMode(C, 'classic');
  const publicClick = mockInteraction({ customId: 'setup:mmo:full', ephemeralMessage: false });
  await setup.handleSetupInteraction(publicClick.interaction);
  assert.equal(publicClick.calls.reply.length, 1);
  assert.equal(publicClick.calls.reply[0].ephemeral, true);
  assert.equal(guildFeatures.getMmoState(C), 'full');

  const classicAsk = mockInteraction({ customId: 'setup:mmo:classic' });
  await setup.handleSetupInteraction(classicAsk.interaction);
  assert.equal(guildFeatures.getMmoState(C), 'full', 'Pede confirmação antes do clássico');
  const confirmIds = classicAsk.calls.update[0].components[1].toJSON().components.map((c) => c.custom_id);
  assert.ok(confirmIds.includes('setup:mmo:classic_confirm'));
  await setup.handleSetupInteraction(mockInteraction({ customId: 'setup:mmo:classic_confirm' }).interaction);
  assert.equal(guildFeatures.getMmoState(C), 'classic');

  await setup.handleSetupInteraction(mockInteraction({ customId: 'setup:mod:marriage' }).interaction);
  assert.equal(guildFeatures.isGroupEnabled(C, 'marriage'), false);
  await setup.handleSetupInteraction(mockInteraction({ customId: 'setup:mod:marriage' }).interaction);
  assert.equal(guildFeatures.isGroupEnabled(C, 'marriage'), true);

  await setup.handleSetupInteraction(mockInteraction({ customId: 'setup:chan:mmo', values: ['444444', '555555'] }).interaction);
  assert.deepEqual(guildFeatures.getGuildFeatures(C).channels.mmo, ['444444', '555555']);
  await setup.handleSetupInteraction(mockInteraction({ customId: 'setup:chanclear:mmo' }).interaction);
  assert.deepEqual(guildFeatures.getGuildFeatures(C).channels.mmo, []);

  const nav = mockInteraction({ customId: 'setup:nav', values: ['modules'] });
  await setup.handleSetupInteraction(nav.interaction);
  assert.ok(nav.calls.update[0].embeds[0].data.title.includes('Módulos'));
  console.log('  ✅ 9. Botões, menus e confirmação do modo clássico.');

  // 10. /py-setup substitui o /py-set: um único slash, py!set vira atalho
  const json = setup.data.toJSON();
  assert.equal(json.name, 'py-setup');
  assert.ok(json.description_localizations['pt-BR']);
  for (const opt of json.options) {
    assert.ok(opt.description_localizations?.['pt-BR'], `Opção ${opt.name} localizada`);
    for (const choice of opt.choices || []) assert.ok(choice.name_localizations?.['pt-BR'], choice.name);
  }
  assert.equal(setCommand.data, undefined, '/py-set não é mais registrado como slash');
  assert.ok(setup.aliases.includes('py-painel') && setup.aliases.includes('painel'));
  const adminCmd = commands.find((c) => c.name === 'py-admin');
  assert.ok(!adminCmd.aliases.includes('painel'), 'painel abre a central do servidor, não o painel do dono');
  assert.equal(setup.ephemeral, true);
  console.log('  ✅ 10. /py-setup é a central única (py-set e painel redirecionam).');

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('✨ Central do servidor validada.');
})().catch((err) => {
  console.error('❌ Falha nos testes da central do servidor:', err);
  process.exit(1);
});
