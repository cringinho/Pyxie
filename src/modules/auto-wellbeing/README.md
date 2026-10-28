# 💜 Automações de Bem-estar

## O que é este módulo?

Sete cuidados pensados para uma comunidade de pessoas neurodivergentes e em sofrimento. Cada servidor liga em Painel → **Automações** (grupo Comunidade). Todos desligados por padrão. O tom é caloroso e sem ironia (AGENTS.md §12).

## O que ele é capaz de fazer?

- **Pausa de hiperfoco:** quem tem o cargo escolhido (opt-in) recebe por DM um lembrete gentil depois de muito tempo seguido no chat. No máximo um a cada 4 h.
- **Horário de descanso:** de madrugada, canais em modo lento ou fechados, com boa-noite. De manhã voltam exatamente como estavam (estado em `quietHours.json`).
- **Primeira mensagem acolhida:** a primeira mensagem de quem chegou na semana ganha resposta calorosa.
- **Ninguém sem resposta:** em canais de ajuda e fóruns, sem resposta em X min, avisa que a mensagem foi vista e marca só o cargo de ajudantes.
- **Cuidado em crise:** frase de sofrimento sério fora do desabafo → DM com CVV `188`, findahelpline e emergência; aviso discreto para a staff. Uma vez a cada 6 h por pessoa.
- **Marcos de membros** (50, 100, 250… 1000, 2000…).
- **Obrigada pelo boost.**

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Enviar Mensagens; Gerenciar Canais para o horário de descanso.

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules3.js` (regras puras), `src/services/autoState.js` (estado com escrita atômica).
