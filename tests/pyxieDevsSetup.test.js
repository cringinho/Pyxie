const assert = require('node:assert');
const { PermissionFlagsBits: P } = require('discord.js');
const bp = require('../scripts/lib/pyxieDevsBlueprint');

console.log('Verificando a planta do servidor Pyxie Devs...');

// Idioma padrão: inglês, com ES e PT-BR cobertos por cargos e canais.
assert.strictEqual(bp.GUILD_SETTINGS.preferredLocale, 'en-US');
const names = bp.allChannelNames();
for (const required of ['welcome', 'rules', 'announcements', 'anuncios-es', 'anuncios-pt-br', 'game-updates', 'general', 'comunidad-es', 'comunidade-pt-br']) {
  assert.ok(names.includes(required), `canal ausente: ${required}`);
}
assert.strictEqual(new Set(names).size, names.length, 'nomes de canal duplicados');
for (const cat of bp.CATEGORIES) {
  for (const ch of cat.channels) {
    const voice = ch.type === 'voice' || ch.type === 'stage';
    if (!voice) assert.match(ch.name, /^[a-z0-9-]{1,100}$/, `nome inválido para canal de texto: ${ch.name}`);
    if (voice) assert.ok(!ch.topic, `canal de voz não leva tópico: ${ch.name}`);
    assert.ok(ch.name.length <= 100);
  }
}
for (const v of ['Lounge EN', 'Lounge ES', 'Lounge PT-BR', 'Game Party', 'Dev Talks']) assert.ok(names.includes(v), `canal de voz ausente: ${v}`);
for (const k of ['report-an-issue', 'safety', 'rules', 'bug-reports']) assert.ok(names.includes(k), `canal de segurança ausente: ${k}`);
assert.ok(bp.RULES_TEXT.includes('13+'), 'regras devem citar a idade mínima do Discord');
for (const key of ['en', 'es', 'pt']) assert.ok(bp.ROLES.some((r) => r.key === key), `cargo de idioma ausente: ${key}`);

// Textos fixados: os três idiomas, sem menção em massa.
for (const text of [bp.WELCOME_TEXT, bp.RULES_TEXT, bp.SAFETY_TEXT, bp.FAQ_TEXT]) {
  assert.ok(text.length < 2000, 'mensagem acima do limite do Discord');
  assert.ok(!/@everyone|@here/.test(text));
}
assert.ok(/Welcome/.test(bp.WELCOME_TEXT) && /Bienvenido/.test(bp.WELCOME_TEXT) && /Bem-vindo/.test(bp.WELCOME_TEXT));
assert.ok(/Rules/.test(bp.RULES_TEXT) && /Reglas/.test(bp.RULES_TEXT) && /Regras/.test(bp.RULES_TEXT));

// Permissões: avisos só leitura para todos, staff invisível, ninguém ganha Administrador.
const ids = { everyone: 'E', devs: 'D', mods: 'M' };
const ro = bp.overwritesFor(bp.ACCESS.readonly, ids);
assert.ok(BigInt(ro.find((o) => o.id === 'E').deny) & P.SendMessages);
assert.ok(BigInt(ro.find((o) => o.id === 'D').allow) & P.SendMessages);
const staff = bp.overwritesFor(bp.ACCESS.staff, ids);
assert.ok(BigInt(staff.find((o) => o.id === 'E').deny) & P.ViewChannel);
for (const r of bp.ROLES) assert.ok(!r.permissions.includes(P.Administrator), `${r.name} não pode ser Administrador`);

// Idempotência: servidor vazio cria tudo; servidor completo não cria nada; extras só são listados.
const empty = bp.planChanges({ roles: [], channels: [] });
assert.strictEqual(empty.filter((a) => a.op === 'create-channel').length, names.length);
const full = { roles: bp.ROLES.map((r, i) => ({ id: String(i), name: r.name })), channels: [] };
bp.CATEGORIES.forEach((c, i) => {
  full.channels.push({ id: `c${i}`, name: c.name, type: 4 });
  c.channels.forEach((ch, j) => full.channels.push({ id: `c${i}-${j}`, name: ch.name, type: 0, parent_id: `c${i}` }));
});
assert.deepStrictEqual(bp.planChanges(full), []);
full.channels.push({ id: 'x', name: 'old-stuff', type: 0 });
assert.deepStrictEqual(bp.findExtras(full).map((c) => c.name), ['old-stuff']);

// Onboarding e AutoMod dentro dos limites da API do Discord.
const accessOf = Object.fromEntries(bp.CATEGORIES.flatMap((c) => c.channels.map((ch) => [ch.name, ch.access])));
const defaults = bp.ONBOARDING.defaultChannels;
assert.ok(defaults.length >= 7, 'Onboarding exige 7+ canais padrão');
assert.ok(defaults.filter((n) => accessOf[n] === bp.ACCESS.open).length >= 5, 'Onboarding exige 5+ canais padrão com escrita liberada');
for (const prompt of bp.ONBOARDING.prompts) {
  assert.ok(prompt.title.length <= 100, `pergunta longa: ${prompt.title}`);
  for (const o of prompt.options) {
    assert.ok(o.title.length <= 50 && (o.description || '').length <= 100, `opção fora do limite: ${o.title}`);
    for (const r of o.roles) assert.ok(bp.ROLES.some((x) => x.key === r), `cargo inexistente: ${r}`);
    for (const c of o.channels) assert.ok(names.includes(c), `canal inexistente: ${c}`);
  }
}
for (const c of defaults) assert.ok(names.includes(c), `canal padrão inexistente: ${c}`);
assert.ok(bp.ONBOARDING.prompts[0].required, 'o idioma é obrigatório');
assert.ok(bp.AUTOMOD_MESSAGE.length <= 150, 'mensagem do AutoMod acima de 150 caracteres');
assert.ok(names.includes(bp.AUTOMOD_ALERT_CHANNEL) && accessOf[bp.AUTOMOD_ALERT_CHANNEL] === bp.ACCESS.staff, 'alertas do AutoMod em canal da equipe');
assert.deepStrictEqual(bp.AUTOMOD.map((r) => r.triggerType).sort(), [1, 3, 4, 5]);
for (const r of bp.AUTOMOD) assert.ok(r.name.length <= 100);

console.log('✔ Planta do Pyxie Devs ok.');
