const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🛡️ Testes de moderação (blindagem, brigas) e monitor de links...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-mod-'));

const shieldMode = require('../src/services/shieldMode');
const watch = require('../src/services/conflictWatch');
const sentinel = require('../src/services/linkSentinel');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';

(async () => {
  try {
    // 1. Blindagem: cria a regra uma vez, depois só atualiza; desligar não apaga
    const calls = [];
    let rules = [];
    const discord = async (method, route, body) => {
      calls.push({ method, route, body });
      if (method === 'GET') return rules;
      if (method === 'POST') {
        const rule = { id: '700000000000000001', ...body };
        rules.push(rule);
        return rule;
      }
      if (method === 'PATCH') return { id: route.split('/').pop(), ...body };
      return {};
    };
    const on = await shieldMode.applyShield(G, { enabled: true, terms: 'Bolsonaro\nLula, lula', exemptChannelIds: ['111111111111111111'] }, { discord, defaultMessage: 'pausado' });
    assert.equal(on.ruleId, '700000000000000001');
    const post = calls.find((c) => c.method === 'POST');
    assert.equal(post.body.trigger_type, 1);
    assert.deepEqual(post.body.trigger_metadata.keyword_filter, ['bolsonaro', 'lula'], 'Termos limpos e sem repetição');
    assert.deepEqual(post.body.actions[0], { type: 1, metadata: { custom_message: 'pausado' } });
    assert.deepEqual(post.body.exempt_channels, ['111111111111111111']);
    assert.equal(post.body.enabled, true);
    calls.length = 0;
    const off = await shieldMode.applyShield(G, { enabled: false }, { discord, defaultMessage: 'pausado' });
    assert.equal(calls[0].method, 'PATCH', 'Desligar atualiza a mesma regra');
    assert.equal(calls[0].body.enabled, false);
    assert.deepEqual(off.terms, ['bolsonaro', 'lula'], 'Termos guardados para a próxima vez');
    console.log('  ✅ 1. Modo blindagem com AutoMod nativo.');

    // 2. Detector: mais de 4 respostas em 2 min dispara uma vez; respostas espaçadas não
    const base = Date.now();
    let key = null;
    for (let i = 0; i < 5; i++) {
      key = watch.trackReply({ guildId: G, channelId: 'c1', authorId: i % 2 ? 'a' : 'b', repliedToId: i % 2 ? 'b' : 'a', now: base + i * 1000 }) || key;
    }
    assert.ok(key, 'Cinco respostas rápidas disparam');
    for (let i = 0; i < 5; i++) {
      assert.equal(watch.trackReply({ guildId: G, channelId: 'c2', authorId: 'x', repliedToId: 'y', now: base + i * 60000 }), null);
    }
    assert.equal(watch.trackReply({ guildId: G, channelId: 'c3', authorId: 'x', repliedToId: 'x', now: base }), null, 'Responder a si mesmo não conta');
    console.log('  ✅ 2. Detector de troca rápida.');

    // 3. Degraus: aviso → modo lento → castigo; volta ao começo depois de 10 min de calma
    assert.equal(watch.nextLevel('par', base), 1);
    assert.equal(watch.nextLevel('par', base + 60000), 2);
    assert.equal(watch.nextLevel('par', base + 120000), 3);
    assert.equal(watch.nextLevel('par', base + 180000), 3, 'Nunca passa do castigo (sem banimento)');
    assert.equal(watch.nextLevel('par', base + 30 * 60000), 1);
    console.log('  ✅ 3. Ações graduais sem banimento.');

    // 4. Groq: só "hostil" aciona; erro do Groq vira "desconhecida"
    const fakeChat = (label) => async () => ({ ok: true, data: { choices: [{ message: { content: JSON.stringify({ label }) } }] } });
    assert.equal((await watch.classify([{ author: 'a', content: 'kkk' }], { chat: fakeChat('animada') })).label, 'animada');
    assert.equal((await watch.classify([{ author: 'a', content: 'x' }], { chat: fakeChat('hostil') })).label, 'hostil');
    assert.equal((await watch.classify([], { chat: async () => ({ ok: false, error: 'missing_api_key' }) })).label, 'desconhecida');
    console.log('  ✅ 4. Classificação pelo Groq com reserva.');

    // 5. Modo lento volta ao valor anterior, mesmo depois de reinício (estado em arquivo)
    watch.rememberSlowmode(G, '222222222222222222', 5, base - 1);
    const restored = [];
    const client = { channels: { fetch: async () => ({ setRateLimitPerUser: async (v) => restored.push(v) }) } };
    await watch.restoreExpiredSlowmodes(client, [G], base);
    assert.deepEqual(restored, [5]);
    assert.deepEqual(watch.loadState(G).slowmodes, {});
    console.log('  ✅ 5. Modo lento temporário com volta garantida.');

    // 6. Monitor de links: alerta só na 2ª falha; redirecionamento para outro domínio vira proposta
    const down = sentinel.upsertLink({ url: 'https://quebrado.example/guia', label: 'Guia CIPTEA' });
    const moved = sentinel.upsertLink({ url: 'https://antigo.example/', fallbackUrl: 'https://reserva.example/' });
    const same = sentinel.upsertLink({ url: 'https://site.example/a' });
    assert.throws(() => sentinel.upsertLink({ url: 'javascript:alert(1)' }));
    const fetchImpl = async (url, init = {}) => {
      if (url.startsWith('https://archive.org/wayback')) return { json: async () => ({ archived_snapshots: { closest: { available: true, url: 'https://web.archive.org/x' } } }) };
      if (url.startsWith('https://quebrado.example')) return { status: 404, headers: { get: () => null } };
      if (url.startsWith('https://antigo.example')) return { status: 301, headers: { get: () => 'https://golpe.example/' } };
      if (url === 'https://site.example/a') return { status: 301, headers: { get: () => '/b' } };
      return { status: 200, headers: { get: () => null } };
    };
    let alerts = await sentinel.checkAll({ fetchImpl });
    assert.equal(alerts.filter((a) => a.kind === 'down').length, 0, 'Uma falha não alerta');
    assert.equal(alerts.find((a) => a.kind === 'redirect').proposed, 'https://golpe.example/');
    assert.equal(sentinel.listLinks().find((l) => l.id === moved.id).url, 'https://antigo.example/', 'Outro domínio não troca sozinho');
    assert.equal(sentinel.listLinks().find((l) => l.id === same.id).url, 'https://site.example/b', 'Mesmo domínio troca');
    alerts = await sentinel.checkAll({ fetchImpl });
    const downAlert = alerts.find((a) => a.kind === 'down');
    assert.equal(downAlert.link.id, down.id);
    assert.equal(downAlert.diagnosis, 'HTTP 404');
    assert.equal(downAlert.replacement, 'https://web.archive.org/x', 'Sem reserva, usa o Web Archive');
    assert.equal(sentinel.resolveLiveUrl('https://quebrado.example/guia'), 'https://web.archive.org/x');
    alerts = await sentinel.checkAll({ fetchImpl });
    assert.ok(!alerts.some((a) => a.kind === 'down'), 'Não repete o alerta todo dia');
    sentinel.updateLink(down.id, { mutedUntil: Date.now() + 1000 });
    assert.ok(sentinel.listLinks().find((l) => l.id === down.id).mutedUntil > Date.now());
    console.log('  ✅ 6. Monitor de links: 2 falhas, Web Archive e proposta de troca.');

    // 7. Horário: roda uma vez por dia a partir das 4h de Brasília
    const at3 = Date.UTC(2026, 9, 28, 6, 0); // 03:00 BRT
    const at5 = Date.UTC(2026, 9, 28, 8, 0); // 05:00 BRT
    assert.equal(sentinel.shouldRunDaily(at3), false);
    assert.equal(sentinel.shouldRunDaily(at5), true);
    sentinel.markDailyRun(at5);
    assert.equal(sentinel.shouldRunDaily(at5 + 3600000), false);
    console.log('  ✅ 7. Verificação diária às 4h.');

    // 8. Textos bilíngues e mensagem do AutoMod dentro do limite de 150
    for (const ns of ['moderation', 'linkSentinel']) {
      const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`])).sort();
      assert.deepEqual(keys(TRANSLATIONS.pt[ns]), keys(TRANSLATIONS.en[ns]), `${ns} com paridade`);
    }
    assert.ok(TRANSLATIONS.pt.moderation.shieldBlocked.length <= 150 && TRANSLATIONS.en.moderation.shieldBlocked.length <= 150);
    console.log('  ✅ 8. Textos PT/EN.');

    console.log('🎉 [TEST] Moderação e monitor de links validados!');
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
