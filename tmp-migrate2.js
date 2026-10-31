// Migração (v2): data/ da RAIZ via src/utils/dataDir, com nomes sem colisão.
// `dataDir`/`dataPath` colidiam com variáveis locais (`const dataDir = ...`).
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DRY = process.argv.includes('--dry');
const ROOT_DATA = path.join(ROOT, 'data');
const HELPER = path.join(ROOT, 'src', 'utils', 'dataDir.js');

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git'].includes(e.name)) continue;
      walk(full);
    } else if (e.name.endsWith('.js')) files.push(full);
  }
})(path.join(ROOT, 'src'));

const RE_DIRNAME = /path\.join\(__dirname,\s*((?:['"]\.\.['"],\s*)+)['"]data['"](\s*\)|\s*,)/g;
const RE_CWD = /path\.join\(process\.cwd\(\),\s*['"]data['"](\s*\)|\s*,)/g;

let touched = 0;
let total = 0;

for (const file of files) {
  if (file === HELPER) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let changedHere = 0;

  const out = lines.map((line) => {
    if (/PYXIE_DATA_DIR|pyxieData/.test(line)) return line;

    let next = line;

    next = next.replace(RE_DIRNAME, (match, upsRaw, tail) => {
      const ups = (upsRaw.match(/\.\./g) || []).length;
      const resolved = path.resolve(path.dirname(file), ...Array(ups).fill('..'), 'data');
      if (resolved !== ROOT_DATA) return match;
      changedHere += 1;
      return tail.trim() === ')' ? 'pyxieDataDir()' : 'pyxieDataPath(';
    });

    next = next.replace(RE_CWD, (match, tail) => {
      changedHere += 1;
      return tail.trim() === ')' ? 'pyxieDataDir()' : 'pyxieDataPath(';
    });

    return next;
  });

  if (!changedHere) continue;

  let text = out.join('\n');
  if (!text.includes('utils/dataDir')) {
    const rel = path
      .relative(path.dirname(file), path.join(ROOT, 'src', 'utils', 'dataDir'))
      .replace(/\\/g, '/');
    const spec = rel.startsWith('.') ? rel : `./${rel}`;
    const importLine = `const { dataDir: pyxieDataDir, dataPath: pyxieDataPath } = require('${spec}');\n`;
    text = /^['"]use strict['"];/.test(text)
      ? text.replace(/^(['"]use strict['"];\n)/, `$1${importLine}`)
      : importLine + text;
  }

  touched += 1;
  total += changedHere;
  if (!DRY) fs.writeFileSync(file, text, 'utf8');
  console.log(`${DRY ? '~' : '✔'} ${path.relative(ROOT, file)} (${changedHere})`);
}

console.log(`\n${DRY ? 'A fazer' : 'Feito'}: ${touched} arquivo(s), ${total} ponto(s).`);
