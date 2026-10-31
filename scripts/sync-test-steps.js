/**
 * Mantém `tests/steps.json` em sincronia com os arquivos de teste.
 *
 * Sem isso, um teste novo pode ficar fora da suíte sem ninguém perceber — e o gate
 * de verificações nunca saberia. Modo padrão: verifica e sai com erro se houver
 * divergência. Com `--write`: acrescenta os que faltam (o smoke fica sempre por último).
 *
 * Uso: node scripts/sync-test-steps.js [--write]
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const STEPS_PATH = path.join(ROOT, 'tests', 'steps.json');
const TESTS_DIR = path.join(ROOT, 'tests');
const SMOKE = 'node scripts/smoke_all_commands.js';

const data = JSON.parse(fs.readFileSync(STEPS_PATH, 'utf8'));
const steps = Array.isArray(data.steps) ? data.steps : [];

const onDisk = fs
  .readdirSync(TESTS_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && e.name.endsWith('.test.js'))
  .map((e) => `node tests/${e.name}`)
  .sort();

const listed = new Set(steps);
const missing = onDisk.filter((cmd) => !listed.has(cmd));
const ghosts = steps.filter((cmd) => cmd !== SMOKE && !onDisk.includes(cmd));

if (!missing.length && !ghosts.length) {
  console.log(`✅ steps.json em sincronia (${steps.length} passos).`);
  process.exit(0);
}

if (missing.length) {
  console.log(`➕ faltam no steps.json (${missing.length}):`);
  missing.forEach((m) => console.log(`   ${m}`));
}
if (ghosts.length) {
  console.log(`👻 no steps.json mas sem arquivo (${ghosts.length}):`);
  ghosts.forEach((g) => console.log(`   ${g}`));
}

if (process.argv.includes('--write')) {
  const keep = steps.filter((cmd) => cmd !== SMOKE && !ghosts.includes(cmd));
  const next = [...keep, ...missing, SMOKE];
  fs.writeFileSync(
    STEPS_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString(), steps: next }, null, 2) + '\n',
    'utf8'
  );
  console.log(`\n✍️  steps.json atualizado: ${next.length} passos. Rode \`npm run test:map\` para mapear os novos.`);
  process.exit(0);
}

console.log('\nRode `node scripts/sync-test-steps.js --write` para corrigir.');
process.exit(1);
