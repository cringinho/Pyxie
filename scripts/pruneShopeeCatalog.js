/**
 * Poda a vitrine da Shopee: mantém os produtos que realmente pagam e desativa o resto.
 *
 * Critério: comissão em R$ (não %), com peso maior para quem já vendeu. Peça com comissão
 * alta e zero venda ainda pode ser boa, mas fica atrás de quem já converte.
 *
 * Uso:
 *   node scripts/pruneShopeeCatalog.js --dry          # mostra o que faria
 *   node scripts/pruneShopeeCatalog.js --keep=20      # aplica (padrão 20)
 *   node scripts/pruneShopeeCatalog.js --reactivate   # religa todos
 *
 * Sempre grava um backup antes de mexer: data/backups/shopee/shopee-<data>.json
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const FILE = path.join(ROOT, 'src', 'data', 'shopee.json');
const BACKUP_DIR = path.join(ROOT, 'data', 'backups', 'shopee');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const reactivate = args.includes('--reactivate');
const keepArg = args.find((a) => a.startsWith('--keep='));
const keep = Math.max(1, Number(keepArg ? keepArg.split('=')[1] : 20) || 20);

const items = JSON.parse(fs.readFileSync(FILE, 'utf8'));
if (!Array.isArray(items)) {
  console.error('shopee.json não é uma lista.');
  process.exit(1);
}

const money = (v) => Number(String(v || '').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
const sales = (v) => {
  const raw = String(v || '').toLowerCase();
  if (raw.includes('mil')) return 2000;
  return Number(raw.replace(/[^0-9]/g, '')) || 0;
};

const score = (item) => {
  const commission = money(item.comissao);
  const sold = sales(item.vendas);
  return commission * (sold > 0 ? 1.6 : 1) + Math.min(20, sold / 100);
};

const ranked = [...items].sort((a, b) => score(b) - score(a));
const winners = new Set(ranked.slice(0, keep).map((i) => String(i.id)));

if (reactivate) {
  items.forEach((i) => {
    i.active = true;
    if (i.status !== 'out_of_stock' && i.status !== 'inactive') i.status = 'active';
  });
  fs.writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✅ ${items.length} produtos religados.`);
  process.exit(0);
}

const toKeep = [];
const toDrop = [];
for (const item of items) {
  if (winners.has(String(item.id))) toKeep.push(item);
  else toDrop.push(item);
}

console.log(`\n📦 Catálogo: ${items.length} produtos · mantendo ${toKeep.length} · desativando ${toDrop.length}\n`);
console.log('MANTIDOS (comissão / vendas):');
toKeep.forEach((i) => console.log(`  ${String(i.comissao).padEnd(9)} ${String(i.vendas).padEnd(7)} ${String(i.titulo).slice(0, 58)}`));
console.log('\nDESATIVADOS:');
toDrop.slice(0, 40).forEach((i) => console.log(`  ${String(i.comissao).padEnd(9)} ${String(i.vendas).padEnd(7)} ${String(i.titulo).slice(0, 58)}`));

if (dry) {
  console.log('\n(dry-run: nada foi gravado)');
  process.exit(0);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const backup = path.join(BACKUP_DIR, `shopee-${stamp}.json`);
fs.writeFileSync(backup, JSON.stringify(items, null, 2), 'utf8');

for (const item of items) {
  const isWinner = winners.has(String(item.id));
  item.active = isWinner;
  if (!isWinner) item.pausedReason = 'poda de catálogo';
}

fs.writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf8');
console.log(`\n✅ Aplicado. Backup em ${path.relative(ROOT, backup)}`);
console.log(`   ativos agora: ${items.filter((i) => i.active !== false).length}`);
