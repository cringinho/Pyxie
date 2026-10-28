const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🎨 Testes dos embeds personalizáveis e do rostinho no rodapé...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-embeds-'));
const eo = require('../src/services/embedOverrides');

const G = '1453890868980482090';
const OTHER = '999999999999999999';

(async () => {
  try {
    // 1. Chave estável: o mesmo embed para pessoas e números diferentes vira a mesma entrada
    const a = eo.embedKey('/py-wallet', { title: '💰 Carteira de Maria (12 moedas)' }, ['Maria']);
    const b = eo.embedKey('/py-wallet', { title: '💰 Carteira de João <:coin:123456789012345678> (9 moedas)' }, ['João']);
    assert.equal(a.key, b.key);
    assert.notEqual(a.key, eo.embedKey('/py-daily', { title: '💰 Carteira de Maria' }, ['Maria']).key, 'Comando faz parte da chave');
    assert.equal(eo.embedKey(null, { description: 'Só descrição' }).command, 'automatico');
    console.log('  ✅ 1. Chave estável por comando e título, sem nomes, números e emojis.');

    // 2. Mudanças: cor, {original}, {emoji:...}, imagens, troca de emoji e limites do Discord
    const embed = { title: '🪙 Diário', description: 'Você ganhou 🪙 50', color: 1, footer: { text: 'Pyxie' }, fields: [{ name: '🪙 Saldo', value: '100 🪙' }] };
    const o = eo.normalizeOverride({ color: '#FF00AA', title: '✨ {original}', description: '{original}\n\n-# volte amanhã', thumbnailUrl: 'https://x.test/a.png', imageUrl: 'javascript:1', emojiSwaps: [{ from: '🪙', to: '<:pcoin:123456789012345678>' }] });
    assert.equal(o.imageUrl, '', 'Só links https');
    const out = eo.applyToEmbed(embed, o);
    assert.equal(out.color, 0xff00aa);
    assert.equal(out.title, '✨ <:pcoin:123456789012345678> Diário');
    assert.ok(out.description.endsWith('-# volte amanhã') && out.description.includes('<:pcoin:123456789012345678> 50'));
    assert.equal(out.fields[0].value, '100 <:pcoin:123456789012345678>');
    assert.equal(out.thumbnail.url, 'https://x.test/a.png');
    assert.equal(embed.title, '🪙 Diário', 'Original intacto');
    const long = eo.applyToEmbed({ title: 'x' }, eo.normalizeOverride({ title: `${'y'.repeat(280)}` }));
    assert.ok(long.title.length <= 256);
    console.log('  ✅ 2. Cor, textos com {original}, imagens, troca de emojis e limites.');

    // 3. Rostinho no rodapé: escolhido pelo tom, nunca por cima de um ícone que já existe
    assert.equal(eo.pickMood({ title: '❌ Não consegui' }), 'worried');
    assert.equal(eo.pickMood({ title: '🏆 Vitória!' }), 'happy');
    assert.equal(eo.pickMood({ description: 'Você perdeu a rodada' }), 'sad');
    assert.equal(eo.pickMood({ title: '🔮 Sua carta' }), 'smile');
    assert.ok(eo.decorateFooter({ title: 'oi', footer: { text: 'Pyxie' } }).footer.icon_url.endsWith('/assets/pyxie/sticker/footer/smile.png'));
    assert.equal(eo.decorateFooter({ footer: { text: 'a', icon_url: 'https://x.test/i.png' } }).footer.icon_url, 'https://x.test/i.png');
    assert.equal(eo.decorateFooter({ title: 'sem rodapé' }).footer, undefined, 'Sem rodapé, sem ícone');
    assert.equal(eo.applyToEmbed(embed, eo.normalizeOverride({ footerIcon: 'none' })).footer.icon_url, undefined);
    assert.ok(eo.applyToEmbed(embed, eo.normalizeOverride({ footerIcon: 'sad' })).footer.icon_url.endsWith('/sad.png'));
    // Miniatura automática só em embed curto de comemoração, sem imagem própria; 'none' tira
    assert.ok(eo.decorateThumb({ title: '🏆 Vitória!', description: 'curto' }).thumbnail.url.endsWith('/sticker/sticker_win_victory.png'));
    assert.equal(eo.decorateThumb({ title: '🔮 Sua carta', description: 'curto' }).thumbnail, undefined, 'Embed comum fica sem');
    assert.equal(eo.decorateThumb({ title: '🏆 Vitória!', description: 'x'.repeat(600) }).thumbnail, undefined, 'Embed longo fica sem');
    assert.equal(eo.decorateThumb({ title: '🏆 Vitória!', image: { url: 'https://x.test/i.png' } }).thumbnail, undefined, 'Com imagem fica sem');
    assert.equal(eo.applyToEmbed({ title: '🏆 Vitória!', thumbnail: { url: 'https://x.test/t.png' } }, eo.normalizeOverride({ thumbnailUrl: 'none' })).thumbnail, undefined);
    for (const rel of ['pyxie_pixelart.png', 'sticker/sticker_win_victory.png']) assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'pyxie', rel)));
    for (const mood of eo.FOOTER_MOODS) assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'pyxie', 'sticker', 'footer', `${mood}.png`)), `Arquivo ${mood}.png existe`);
    console.log('  ✅ 3. Rostinho no rodapé pelo tom, com escolha manual e opção sem rostinho.');

    // 4. Corpo dos envios: canal, resposta de interação e outros servidores
    const k = eo.embedKey('/py-daily', embed, []);
    eo.setOverride(G, k.key, { color: '#00ff00' });
    eo.setGlobalSwaps(G, [{ from: '🎲', to: '<:dice:123456789012345678>' }]);
    const channelBody = { content: 'oi', embeds: [embed], components: [{ type: 1, components: [{ type: 2, custom_id: 'x', emoji: { name: '🎲' } }] }] };
    const r1 = eo.transformBody(G, channelBody, { command: '/py-daily', names: [] });
    assert.equal(r1.body.embeds[0].color, 0x00ff00);
    assert.deepEqual(r1.body.components[0].components[0].emoji, { id: '123456789012345678', name: 'dice', animated: false });
    assert.equal(r1.body.content, 'oi', 'Texto avulso não muda');
    assert.equal(r1.seen.length, 1);
    const r2 = eo.transformBody(G, { type: 4, data: { embeds: [embed] } }, { command: '/py-daily' });
    assert.equal(r2.body.type, 4);
    assert.equal(r2.body.data.embeds[0].color, 0x00ff00);
    assert.equal(eo.transformBody(G, { type: 5, data: { flags: 64 } }, {}).seen.length, 0, 'Resposta adiada não mexe');
    const r3 = eo.transformBody(OTHER, { embeds: [embed] }, { command: '/py-daily' });
    assert.equal(r3.body.embeds[0].color, 1, 'Outro servidor: sem as mudanças da Cringelândia');
    assert.ok(r3.body.embeds[0].footer.icon_url, 'Outro servidor: ganha o rostinho');
    assert.equal(r3.seen.length, 0, 'Outro servidor: fora do catálogo');
    console.log('  ✅ 4. Envios de canal e de interação mudam só na Cringelândia; o rostinho vale em todo lugar.');

    // 5. Gancho no REST: contexto do comando, catálogo e mensagens enviadas
    const sent = [];
    const fakeClient = {
      emit: () => true,
      application: { id: '111111111111111111' },
      channels: { cache: new Map([['222222222222222222', { guildId: G }]]) },
      rest: { request: async (opts) => (sent.push(opts), { id: '333333333333333333' }) },
    };
    eo.install(fakeClient);
    await eo._als.run({ guildId: G, command: '/py-daily', names: [] }, () => fakeClient.rest.request({ method: 'POST', fullRoute: '/channels/222222222222222222/messages', body: { embeds: [embed] } }));
    assert.equal(sent[0].body.embeds[0].color, 0x00ff00);
    await fakeClient.rest.request({ method: 'GET', fullRoute: '/channels/222222222222222222/messages', body: undefined });
    assert.equal(sent[1].body, undefined, 'Leituras passam direto');
    eo.flushCatalogs();
    const list = eo.listCatalog(G);
    const item = list.find((e) => e.key === k.key);
    assert.ok(item && item.customized && item.sentCount === 1);
    const found = eo.getEntry(G, k.key);
    assert.equal(found.entry.sent[0].messageId, '333333333333333333');
    console.log('  ✅ 5. Gancho do REST aplica, cataloga e guarda as mensagens de canal.');

    // 6. Atualizar mensagens já enviadas (só embeds, sem marcar ninguém)
    const calls = [];
    const res = await eo.updateSent(G, k.key, async (method, route, body) => {
      calls.push({ method, route, body });
      return method === 'GET' ? { embeds: [{ title: 'velho' }] } : {};
    });
    assert.deepEqual(res, { updated: 1, failed: 0 });
    const patch = calls.find((c) => c.method === 'PATCH');
    assert.equal(patch.body.embeds[0].color, 0x00ff00);
    assert.deepEqual(patch.body.allowed_mentions, { parse: [] });
    assert.equal(patch.body.components, undefined, 'Botões ficam como estão');
    console.log('  ✅ 6. Atualiza as mensagens já enviadas.');

    // 7. Voltar ao padrão apaga a mudança
    eo.setOverride(G, k.key, {});
    assert.equal(eo.loadOverrides(G).embeds[k.key], undefined);
    console.log('  ✅ 7. Voltar ao padrão.');

    // 8. Textos do painel PT/EN
    const src = fs.readFileSync(path.join(__dirname, '..', 'client', 'src', 'dashboard', 'i18n.js'), 'utf8');
    const keys = (lang) => {
      const block = src.split(lang === 'pt' ? /\bpt:\s*{/ : /\ben:\s*{/)[1] || '';
      return [...block.matchAll(/"(embeds\.[\w.]+)"/g)].map((m) => m[1]);
    };
    const pt = new Set(keys('pt'));
    const en = new Set(keys('en'));
    assert.ok(pt.size > 30);
    for (const key of en) assert.ok(pt.has(key), `Falta em PT: ${key}`);
    console.log('  ✅ 8. Textos do painel em PT e EN.');
    console.log('🎉 [TEST] Embeds personalizáveis validados!');
    process.exit(0);
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
