/**
 * Suíte Turbo — runner paralelo com isolamento e gate de manifesto.
 *
 * Substitui a cadeia `a.js && b.js && …` do package.json por um pool de processos.
 * Como cada teste escreve em data/, o pool só roda em paralelo arquivos que NÃO
 * disputam os mesmos arquivos: o mapa de conflitos vem de `test-runs/data-touch-map.json`
 * (gerado uma vez com `--map`), que registra quais caminhos cada teste toca.
 *
 * Modos:
 *   node tests/run.js                 # suíte completa (pool)
 *   node tests/run.js --map           # roda em série e grava o mapa de conflitos
 *   node tests/run.js --changed       # só o que o git diff afeta (loop local)
 *   node tests/run.js --only=<arquivo>
 *   node tests/run.js --failed        # repete só o que falhou na última execução
 *   node tests/run.js --jobs=8
 *   node tests/run.js --repeat=3      # estabilidade (compara as 3 execuções)
 *   node tests/run.js --gate          # falha se alguma verificação do baseline sumir
 *   node tests/run.js --list          # lista os passos e sai
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'test-runs');
// Artefatos versionados: o deploy também se beneficia do paralelismo e do gate.
const MAP_PATH = path.join(__dirname, 'data-touch-map.json');
const BASELINE_PATH = path.join(__dirname, 'baseline-manifest.json');
const SOLO_PATH = path.join(__dirname, 'solo.json');
// Saídas da execução ficam fora do git.
const STATE_PATH = path.join(OUT_DIR, 'runner-state.json');
const LAST_FAILED_PATH = path.join(OUT_DIR, 'last-failed.json');
const RESULT_PATH = path.join(OUT_DIR, 'manifest.current.json');

const STEP_TIMEOUT_MS = 300000;
const MAX_BUFFER = 16 * 1024 * 1024;
// O scripts/test-safe.sh já isola data/ por fora: nesse caso não isolamos de novo.
const EXTERNAL_DATA = process.env.PYXIE_TESTS_EXTERNAL_DATA === '1';

const argv = process.argv.slice(2);
const has = (n) => argv.includes(n);
const val = (n) => {
  const inline = argv.find((a) => a.startsWith(`${n}=`));
  if (inline) return inline.slice(n.length + 1);
  const at = argv.indexOf(n);
  if (at >= 0 && argv[at + 1] && !argv[at + 1].startsWith('--')) return argv[at + 1];
  return null;
};

/** Mesmo ambiente do scripts/test-safe.sh, com a mesma sujeira controlada. */
const TEST_ENV = {
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

/**
 * Lista oficial dos passos, em tests/steps.json.
 *
 * NÃO ler `package.json > scripts.test`: esse script aponta para este runner, e ler
 * dali fazia o runner executar a si mesmo (recursão infinita). O arquivo é a fonte
 * única da ordem; para regenerar, use `npm run test:steps`.
 */
function readSteps() {
  const file = path.join(__dirname, 'steps.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data.steps.map((cmd, index) => {
    const tokens = String(cmd).trim().split(/\s+/);
    return { index, cmd, file: tokens[1], args: tokens.slice(2) };
  });
}

/** Hash de cada arquivo relevante de data/ (para descobrir quem escreve o quê). */
function snapshot(dir) {
  const out = {};
  const walk = (current) => {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        try {
          const buf = fs.readFileSync(full);
          out[path.relative(dir, full).replace(/\\/g, '/')] = crypto
            .createHash('sha1')
            .update(buf)
            .digest('hex')
            .slice(0, 12);
        } catch (_) {
          /* arquivo preso/lockado: ignora */
        }
      }
    }
  };
  walk(dir);
  return out;
}

function diffSnapshot(before, after) {
  const touched = new Set();
  for (const [key, hash] of Object.entries(after)) {
    if (before[key] !== hash) touched.add(key);
  }
  for (const key of Object.keys(before)) {
    if (!(key in after)) touched.add(key);
  }
  return [...touched];
}

