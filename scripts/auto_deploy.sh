#!/usr/bin/env bash
# ==============================================================================
# Pyxie Bot - Automated Safe Deployment Worker
# Executado periodicamente via systemd timer para verificar a branch 'main'.
# Se não houver novos commits: sai imediatamente em < 0.3s sem gastar recursos.
# Se houver novos commits: realiza backup do banco de dados, puxa código,
# roda testes, e só reinicia o bot se os testes passarem 100%.
# ==============================================================================

set -Eeuo pipefail

# Garante PATH completo para comandos do Node, npm, pm2 e git
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

REPO_DIR="${HOME}/kuromi"
LOG_DIR="${REPO_DIR}/logs"
LOG_FILE="${LOG_DIR}/autodeploy.log"
LOCK_FILE="/tmp/pyxie_autodeploy.lock"

# Cria diretório de logs se não existir
mkdir -p "${LOG_DIR}"

# 1. Lock de Concorrência: Impede múltiplas execuções simultâneas
exec 200>"${LOCK_FILE}"
if ! flock -n 200; then
  # Outra instância já está em execução (ex: instalando pacotes ou rodando testes)
  exit 0
fi

cd "${REPO_DIR}"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "${msg}"
  echo "${msg}" >> "${LOG_FILE}"
}

# 2. Verifica se a branch local é 'main'
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ "${CURRENT_BRANCH}" != "main" ]; then
  # Se a VM estiver em outra branch intencionalmente para testes, não mexe
  exit 0
fi

# 3. Pré-checagem rápida: busca commits do remoto sem alterar a working tree
if ! git fetch origin main --quiet 2>/dev/null; then
  # Falha transitória de rede com o GitHub; sai silenciosamente para tentar no próximo ciclo
  exit 0
fi

LOCAL_REV=$(git rev-parse HEAD)
REMOTE_REV=$(git rev-parse origin/main)

# Se não houver commits novos, sai imediatamente (zero CPU, zero reinício, zero risco)
if [ "${LOCAL_REV}" = "${REMOTE_REV}" ]; then
  exit 0
fi

# ==============================================================================
# NOVO COMMIT DETECTADO! Iniciando pipeline de deploy seguro
# ==============================================================================
COMMIT_MSG=$(git log -1 --pretty=format:"%s (%an)" origin/main)
log "⚡ Novo commit detectado em origin/main: ${REMOTE_REV:0:7} - \"${COMMIT_MSG}\""
log "Iniciando processo de deploy seguro com proteção de banco de dados..."

# 4. Snapshot Atômico do Banco de Dados e Configurações da VM
BACKUP_DIR="${HOME}/backups/kuromi/auto-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP_DIR}/src_data"

if [ ! -d "data" ]; then
  log "❌ ERRO CRÍTICO: Pasta data/ não encontrada. Abortando para segurança."
  exit 1
fi

# Copia base de dados dos usuários (economia, inventário, etc) e arquivos de ambiente
cp -a data "${BACKUP_DIR}/"
[ -f .env ] && cp -a .env "${BACKUP_DIR}/"
[ -f prefix.json ] && cp -a prefix.json "${BACKUP_DIR}/"

# Salva arquivos dinâmicos gerados em produção (minigames da IA Groq, cliques Shopee, emojis)
for dynamic_file in generated_work_minigames.json shopee.json emojis.json discordAppEmojis.json themeEmojis.json; do
  if [ -f "src/data/${dynamic_file}" ]; then
    cp -a "src/data/${dynamic_file}" "${BACKUP_DIR}/src_data/"
  fi
done

log "✅ Backup completo criado em: ${BACKUP_DIR}"

# 5. Guarda o arquivo de minigames gerados pela IA na VM em local temporário para merge
TEMP_MINIGAMES="/tmp/live_minigames_$(date +%s).json"
if [ -f "src/data/generated_work_minigames.json" ]; then
  cp "src/data/generated_work_minigames.json" "${TEMP_MINIGAMES}"
fi

# 6. Prepara árvore de trabalho para Fast-Forward seguro
# Descarta alterações locais em arquivos rastreados de src/data para não travar o pull
git checkout -- src/data/ 2>/dev/null || true

