const fs = require('fs');

/**
 * Mescla dois arquivos JSON de cenários de trabalho gerados (Groq AI),
 * combinando os arrays de cada profissão e deduplicando por texto do cenário.
 *
 * @param {string} fileA - Caminho do primeiro arquivo (ex: backup ou produção)
 * @param {string} fileB - Caminho do segundo arquivo (ex: recém-puxado do git)
 * @param {string} [outputFile] - Arquivo de destino (se omitido, salva em fileA)
 */
function mergeMinigames(fileA, fileB, outputFile) {
  let dataA = {};
  let dataB = {};

  try {
    if (fs.existsSync(fileA)) {
      dataA = JSON.parse(fs.readFileSync(fileA, 'utf8'));
    }
  } catch (err) {
    console.warn(`[mergeMinigames] Aviso ao ler ${fileA}:`, err.message);
  }

  try {
    if (fs.existsSync(fileB)) {
      dataB = JSON.parse(fs.readFileSync(fileB, 'utf8'));
    }
  } catch (err) {
    console.warn(`[mergeMinigames] Aviso ao ler ${fileB}:`, err.message);
  }

  const merged = {};
  const allProfessions = new Set([...Object.keys(dataA), ...Object.keys(dataB)]);

  for (const prof of allProfessions) {
    const listA = Array.isArray(dataA[prof]) ? dataA[prof] : [];
    const listB = Array.isArray(dataB[prof]) ? dataB[prof] : [];
    const seenScenarios = new Set();
    const uniqueList = [];

    // Prioriza listA (gerados localmente na VM), depois listB (vindos do repo)
    for (const item of [...listA, ...listB]) {
      if (!item) continue;
      const key = (item.scenario || item.pt?.scenario || item.en?.scenario || '').trim().toLowerCase();
      if (key && !seenScenarios.has(key)) {
        seenScenarios.add(key);
        uniqueList.push(item);
      }
    }

    merged[prof] = uniqueList;
  }

  const dest = outputFile || fileA;
  fs.writeFileSync(dest, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

if (require.main === module) {
  const [, , fileA, fileB, out] = process.argv;
  if (!fileA || !fileB) {
    console.error('Uso: node scripts/merge_minigames.js <fileA> <fileB> [outputFile]');
    process.exit(1);
  }
  mergeMinigames(fileA, fileB, out || fileA);
  console.log(`[mergeMinigames] Cenários mesclados com sucesso em: ${out || fileA}`);
}

module.exports = { mergeMinigames };