/** Move data/ para backup no MESMO volume, semeia um data/ limpo e devolve a função de restore. */
function isolateData() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const backupDir = fs.mkdtempSync(path.join(OUT_DIR, 'data-backup-'));
  const hadData = fs.existsSync(DATA_DIR);
  if (hadData) fs.renameSync(DATA_DIR, path.join(backupDir, 'data'));
  fs.writeFileSync(STATE_PATH, JSON.stringify({ backupDir, hadData }, null, 2), 'utf8');
  require('node:child_process').execFileSync(process.execPath, ['scripts/seed_ci_fixtures.js'], {
    cwd: ROOT,
    env: TEST_ENV,
  });

  return function restore() {
    fs.rmSync(DATA_DIR, { recursive: true, force: true });
    if (hadData) {
      const src = path.join(backupDir, 'data');
      if (fs.existsSync(src)) fs.renameSync(src, DATA_DIR);
    }
    fs.rmSync(backupDir, { recursive: true, force: true });
    fs.rmSync(STATE_PATH, { force: true });
  };
}

const { parseOutput, parseSummaryNumbers } = require('../scripts/lib/test-output');

/** Executa um passo e devolve o registro (assíncrono para permitir concorrência). */
function runOne(step) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const child = spawn(process.execPath, [step.file, ...step.args], {
      cwd: ROOT,
      env: TEST_ENV,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let killed = false;
    const CAP = 8 * 1024 * 1024; // teto por stream: teste em loop não estoura a memória

    const timer = setTimeout(() => {
      killed = true;
      try {
        child.kill('SIGKILL');
      } catch (_) {}
    }, STEP_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      if (stdout.length < CAP) stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < CAP) stderr += chunk;
    });

    const finish = (code) => {
      clearTimeout(timer);
      const ms = Date.now() - startedAt;
      const { checks, failures } = parseOutput(stdout, stderr);
      const ok = !killed && code === 0;
      // Teste que morre sem ❌ (ex.: JSON.parse de arquivo no meio do rename) não pode
      // ficar sem diagnóstico: guarda o fim do stderr.
      const tail = String(stderr || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(-12);
      resolve({
        index: step.index,
        file: step.file,
        ms,
        exitCode: killed ? null : code,
        timedOut: killed,
        checks,
        checkCount: checks.length,
        failures: failures.length ? failures : ok ? [] : tail,
        summaryNumbers: parseSummaryNumbers(stdout),
      });
    };

    child.on('close', finish);
    child.on('error', () => finish(1));
  });
}

/**
 * Escalonador: mantém no máximo `jobs` processos ativos, e nunca dois que toquem
 * o mesmo arquivo de data/. Sem mapa de conflitos, roda em série (seguro por padrão).
 */
async function runPool(steps, touches, jobs, onResult) {
  const pending = [...steps];
  const active = new Map(); // file -> { touches: Set|null, promise }
  const results = [];

  const conflicts = (file) => {
    const mine = touches[file];
    for (const [, info] of active) {
      if (!mine || !info.touches) return true;
      for (const p of mine) if (info.touches.has(p)) return true;
    }
    return false;
  };

  const launch = (step) => {
    const promise = runOne(step)
      .then((result) => {
        results.push(result);
        onResult(result);
        active.delete(step.file);
        return result;
      })
      .catch((err) => {
        active.delete(step.file);
        results.push({
          index: step.index,
          file: step.file,
          ms: 0,
          exitCode: 1,
          timedOut: false,
          checks: [],
          checkCount: 0,
          failures: [String(err && err.message)],
        });
      });
    active.set(step.file, {
      touches: touches[step.file] ? new Set(touches[step.file]) : null,
      promise,
    });
  };

  while (pending.length || active.size) {
    while (active.size < jobs && pending.length) {
      const idx = pending.findIndex((s) => !conflicts(s.file));
      if (idx === -1) break;
      launch(pending.splice(idx, 1)[0]);
    }
    if (!active.size) break;
    await Promise.race([...active.values()].map((i) => i.promise));
  }

  return results;
}

