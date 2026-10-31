/**
 * Concede plano vitalício (Premium) a servidores específicos.
 *
 * Uso:
 *   node scripts/grantLifetime.js --list                  # mostra o plano atual dos alvos
 *   node scripts/grantLifetime.js                         # concede a Mary + Cringelândia
 *   node scripts/grantLifetime.js --guild=<id> [--guild=<id>]
 *   node scripts/grantLifetime.js --dry                   # mostra o que faria, sem gravar
 *
 * Idempotente: rodar de novo não duplica nada e não estende nada (não há prazo).
 */
const scopes = require('../src/config/scopes');
const plans = require('../src/services/guildPlans');
const addons = require('../src/services/guildAddons');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const listOnly = args.includes('--list');

const targets = new Map([
  [scopes.CRINGELANDIA_GUILD_ID, 'Cringelândia (servidor do dono)'],
  [scopes.MARY_GUILD_ID, 'Mary (lojinha de Robux)'],
]);
for (const arg of args.filter((a) => a.startsWith('--guild='))) {
  const id = arg.slice('--guild='.length).trim();
  if (!targets.has(id)) targets.set(id, 'concedido por --guild');
}

function show(guildId, label) {
  const p = plans.getPlan(guildId);
  const a = addons.status(guildId, 'lojinha');
  const until = p.lifetime ? 'vitalício' : p.paidUntil ? new Date(p.paidUntil).toISOString().slice(0, 10) : '—';
  const addonLabel = a.active ? (a.lifetime ? 'ativo (vitalício)' : `ativo até ${new Date(a.until).toISOString().slice(0, 10)}`) : 'inativo';
  console.log(
    `  ${label}\n    id=${guildId} plano=${p.plan} ativo=${p.active} até=${until} origem=${p.source}\n    extras: lojinha ${addonLabel}`
  );
}

if (listOnly) {
  console.log('\n📋 Planos atuais:');
  for (const [id, label] of targets) show(id, label);
  console.log('');
  process.exit(0);
}

console.log(`\n👑 Concedendo Premium vitalício a ${targets.size} servidor(es)${dry ? ' (dry-run)' : ''}:`);
for (const [id, label] of targets) {
  if (!/^\d{17,20}$/.test(id)) {
    console.log(`  ⚠️ ${label}: id inválido (${id}) — pulado`);
    continue;
  }
  if (dry) {
    show(id, `${label} (antes)`);
    continue;
  }
  const result = plans.grantPlan(id, 'premium', {
    lifetime: true,
    source: 'lifetime',
    note: `vitalício: ${label}`,
  });
  if (!result.ok) {
    console.log(`  ❌ ${label}: ${result.reason}`);
    continue;
  }
  console.log(`  ✅ ${label}`);
  addons.grant(id, 'lojinha', { lifetime: true, source: 'lifetime', note: `vitalício: ${label}` });
  show(id, 'estado final');
}

console.log('\nFeito.\n');
