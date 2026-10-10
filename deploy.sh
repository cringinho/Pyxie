#!/usr/bin/env bash
# ==============================================================================
# Pyxie Bot - Manual Safe Deployment Script
# Suporta flag '--force' para forçar deploy mesmo sem novos commits.
# Sem flags: checa se há novos commits antes de rodar o pipeline.
# ==============================================================================

set -Eeuo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

REPO_DIR="${HOME}/kuromi"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/deploy.log"
LOCK_FILE="/tmp/pyxie_autodeploy.lock"

mkdir -p "${LOG_DIR}"

exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
  echo "⚠️ Outro processo de deploy já está em execução. Aguarde alguns instantes."
  exit 1
fi

cd "${REPO_DIR}"

FORCE_DEPLOY=false
if [ "${1:-}" = "--force" ] || [ "${1:-}" = "-f" ]; then
  FORCE_DEPLOY=true
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "${CURRENT_BRANCH}" != "main" ]; then
  echo "❌ ERRO: A branch atual não é 'main'. Deploy abortado."
  exit 1
fi

echo "🔍 Verificando repositório remoto (origin/main)..."
git fetch origin main --quiet

LOCAL_REV=$(git rev-parse HEAD)
REMOTE_REV=$(git rev-parse origin/main)

if [ "${LOCAL_REV}" = "${REMOTE_REV}" ] && [ "${FORCE_DEPLOY}" = false ]; then
  echo "✅ A branch 'main' já está 100% atualizada (${LOCAL_REV:0:7}). Nada a fazer."
  echo "Dica: use './deploy.sh --force' para forçar reinstalação/reinício manual."
  exit 0
fi

BACKUP_DIR="${HOME}/backups/kuromi/$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}/src_data"

if [ ! -d "data" ]; then
  echo "❌ ERRO CRÍTICO: Pasta data/ não encontrada. Deploy cancelado."
  exit 1
fi

echo "💾 Criando backup atômico dos bancos e configurações em ${BACKUP_DIR}..."
cp -a data "${BACKUP_DIR}/"
[ -f .env ] && cp -a .env "${BACKUP_DIR}/"
[ -f prefix.json ] && cp -a prefix.json "${BACKUP_DIR}/"

for dynamic_file in generated_work_minigames.json shopee.json emojis.json discordAppEmojis.json themeEmojis.json; do
  if [ -f "src/data/${dynamic_file}" ]; then
    cp -a "src/data/${dynamic_file}" "${BACKUP_DIR}/src_data/"
  fi
done

TEMP_MINIGAMES="/tmp/live_minigames_$(date +%s).json"
if [ -f "src/data/generated_work_minigames.json" ]; then
  cp "src/data/generated_work_minigames.json" "${TEMP_MINIGAMES}"
fi

git checkout -- src/data/ public/ 2>/dev/null || true

echo "📥 Atualizando código via git pull..."
git pull --ff-only origin main

if [ -f "${TEMP_MINIGAMES}" ] && [ -f "scripts/merge_minigames.js" ]; then
  node scripts/merge_minigames.js "${TEMP_MINIGAMES}" "src/data/generated_work_minigames.json" "src/data/generated_work_minigames.json" || true
  rm -f "${TEMP_MINIGAMES}"
fi

[ -f "${BACKUP_DIR}/.env" ] && cp -a "${BACKUP_DIR}/.env" .env
[ -f "${BACKUP_DIR}/prefix.json" ] && cp -a "${BACKUP_DIR}/prefix.json" prefix.json
[ -f "${BACKUP_DIR}/src_data/shopee.json" ] && cp -a "${BACKUP_DIR}/src_data/shopee.json" src/data/shopee.json
[ -f "${BACKUP_DIR}/src_data/themeEmojis.json" ] && cp -a "${BACKUP_DIR}/src_data/themeEmojis.json" src/data/themeEmojis.json
if [ -f "${BACKUP_DIR}/src_data/emojis.json" ]; then
  node -e "
    const fs = require('fs');
    try {
      const b = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
      const obsolete = ['phantom_coin', 'vigor_energy', 'boss_behemoth', 'relic_t1', 'relic_t2', 'relic_t3', 'relic_t4', 'relic_t5'];
      obsolete.forEach(k => delete b[k]);
      const cur = JSON.parse(fs.readFileSync('src/data/emojis.json', 'utf8'));
      obsolete.forEach(k => delete cur[k]);
      const merged = Object.assign({}, cur, b);
      obsolete.forEach(k => delete merged[k]);
      fs.writeFileSync('src/data/emojis.json', JSON.stringify(merged, null, 2));
    } catch (e) {}
  " "${BACKUP_DIR}/src_data/emojis.json" || true
