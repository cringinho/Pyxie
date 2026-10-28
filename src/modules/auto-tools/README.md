# 🛠️ Ferramentas Automáticas

## O que é este módulo?

Sete ferramentas do dia a dia. Cada servidor liga em Painel → **Automações** (grupo Utilidade). Desligadas por padrão.

## O que ele é capaz de fazer?

- **Call temporária:** entrar na call "criar sala" cria uma call própria, que some quando esvazia (também depois de reinício).
- **Contador de membros** no nome de um canal, a cada 10 min (só renomeia quando muda).
- **Respostas automáticas:** `gatilho => resposta`, uma por linha, com variações por `|`. Palavra inteira, sem acento; pausa de 2 min por pergunta.
- **Recado agendado** nos dias e hora escolhidos (Brasília).
- **Resumo semanal** para a staff: mensagens, entradas, saídas, comandos e automações que mais agiram na semana.
- **Arquivo de fixadas:** perto do limite de 50, move as mais antigas para um canal de arquivo.
- **Lembrete de bump** do Disboard depois de 2 h.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Gerenciar Canais e Mover Membros (salas), Gerenciar Canais (contador), Gerenciar Mensagens (fixadas).

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules3.js`, `src/services/autoState.js`, `src/services/guildActivity.js` (resumo).
