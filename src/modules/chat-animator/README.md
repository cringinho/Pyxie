# 🎉 Animador de Chat

## O que é este módulo?

Quando um canal que estava vivo fica em silêncio, a Pyxie solta algo leve para puxar assunto: uma pergunta, um "isso ou aquilo", uma enquete nativa, um desafio criativo, uma curiosidade, uma palavra embaralhada ou uma pergunta escrita pela staff.

**Desligado por padrão.** Cada servidor liga em Painel → Automações → Animador de chat.

## O que ele é capaz de fazer?

- **Só fala no silêncio:** o canal precisa ter tido conversa nas últimas 24 h e estar quieto há N minutos (padrão 90).
- **Respeita horário e limite:** janela de horário (Brasília), máximo por canal por dia e intervalo mínimo no servidor.
- **Espera mais quando ninguém responde:** depois de 3 posts sem resposta, o intervalo dobra (até 8×).
- **Nunca fala:** no canal de desabafo, durante pausa de raid, no modo blindagem nem logo depois da própria mensagem.
- **Some sozinho:** apaga o post ignorado depois de X minutos (0 = nunca).
- **Jeito da Pyxie:** fofa, neutra ou tsundere (só a abertura muda).
- **Palavra embaralhada** dá só a glória: não dá moedas (AGENTS.md §5).
- **Staff pausa por 24 h** no botão do próprio post (precisa de Gerenciar Mensagens).
- **Números no cartão do painel:** posts e respondidos.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

- **Canais escolhidos** no painel (até 10).
- Enviar mensagens; criar enquetes (sem ela, o tipo enquete é pulado).

## Recursos no site e web

Painel → servidor → **Automações** → Animador de chat, com prévia ao vivo.

## Ferramentas e bibliotecas usadas

- `src/services/automations.js` (esquema declarativo que monta a tela e valida o salvamento).
- `src/services/animator.js` (regras puras), `src/data/animatorBank.js` (banco PT/EN).
- `src/services/automationStats.js` (números do cartão).