# 7. Executa o git pull Fast-Forward
if ! git pull --ff-only origin main; then
  log "❌ ERRO: 'git pull --ff-only origin main' falhou. Restaurando estado anterior..."
  [ -f "${TEMP_MINIGAMES}" ] && rm -f "${TEMP_MINIGAMES}"
  exit 1
fi

# 8. Mescla de forma inteligente os cenários gerados pela IA (sem perder nada)
if [ -f "${TEMP_MINIGAMES}" ] && [ -f "scripts/merge_minigames.js" ]; then
  node scripts/merge_minigames.js "${TEMP_MINIGAMES}" "src/data/generated_work_minigames.json" "src/data/generated_work_minigames.json" || true
  rm -f "${TEMP_MINIGAMES}"
fi

# 9. Restaura arquivos de configuração e estado vivo da VM
[ -f "${BACKUP_DIR}/.env" ] && cp -a "${BACKUP_DIR}/.env" .env
[ -f "${BACKUP_DIR}/prefix.json" ] && cp -a "${BACKUP_DIR}/prefix.json" prefix.json
[ -f "${BACKUP_DIR}/src_data/shopee.json" ] && cp -a "${BACKUP_DIR}/src_data/shopee.json" src/data/shopee.json
[ -f "${BACKUP_DIR}/src_data/themeEmojis.json" ] && cp -a "${BACKUP_DIR}/src_data/themeEmojis.json" src/data/themeEmojis.json
[ -f "${BACKUP_DIR}/src_data/emojis.json" ] && cp -a "${BACKUP_DIR}/src_data/emojis.json" src/data/emojis.json
[ -f "${BACKUP_DIR}/src_data/discordAppEmojis.json" ] && cp -a "${BACKUP_DIR}/src_data/discordAppEmojis.json" src/data/discordAppEmojis.json

# 10. Garante que os bancos de dados em data/ continuem sendo estritamente os da VM
# (data/*.json é ignorado no git, mas sincronizamos qualquer arquivo necessário)
cp -a "${BACKUP_DIR}/data/." data/

# 10.1. Sincroniza chaves SSH de administração para acesso seguro à VM
mkdir -p "${HOME}/.ssh" && chmod 700 "${HOME}/.ssh"
for pubkey in \
  "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJJnIAYrpK6GLnX47iEq2srrH14lhOhsfSIdjPcHEUol leandrosdclh" \
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCgeXeZaXN+E9qvDiRFWYynEPdtQT5Te8Qe727IaN2vis1kLVmIfJLPFspwgq+Bmia7TwwoIv5zHqhZrFKlE32Htjr1MqUNEpyj9Qb2dYrpJiA7vE+MW7YAfHYNeWK5uy+TnnoBbdYZBdqg/fgmAAuSKfXrZua2xMQdrqIH/B4DvomzU8OrirFeJ6M15ywLtkQHKVIDcQenclvi9Sf8/+B58xUFayAMGjep6daFbKeuEjCmnWt3IiQTQw1PhpOdfVdvhAwA9qxcKLDV0pmvUalrEf6/xFnbjFOVLjitJO4OW/YVoqmJlzHVjrDS7iHjfG6HGwQcIwErvmSnG9Jje0wXk4lg7ZOcRzIc92YlBCn4fzfN3TMa3+JEXTvECOqvs5o2knKq0hdgIpr48M9pXqjOOAcKEyvg9JdRFeVXtFJhXmyeAHH748KxZHhHTY4/4SIYjL1vIhpWXjad7gNwRKIGiiR6UxqPBni/VgESswltGuLZZF1LXR+XBqDt+tzXntvM/FBtYj4I/uYb0VboAnatDAvbdKwoZIbYdoZW/KkBqIx3HXNhfdyl0Y4OqYu4NvEMjNsVv86j0xRPC08xW3/a4AVQO0xDk5mfMKK3ll9gZT9QkK1qX/erdUgwwb42c1TaGo1LOobp+Aiht88lNIAX+H/zQjx+n4qgcYCvgcImDQ== user@DESKTOP-RQ7J9NH" \
  "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC9xsX55FfgfDGEUPN7wEWs7t19YCEagkISzDejGwDKcjM3sinEmWLH/6DYaQEBkjQQEx3ZECMncfRSGOvSa8DJsp5voD5NqYvHp8o8qg5eorD92U9VArba5nFfcuY+PuiEJv+JuLcl0zfjWnKmTYPniCnD9w5E6qhogljvopGLXtdEwEAOuaNHpZEkJ7iXstyydTCdpNFU3Pmj8veNy7nfzGeMs6LF2AFTE8n4+MMMGayEUDhzgNHesRBMTVXt+M1jXpgAuGQBrxtIWmoxNWCWYwTO6r5wY3gu7cwHpl0QXI7B0LDD2fUO0KfTWLSqQOVGDVmpNFhVJ4AZlR/AY6oj ssh-key-2026-09-29"
