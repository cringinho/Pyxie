#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="${SCRIPT_DIR}/systemd"

echo "⚙️ Configurando o serviço e timer de auto-deploy no systemd..."
sudo cp "${SYSTEMD_DIR}/pyxie-autodeploy.service" /etc/systemd/system/
sudo cp "${SYSTEMD_DIR}/pyxie-autodeploy.timer" /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable --now pyxie-autodeploy.timer

echo "✅ Timer ativado com sucesso! Status:"
sudo systemctl status pyxie-autodeploy.timer --no-pager
echo ""
echo "Lista de timers ativos:"
systemctl list-timers pyxie-autodeploy.timer --no-pager
