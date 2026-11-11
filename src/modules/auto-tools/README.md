# 🛠️ Ferramentas Automáticas

## O que é este módulo?

Sete ferramentas do dia a dia. Cada servidor liga em Painel → **Automações** (grupo Utilidade). Desligadas por padrão (a recompensa de bump da Cringelândia é a exceção: já vem ligada lá).

## O que ele é capaz de fazer?

- **Call temporária:** entrar na call "criar sala" cria uma call própria, que some quando esvazia (também depois de reinício).
- **Contador de membros** no nome de um canal, a cada 10 min (só renomeia quando muda).
- **Respostas automáticas:** `gatilho => resposta`, uma por linha, com variações por `|`. Palavra inteira, sem acento; pausa de 2 min por pergunta.
- **Recado agendado** nos dias e hora escolhidos (Brasília).
- **Resumo semanal** para a staff: mensagens, entradas, saídas, comandos e automações que mais agiram na semana.
- **Arquivo de fixadas:** perto do limite de 50, move as mais antigas para um canal de arquivo.
- **Lembrete de bump (2.0):** depois de um `/bump` no DISBOARD, avisa quando der para dar de novo. O aviso pode ir no mesmo canal ou num canal fixo, como cartão (cor, título e texto com `{user}`, `{role}`, `{count}`, `{streak}`) ou texto puro, com até três cargos marcados, botão que abre a página do servidor no DISBOARD, DM para quem bumpou, horário de silêncio (segura o aviso de madrugada e retoma às 08:00 de Brasília) e repetição opcional até alguém bumpar. Também apaga o aviso antigo quando chega bump novo, apaga o lembrete depois do tempo escolhido, agradece cada bump com a sequência de dias, celebra marcos de N bumps e guarda bumps totais, recorde, ranking de quem mais bumpa e o melhor horário/dia — tudo no painel (Automações → Lembrete de bump), com botão para zerar os contadores.
- **Recompensa de bump (só Cringelândia):** cada bump confirmado pelo DISBOARD paga `100` moedinhas a quem bumpou (dentro do teto diário de moedas) e tem `5%` de chance de um feijão mágico. Vale com ou sem o lembrete ligado. Um bump premiado a cada 110 min por servidor (o DISBOARD libera de 2 em 2 h); a mesma mensagem nunca paga duas vezes, e o estado é gravado antes do crédito. O cartão sai com a voz da Pyxie (falas sorteadas sem repetir), sem marcar ninguém, e substitui o agradecimento do lembrete. Totais e ranking da recompensa aparecem no painel, no mesmo cartão do lembrete. Serviço: `src/services/bumpRewards.js`; estado em `data/guilds/<id>/bumpRewards.json`.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Gerenciar Canais e Mover Membros (salas), Gerenciar Canais (contador), Gerenciar Mensagens (fixadas).

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules3.js`, `src/services/autoState.js`, `src/services/bumpRewards.js`, `src/utils/phraseDeck.js`, `src/services/guildActivity.js` (resumo).
