const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('✉️ Testes do estúdio de mensagens...');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-studio-'));
process.env.PYXIE_DATA_DIR = tmpDir;
process.env.DISCORD_TOKEN = 'test-token';

const studio = require('../src/services/messageStudio');
const store = require('../src/services/messageStudioStore');
const mentionPrefs = require('../src/services/mentionPrefs');
const { HOMOLOGATION_CHANNEL_ID } = require('../src/config/scopes');
const { TRANSLATIONS } = require('../src/utils/i18n');

const GUILD = '111111111111111111';
const OTHER_GUILD = '999999999999999999';
const CHANNEL = '222222222222222222';
const FOREIGN_CHANNEL = '333333333333333333';
const ROLE = '444444444444444444';

(async () => {
  try {
    // 1. Validação dos limites do Discord
    const big = studio.normalizeMessage({
      name: 'Grande',
      embeds: [{ title: 'x'.repeat(257), description: 'ok', fields: Array.from({ length: 26 }, () => ({ name: 'a', value: 'b' })) }],
    });
    const codes = studio.validateMessage(big).map((e) => `${e.code}:${e.path}`);
    assert(codes.includes('too_long:embeds.0.title'), 'Título acima de 256 é recusado');
    assert(codes.includes('too_many:embeds.0.fields'), 'Mais de 25 campos é recusado');
    const total = studio.normalizeMessage({
      name: 'Total',
      embeds: [{ description: 'a'.repeat(4000) }, { description: 'b'.repeat(2500) }],
    });
    assert(studio.validateMessage(total).some((e) => e.code === 'too_long' && e.path === 'embeds'), 'Soma acima de 6000 é recusada');
    const buttons = studio.normalizeMessage({
      name: 'Botões',
      envelope: { content: 'oi' },
      buttons: Array.from({ length: 6 }, (_, i) => ({ id: `b${i}`, label: 'x', row: 0, action: { type: 'link', url: 'https://pyxie.com.br' } })),
    });
    assert(studio.validateMessage(buttons).some((e) => e.path === 'buttons.row0'), 'Mais de 5 botões numa fileira é recusado');
    assert(
      studio.validateMessage(studio.normalizeMessage({ name: 'L', envelope: { content: 'oi' }, buttons: [{ label: 'x', action: { type: 'link', url: 'http://inseguro' } }] }))
        .some((e) => e.code === 'invalid_url'),
      'Link sem https é recusado'
    );
    console.log('  ✅ 1. Limites do Discord validados antes de salvar.');

    // 2. Formato novo (Components V2): sem texto avulso nem embeds, flag correta.
    const v2Bad = studio.normalizeMessage({ name: 'V2', mode: 'v2', envelope: { content: 'avulso' }, embeds: [{ title: 'x' }], v2: { blocks: [{ type: 'text', content: 'oi' }] } });
    const v2Codes = studio.validateMessage(v2Bad).map((e) => e.code);
    assert(v2Codes.includes('v2_no_content') && v2Codes.includes('v2_no_embeds'), 'V2 não aceita texto avulso nem embeds');
    const v2 = studio.normalizeMessage({
      name: 'Boas-vindas V2',
      mode: 'v2',
      v2: {
        accentColor: '#e60067',
        blocks: [
          { type: 'text', content: '### Oi {server}! {emoji:map}' },
          { type: 'separator', spacing: 'large' },
          { type: 'section', text: 'Pegue seu cargo', accessory: { type: 'button', buttonId: 'cargo' } },
          { type: 'gallery', images: [{ url: 'https://cdn.discordapp.com/emojis/1551355962974273546.png' }] },
        ],
      },
      buttons: [{ id: 'cargo', label: 'Quero', style: 'success', action: { type: 'role', roleId: ROLE } }],
    });
    assert.deepEqual(studio.validateMessage(v2), []);
    const v2Payload = studio.buildPayload(v2, { guild: { name: 'Cringelândia' } });
    assert.equal(v2Payload.flags & studio.MESSAGE_FLAGS.IS_COMPONENTS_V2, studio.MESSAGE_FLAGS.IS_COMPONENTS_V2);
    assert.equal(v2Payload.content, undefined);
    assert.equal(v2Payload.embeds, undefined);
    const container = v2Payload.components[0];
    assert.equal(container.type, 17);
    assert.equal(container.accent_color, 0xe60067);
    assert.match(container.components[0].content, /Oi Cringelândia! <:map:1551355962974273546>/, 'Variáveis e {emoji:chave} resolvidos');
    assert.equal(container.components[2].accessory.custom_id, 'pyxs:role:boas-vindas-v2:cargo');
    assert.equal(studio.resolveText('{emoji:portalframe98}'), '', 'Portal do Minecraft é proibido (AGENTS §7)');
    assert(!studio.listAppEmojis().some((e) => e.id === '1548444170488778954'), 'Portal fora do seletor de emojis');
    console.log('  ✅ 2. Formato novo do Discord montado com Container, seção, galeria e botão.');

    // 3. Clássico: menções desligadas por padrão e envio silencioso.
    const classic = studio.normalizeMessage({
      name: 'Regras',
      envelope: { content: 'Bem-vinda {user}!', silent: true },
      embeds: [{ title: 'Regras de {server}', fields: [{ name: 'Respeito', value: 'Sempre', inline: true }], timestamp: true }],
      buttons: [{ label: 'Site', action: { type: 'link', url: 'https://pyxie.com.br' } }],
    });
    assert.deepEqual(studio.validateMessage(classic), []);
    const p = studio.buildPayload(classic, { user: { id: '555555555555555555' }, guild: { name: 'Cring' } });
    assert.equal(p.content, 'Bem-vinda <@555555555555555555>!');
    assert.deepEqual(p.allowed_mentions.parse, [], 'Ninguém é marcado sem querer');
    assert.equal(p.flags, studio.MESSAGE_FLAGS.SUPPRESS_NOTIFICATIONS);
    assert.equal(p.embeds[0].title, 'Regras de Cring');
    assert.equal(p.components[0].components[0].url, 'https://pyxie.com.br');
    console.log('  ✅ 3. Formato clássico com variáveis, silencioso e sem pings.');

    // 4. Histórico de 10 versões e restauração.
    for (let i = 0; i < 12; i++) {
      const r = store.saveMessage(GUILD, { name: 'Regras', envelope: { content: `v${i}` } });
      assert.equal(r.ok, true);
    }
    const saved = store.getMessage(GUILD, 'regras');
    assert.equal(saved.envelope.content, 'v11');
    assert.equal(saved.history.length, 10, 'Guarda as últimas 10 versões');
    assert.equal(saved.history[0].envelope.content, 'v10');
    store.restoreVersion(GUILD, 'regras', 0);
    assert.equal(store.getMessage(GUILD, 'regras').envelope.content, 'v10');
    assert.equal(store.saveMessage(GUILD, { name: 'Vazia' }).ok, false, 'Mensagem vazia não é salva');
    assert.equal(store.listMessages(OTHER_GUILD).length, 0, 'Cada servidor tem as próprias mensagens');
    console.log('  ✅ 4. Histórico de versões e isolamento por servidor.');

    // 5. Envio pela REST: canal de outro servidor é recusado; envio registrado; atualização das enviadas.
    const calls = [];
    const fakeFetch = async (url, init = {}) => {
      calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null });
      const ok = (body) => ({ ok: true, status: 200, json: async () => body });
      if (url.endsWith(`/channels/${CHANNEL}`)) return ok({ id: CHANNEL, guild_id: GUILD });
      if (url.endsWith(`/channels/${FOREIGN_CHANNEL}`)) return ok({ id: FOREIGN_CHANNEL, guild_id: OTHER_GUILD });
      if (url.endsWith(`/guilds/${GUILD}`)) return ok({ id: GUILD, name: 'Cring', icon: null });
      if (url.endsWith('/users/@me')) return ok({ id: '1', avatar: null });
      if (init.method === 'POST' && url.includes('/messages')) return ok({ id: '777777777777777777' });
      if (init.method === 'PATCH') return ok({});
      return { ok: false, status: 404, json: async () => ({ code: 10003 }) };
    };
    await assert.rejects(store.sendMessage(GUILD, 'regras', FOREIGN_CHANNEL, { fetchImpl: fakeFetch }), (e) => e.code === 'channel_not_in_guild');
    const sent = await store.sendMessage(GUILD, 'regras', CHANNEL, { fetchImpl: fakeFetch });
    assert.equal(sent.messageId, '777777777777777777');
    assert.equal(store.getMessage(GUILD, 'regras').sent.length, 1);
    const updated = await store.updateSent(GUILD, 'regras', { fetchImpl: fakeFetch });
    assert.equal(updated[0].ok, true, 'Mensagens já enviadas são atualizadas');
    console.log('  ✅ 5. Envio pela REST, canal conferido e atualização das enviadas.');

    // 6. Prévia de homologação: menções viram texto e allowed_mentions vazio.
    store.saveMessage(GUILD, { name: 'Ping', envelope: { content: 'Oi <@555555555555555555> e <@&444444444444444444> @everyone' } });
    calls.length = 0;
    await store.sendHomologationPreview(GUILD, 'ping', { fetchImpl: fakeFetch });
    const previewCall = calls.find((c) => c.url.endsWith(`/channels/${HOMOLOGATION_CHANNEL_ID}/messages`));
    assert(previewCall, 'Prévia vai para o canal de homologação');
    assert.match(previewCall.body.content, /`<@555555555555555555>`/);
    assert.match(previewCall.body.content, /`@everyone`/);
    assert.deepEqual(previewCall.body.allowed_mentions, { parse: [], users: [], roles: [], replied_user: false });
    console.log('  ✅ 6. Prévia real blindada contra pings.');

    // 7. Modo silencioso nas marcações.
    assert.equal(mentionPrefs.toggleSilent(GUILD, '555555555555555555'), true);
    const m = mentionPrefs.formatMentions(GUILD, [
      { id: '555555555555555555', displayName: 'Ana' },
      { id: '666666666666666666', displayName: 'Bia' },
    ]);
    assert.equal(m.text, '**Ana**, <@666666666666666666>');
    assert.deepEqual(m.allowedUserIds, ['666666666666666666']);
    assert.equal(mentionPrefs.toggleSilent(GUILD, '555555555555555555'), false);
    console.log('  ✅ 7. Preferência de marcação silenciosa.');

    // 7b. Agendador: envio agendado uma vez, repetição só com atividade mínima, fonte de fórum e webhook.
    const delivery = require('../src/services/messageStudioDelivery');
    const posts = [];
    let afterCount = 0;
    const deliveryFetch = async (url, init = {}) => {
      const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
      const method = init.method || 'GET';
      if (method === 'GET' && url.endsWith(`/channels/${CHANNEL}`)) return ok({ id: CHANNEL, guild_id: GUILD, type: 0 });
      if (method === 'GET' && url.endsWith(`/guilds/${GUILD}`)) return ok({ id: GUILD, name: 'Cring', icon: null });
      if (method === 'GET' && url.endsWith('/users/@me')) return ok({ id: '1', avatar: null });
      if (method === 'GET' && url.includes('/messages?after=')) return ok(Array.from({ length: afterCount }, () => ({ author: { bot: false } })));
      if (method === 'GET' && url.includes('/channels/888888888888888888/messages')) {
        return ok([
          { author: { id: '2' }, content: 'outra pessoa' },
          { author: { id: '214153735281180673' }, content: 'Texto do dono no fórum', attachments: [{ url: 'https://cdn.example/arte.png' }], embeds: [] },
        ]);
      }
      if (method === 'GET' && url.endsWith(`/channels/${CHANNEL}/webhooks`)) return ok([]);
      if (method === 'POST' && url.endsWith(`/channels/${CHANNEL}/webhooks`)) return ok({ id: '5', token: 'hooktoken', application_id: '1' });
      if (method === 'POST') {
        posts.push({ url, body: JSON.parse(init.body) });
        return ok({ id: String(900000000000000000 + posts.length) });
      }
      if (method === 'DELETE') return ok({}, 204);
      return { ok: false, status: 404, json: async () => ({}) };
    };
    const at = Date.now() - 1000;
    const scheduled = store.saveMessage(GUILD, {
      name: 'Agendada',
      envelope: { content: 'base', identity: { useWebhook: true, username: 'Pyxie Avisos', avatarUrl: 'https://cdn.example/a.png' } },
      delivery: {
        schedule: { at, channelId: CHANNEL },
        repeat: { everyHours: 1, minMessages: 3, channelId: CHANNEL },
        source: { threadId: '888888888888888888', authorId: '214153735281180673' },
      },
    });
    assert.equal(scheduled.ok, true);
    await delivery.tick({ now: Date.now(), fetchImpl: deliveryFetch });
    const webhookPost = posts.find((p) => p.url.includes('/webhooks/5/hooktoken'));
    assert(webhookPost, 'Identidade própria envia pelo webhook da Pyxie');
    assert.equal(webhookPost.body.username, 'Pyxie Avisos');
    assert.match(webhookPost.body.content, /Texto do dono no fórum\nhttps:\/\/cdn\.example\/arte\.png/, 'Texto puxado do fórum, anexo como link');
    const firstRound = posts.length;
    assert.equal(firstRound, 2, 'Agendamento e primeira repetição enviados');
    await delivery.tick({ now: Date.now() + 2 * 3600000, fetchImpl: deliveryFetch });
    assert.equal(posts.length, firstRound, 'Repetição não sai sem atividade mínima no canal');
    afterCount = 3;
    await delivery.tick({ now: Date.now() + 3 * 3600000, fetchImpl: deliveryFetch });
    assert.equal(posts.length, firstRound + 1, 'Repetição sai quando o canal teve mensagens suficientes');
    assert.equal(posts.filter((p) => p.url.includes('/webhooks/')).length, posts.length, 'Agendamento não repete o envio único');
    console.log('  ✅ 7b. Agendamento, repetição com atividade mínima, fonte de fórum e webhook.');

    // 7c. DM de parceria pelo fórum (plano 5.4): copia a última mensagem do dono e avisa o resultado.
    const partnerships = require('../src/modules/partnerships/partnershipManager');
    const OWNER = '214153735281180673';
    const reports = [];
    const dms = [];
    const ownerUser = { send: async (p) => reports.push(p) };
    const fakeThreadMessages = new Map([
      ['m2', { author: { id: '2' }, content: 'não é do dono', attachments: new Map(), embeds: [] }],
      ['m1', { author: { id: OWNER }, content: 'Bem-vinda à rede de parcerias!', attachments: new Map([['a', { url: 'https://cdn.example/banner.png' }]]), embeds: [] }],
    ]);
    partnerships.client = {
      channels: { fetch: async (id) => (id === '777777777777777777' ? { messages: { fetch: async () => fakeThreadMessages } } : null) },
      users: { fetch: async () => ownerUser },
    };
    partnerships.config.dmSource = { threadId: '777777777777777777', authorId: OWNER, reportChannelId: '' };
    const partner = { id: '555555555555555555', send: async (p) => dms.push(p) };
    const r1 = await partnerships.sendApprovalDm(partner, { projectName: 'Projeto' }, 'pt');
    assert.equal(r1.mode, 'forum');
    assert.match(dms[0].content, /Bem-vinda à rede de parcerias!\nhttps:\/\/cdn\.example\/banner\.png/);
    assert.match(reports[0].content, /Mandei para <@555555555555555555>/);
    const closed = { id: '555555555555555555', send: async () => { const e = new Error('closed'); e.code = 50007; throw e; } };
    const r2 = await partnerships.sendApprovalDm(closed, { projectName: 'Projeto' }, 'pt');
    assert.equal(r2.mode, 'failed');
    assert.match(reports.at(-1).content, /DM de <@555555555555555555> está fechada/);
    fakeThreadMessages.delete('m1');
    const r3 = await partnerships.sendApprovalDm(partner, { projectName: 'Projeto' }, 'pt');
    assert.equal(r3.mode, 'missing');
    assert.match(reports.at(-1).content, /Não achei seu texto/);
    partnerships.config.dmSource = { threadId: '', authorId: '', reportChannelId: '' };
    const r4 = await partnerships.sendApprovalDm(partner, { projectName: 'Projeto' }, 'pt');
    assert.equal(r4.mode, 'fixed', 'Sem fonte configurada usa o texto fixo');
    console.log('  ✅ 7c. DM de parceria pelo fórum com retorno ao dono.');

    // 8. Textos do estúdio em pt e en.
    assert.deepEqual(Object.keys(TRANSLATIONS.pt.messageStudio).sort(), Object.keys(TRANSLATIONS.en.messageStudio).sort());
    console.log('  ✅ 8. Textos do estúdio bilíngues.');

    console.log('🎉 [TEST] Estúdio de mensagens validado!');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