/** Lista de arquivos alterados (working tree + untracked) segundo o git. */
function gitChangedFiles() {
  const { execFileSync } = require('node:child_process');
  const out = new Set();
  try {
    execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((f) => out.add(f.replace(/\\/g, '/')));
  } catch (_) {}
  try {
    execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean)
      .map((l) => l.slice(3).trim().replace(/\\/g, '/'))
      .filter(Boolean)
      .forEach((f) => out.add(f));
  } catch (_) {}
  return [...out];
}

// ---------------------------------------------------------------- dependências (--changed)

const DEP_CACHE = new Map();

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

/** Lista de testes que precisam rodar sozinhos (sensíveis a concorrência em data/). */
function readSolo() {
  const data = readJson(SOLO_PATH, { files: [] });
  return new Set(Array.isArray(data.files) ? data.files : []);
}

function writeSolo(set) {
  fs.writeFileSync(
    SOLO_PATH,
    JSON.stringify({ files: [...set].sort(), updatedAt: new Date().toISOString() }, null, 2),
    'utf8'
  );
}

function resolveReq(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  const tries = [base, `${base}.js`, `${base}.json`, path.join(base, 'index.js')];
  for (const t of tries) {
    try {
      if (fs.statSync(t).isFile()) return t;
    } catch (_) {}
  }
  return null;
}

/** Todas as dependências locais (transitivas) de um arquivo, em caminho relativo. */
function collectDeps(file, depth = 0) {
  const key = path.resolve(file);
  if (DEP_CACHE.has(key)) return DEP_CACHE.get(key);
  const set = new Set();
  DEP_CACHE.set(key, set);
  if (depth > 10) return set;

  let src = '';
  try {
    src = fs.readFileSync(key, 'utf8');
  } catch (_) {
    return set;
  }

  const re = /require\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  let match;
  while ((match = re.exec(src))) {
    const resolved = resolveReq(key, match[1]);
    if (!resolved) continue;
    set.add(path.relative(ROOT, resolved).replace(/\\/g, '/'));
    for (const dep of collectDeps(resolved, depth + 1)) set.add(dep);
  }
  return set;
}

function affectedTests(steps, changed) {
  if (!changed.length) return [];
  const changedSet = new Set(changed);
  return steps.filter((step) => {
    const rel = step.file.replace(/\\/g, '/');
    if (changedSet.has(rel)) return true;
    for (const dep of collectDeps(path.join(ROOT, step.file))) {
      if (changedSet.has(dep)) return true;
    }
    return false;
  });
}

// ---------------------------------------------------------------- gate de manifesto

/** Compara a execução atual com o baseline. Devolve a lista de problemas. */
function compareManifests(baseline, current) {
  const problems = [];
  const cur = new Map(current.steps.map((s) => [s.file, s]));
  // Números dentro do nome são dinâmicos ("22 arquivos" -> "23 arquivos").
  // A contagem por arquivo continua sendo exigida logo abaixo, então nada se perde.
  const norm = (text) =>
    String(text)
      .replace(/\d+/g, '#')
      .replace(/\s+/g, ' ')
      .trim();

  for (const base of baseline.steps) {
    const now = cur.get(base.file);
    if (!now) {
      problems.push(`arquivo ausente na execução: ${base.file}`);
      continue;
    }
    if (base.exitCode !== now.exitCode) {
      problems.push(`${base.file}: exit ${base.exitCode} -> ${now.exitCode}`);
    }
    if (now.checkCount < base.checkCount) {
      problems.push(`${base.file}: verificações ${base.checkCount} -> ${now.checkCount}`);
    }
    const present = new Set(now.checks.map(norm));
    for (const check of base.checks) {
      if (!present.has(norm(check))) problems.push(`${base.file}: verificação perdida: ${check.slice(0, 90)}`);
    }
  }

  return problems;
}

// ---------------------------------------------------------------- execução

