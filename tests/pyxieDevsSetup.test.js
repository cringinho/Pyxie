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
for (const n of names) assert.match(n, /^[a-z0-9-]{1,100}$/, `nome inválido para o Discord: ${n}`);
for (const key of ['en', 'es', 'pt']) assert.ok(bp.ROLES.some((r) => r.key === key), `cargo de idioma ausente: ${key}`);

// Textos fixados: os três idiomas, sem menção em massa.
for (const text of [bp.WELCOME_TEXT, bp.RULES_TEXT]) {
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

console.log('✔ Planta do Pyxie Devs ok.');
