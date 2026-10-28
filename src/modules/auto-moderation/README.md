# 🧹 Automações de Moderação

## O que é este módulo?

Rotinas de moderação que cada servidor liga em Painel → **Automações** (grupo Moderação). Desligadas por padrão.

## O que ele é capaz de fazer?

- **Registro de moderação:** mensagens apagadas e editadas, entradas, saídas, apelidos e cargos num canal da staff (sem pings).
- **Modo lento automático:** quando a conversa passa de N mensagens por minuto, liga o modo lento e volta ao valor anterior sozinho (guardado em `data/guilds/<id>/autoSlowmode.json`, sobrevive a reinício).
- **Cor de cargo legível:** avisa quando um cargo ganha cor com pouco contraste no tema escuro (WCAG) e oferece botão para aplicar uma cor parecida que passa.
- **Limpeza de canais:** apaga mensagens mais velhas que X horas (mantém as fixadas, se escolhido).

## Comandos no Discord

Nenhum. Botão **Aplicar sugestão** no aviso de contraste (Gerenciar Cargos).

## Canais, cargos e permissões

Gerenciar Canais (modo lento), Gerenciar Mensagens e Ler Histórico (limpeza), Enviar Mensagens (registro).

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules.js`, `src/services/autoAlerts.js`, partials de mensagem para registrar o que saiu do cache.
