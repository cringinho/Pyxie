/**
 * Captura o "manifesto de verificações" da suíte atual.
 *
 * Roda cada passo do `npm test` isoladamente, mede o tempo, extrai as verificações
 * impressas (linhas com ✅) e grava um JSON. Esse arquivo é o contrato de qualidade:
 * a suíte nova só é aceita se reproduzir o mesmo conjunto de verificações.
 *
 * Uso:
 *   node scripts/capture-test-manifest.js                 # roda tudo e grava o baseline
 *   node scripts/capture-test-manifest.js --resume        # continua de onde parou
 *   node scripts/capture-test-manifest.js --only=<arquivo># um passo específico
 *   node scripts/capture-test-manifest.js --restore       # devolve data/ se algo morreu
 *   node scripts/capture-test-manifest.js --keep-data     # não mexe em data/ (só leitura)
 *
 * Segurança: `data/` é renomeado para um backup temporário (O(1), mesma partição) e
 * restaurado no finally. Um marcador em test-runs/baseline-state.json permite restaurar
 * à mão (`--restore`) caso o processo seja morto à força.
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'test-runs');
const MANIFEST_PATH = path.join(ROOT, 'tests', 'baseline-manifest.json');
const STATE_PATH = path.join(OUT_DIR, 'baseline-state.json');

const STEP_TIMEOUT_MS = 300000; // 5 min por arquivo: pega travamento sem matar teste lento
const MAX_BUFFER = 16 * 1024 * 1024;

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const flagValue = (name) => {
  const found = args.find((a) => a.startsWith(`${name}=`));
  return found ? found.slice(name.length + 1) : null;
};

/** Ambiente idêntico ao scripts/test-safe.sh (sem segredos reais). */
function testEnv() {
  return {
    ...process.env,
    DISCORD_TOKEN: '',
    GROQ_API_KEY: '',
    DATABASE_URL: '',
    PANEL_SECRET: '',
    API_SECRET_TOKEN: '',
    MARY_STUDIO_SECRET: '',
    PYXIE_CI_FIXTURES: '1',
    FORCE_COLOR: '0',
    NO_COLOR: '1',
  };
}

/** Lista de passos do `npm test`, na ordem original (o mesmo encadeamento &&). */
function readSteps() {
  const file = path.join(__dirname, '..', 'tests', 'steps.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data.steps.map((cmd, index) => {
    const tokens = String(cmd).trim().split(/\s+/);
    return { index, cmd, bin: tokens[0], args: tokens.slice(1) };
  });
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {
    return null;
  }
}

function saveManifest(manifest) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
}

