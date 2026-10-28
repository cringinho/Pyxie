const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('🧚 Testes da voz da Pyxie, comunidade, [Título] Nick e artes...');

process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-voice-'));

const voice = require('../src/services/pyxieVoice');
const radar = require('../src/services/newsRadar');
const titleNick = require('../src/services/titleNick');
const assets = require('../src/services/pyxieAssets');
const { saveCommunityConfig } = require('../src/services/communityConfig');
const { TRANSLATIONS } = require('../src/utils/i18n');

(async () => {
  try {
    // 1. Voz: fora da Cringelândia só falas prontas; Groq dentro, com filtro e reserva
    const outside = await voice.line('daily', { nickname: 'Ana' }, { inCringelandia: false, lang: 'pt', chat: async () => { throw new Error('não deveria chamar'); } });
    assert.equal(outside.source, 'fallback');
    assert.ok(outside.text.length > 0);
    let seenPrompt = '';
    const ok = await voice.line('daily', { nickname: 'Ana', userId: 'u1', streak: 3 }, {
      inCringelandia: true,
      lang: 'pt',
      chat: async (body) => {
        seenPrompt = body.messages.map((m) => m.content).join('\n');
        return { ok: true, data: { choices: [{ message: { content: '"Três dias seguidos? Hmpf, quase me impressionou."' } }] } };
      },
    });
    assert.equal(ok.source, 'groq');
    assert.equal(ok.text, 'Três dias seguidos? Hmpf, quase me impressionou.');
    assert.ok(seenPrompt.includes('sequência do diário: 3'), 'Contexto vai para o Groq');
    assert.equal((await voice.line('daily', { userId: 'u1' }, { inCringelandia: true, lang: 'pt' })).source, 'cache', 'Cache curto evita gastar cota');
    for (const bad of ['Vai votar no Lula, hein', 'olha <@123>', 'veja https://x.com', 'x'.repeat(200), 'que burra']) {
      assert.equal(voice.cleanLine(bad), null, `Filtro barra: ${bad.slice(0, 20)}`);
    }
    voice._resetCache();
    const failed = await voice.line('work', { userId: 'u2' }, { inCringelandia: true, lang: 'en', chat: async () => ({ ok: true, data: { choices: [{ message: { content: 'sua religião é...' } }] } }) });
    assert.equal(failed.source, 'fallback', 'Resposta barrada cai na fala pronta');
    const slow = await voice.line('tarot', { userId: 'u3' }, { inCringelandia: true, lang: 'pt', chat: () => new Promise(() => {}) });
    assert.equal(slow.source, 'fallback', 'Mais de 3 s cai na fala pronta');
    console.log('  ✅ 1. Voz da Pyxie: Groq só na Cringelândia, filtro, cache e reserva.');

    // 2. Radar: RSS e Atom; Reddit sem resumo; resumo só de notícia
    const rss = `<rss><channel><item><title><![CDATA[Lei do CIPTEA &amp; novidades]]></title><link>https://g1.example/ciptea</link><description>&lt;p&gt;Texto da notícia&lt;/p&gt;</description></item></channel></rss>`;
    const atom = `<feed><entry><title>Pergunta no Reddit</title><link href="https://www.reddit.com/r/autismobrasil/x"/><content>texto de uma pessoa</content></entry></feed>`;
    assert.deepEqual(radar.parseFeed(rss)[0], { title: 'Lei do CIPTEA & novidades', link: 'https://g1.example/ciptea', description: 'Texto da notícia' });
    assert.equal(radar.parseFeed(atom)[0].link, 'https://www.reddit.com/r/autismobrasil/x');
    let summarized = 0;
    const chat = async () => {
      summarized++;
      return { ok: true, data: { choices: [{ message: { content: 'Resumo neutro.' } }] } };
    };
    const fetchImpl = async (url) => ({ ok: true, text: async () => (url.includes('reddit') ? atom : rss) });
    const created = await radar.collect(['https://g1.example/rss', 'https://www.reddit.com/r/autismobrasil/.rss'], { fetchImpl, chat });
    assert.equal(created.length, 2);
    assert.equal(created.find((c) => !c.reddit).summary, 'Resumo neutro.');
    assert.equal(created.find((c) => c.reddit).summary, null, 'Reddit: só título e link');
    assert.equal(summarized, 1);
    assert.equal((await radar.collect(['https://g1.example/rss'], { fetchImpl, chat })).length, 0, 'Não repete itens');
    assert.ok(radar.takePending(created[0].id));
    assert.equal(radar.takePending(created[0].id), null, 'Aprovação só uma vez');
    console.log('  ✅ 2. Radar com aprovação, sem copiar texto do Reddit.');

    // 3. Comunidade: moedinhas com teto (AGENTS §5)
    const cfg = saveCommunityConfig('1453890868980482090', { hyperfocus: { rewardCoins: 999, minChars: 1 } });
    assert.equal(cfg.hyperfocus.rewardCoins, 30, 'Teto de 30 moedinhas');
    assert.equal(cfg.hyperfocus.minChars, 50);
    console.log('  ✅ 3. Fórum de hiperfocos com teto de moedinhas.');

    // 4. [Título] Nick: 32 caracteres, título preservado
    assert.equal(titleNick.composeNick('Rainha', 'Ana'), '[Rainha] Ana');
    const long = titleNick.composeNick('Imperatriz das Galáxias', 'Anastácia Beatriz');
    assert.ok(long.length <= 32 && long.startsWith('[Imperatriz das Galáxias] '), long);
    const member = { id: 'm1', nickname: 'Aninha', manageable: true, guild: { id: 'g1' }, user: { username: 'ana' }, setNickname: async (n) => (member.nickname = n) };
    let res = await titleNick.toggle(member, 'Rainha');
    assert.equal(res.enabled, true);
    assert.equal(member.nickname, '[Rainha] Aninha');
    await titleNick.sync(member, 'Fada');
    assert.equal(member.nickname, '[Fada] Aninha');
    res = await titleNick.toggle(member, 'Fada');
    assert.equal(res.enabled, false);
    assert.equal(member.nickname, 'Aninha', 'Desligar devolve o apelido original');
    console.log('  ✅ 4. [Título] Nick dentro de 32 caracteres.');

    // 5. Artes: lista real do disco, marcação e crédito
    const list = assets.listAssets();
    assert.ok(list.length > 0 && list.every((a) => fs.existsSync(path.join(__dirname, '..', 'public', a.url))), 'Lista vem do disco');
    assert.throws(() => assets.updateAsset('nao-existe.png', { origin: 'ai' }));
    console.log('  ✅ 5. Registro de artes ligado aos arquivos reais.');

    // 6. Textos PT/EN
    const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`])).sort();
    for (const ns of ['pyxieVoice', 'hyperfocus', 'radar', 'titleNick']) {
      assert.deepEqual(keys(TRANSLATIONS.pt[ns]), keys(TRANSLATIONS.en[ns]), `${ns} com paridade`);
    }
    console.log('  ✅ 6. Textos PT/EN.');

    console.log('🎉 [TEST] Voz, comunidade, título no apelido e artes validados!');
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
