const fs = require('node:fs');
const path = require('node:path');

function auditDatabase(dataDir, { autoCleanStale = false } = {}) {
  const issues = [];
  const fixes = [];
  console.log(`🔍 [Audit] Escaneando diretório de dados: ${dataDir}`);

  if (!fs.existsSync(dataDir)) {
    return { error: 'DATA_DIR_NOT_FOUND', issues, fixes };
  }

  const allEntries = fs.readdirSync(dataDir);
  const files = allEntries.filter((f) => f.endsWith('.json'));

  // 1. Auditoria de arquivos JSON quanto a parsing e sintaxe
  const data = {};
  for (const f of files) {
    const fullPath = path.join(dataDir, f);
    try {
      const raw = fs.readFileSync(fullPath, 'utf8');
      data[f] = JSON.parse(raw);
    } catch (err) {
      issues.push({ file: f, issue: 'CORRUPTED_JSON', details: err.message });
    }
  }

  // 2. Auditoria da Economia (economy.json)
  if (data['economy.json']) {
    const eco = data['economy.json'];
    for (const [userId, acc] of Object.entries(eco)) {
      if (!acc || typeof acc !== 'object') {
        issues.push({ file: 'economy.json', userId, issue: 'INVALID_ACCOUNT_STRUCTURE' });
        continue;
      }

      // Checa saldo negativo ou NaN em coins
      if (typeof acc.coins !== 'number' || isNaN(acc.coins) || acc.coins < 0) {
        issues.push({ file: 'economy.json', userId, issue: 'INVALID_OR_NEGATIVE_COINS', value: acc.coins });
      }

      // Checa saldo negativo ou NaN em magicBeans
      if (acc.magicBeans !== undefined && (typeof acc.magicBeans !== 'number' || isNaN(acc.magicBeans) || acc.magicBeans < 0)) {
        issues.push({ file: 'economy.json', userId, issue: 'INVALID_OR_NEGATIVE_MAGIC_BEANS', value: acc.magicBeans });
      }

      // Checa níveis de profissão inválidos
      if (acc.workProfessionLevel !== undefined && (!Number.isInteger(acc.workProfessionLevel) || acc.workProfessionLevel < 1 || acc.workProfessionLevel > 4)) {
        issues.push({ file: 'economy.json', userId, issue: 'INVALID_PROFESSION_LEVEL', value: acc.workProfessionLevel });
      }

      // Checa cooldowns incoerentes (datas no futuro distante > 1 ano ou valores NaN)
      const now = Date.now();
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      if (acc.lastDaily && (isNaN(acc.lastDaily) || acc.lastDaily > now + oneYearMs)) {
        issues.push({ file: 'economy.json', userId, issue: 'ANOMALOUS_DAILY_COOLDOWN', value: acc.lastDaily });
      }
      if (acc.lastWork && (isNaN(acc.lastWork) || acc.lastWork > now + oneYearMs)) {
        issues.push({ file: 'economy.json', userId, issue: 'ANOMALOUS_WORK_COOLDOWN', value: acc.lastWork });
      }
    }
  }

  // 3. Auditoria do Álbum de Tarot (tarot_album.json)
  if (data['tarot_album.json']) {
    const album = data['tarot_album.json'];
    for (const [userId, userAlbum] of Object.entries(album)) {
      if (!userAlbum || typeof userAlbum !== 'object') {
        issues.push({ file: 'tarot_album.json', userId, issue: 'INVALID_ALBUM_STRUCTURE' });
        continue;
      }

      if (Array.isArray(userAlbum.discoveredCards)) {
        const seenCards = new Set();
        for (const card of userAlbum.discoveredCards) {
          if (!card || typeof card.id !== 'string') {
            issues.push({ file: 'tarot_album.json', userId, issue: 'MALFORMED_CARD_OBJECT', card });
          } else {
            if (seenCards.has(card.id)) {
              issues.push({ file: 'tarot_album.json', userId, issue: 'DUPLICATE_DISCOVERED_CARD', cardId: card.id });
            }
            seenCards.add(card.id);
          }
        }
      }

      if (userAlbum.totalPulls !== undefined && (typeof userAlbum.totalPulls !== 'number' || userAlbum.totalPulls < 0 || isNaN(userAlbum.totalPulls))) {
        issues.push({ file: 'tarot_album.json', userId, issue: 'INVALID_TOTAL_PULLS', value: userAlbum.totalPulls });
      }
    }
  }

  // 4. Auditoria de Casamentos (marriageData.json / marriages.json)
  const marData = data['marriageData.json'] || data['marriages.json'];
  if (marData) {
    const marriages = marData.marriages || marData;
    if (typeof marriages === 'object' && !Array.isArray(marriages)) {
      for (const [mId, m] of Object.entries(marriages)) {
        if (!m || typeof m !== 'object') continue;
        const u1 = m.user1Id || (Array.isArray(m.spouses) ? m.spouses[0] : null);
        const u2 = m.user2Id || (Array.isArray(m.spouses) ? m.spouses[1] : null);
        if (!u1 || !u2 || u1 === u2) {
          issues.push({ file: 'marriageData.json', marriageId: mId, issue: 'INCOHERENT_SPOUSES', m });
        }
        if (m.sharedVaultCoins !== undefined && (typeof m.sharedVaultCoins !== 'number' || m.sharedVaultCoins < 0 || isNaN(m.sharedVaultCoins))) {
          issues.push({ file: 'marriageData.json', marriageId: mId, issue: 'INVALID_VAULT_COINS', value: m.sharedVaultCoins });
        }
      }
    }
  }

  // 5. Auditoria de Resíduos e Arquivos Temporários
  const staleFiles = allEntries.filter((f) => {
    return f.endsWith('.tmp') ||
           f.includes('.tmp.') ||
           f.endsWith('.bak_tarot_module') ||
           (f.endsWith('.backup') && f !== 'settings.json.bak');
  });

  const remainingStaleFiles = [];
  for (const sf of staleFiles) {
    if (autoCleanStale) {
      try {
        fs.unlinkSync(path.join(dataDir, sf));
        fixes.push({ file: sf, status: 'AUTO_DELETED_STALE' });
      } catch (err) {
        remainingStaleFiles.push(sf);
        issues.push({ file: sf, issue: 'STALE_TEMPORARY_OR_BACKUP_FILE', details: `Falha ao remover: ${err.message}` });
      }
    } else {
      remainingStaleFiles.push(sf);
      issues.push({ file: sf, issue: 'STALE_TEMPORARY_OR_BACKUP_FILE', details: 'Arquivo temporário ou backup legado acumulado' });
    }
  }

  return {
    totalCheckedFiles: files.length,
    totalStaleFiles: remainingStaleFiles.length,
    staleFiles: remainingStaleFiles,
    issuesFound: issues.length,
    issues,
    fixes,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const dirArg = args.find((a) => !a.startsWith('--'));
  const targetDir = dirArg || path.join(__dirname, '..', 'data');
  const result = auditDatabase(targetDir);

  if (shouldFix && result.staleFiles.length > 0) {
    console.log(`\n🧹 Removendo ${result.staleFiles.length} arquivos temporários e legados em ${targetDir}...`);
    for (const sf of result.staleFiles) {
      try {
        fs.unlinkSync(path.join(targetDir, sf));
        result.fixes.push({ file: sf, status: 'DELETED' });
      } catch (err) {
        result.fixes.push({ file: sf, status: 'ERROR', message: err.message });
      }
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

module.exports = { auditDatabase };
