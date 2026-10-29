#!/usr/bin/env bash
# Roda `npm test` sem tocar nos dados locais nem usar segredos reais.
#
# 1. Move data/ para um backup temporário (e guarda uma cópia do economy.json,
#    que não respeita PYXIE_DATA_DIR).
# 2. Cria um data/ mínimo com scripts/seed_ci_fixtures.js.
# 3. Roda a suíte com DISCORD_TOKEN, GROQ_API_KEY, DATABASE_URL e segredos do painel em branco.
# 4. Restaura data/ sempre, mesmo se a suíte falhar ou for interrompida.
#
# Uso: ./scripts/test-safe.sh [arquivo de log]   (padrão: test.log)
# Sai com o mesmo código da suíte.
set -u
export PATH="$PATH:/c/Program Files/nodejs:/c/Program Files/Git/cmd:/c/Program Files/Git/bin"

cd "$(dirname "$0")/.." || exit 1

LOG_FILE="${1:-test.log}"
BACKUP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pyxie-data-bak.XXXXXX")"
HAD_DATA=0

restore() {
  rm -rf data
  if [ "$HAD_DATA" = "1" ]; then
    mv "$BACKUP_DIR/data" data
    if [ -f "$BACKUP_DIR/economy.json" ]; then
      cp "$BACKUP_DIR/economy.json" data/economy.json
    fi
  fi
  rm -rf "$BACKUP_DIR"
}
trap restore EXIT
trap 'exit 130' INT TERM

if [ -d data ]; then
  HAD_DATA=1
  if [ -f data/economy.json ]; then
    cp data/economy.json "$BACKUP_DIR/economy.json"
  fi
  mv data "$BACKUP_DIR/data"
fi

node scripts/seed_ci_fixtures.js >/dev/null

DISCORD_TOKEN= GROQ_API_KEY= DATABASE_URL= \
  PANEL_SECRET= API_SECRET_TOKEN= MARY_STUDIO_SECRET= \
  PYXIE_CI_FIXTURES=1 npm test >"$LOG_FILE" 2>&1
STATUS=$?

echo "npm test terminou com código $STATUS (log em $LOG_FILE)"
exit "$STATUS"