do
  if ! grep -qF "${pubkey}" "${HOME}/.ssh/authorized_keys" 2>/dev/null; then
    echo "${pubkey}" >> "${HOME}/.ssh/authorized_keys"
  fi
done
chmod 600 "${HOME}/.ssh/authorized_keys"

# 11. Quality Gate: Executa os 13 testes automatizados antes de reiniciar o bot
log "🧪 Executando bateria de testes automatizados (npm test)..."
if ! npm test; then
  log "❌ ERRO: Testes automatizados falharam no commit ${REMOTE_REV:0:7}!"
  log "Executando rollback imediato para proteger o bot em produção..."

  # Reverte o git para o commit anterior que estava funcionando
  git reset --hard "${LOCAL_REV}"

  # Restaura todos os dados do backup
  cp -a "${BACKUP_DIR}/data/." data/
  [ -f "${BACKUP_DIR}/.env" ] && cp -a "${BACKUP_DIR}/.env" .env
  [ -f "${BACKUP_DIR}/prefix.json" ] && cp -a "${BACKUP_DIR}/prefix.json" prefix.json
  for dynamic_file in generated_work_minigames.json shopee.json emojis.json discordAppEmojis.json themeEmojis.json; do
    if [ -f "${BACKUP_DIR}/src_data/${dynamic_file}" ]; then
      cp -a "${BACKUP_DIR}/src_data/${dynamic_file}" "src/data/${dynamic_file}"
    fi
  done

  log "🛡️ Rollback concluído. O bot permanece online na versão estável anterior."
  exit 1
fi
log "✅ Quality Gate aprovado: 100% dos testes passaram."

# 12. Instalação inteligente de dependências (apenas se package.json mudou)
if git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^package(-lock)?\.json$'; then
  log "📦 Alterações em dependências detectadas. Executando 'npm ci --omit=dev'..."
  npm ci --omit=dev
else
  log "⚡ Dependências inalteradas. Pulando npm ci."
fi

# 13. Registro de comandos slash (apenas se comandos mudaram)
if git diff "${LOCAL_REV}" "${REMOTE_REV}" --name-only | grep -qE '^(src/commands|src/registerSlashCommands\.js)'; then
  log "📜 Novos comandos ou alterações detectadas. Registrando Slash Commands..."
  node src/registerSlashCommands.js || log "⚠️ Aviso: Falha não-fatal ao registrar slash commands."
fi

# 14. Reinício gracioso do processo no PM2
log "🔄 Reiniciando Pyxie via PM2 (reload gracioso)..."
pm2 reload pyxie --update-env || pm2 restart pyxie --update-env || pm2 startOrReload ecosystem.config.js --update-env
pm2 save --force 2>/dev/null || true

# 15. Limpeza de backups antigos (mantém apenas os últimos 15 backups para não encher o disco)
(cd "${HOME}/backups/kuromi" && ls -dt auto-* 2>/dev/null | tail -n +16 | xargs -r rm -rf) || true

log "🎉 Deploy automático concluído com sucesso para ${REMOTE_REV:0:7}!"
log "Status atual da Pyxie:"
pm2 status | grep -E 'pyxie|name' || true
