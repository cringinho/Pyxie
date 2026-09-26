#!/usr/bin/env bash
set -Eeuo pipefail

cd "$HOME/kuromi"

if [ "$(git branch --show-current)" != "main" ]; then
  echo "ERRO: a branch atual nao e main."
  exit 1
fi

BACKUP="$HOME/backups/kuromi/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
if [ ! -d data ]; then
  echo "ERRO: a pasta data/ nao existe na VM. Deploy abortado."
  exit 1
fi
cp -a data "$BACKUP/"
[ -f .env ] && cp -a .env "$BACKUP/"
[ -f prefix.json ] && cp -a prefix.json "$BACKUP/"
[ -f src/data/emojis.json ] && cp -a src/data/emojis.json "$BACKUP/"
[ -f src/data/shopee.json ] && cp -a src/data/shopee.json "$BACKUP/"
[ -f src/data/themeEmojis.json ] && cp -a src/data/themeEmojis.json "$BACKUP/"
echo "Backup criado em $BACKUP"

# A VM e a fonte de verdade dos dados. Guarde qualquer estado local antes do pull;
# ele nao deve impedir a atualizacao nem ser enviado para o repositorio.
git fetch origin
git stash push -u -m "deploy-pre-$BACKUP"

git pull --ff-only origin main

# O pull atualiza o codigo, mas os dados continuam sendo os da VM.
rm -rf data
cp -a "$BACKUP/data" data
[ -f "$BACKUP/.env" ] && cp -a "$BACKUP/.env" .env
[ -f "$BACKUP/prefix.json" ] && cp -a "$BACKUP/prefix.json" prefix.json
[ -f "$BACKUP/emojis.json" ] && cp -a "$BACKUP/emojis.json" src/data/emojis.json
[ -f "$BACKUP/shopee.json" ] && cp -a "$BACKUP/shopee.json" src/data/shopee.json
[ -f "$BACKUP/themeEmojis.json" ] && cp -a "$BACKUP/themeEmojis.json" src/data/themeEmojis.json

npm ci --omit=dev
node src/registerSlashCommands.js || echo "Aviso: falha ao registrar slash commands"
pm2 restart pyxie --update-env || pm2 startOrReload ecosystem.config.js --update-env
pm2 save
pm2 status

echo "Atualizacao concluida. Backup: $BACKUP"
