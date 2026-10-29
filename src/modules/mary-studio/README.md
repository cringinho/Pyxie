# Módulo Mary Studio (lojinha de Robux da Mary)

Módulo exclusivo do servidor da Mary (`1557399041443111025`, zona `mary` em `src/config/scopes.js`). Só a Mary (`1463644930080637140`) e o dono da Pyxie mexem nele.

## Onde fica cada coisa

- **Telas no `/dashboard`** (login com Discord; a zona `mary` só aceita a Mary e o dono, conferido ao vivo pelo bot):
  - **Lojinha** (`#/guild/<id>/maryStore`): status, estoque, preço do 1k, PIX, tickets de compra, canal das avaliações, cargo de cliente, filtro de convites, respostas rápidas, variáveis e modelos prontos.
  - **Ferramentas Robux** (`#/guild/<id>/maryTools`): calculadora dos 30%, conferir gamepass, conferir nick do Roblox, recibo de entrega (com botão de avaliação) e sorteios.
  - **Aparência da Pyxie** (`#/guild/<id>/maryProfile`): apelido, foto, banner e bio da Pyxie só nesse servidor (`PATCH /guilds/{id}/members/@me`), com envio de imagem.
  - **Mensagens** (estúdio geral, `src/services/messageStudio.js`): no servidor da Mary os botões ganham a ação **Ação da lojinha** (calculadora, conferir nick, ticket, avaliação → `customId` `mary_btn:<tipo>:<botão>`), e os textos aceitam `{estoque}`, `{preco_1k}`, `{status_loja}`, `{total_avaliacoes}`, `{nota_media}`, `{pix_key}`, `{pix_name}` e `{bio}`. Fora da zona `mary` a API recusa essa ação (`mary_only`).
- **API**: `/api/dashboard/guilds/:guildId/mary/*` em `src/routes/dashboardRoutes.js` (sempre `requireSession, requireGuild` e zona `mary`); regras em `maryDashboard.js`.
- **Discord**:
  - `/py-mary` e `py!mary` (na DM): central rápida com status, estoque e o link `https://pyxie.com.br/dashboard#/guild/<id>/maryStore`. Atalhos: mudar status, estoque e preço, atalho na DM.
  - Menu de contexto **✏️ Editar na Pyxie**: leva a mensagem da Pyxie para o estúdio do painel (ou acha a que já está lá) e manda o link `#/guild/<id>/studio/<mensagem>`. Recusa mensagens com botões que se perderiam (sorteio).
  - `/py-gamepass`: inspetor de gamepass.
  - Handlers dos botões `mary_btn:*` (calculadora, conferir nick, ticket, avaliação), tickets com macros, avaliações, sorteios e filtro de convites. Só respondem no servidor da Mary.
- **Imagens**: `data/uploads/mary/`, servidas em `/api/mary/media/<arquivo>` (mensagens antigas apontam para lá). Upload pelo painel até 8 MB, só PNG, JPG, GIF ou WebP de verdade.
- **Endereços antigos**: `/mary` e `/mary/auth/magic` redirecionam para a Lojinha no painel. Não há mais app web próprio, link mágico nem `MARY_STUDIO_SECRET`.

## Dados (`data/`, escrita atômica)

- `maryStudioConfig.json`: configuração da lojinha, perfil local, macros e `migratedToDashboard` (registros do estúdio antigo já levados ao painel).
- `maryStoreData.json`: tickets, avaliações, cupons, sorteios.
- `marySavedMessages.json`: mensagens do estúdio antigo. Não é apagado. Na subida do processo do bot, cada registro vira uma mensagem do estúdio do painel (`data/guilds/<id>/messages.json`, id `mary-<registro>`) ligada à mensagem já postada, para editar e atualizar de lá. Os cards explicativos viram abas privadas; enquanto a mensagem não é atualizada pelo painel, os botões antigos continuam respondendo pelo arquivo antigo.
- `marySecurity.json` (sessões do app antigo): não é mais lido.

## Ciclo de vida

`onLoad` registra os listeners por `ctx.registerListener` e o verificador de sorteios por `ctx.registerInterval`; a migração das mensagens antigas roda só no processo do bot (`ctx.isBotProcess`). `onUnload` solta o cliente.
