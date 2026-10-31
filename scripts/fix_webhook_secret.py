#!/usr/bin/env python3
"""Atualiza MERCADOPAGO_WEBHOOK_SECRET no .env de produção a partir de um arquivo
temporário com a linha já no formato CHAVE=valor (lido por stdin/scp, nunca por argumento).
Uso: python3 scripts/fix_webhook_secret.py /tmp/mpsec"""
import pathlib
import re
import sys

if len(sys.argv) < 2:
    sys.exit('faltou o caminho do arquivo temporário')

line = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8').strip()
if not line.startswith('MERCADOPAGO_WEBHOOK_SECRET='):
    line = f'MERCADOPAGO_WEBHOOK_SECRET={line}'
if len(line) < 40:
    sys.exit('linha inválida')

env = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else pathlib.Path('.env')
text = env.read_text(encoding='utf-8')
pattern = r'^MERCADOPAGO_WEBHOOK_SECRET=.*$'
if re.search(pattern, text, re.M):
    text = re.sub(pattern, line, text, flags=re.M)
else:
    text = text.rstrip() + '\n' + line + '\n'
env.write_text(text, encoding='utf-8')
print('MERCADOPAGO_WEBHOOK_SECRET atualizado')
