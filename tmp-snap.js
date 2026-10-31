// Snapshot/diff de diretório para provar isolamento do bot de teste.
const fs = require('fs');
const path = require('path');

function snap(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else {
        const st = fs.statSync(full);
        out[path.relative(dir, full).replace(/\\/g, '/')] = `${st.size}:${st.mtimeMs}`;
      }
    }
  })(dir);
  return out;
}

const mode = process.argv[2];
const a = process.argv[3];
const b = process.argv[4];

if (mode === 'snap') {
  const data = snap(path.resolve(a));
  fs.writeFileSync(path.resolve(b), JSON.stringify(data, null, 2));
  console.log(`snapshot ${a}: ${Object.keys(data).length} arquivos -> ${b}`);
} else if (mode === 'diff') {
  const before = JSON.parse(fs.readFileSync(path.resolve(a), 'utf8'));
  const after = JSON.parse(fs.readFileSync(path.resolve(b), 'utf8'));
  const changed = [];
  for (const k of Object.keys(after)) {
    if (!(k in before)) changed.push(`novo: ${k}`);
    else if (before[k] !== after[k]) changed.push(`alterado: ${k}`);
  }
  for (const k of Object.keys(before)) if (!(k in after)) changed.push(`removido: ${k}`);
  if (!changed.length) console.log(`✅ ${a} intocado (${Object.keys(after).length} arquivos)`);
  else {
    console.log(`❌ ${changed.length} mudança(s):`);
    changed.slice(0, 20).forEach((c) => console.log('   ' + c));
  }
}
