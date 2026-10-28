# 🔥 Fogueira de Voz

## O que é este módulo?

Muita gente não entra em call porque não sabe que tem conversa rolando. Quando uma call pública junta gente por um tempo, a Pyxie posta um convite discreto no canal escolhido, com um botão para entrar. O convite some sozinho quando a call esvazia.

**Desligada por padrão.** Cada servidor liga em Recursos.

## O que ele é capaz de fazer?

- **Quando avisa:** N pessoas (padrão 5) na mesma call por M minutos (padrão 10).
- **Discreto:** não marca ninguém e não mostra nomes, só quantas pessoas.
- **Some sozinho** quando a call fica com menos de 2 pessoas.
- **Pausa por call** (padrão 2 h) para não repetir.
- **Nunca anuncia:** calls privadas (que `@everyone` não vê), o canal AFK e as calls excluídas no painel.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

- **Canal do convite** (escolhido no painel), onde a Pyxie possa enviar mensagens.

## Recursos no site e web

Painel → servidor → **Recursos** → Fogueira de voz.

## Ferramentas e bibliotecas usadas

- Intent de estados de voz (leve, não privilegiado). Configuração em `data/guilds/<id>/campfire.json`; regra em `src/services/campfire.js`.
