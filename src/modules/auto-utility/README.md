# 🧰 Automações de Utilidade

## O que é este módulo?

Facilidades que cada servidor liga em Painel → **Automações** (grupo Utilidade). Desligadas por padrão.

## O que ele é capaz de fazer?

- **Mural de destaques:** mensagem com N reações do emoji escolhido vai para o mural (atualiza a contagem depois).
- **Tópico automático** em canais de sugestões, artes etc.
- **Reações automáticas** (até 5 emojis) nos canais escolhidos.
- **Publicar anúncios** sozinho nos canais de anúncio.
- **Mensagem fixa no fim** do canal, repostada a cada N mensagens.
- **Links com prévia:** X, Instagram, TikTok, Reddit e Bluesky em versões que mostram a prévia.
- **Mensagem longa vira arquivo** `.txt` a partir de N linhas.
- **Aviso de instabilidade do Discord** (discordstatus.com a cada 5 min), editado para "normalizado" quando resolve.
- **Cargo de quem está em call**, tirado ao sair.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Inserir Links, Criar Tópicos, Adicionar Reações, Gerenciar Mensagens, Anexar Arquivos e Gerenciar Cargos, conforme o cartão.

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules.js`, estado em `data/guilds/<id>/{starboard,sticky,discordStatus}.json` (escrita atômica).
