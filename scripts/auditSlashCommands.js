const fs = require('fs');
const path = require('path');

const cmdDirs = [
  'src/commands',
  'src/modules/marriage/commands',
  'src/modules/museum/commands',
  'src/modules/partnerships/commands',
  'src/modules/seasonal/commands',
  'src/modules/tarot/commands',
];

const cmdFiles = [];
for (const dir of cmdDirs) {
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.js') && f !== 'index.js' && f !== 'commandHelpers.js' && f !== 'commandNames.js' && f !== 'economyHelpers.js') {
        cmdFiles.push(path.join(dir, f));
      }
    }
  }
}

console.log(`Found ${cmdFiles.length} command files.`);
for (const file of cmdFiles) {
  try {
    const mod = require(path.resolve(file));
    if (!mod || !mod.data) continue;
    const d = mod.data.toJSON ? mod.data.toJSON() : mod.data;
    const name = d.name;
    const desc = d.description || '';
    const locs = d.description_localizations || {};
    const pt = locs['pt-BR'] || '';
    
    // Check if base description appears to be Portuguese
    const ptWords = ['mostra', 'exibe', 'jogue', 'veja', 'consulte', 'informações', 'jogar', 'casar', 'divorciar', 'adote', 'vende', 'compre', 'abrir', 'altera', 'configura', 'reseta', 'envia', 'rolar', 'pegar', 'obtenha', 'ver'];
    const isBasePt = ptWords.some(w => desc.toLowerCase().split(/\s+/).includes(w));

    console.log(`\nCMD: ${name} (file: ${file})`);
    console.log(`  Base: "${desc}" | pt-BR: "${pt}"`);
    if (d.options && d.options.length > 0) {
      for (const opt of d.options) {
        const optLocs = opt.description_localizations || {};
        const optPt = optLocs['pt-BR'] || '';
        const nameLocs = opt.name_localizations || {};
        console.log(`    opt/sub: ${opt.name} (${JSON.stringify(nameLocs)}) | Base: "${opt.description}" | pt-BR: "${optPt}"`);
        if (opt.options) {
          for (const subOpt of opt.options) {
            console.log(`      arg: ${subOpt.name} (${JSON.stringify(subOpt.name_localizations || {})}) | Base: "${subOpt.description}" | pt-BR: "${(subOpt.description_localizations || {})['pt-BR'] || ''}"`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error in ${file}:`, err.message);
  }
}
