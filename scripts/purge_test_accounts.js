/**
 * Pyxie Bot - Safe Test Accounts Purge Tool
 * Remove com segurança todas as contas e registros de teste gerados por testes unitários e mocks,
 * preservando 100% dos dados dos usuários reais do Discord (Snowflakes de 17-20 dígitos).
 */

const fs = require('fs');
const path = require('path');

function isTestId(id) {
  if (!id || typeof id !== 'string') return true;
  const trimmed = id.trim();
  // Se contiver palavras reservadas de teste, é conta de teste
  if (/test|mock|dummy|worker|sample/i.test(trimmed)) return true;
  // No Discord, qualquer ID de usuário real é estritamente um snowflake numérico de 17 a 20 dígitos
  if (!/^\d{17,20}$/.test(trimmed)) return true;
  return false;
}

function purgeDatabase(targetDir = path.join(process.cwd(), 'data')) {
  console.log(`🧹 Iniciando limpeza de contas de teste no diretório: ${targetDir}`);
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Diretório não encontrado: ${targetDir}`);
    return;
  }

  const results = {
    economy: { purged: 0, kept: 0 },
    tarot_album: { purged: 0, kept: 0 },
    pets: { purged: 0, kept: 0 },
    arcaneMathRanking: { purged: 0, kept: 0 },
    tictactoeStats: { purged: 0, kept: 0 },
    lootlabs_tx: { purged: 0, kept: 0 },
    lootlabs_pending: { purged: 0, kept: 0 },
    expeditions: { purged: 0, kept: 0 },
    inventory: { purged: 0, kept: 0 },
    marriageData: { purged: 0, kept: 0 },
  };

  function safeSave(filePath, data) {
    const backupPath = filePath + `.backup_${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    const tmpPath = filePath + `.tmp_${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
  }

  // 1. economy.json (Root keys = userId)
  const ecoPath = path.join(targetDir, 'economy.json');
  if (fs.existsSync(ecoPath)) {
    try {
      const eco = JSON.parse(fs.readFileSync(ecoPath, 'utf8'));
      let modified = false;
      for (const k of Object.keys(eco)) {
        if (isTestId(k)) {
          delete eco[k];
          results.economy.purged++;
          modified = true;
        } else {
          results.economy.kept++;
        }
      }
      if (modified) safeSave(ecoPath, eco);
    } catch (e) {
      console.error(`Erro ao processar economy.json: ${e.message}`);
    }
  }

  // 2. tarot_album.json (data.users[userId])
  const tarotPath = path.join(targetDir, 'tarot_album.json');
  if (fs.existsSync(tarotPath)) {
    try {
      const tarot = JSON.parse(fs.readFileSync(tarotPath, 'utf8'));
      let modified = false;
      if (tarot.users && typeof tarot.users === 'object') {
        for (const k of Object.keys(tarot.users)) {
          if (isTestId(k)) {
            delete tarot.users[k];
            results.tarot_album.purged++;
            modified = true;
          } else {
            results.tarot_album.kept++;
          }
        }
      }
      if (modified) safeSave(tarotPath, tarot);
    } catch (e) {
      console.error(`Erro ao processar tarot_album.json: ${e.message}`);
    }
  }

  // 3. pets.json (Root keys = userId)
  const petsPath = path.join(targetDir, 'pets.json');
  if (fs.existsSync(petsPath)) {
    try {
      const pets = JSON.parse(fs.readFileSync(petsPath, 'utf8'));
      let modified = false;
      for (const k of Object.keys(pets)) {
        if (isTestId(k)) {
          delete pets[k];
          results.pets.purged++;
          modified = true;
        } else {
          results.pets.kept++;
        }
      }
      if (modified) safeSave(petsPath, pets);
    } catch (e) {
      console.error(`Erro ao processar pets.json: ${e.message}`);
    }
  }

  // 4. arcaneMathRanking.json (data.players[userId])
  const mathPath = path.join(targetDir, 'arcaneMathRanking.json');
  if (fs.existsSync(mathPath)) {
    try {
      const math = JSON.parse(fs.readFileSync(mathPath, 'utf8'));
      let modified = false;
      if (math.players && typeof math.players === 'object') {
        for (const k of Object.keys(math.players)) {
          if (isTestId(k)) {
            delete math.players[k];
            results.arcaneMathRanking.purged++;
            modified = true;
          } else {
            results.arcaneMathRanking.kept++;
          }
        }
      }
      if (modified) safeSave(mathPath, math);
    } catch (e) {
      console.error(`Erro ao processar arcaneMathRanking.json: ${e.message}`);
    }
  }

  // 5. tictactoeStats.json (data.players[userId])
  const tttPath = path.join(targetDir, 'tictactoeStats.json');
  if (fs.existsSync(tttPath)) {
    try {
      const ttt = JSON.parse(fs.readFileSync(tttPath, 'utf8'));
      let modified = false;
      if (ttt.players && typeof ttt.players === 'object') {
        for (const k of Object.keys(ttt.players)) {
          if (isTestId(k)) {
            delete ttt.players[k];
            results.tictactoeStats.purged++;
            modified = true;
          } else {
            results.tictactoeStats.kept++;
          }
        }
      }
      if (modified) safeSave(tttPath, ttt);
    } catch (e) {
      console.error(`Erro ao processar tictactoeStats.json: ${e.message}`);
    }
  }

  // 6. lootlabs_tx.json (transactions)
  const txPath = path.join(targetDir, 'lootlabs_tx.json');
  if (fs.existsSync(txPath)) {
    try {
      const tx = JSON.parse(fs.readFileSync(txPath, 'utf8'));
      let modified = false;
      for (const [k, val] of Object.entries(tx)) {
        if (k.startsWith('tx_test_') || (val && val.userId && isTestId(val.userId))) {
          delete tx[k];
          results.lootlabs_tx.purged++;
          modified = true;
        } else {
          results.lootlabs_tx.kept++;
        }
      }
      if (modified) safeSave(txPath, tx);
    } catch (e) {
      console.error(`Erro ao processar lootlabs_tx.json: ${e.message}`);
    }
  }

  // 7. lootlabs_pending.json
  const pendingPath = path.join(targetDir, 'lootlabs_pending.json');
  if (fs.existsSync(pendingPath)) {
    try {
      const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
      let modified = false;
      for (const [k, val] of Object.entries(pending)) {
        const uid = val && typeof val === 'object' ? val.userId : k;
        if (isTestId(uid)) {
          delete pending[k];
          results.lootlabs_pending.purged++;
          modified = true;
        } else {
          results.lootlabs_pending.kept++;
        }
      }
      if (modified) safeSave(pendingPath, pending);
    } catch (e) {
      console.error(`Erro ao processar lootlabs_pending.json: ${e.message}`);
    }
  }

  // 8. expeditions.json & inventory.json
  for (const name of ['expeditions', 'inventory']) {
    const fPath = path.join(targetDir, `${name}.json`);
    if (fs.existsSync(fPath)) {
      try {
        const obj = JSON.parse(fs.readFileSync(fPath, 'utf8'));
        let modified = false;
        for (const k of Object.keys(obj)) {
          if (isTestId(k)) {
            delete obj[k];
            results[name].purged++;
            modified = true;
          } else {
            results[name].kept++;
          }
        }
        if (modified) safeSave(fPath, obj);
      } catch (e) {
        console.error(`Erro ao processar ${name}.json: ${e.message}`);
      }
    }
  }

  // 9. marriageData.json (marriages & requests)
  const marriagePath = path.join(targetDir, 'marriageData.json');
  if (fs.existsSync(marriagePath)) {
    try {
      const mData = JSON.parse(fs.readFileSync(marriagePath, 'utf8'));
      let modified = false;
      if (mData.marriages && typeof mData.marriages === 'object') {
        for (const [k, m] of Object.entries(mData.marriages)) {
          if (isTestId(m.user1Id) || isTestId(m.user2Id) || isTestId(k)) {
            delete mData.marriages[k];
            results.marriageData.purged++;
            modified = true;
          } else {
            results.marriageData.kept++;
          }
        }
      }
      if (mData.requests && typeof mData.requests === 'object') {
        for (const [k, req] of Object.entries(mData.requests)) {
          if (isTestId(req.proposerId) || isTestId(req.targetId) || isTestId(k)) {
            delete mData.requests[k];
            results.marriageData.purged++;
            modified = true;
          }
        }
      }
      if (modified) safeSave(marriagePath, mData);
    } catch (e) {
      console.error(`Erro ao processar marriageData.json: ${e.message}`);
    }
  }

  console.log('\n📊 Resumo da Limpeza de Contas de Teste:');
  let totalPurged = 0;
  for (const [db, stats] of Object.entries(results)) {
    if (stats.purged > 0 || stats.kept > 0) {
      console.log(`  • ${db}: ${stats.purged} removidas | ${stats.kept} contas reais preservadas`);
      totalPurged += stats.purged;
    }
  }
  console.log(`\n✨ Concluído! Total de ${totalPurged} registros de teste removidos com sucesso.\n`);
  return results;
}

if (require.main === module) {
  const target = process.argv[2] || path.join(process.cwd(), 'data');
  purgeDatabase(target);
}

module.exports = { purgeDatabase, isTestId };