function saveState(state) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function readState() {
  if (!fs.existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch (_) {
    return null;
  }
}

/** Normaliza uma linha de verificação (tira emoji, ANSI e espaços extras). */
function cleanLine(line) {
  return String(line)
    // eslint-disable-next-line no-control-regex
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/✅/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrai verificações e falhas da saída de um passo.
 *
 * Dois padrões de sucesso convivem no repositório:
 *   1. `✅ 3. Texto da verificação` (a maioria);
 *   2. `console.log('Verificação de X...: OK')` (botUtils, economy, tarot, ...).
 * Os dois contam como verificação; sem isso, 8 arquivos ficariam sem cobertura no manifesto.
 */
function parseOutput(stdout, stderr) {
  const checks = [];
  const failures = [];
  const seen = new Set();

  const absorb = (line) => {
    const raw = String(line || '');
    const clean = cleanLine(raw);

    const isCheck =
      raw.includes('✅') ||
      raw.includes('✔') ||
      /:\s*OK\.?\s*$/.test(clean) ||
      /\bOK\b\s*$/.test(clean);

    if (isCheck && clean) {
      const name = clean.replace(/^[\s\-•]+/, '');
      if (name && name.length > 3 && !seen.has(name)) {
        seen.add(name);
        checks.push(name);
      }
    }

    if (raw.includes('❌') || /erro crítico|AssertionError/i.test(raw)) {
      failures.push(clean.slice(0, 300));
    }
  };

  String(stdout || '').split(/\r?\n/).forEach(absorb);
  String(stderr || '').split(/\r?\n/).forEach(absorb);

  // Arquivos que só imprimem um resumo (ex.: smoke_all_commands) também precisam de
  // pelo menos uma verificação rastreável, senão ficam sem cobertura no gate.
  if (checks.length === 0) {
    const summary = parseSummaryNumbers(stdout);
    if (summary) checks.push(`resumo: ${summary.line}`);
  }

  return { checks, failures: failures.slice(0, 25) };
}

/** Números do resumo final: compara contagens internas, não só nomes de linha. */
function parseSummaryNumbers(stdout) {
  const text = String(stdout || '');
  const line = text
    .split(/\r?\n/)
    .map((l) => cleanLine(l))
    .filter(Boolean)
    .reverse()
    .find((l) => /\d+\s*execu/i.test(l) || /\d+\s+ok\b/i.test(l));
  if (!line) return null;
  return {
    line,
    numbers: (line.match(/\d+/g) || []).map(Number),
  };
}

/** Resumo final (ex.: "128 execuções: 128 ok, 0 avisos"). */
function parseSummary(stdout) {
  const parsed = parseSummaryNumbers(stdout);
  return parsed ? parsed.line : null;
}

// ---------------------------------------------------------------- data/ seguro

function prepareData({ keepData }) {
  if (keepData) return null;
  // Backup no MESMO volume do projeto: rename entre volumes (C: -> E:) falha com EXDEV.
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const backupDir = fs.mkdtempSync(path.join(OUT_DIR, 'data-backup-'));
  const hadData = fs.existsSync(DATA_DIR);
  if (hadData) fs.renameSync(DATA_DIR, path.join(backupDir, 'data'));
  saveState({ backupDir, hadData, createdAt: new Date().toISOString() });

  const seed = spawnSync(process.execPath, ['scripts/seed_ci_fixtures.js'], {
    cwd: ROOT,
    env: testEnv(),
    encoding: 'utf8',
  });
  if (seed.status !== 0) {
    throw new Error(`seed_ci_fixtures falhou: ${seed.stderr || seed.stdout}`);
  }
  return backupDir;
}

function restoreData() {
  const state = readState();
  if (!state) return false;
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
  if (state.hadData) {
    const source = path.join(state.backupDir, 'data');
    if (fs.existsSync(source)) fs.renameSync(source, DATA_DIR);
  }
  fs.rmSync(state.backupDir, { recursive: true, force: true });
  fs.rmSync(STATE_PATH, { force: true });
  return true;
}

// ---------------------------------------------------------------- execução

function runStep(step) {
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, [step.args[0], ...step.args.slice(1)], {
    cwd: ROOT,
    env: testEnv(),
    encoding: 'utf8',
    timeout: STEP_TIMEOUT_MS,
    maxBuffer: MAX_BUFFER,
  });
  const ms = Date.now() - startedAt;
  const timedOut = Boolean(result.error && result.error.code === 'ETIMEDOUT');
  const { checks, failures } = parseOutput(result.stdout, result.stderr);
  return {
    index: step.index,
    file: step.args[0],
    ms,
    exitCode: timedOut ? null : result.status,
    timedOut,
    checks,
    checkCount: checks.length,
    failures,
    summary: parseSummary(result.stdout),
    summaryNumbers: parseSummaryNumbers(result.stdout),
  };
}

function main() {
  if (hasFlag('--restore')) {
    const ok = restoreData();
    console.log(ok ? '✅ data/ restaurado do backup.' : 'ℹ️ Nenhum estado de baseline pendente.');
    return;
  }

  const steps = readSteps();
  const only = flagValue('--only');
  const resume = hasFlag('--resume');
  const keepData = hasFlag('--keep-data');

  const previous = resume || only ? loadManifest() : null;
  const manifest = previous || {
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    cpusCount: os.cpus().length,
    totalMs: 0,
    totalChecks: 0,
    steps: [],
  };
  if (!previous) manifest.commands = steps.map((s) => s.cmd);

  const done = new Set((manifest.steps || []).map((s) => s.file));
  const queue = steps.filter((s) => {
    if (only) return s.args[0] === only;
    if (resume) return !done.has(s.args[0]);
    return true;
  });

  if (!only && !resume) manifest.steps = [];

  console.log(`\n📋 Baseline: ${queue.length} passo(s) de ${steps.length}. Timeout ${STEP_TIMEOUT_MS / 1000}s por arquivo.`);
  if (!keepData) console.log('🔒 data/ vai para backup temporário e volta no fim.\n');

  let backupDir = null;
  try {
    backupDir = prepareData({ keepData });
    const startedAt = Date.now();

    for (const step of queue) {
      process.stdout.write(`▶ ${step.args[0]} ... `);
      const record = runStep(step);
      const icon = record.exitCode === 0 ? '✅' : record.timedOut ? '⏱️' : '❌';
      console.log(`${icon} ${record.ms} ms · ${record.checkCount} verificações`);

      manifest.steps = manifest.steps.filter((s) => s.file !== record.file);
      manifest.steps.push(record);
      manifest.steps.sort((a, b) => a.index - b.index);
      manifest.totalMs = manifest.steps.reduce((sum, s) => sum + (s.ms || 0), 0);
      manifest.totalChecks = manifest.steps.reduce((sum, s) => sum + (s.checkCount || 0), 0);
      manifest.updatedAt = new Date().toISOString();
      saveManifest(manifest);

      if (record.exitCode !== 0 && record.failures.length) {
        record.failures.slice(0, 5).forEach((f) => console.log(`    ↳ ${f}`));
      }
    }

    if (!only) manifest.wallClockMs = Date.now() - startedAt;
    saveManifest(manifest);

    const failed = manifest.steps.filter((s) => s.exitCode !== 0);
    console.log('\n────────────────────────────────────────────');
    console.log(`Arquivos:        ${manifest.steps.length}`);
    console.log(`Verificações:    ${manifest.totalChecks}`);
    console.log(`Soma por passo:  ${(manifest.totalMs / 1000).toFixed(1)} s`);
    console.log(`Tempo de parede: ${(manifest.wallClockMs / 1000).toFixed(1)} s`);
    console.log(`Falhas:          ${failed.length}`);
    if (failed.length) console.log(`  ↳ ${failed.map((f) => f.file).join(', ')}`);
    console.log(`Manifesto:       ${path.relative(ROOT, MANIFEST_PATH)}`);
    console.log('────────────────────────────────────────────\n');
  } finally {
    if (backupDir) {
      try {
        restoreData();
        console.log('🔓 data/ restaurado.');
      } catch (err) {
        console.error(`⚠️ Falha ao restaurar data/: ${err.message}. Rode com --restore.`);
      }
    }
  }
}

process.on('uncaughtException', (err) => {
  console.error('\n💥 Erro inesperado:', err.message);
  console.error('Rode `node scripts/capture-test-manifest.js --restore` para devolver data/.');
  process.exit(1);
});

main();