async function main() {
  const steps = readSteps();
  const cpuBudget = Math.max(1, os.cpus().length - 4);
  const jobs = Math.max(1, Math.min(32, Number(val('--jobs')) || cpuBudget));
  const only = val('--only');
  const repeat = Math.max(1, Number(val('--repeat')) || 1);
  const wantGate = has('--gate');

  if (has('--list')) {
    steps.forEach((s) => console.log(`${String(s.index).padStart(2, '0')}  ${s.cmd}`));
    return;
  }

  let selection = steps;
  let mode = 'full';
  if (only) {
    selection = steps.filter((s) => s.file === only);
    mode = 'only';
  } else if (has('--changed')) {
    selection = affectedTests(steps, gitChangedFiles());
    mode = 'changed';
  } else if (has('--failed')) {
    const last = readJson(LAST_FAILED_PATH, { files: [] });
    selection = steps.filter((s) => (last.files || []).includes(s.file));
    mode = 'failed';
  }

  if (!selection.length) {
    console.log('✅ Nada a rodar: nenhum arquivo afetado pelas mudanças.');
    return;
  }

  const map = readJson(MAP_PATH, null);
  const touches = map && map.touches ? map.touches : {};
  const baseline = readJson(BASELINE_PATH, null);

  console.log(`\n⚡ Suíte Turbo · ${selection.length}/${steps.length} arquivo(s) · ${jobs} jobs · modo ${mode}`);
  if (!map) console.log('ℹ️ Sem mapa de conflitos: série. Rode `node tests/run.js --map` uma vez.');

  const results = [];
  const startedAt = Date.now();
  let done = 0;

  const restore = EXTERNAL_DATA ? () => {} : isolateData();
  const cleanup = () => {
    try {
      restore();
    } catch (_) {}
  };
  process.once('SIGINT', () => {
    cleanup();
    process.exit(130);
  });
  process.once('SIGTERM', () => {
    cleanup();
    process.exit(143);
  });

  try {
    if (has('--map')) {
      const touchesOut = { ...touches };
      for (const step of selection) {
        const pre = snapshot(DATA_DIR);
        const result = await runOne(step);
        const post = snapshot(DATA_DIR);
        touchesOut[step.file] = diffSnapshot(pre, post);
        results.push(result);
        done += 1;
        console.log(
          `▶ [${done}/${selection.length}] ${step.file} · ${result.ms} ms · ${result.checkCount} checks · ${touchesOut[step.file].length} arquivos de data/`
        );
      }
      fs.writeFileSync(
        MAP_PATH,
        JSON.stringify({ generatedAt: new Date().toISOString(), touches: touchesOut }, null, 2),
        'utf8'
      );
      console.log(`\n🗺️  Mapa de conflitos: ${path.relative(ROOT, MAP_PATH)}`);
    } else {
      const soloSet = readSolo();
      const isClean = (file) => {
        if (soloSet.has(file)) return false; // quarentena força série
        const t = touches[file];
        if (!t) return false; // sem mapa: trata como sujo (série, seguro)
        return t.every((p) => p.startsWith('cache/')); // cache é descartável, não conflita
      };

      const cleanSteps = selection.filter((s) => isClean(s.file));
      const serialSteps = selection.filter((s) => !isClean(s.file)).sort((a, b) => a.index - b.index);
      const runs = [];

      for (let r = 0; r < repeat; r++) {
        if (repeat > 1) console.log(`\n— repetição ${r + 1}/${repeat} —`);
        const got = [];

        if (cleanSteps.length) {
          got.push(
            ...(await runPool(cleanSteps, touches, jobs, (result) => {
              done += 1;
              const icon = result.exitCode === 0 ? '✅' : result.timedOut ? '⏱️' : '❌';
              console.log(`▶ [${done}] ${icon} ${result.file} · ${result.ms} ms · ${result.checkCount} checks`);
            }))
          );
        }

        // Quem escreve em data/ roda em série, na ordem original do package.json:
        // é assim que o estado final bate com o baseline, teste por teste.
        for (const step of serialSteps) {
          const result = await runOne(step);
          done += 1;
          const icon = result.exitCode === 0 ? '✅' : result.timedOut ? '⏱️' : '❌';
          console.log(`▶ [${done}] ${icon} ${result.file} (série) · ${result.ms} ms · ${result.checkCount} checks`);
          got.push(result);
        }

        runs.push(got);
      }

      results.push(...runs[0]);

      // Segurança extra: teste "livre" que falhou no pool é reexecutado sozinho.
      // Se passar, entra na quarentena para não gerar instabilidade futura.
      const failedInPool = runs[0].filter((r) => r.exitCode !== 0 && isClean(r.file));
      if (failedInPool.length) {
        const promoted = [];
        for (const failed of failedInPool) {
          const step = selection.find((s) => s.file === failed.file);
          if (!step) continue;
          const retry = await runOne(step);
          console.log(
            `🔁 ${step.file} (retry solo) · ${retry.exitCode === 0 ? '✅' : '❌'} ${retry.ms} ms · ${retry.checkCount} checks`
          );
          if (retry.exitCode === 0) {
            promoted.push(step.file);
            const idx = results.findIndex((r) => r.file === step.file);
            if (idx >= 0) results[idx] = retry;
            else results.push(retry);
          }
        }
        if (promoted.length) {
          const set = readSolo();
          promoted.forEach((f) => set.add(f));
          writeSolo(set);
          console.log(`📌 Quarentena (interferência em paralelo): ${promoted.join(', ')}`);
        }
      }

      for (let i = 1; i < runs.length; i++) {
        // Compara com o resultado final (pós-quarentena), não com o cru do primeiro pool.
        const drift = compareManifests({ steps: results }, { steps: runs[i] });
        if (drift.length) {
          console.log(`\n⚠️ Instabilidade na repetição ${i + 1}:`);
          drift.slice(0, 10).forEach((p) => console.log(`   - ${p}`));
        }
      }
    }
  } finally {
    cleanup();
  }

  const wall = Date.now() - startedAt;
  const ordered = results.slice().sort((a, b) => a.index - b.index);
  const current = {
    generatedAt: new Date().toISOString(),
    node: process.version,
    mode,
    jobs,
    wallClockMs: wall,
    totalMs: ordered.reduce((sum, r) => sum + (r.ms || 0), 0),
    totalChecks: ordered.reduce((sum, r) => sum + (r.checkCount || 0), 0),
    steps: ordered,
  };
  fs.writeFileSync(RESULT_PATH, JSON.stringify(current, null, 2), 'utf8');

  const failed = ordered.filter((r) => r.exitCode !== 0);
  fs.writeFileSync(LAST_FAILED_PATH, JSON.stringify({ files: failed.map((f) => f.file), at: current.generatedAt }, null, 2), 'utf8');

  const baseWall = baseline && baseline.wallClockMs ? baseline.wallClockMs : 0;
  console.log('\n────────────────────────────────────────────');
  console.log(`Arquivos:        ${ordered.length}`);
  console.log(
    `Verificações:    ${current.totalChecks}${baseline ? ` (baseline ${baseline.totalChecks})` : ''}`
  );
  console.log(
    `Tempo de parede: ${(wall / 1000).toFixed(1)} s${
      baseWall ? `  · baseline ${(baseWall / 1000).toFixed(1)} s · ${(baseWall / wall).toFixed(1)}x mais rápido` : ''
    }`
  );
  console.log(`Falhas:          ${failed.length}`);
  if (failed.length) failed.slice(0, 12).forEach((f) => console.log(`   ↳ ${f.file}`));

  if (mode === 'full') {
    const slow = ordered.slice().sort((a, b) => b.ms - a.ms).slice(0, 5);
    console.log(`Mais lentos:     ${slow.map((s) => `${s.file} (${s.ms} ms)`).join(' · ')}`);
  }

  let gateFailed = false;
  if (baseline && (wantGate || mode === 'full')) {
    const problems = compareManifests(baseline, current);
    if (problems.length) {
      gateFailed = true;
      console.log(`\n🚫 Gate de verificações: ${problems.length} problema(s)`);
      problems.slice(0, 15).forEach((p) => console.log(`   - ${p}`));
    } else {
      console.log('🔒 Gate de verificações: OK — nada do baseline se perdeu.');
    }
  }
  console.log('────────────────────────────────────────────\n');

  process.exit(failed.length || gateFailed ? 1 : 0);
}

main().catch((err) => {
  console.error('💥 Falha no runner:', err && err.message);
  process.exit(1);
});
