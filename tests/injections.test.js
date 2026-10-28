const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

console.log('💉 Testes das Injeções (cargos prontos com bandeiras e painel de escolha)...');
process.env.PYXIE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-inject-'));

const { PACKS } = require('../src/data/injectionPacks');
const inj = require('../src/services/injections');
const mod = require('../src/modules/injections');
const { TRANSLATIONS } = require('../src/utils/i18n');

const G = '1453890868980482090';
const CH = '444000000000000009';

(async () => {
  try {
    // 1. Catálogo: mínimos pedidos, ids únicos, nomes PT/EN e cores válidas.
    assert(PACKS.gender.items.length >= 10, 'Pelo menos 10 gêneros');
    assert(PACKS.sexuality.items.length >= 25, 'Pelo menos 25 sexualidades');
    assert.equal(PACKS.colors24.items.length, 24);
    assert.equal(PACKS.colors48.items.length, 48);
    assert.equal(PACKS.colors75.items.length, 75);
    assert(PACKS.neuro.items.length >= 10);
    for (const [id, pack] of Object.entries(PACKS)) {
      assert.equal(new Set(pack.items.map((i) => i.id)).size, pack.items.length, `${id}: ids únicos`);
      for (const i of pack.items) {
        assert(i.pt && i.en && i.emoji, `${id}/${i.id}: nomes e emoji`);
        assert(i.stripes.length && i.stripes.every((h) => /^[0-9A-F]{6}$/i.test(h)), `${id}/${i.id}: listras em hex`);
      }
      assert(TRANSLATIONS.pt.injections.pack[id] && TRANSLATIONS.en.injections.pack[id], `${id}: nome do pacote PT/EN`);
    }
    const png = await inj.flagPng(PACKS.gender.items[4]);
    assert.equal(png.subarray(1, 4).toString(), 'PNG', 'Bandeira vira PNG');
    console.log('  ✅ 1. Catálogo completo e bandeiras em PNG.');

    // 2. Opções: botões só até 20 itens; itens inválidos saem.
    assert.equal(inj.normalizeOptions('colors75', { format: 'buttons' }).format, 'select');
    assert.deepEqual(inj.normalizeOptions('gender', { items: ['woman', 'xyz'] }).items, ['woman']);
    assert.equal(inj.normalizeOptions('nada', {}), null);
    assert.equal(inj.normalizeOptions('colors24', {}).mode, 'single', 'Cores: uma por vez por padrão');
    console.log('  ✅ 2. Opções limpas.');

    // 3. Tarefa completa num servidor falso: cria, reaproveita, posiciona, publica e põe no onboarding.
    let roleSeq = 100;
    const roles = new Map([['900000000000000001', { id: '900000000000000001', name: 'Mulher' }]]);
    const created = [];
    let positions = null;
    const sent = [];
    let onboardingBody = null;
    const guild = {
      id: G,
      features: ['ROLE_ICONS', 'COMMUNITY'],
      members: { me: { permissions: { has: () => true }, roles: { highest: { position: 50 } } } },
      roles: {
        cache: roles,
        create: async (o) => {
          const r = { id: `90000000000000${roleSeq++}`, ...o };
          created.push(o);
          roles.set(r.id, r);
          return r;
        },
        setPositions: async (p) => (positions = p),
      },
      channels: { cache: new Map([[CH, { id: CH, isTextBased: () => true, send: async (p) => (sent.push(p), { id: 'msg1', url: 'https://discord.com/x' }) }]]) },
    };
    const client = {
      guilds: { cache: new Map([[G, guild]]) },
      rest: {
        get: async () => ({ prompts: [{ id: '1', title: 'Antiga' }], default_channel_ids: ['1'], enabled: true, mode: 0 }),
        put: async (route, { body }) => ((onboardingBody = body), { prompts: body.prompts.map((p, i) => ({ ...p, id: p.id || String(i) })) }),
      },
    };
    const { jobId } = mod.start(client, { guildId: G, pack: 'gender', options: { items: ['woman', 'transwoman', 'nonbinary'], publish: true, channelId: CH, onboarding: true }, lang: 'pt', by: 'u' });
    await new Promise((r) => setTimeout(r, 200));
    const job = mod.status(client, { jobId });
    assert.equal(job.state, 'done', job.error);
    assert.deepEqual([job.result.created, job.result.reused], [2, 1], 'Reaproveita cargo de mesmo nome');
    assert(created.every((c) => c.permissions.length === 0 && c.mentionable === false), 'Cargos sem permissão e sem menção');
    assert(Buffer.isBuffer(created.find((c) => c.name === 'Mulher trans').icon), 'Com boost nível 2, bandeira vira ícone');
    assert.equal(positions.length, 3, 'Cargos posicionados abaixo da Pyxie');
    assert.deepEqual(sent[0].allowedMentions.parse, [], 'Painel sem ping');
    assert.equal(sent[0].components[0].components[0].data.custom_id.startsWith('inj:sel:'), true);
    assert.equal(onboardingBody.prompts.length, 2, 'Mantém a pergunta antiga e acrescenta a nova');
    assert.equal(onboardingBody.prompts[1].options.length, 3);
    assert.equal(job.result.onboarding, 'ok');
    console.log('  ✅ 3. Injeção cria, reaproveita, posiciona, publica e vai para Canais e cargos.');

    // 4. Escolhas: modo um-só troca, quem não pode pegar é recusado, "tirar tudo" limpa.
    const record = inj.list(G)[0];
    const memberRoles = new Map();
    const replies = [];
    const member = {
      roles: {
        cache: { has: (id) => memberRoles.has(id), keys: () => memberRoles.keys() },
        add: async (ids) => ids.forEach((id) => memberRoles.set(id, true)),
        remove: async (ids) => ids.forEach((id) => memberRoles.delete(id)),
      },
    };
    for (const r of roles.values()) r.editable = true;
    const pick = (values) => ({ customId: `inj:sel:${record.id}:0`, guild, member, values, locale: 'pt-BR', reply: async (p) => replies.push(p) });
    await mod.handleInteraction(pick([record.items[0].roleId, record.items[1].roleId]));
    assert.equal(memberRoles.size, 2, 'Modo vários: pega os dois');
    await mod.handleInteraction(pick([record.items[1].roleId]));
    assert.deepEqual([...memberRoles.keys()], [record.items[1].roleId], 'Desmarcar tira');
    await mod.handleInteraction({ customId: `inj:clear:${record.id}`, guild, member, locale: 'pt-BR', reply: async (p) => replies.push(p) });
    assert.equal(memberRoles.size, 0, 'Tirar tudo');
    inj.store(G, { ...record, allowedRoleIds: ['123456789012345678'] });
    await mod.handleInteraction(pick([record.items[0].roleId]));
    assert.equal(memberRoles.size, 0, 'Sem o cargo liberado não pega');
    assert.match(replies.at(-1).content, /alguns cargos/);
    console.log('  ✅ 4. Escolhas dos membros respeitam modo e quem pode pegar.');

    // 5. Remover: tira o painel e, se pedido, os cargos.
    const deletedRoles = [];
    for (const r of roles.values()) r.delete = async () => deletedRoles.push(r.id);
    guild.channels.cache.get(CH).messages = { delete: async () => {} };
    const removed = await mod.removeInjection(client, { guildId: G, injectionId: record.id, deleteRoles: true });
    assert.equal(removed.deletedRoles, 3);
    assert.equal(inj.list(G).length, 0);
    console.log('  ✅ 5. Remover painel e cargos.');

    console.log('🎉 Injeções validadas!');
  } finally {
    fs.rmSync(process.env.PYXIE_DATA_DIR, { recursive: true, force: true });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
