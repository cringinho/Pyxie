# ✉️ Estúdio de Mensagens

Mensagens personalizadas por servidor, criadas no painel (`/dashboard` → servidor → **Mensagens**). Vale para qualquer servidor onde a pessoa é administradora; a Cringelândia e o servidor da Mary usam o mesmo estúdio.

## Onde fica cada parte

- `src/services/messageStudio.js`: modelo, validação pelos limites do Discord, variáveis, emojis e montagem do payload (formato clássico e Components V2).
- `src/services/messageStudioStore.js`: `data/guilds/<guildId>/messages.json` (escrita atômica), histórico de 10 versões, envio e edição pela REST, prévia de homologação.
- `src/services/mentionPrefs.js`: preferência de marcação silenciosa por pessoa.
- Este módulo: trata os cliques no bot (`pyxs:<ação>:<mensagem>:<botão>`) e os formulários (`pyxsm:<mensagem>:<botão>`).

## Botões

- **Link:** abre uma URL (`https://` ou `discord://`).
- **Cargo:** dá, tira ou alterna um cargo. A Pyxie precisa de `ManageRoles` e o cargo precisa estar abaixo do dela.
- **Formulário:** abre um modal com até 5 perguntas; as respostas vão como embed para o canal escolhido, sem marcar ninguém.
- **Aba:** troca o conteúdo da mensagem para todos ou abre a aba só para quem clicou.
- **Marcação silenciosa:** alterna a preferência da pessoa; nos anúncios ela aparece em negrito, sem ping.

## Regras

- O formato novo não aceita texto avulso nem embeds clássicos; o Discord também não troca o formato de uma mensagem já enviada.
- `allowedMentions` vem vazio por padrão: mensagens do estúdio nunca marcam ninguém sem querer.
- A prévia no canal de homologação é só do dono da Pyxie (o canal é da staff).
- O emoji do portal do Minecraft (`portalframe98`) é bloqueado (AGENTS.md §7).
