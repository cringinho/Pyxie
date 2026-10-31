/**
 * Parser único de saída dos testes.
 *
 * A suíte usa dois padrões de sucesso:
 *   1. `✅ 3. Texto da verificação` (maioria);
 *   2. `console.log('Verificação de X...: OK')` (botUtils, economy, tarot, ...);
 *   3. arquivos que só imprimem um resumo (smoke_all_commands) contam como 1 verificação.
 *
 * Fonte única: o baseline (capture-test-manifest) e o gate (tests/run.js) precisam
 * enxergar exatamente a mesma coisa, senão o gate compara coisas diferentes.
 */

function cleanLine(line) {
  return String(line)
    // eslint-disable-next-line no-control-regex
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/✅/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSummaryNumbers(stdout) {
  const line = String(stdout || '')
    .split(/\r?\n/)
    .map((l) => cleanLine(l))
    .filter(Boolean)
    .reverse()
    .find((l) => /\d+\s*execu/i.test(l) || /\d+\s+ok\b/i.test(l));
  if (!line) return null;
  return { line, numbers: (line.match(/\d+/g) || []).map(Number) };
}

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

  if (checks.length === 0) {
    const summary = parseSummaryNumbers(stdout);
    if (summary) checks.push(`resumo: ${summary.line}`);
  }

  return { checks, failures: failures.slice(0, 25) };
}

module.exports = { cleanLine, parseOutput, parseSummaryNumbers };
