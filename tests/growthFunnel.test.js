const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/**
 * Funil de crescimento: convites com permissões mínimas, User App, boas-vindas bilíngues
 * com troca de idioma, métricas de entrada/saída/ativação/retenção e envio às listas de bots.
 * Tudo roda num diretório temporário; o data/ real da VM não é tocado (exceto settings.json,
 * que é restaurado no fim).
 */

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-growth-'));
process.env.PYXIE_DATA_DIR = tmpDir;

const growthFunnel = require('../src/services/growthFunnel');
const inviteLinks = require('../src/services/inviteLinks');
const botListStats = require('../src/services/botListStats');
const onboarding = require('../src/services/guildOnboarding');
const { getLanguage, t } = require('../src/utils/i18n');
const { PermissionsBitField, PermissionFlagsBits } = require('discord.js');

const settingsFile = path.join(__dirname, '..', 'data', 'settings.json');
const settingsSnapshot = fs.existsSync(settingsFile) ? fs.readFileSync(settingsFile, 'utf8') : null;
const DAY = 24 * 60 * 60 * 1000;

console.log('📈 Iniciando testes do funil de crescimento...');

async function run() {
  // 1. Convites
  const fullUrl = new URL(inviteLinks.buildGuildInviteUrl());
  const fullPerms = new PermissionsBitField(BigInt(fullUrl.searchParams.get('permissions')));
  assert.equal(fullPerms.has(PermissionFlagsBits.Administrator), false, 'Convite padrão não pede Administrador.');
  for (const flag of ['SendMessages', 'EmbedLinks', 'AttachFiles', 'ManageChannels', 'ManageRoles']) {
    assert.ok(fullPerms.has(PermissionFlagsBits[flag]), `Convite padrão inclui ${flag}.`);
  }
  assert.equal(fullUrl.searchParams.get('scope'), 'bot applications.commands');
  assert.equal(fullUrl.searchParams.get('integration_type'), '0');

  const basicPerms = new PermissionsBitField(BigInt(new URL(inviteLinks.buildGuildInviteUrl('basic')).searchParams.get('permissions')));
  assert.equal(basicPerms.has(PermissionFlagsBits.ManageRoles), false, 'Convite basic não gerencia cargos.');
  assert.equal(basicPerms.has(PermissionFlagsBits.ManageChannels), false, 'Convite basic não gerencia canais.');
  assert.equal(inviteLinks.permissionsFor('admin'), '8', 'Preset admin mantém o convite antigo.');
  assert.equal(inviteLinks.resolvePreset('qualquer'), 'full');

  const userUrl = new URL(inviteLinks.buildUserInstallUrl());
  assert.equal(userUrl.searchParams.get('integration_type'), '1', 'Instalação na conta usa integration_type=1.');
  assert.equal(userUrl.searchParams.get('scope'), 'applications.commands');
  assert.equal(userUrl.searchParams.has('permissions'), false);
  console.log('  ✅ 1. Convite sem Administrador, preset basic e link de User App.');

  // 2. Origem dos convites
  assert.equal(growthFunnel.normalizeRef('TopGG'), 'topgg');
  assert.equal(growthFunnel.normalizeRef('<script>'), 'direct');
  assert.equal(growthFunnel.normalizeRef(''), 'direct');
  const now = Date.UTC(2026, 9, 20, 12);
  assert.equal(growthFunnel.recordInviteClick('topgg', 'guild', { visitorKey: '1.1.1.1', now }).counted, true);
  assert.equal(growthFunnel.recordInviteClick('topgg', 'guild', { visitorKey: '1.1.1.1', now: now + 1000 }).counted, false, 'Mesmo visitante em 10 min conta uma vez.');
  growthFunnel.recordInviteClick('topgg', 'guild', { visitorKey: '1.1.1.1', now: now + 11 * 60 * 1000 });
  growthFunnel.recordInviteClick('site', 'user', { visitorKey: '2.2.2.2', now });
  console.log('  ✅ 2. Cliques por origem com deduplicação por visitante.');

  // 3. Entradas, saídas, ativação e retenção
  const g = (id, extra = {}) => ({ id, name: `Servidor ${id}`, memberCount: 42, ...extra });
  growthFunnel.backfillGuilds([g('old1', { joinedTimestamp: now - 400 * DAY })]);
  growthFunnel.recordGuildJoin(g('a'), now - 40 * DAY);
  growthFunnel.recordGuildCommand('a', now - 40 * DAY + 60 * 1000);
  growthFunnel.recordGuildJoin(g('b'), now - 10 * DAY);
  growthFunnel.recordGuildLeave(g('b'), now - 10 * DAY + 3 * 60 * 60 * 1000);
  growthFunnel.recordGuildJoin(g('c'), now - 5 * DAY);
  growthFunnel.recordGuildCommand('c', now - 2 * DAY);
  growthFunnel.recordGuildCommand('c', now - 2 * DAY + 1);
  growthFunnel.recordGuildJoin(g('d'), now - 60 * 60 * 1000);
  growthFunnel.flushGuildState();

  const summary = growthFunnel.getFunnelSummary({ now, days: 30 });
  assert.equal(summary.activeGuilds, 4, 'old1, a, c, d seguem ativos.');
  assert.equal(summary.periodJoins, 3, 'b, c, d entraram nos últimos 30 dias.');
  assert.equal(summary.periodLeaves, 1);
  assert.equal(summary.periodNet, 2);
  assert.deepEqual(summary.retention.d1, { cohort: 3, retained: 2, rate: 66.7 }, 'D1: a e c ficaram, b saiu em 3h; backfill fora.');
  assert.deepEqual(summary.retention.d30, { cohort: 1, retained: 1, rate: 100 });
  assert.equal(summary.activation24h.cohort, 3);
  assert.equal(summary.activation24h.activated, 1, 'Só a usou comando nas primeiras 24h.');
  assert.equal(summary.inviteSources.topgg.guild, 2);
  assert.equal(summary.inviteSources.site.user, 1);
  assert.equal(summary.recentLeaves[0].id, 'b');
  assert.equal(summary.recentLeaves[0].stayedHours, 3);
  assert.equal(summary.series.length, 30);
  assert.equal(summary.series.at(-1).inviteClicks, 3);

  const stored = JSON.parse(fs.readFileSync(path.join(tmpDir, 'growthGuilds.json'), 'utf8'));
  assert.equal(stored.guilds.c.commands, 2, 'Comandos por servidor são gravados.');
  assert.equal(stored.guilds.old1.backfilled, true);

  growthFunnel.recordGuildJoin(g('b'), now);
  assert.equal(growthFunnel.getFunnelSummary({ now }).activeGuilds, 5, 'Servidor que volta conta como ativo de novo.');
  console.log('  ✅ 3. Entradas, saídas, ativação 24h e retenção D1/D7/D30.');

  // 4. Listas de bots
  const fakeClient = {
    user: { id: '1543650200718155897' },
    guilds: { cache: new Map([['1', { memberCount: 10 }], ['2', { memberCount: 5 }]]) },
    ws: { shards: { size: 1 } },
  };
  fakeClient.guilds.cache.reduce = function reduce(fn, acc) {
    for (const v of this.values()) acc = fn(acc, v);
    return acc;
  };
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return { ok: !url.includes('discords.com'), status: url.includes('discords.com') ? 401 : 200 };
  };
  const result = await botListStats.postBotListStats(fakeClient, {
    env: { TOPGG_API_TOKEN: 'tg', DISCORDS_TOKEN: 'ds' },
    fetchImpl: fakeFetch,
    now,
  });
  assert.equal(calls.length, 2, 'Só listas com token recebem a contagem.');
  assert.equal(result.posted, 1);
  const topggCall = calls.find((c) => c.url.includes('top.gg'));
  assert.equal(topggCall.url, 'https://top.gg/api/bots/1543650200718155897/stats');
  assert.equal(topggCall.init.headers.Authorization, 'tg');
  assert.deepEqual(JSON.parse(topggCall.init.body), { server_count: 2, shard_count: 1 });
  assert.equal(result.results.discords.ok, false);
  assert.equal(result.results.discordbotlist.configured, false);
  assert.equal(result.counts.users, 15);
  console.log('  ✅ 4. Contagem de servidores enviada só às listas configuradas.');

  // 5. Boas-vindas
  assert.equal(onboarding.detectInitialLanguage({ id: '1453890868980482090' }), 'pt');
  assert.equal(onboarding.detectInitialLanguage({ id: '1', preferredLocale: 'pt-BR' }), 'pt');
  assert.equal(onboarding.detectInitialLanguage({ id: '1', preferredLocale: 'en-US' }), 'en');

  const clientWithCommands = {
    user: { id: '1543650200718155897' },
    application: { commands: { cache: [{ name: 'py-daily', id: '999' }] } },
  };
  for (const lang of ['pt', 'en']) {
    const msg = onboarding.buildWelcomeMessage({ id: '1', name: 'Servidor Teste' }, clientWithCommands, lang);
    const embed = msg.embeds[0].toJSON();
    assert.ok(embed.title.split(/\s+/).length <= 8, `Título curto (${lang}).`);
    assert.ok(embed.description.includes('Servidor Teste'), `Nome do servidor na apresentação (${lang}).`);
    assert.ok(embed.description.includes('</py-daily:999>'), `Menção clicável quando o ID está em cache (${lang}).`);
    assert.ok(embed.description.includes('`/py-tarot`'), `Menção em código quando o ID não está em cache (${lang}).`);
    assert.ok(embed.description.includes('\n\n### '), `Seções com ### e respiro (${lang}).`);
    assert.ok(!/[━═]{3,}|-{5,}/.test(embed.description), `Sem divisores ASCII (${lang}).`);
    assert.ok(!embed.description.includes(':0>'), `Sem menções quebradas com ID 0 (${lang}).`);
    assert.equal(msg.components.length, 2);
    const [ptBtn, enBtn] = msg.components[0].toJSON().components;
    assert.equal(ptBtn.custom_id, 'onboard_lang:pt');
    assert.equal(enBtn.custom_id, 'onboard_lang:en');
    assert.equal((lang === 'pt' ? ptBtn : enBtn).style, 1, 'Idioma ativo em destaque.');
    const links = msg.components[1].toJSON().components;
    assert.ok(links.every((b) => b.style === 5 && /^https:\/\//.test(b.url)), 'Botões de link válidos.');
    assert.deepEqual(msg.allowedMentions, { parse: [] });
  }
  assert.equal(t('growth.welcome.title', { lang: 'pt' }, { fairy: '' }).trim(), 'Oi! Eu sou a Pyxie');
  assert.equal(t('growth.welcome.title', { lang: 'en' }, { fairy: '' }).trim(), "Hi! I'm Pyxie");

  const testGuildId = '900000000000000001';
  const replies = [];
  const baseInteraction = {
    customId: 'onboard_lang:pt',
    guild: { id: testGuildId, name: 'Servidor Teste' },
    client: clientWithCommands,
    reply: async (payload) => replies.push(['reply', payload]),
    update: async (payload) => replies.push(['update', payload]),
    followUp: async (payload) => replies.push(['followUp', payload]),
  };
  await onboarding.handleWelcomeLanguageButton({
    ...baseInteraction,
    memberPermissions: new PermissionsBitField([PermissionFlagsBits.SendMessages]),
  });
  assert.equal(replies[0][0], 'reply', 'Sem Gerenciar Servidor: resposta privada e nada muda.');
  assert.equal(getLanguage(testGuildId), 'en');

  replies.length = 0;
  await onboarding.handleWelcomeLanguageButton({
    ...baseInteraction,
    memberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageGuild]),
  });
  assert.equal(replies[0][0], 'update', 'Com Gerenciar Servidor a mensagem é atualizada.');
  assert.equal(getLanguage(testGuildId), 'pt', 'Idioma do servidor trocado.');
  assert.ok(replies[0][1].embeds[0].toJSON().description.includes('Comece por aqui'), 'Boas-vindas re-renderizadas em PT.');
  assert.ok(replies[1][1].content.includes('Português'));
  console.log('  ✅ 5. Boas-vindas PT/EN com menções clicáveis e troca de idioma restrita a Gerenciar Servidor.');

  // 6. User App em servidor sem a Pyxie segue o idioma do Discord da pessoa
  assert.equal(getLanguage({ guildId: '900000000000000002', guild: null, locale: 'pt-BR' }), 'pt');
  assert.equal(getLanguage({ guildId: '900000000000000002', guild: null, locale: 'en-US' }), 'en');
  assert.equal(getLanguage({ guildId: '900000000000000002', locale: 'pt-BR' }), 'en', 'Servidor com a Pyxie mantém o padrão do servidor.');
  const registerSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'registerSlashCommands.js'), 'utf8');
  for (const name of ['py-tarot', 'py-album', 'py-dungeon']) {
    assert.ok(registerSource.includes(`'${name}'`), `${name} instalável na conta.`);
  }
  console.log('  ✅ 6. User App: idioma pela conta e comandos de módulo instaláveis.');
}

run()
  .then(() => console.log('🎉 tests/growthFunnel.test.js concluído com 100% de sucesso!'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    growthFunnel.resetForTests();
    fs.rmSync(tmpDir, { recursive: true, force: true });
    if (settingsSnapshot === null) {
      try { fs.unlinkSync(settingsFile); } catch (_) {}
    } else {
      fs.writeFileSync(settingsFile, settingsSnapshot, 'utf8');
    }
  });
