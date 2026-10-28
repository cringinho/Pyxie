# 🧹 Faxina de Convites

## O que é este módulo?

Convites que ninguém usa se acumulam (o Discord para em 1.000) e links esquecidos continuam circulando. A faxina lista os convites parados e revoga os escolhidos, sem tocar no link personalizado do servidor nem nos convites de quem é dono.

## O que ele é capaz de fazer?

- **Parado:** zero usos e criado há mais de N dias (padrão 7, de 3 a 90).
- **Lista no painel:** código, quem criou, canal e data; botão para revogar todos os listados (confere de novo na hora).
- **Faxina automática semanal** (opcional, desligada por padrão).

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

- **Gerenciar Servidor:** para ver e revogar convites.

## Recursos no site e web

Painel → servidor → **Segurança** → Faxina de convites.

## Ferramentas e bibliotecas usadas

- O site pede pela ponte com o bot (`INVITES_STALE`, `INVITES_REVOKE`); a última faxina automática fica em `data/guilds/<id>/inviteClean.json`.