fi
[ -f "${BACKUP_DIR}/src_data/discordAppEmojis.json" ] && cp -a "${BACKUP_DIR}/src_data/discordAppEmojis.json" src/data/discordAppEmojis.json
cp -a "${BACKUP_DIR}/data/." data/
rm -f data/gloom.json data/gloom.json.bak data/encounters.json data/world_boss.json data/stats.json.*.tmp
if [ -f data/inventory.json ]; then
  node -e "
    const fs = require('fs');
    try {
      const inv = JSON.parse(fs.readFileSync('data/inventory.json', 'utf8'));
      let changed = false;
      for (const u of Object.keys(inv)) {
        if (inv[u] && typeof inv[u] === 'object') {
          for (const item of ['sela_cavalo', 'asas_fada', 'asas_grifo']) {
            if (item in inv[u]) { delete inv[u][item]; changed = true; }
          }
        }
      }
      if (changed) fs.writeFileSync('data/inventory.json', JSON.stringify(inv, null, 2));
    } catch (e) {}
  " || true
fi

echo "🧪 Executando Quality Gate (npm test)..."
if ! npm test; then
  echo "❌ ERRO: Testes falharam após a atualização! Revertendo..."
  git reset --hard "${LOCAL_REV}"
  cp -a "${BACKUP_DIR}/data/." data/
  [ -f "${BACKUP_DIR}/.env" ] && cp -a "${BACKUP_DIR}/.env" .env
  [ -f "${BACKUP_DIR}/prefix.json" ] && cp -a "${BACKUP_DIR}/prefix.json" prefix.json
  echo "🛡️ Rollback finalizado. O bot continua operacional na versão estável."
  exit 1
fi

# Proteção Absoluta de Produção: Restaura snapshot de data/ pós-testes para garantia de zero efeitos colaterais
cp -a "${BACKUP_DIR}/data/." data/

if [ "${FORCE_DEPLOY}" = true ] || git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^package(-lock)?\.json$'; then
  echo "📦 Instalando dependências..."
  npm ci --omit=dev
fi

if [ -d "client" ] && [ -f "client/package.json" ]; then
  if [ "${FORCE_DEPLOY}" = true ] || git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^client/'; then
    echo "⚛️ Verificando e compilando frontend React/Vite..."
    if [ ! -d "client/node_modules" ] || git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^client/package(-lock)?\.json$'; then
      (cd client && npm install --silent)
    fi
    (cd client && npm run build) || echo "Aviso: falha não-fatal ao compilar frontend (utilizando dist existente)."
  fi
fi

if [ "${FORCE_DEPLOY}" = true ] || git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^(src/commands|src/registerSlashCommands\.js)'; then
  echo "📜 Registrando slash commands..."
  node src/registerSlashCommands.js || echo "Aviso: falha não-fatal ao registrar slash commands."
fi

echo "🔄 Reiniciando processo no PM2..."
pm2 reload pyxie --update-env || pm2 restart pyxie --update-env || pm2 startOrReload ecosystem.config.js --update-env
pm2 save --force 2>/dev/null || true

(cd "${HOME}/backups/kuromi" && ls -dt auto-* 2>/dev/null | tail -n +16 | xargs -r rm -rf) || true

echo "✨ ===================================================="
echo "🎉 Deploy concluído com sucesso! Backup: ${BACKUP_DIR}"
echo "✨ ===================================================="
pm2 status | grep -E 'pyxie|name' || true
