# 📩 Módulo de Tickets & Atendimento (Multi-Tenant) • v2.1

Central de atendimento nativa da Pyxie, bilíngue (PT/EN pelo idioma do servidor), com salas privadas, registros para a Staff e o fluxo exclusivo de remoção de artes da Cringelândia.

## 🌟 Funcionalidades

- **Configuração pelo painel web (`/dashboard` → Tickets, todo servidor):**
  - Canal do painel público, categoria das salas (com **Criar pra mim**) e canal de registros da Staff.
  - Painel: título, texto de abertura, e para cada tipo (Ajuda, Denúncia) liga/desliga, nome do botão e descrição. Prévia ao vivo na tela.
  - Salas: limite de salas abertas por membro (`1` a `5`, padrão `2`), cargos da Staff, mensagem própria da recepção e cópia da conversa na DM (liga/desliga).
  - Publicar/atualizar o painel no Discord, estatísticas, lista de tickets abertos com fechamento pelo painel e prévia no canal de homologação (só o dono da Pyxie).
  - O site conversa só pela ponte com o bot (`dashboardBridge.js`: `TICKETS_INFO`, `TICKETS_SAVE`, `TICKETS_PUBLISH`, `TICKETS_CREATE_CATEGORY`, `TICKETS_CLOSE`, `TICKETS_PREVIEW`). Canais, categoria e cargos são conferidos duas vezes: no site (são deste servidor) e no bot (tipo certo).

- **Configuração via `py!set tickets <#canal>` ou `/py-set tickets`** (continua igual):
  - Define o canal do painel público.
  - Menu de categoria das salas ou botão **Crie pra mim** (cria `📩・ATENDIMENTO` no topo com acesso da Staff).
  - Menu opcional de **canal de registros da Staff** (`ticketLogChannelId`).

- **Onde fica a configuração:** `data/guildConfigs.json`, nos campos de sempre (`ticketPanelChannelId`, `ticketCategoryId`, `ticketLogChannelId`, `ticketPanelMessageId`) mais `ticketOptions` (personalização). `ticketOptions.js` é a fonte única dos padrões e limites; campo ausente vale o padrão, então servidores configurados antes continuam iguais.

- **Painel público:**
  - **Todo servidor:** Ajuda e Denúncia (cada um pode ser desligado; o painel nunca fica sem botão).
  - **Cringelândia (zona `cringelandia`, `src/config/scopes.js`):** adiciona **Remoção de Conteúdo** do Museu.
  - Painéis já publicados são **editados no lugar** quando o bot inicia (`refreshTicketPanels`) e quando a configuração é salva no painel web.
  - Botão de um tipo desligado em painel antigo é recusado pelo bot (`tickets.type_disabled`).

- **Salas privadas numeradas:** `ajuda-0004-usuario`, com trava contra clique duplo, uma sala por tipo e limite configurável por membro.

- **Staff:** os cargos escolhidos no painel veem as salas, assumem e fecham. Sem cargos escolhidos, vale quem tem **Gerenciar Canais** (comportamento original).

- **Assumir atendimento:** botão **Assumir** (só Staff) registra quem está cuidando do caso.

- **Fechamento com transcrição:**
  - Autor ou Staff podem fechar (botão com confirmação, `py!fechar [motivo]` / `/py-close`, ou pelo painel web).
  - Transcrição `.txt` vai para o canal de registros (com autor, tipo, quem assumiu, quem fechou, duração e mensagens) e, se ligado, para a DM do autor.
  - Salas apagadas manualmente são encerradas automaticamente (`channelDelete`).

- **Remoção de Conteúdo (só Cringelândia):** modal, confirmação na DM com prazo de 48h, cartão para a Staff no canal escolhido no painel (padrão `MUSEUM_REMOVAL_CHANNEL_ID` = `1557534749310976141`) e aviso na DM ao concluir. Pode ser desligada no painel; os pedidos pendentes aparecem lá.

- **Estatísticas:** `getTicketStats(guildId)` (total, abertos, assumidos, tempo médio de resolução e remoções pendentes da Cringelândia) exposto via `getStats` do módulo e na seção Tickets do painel.

- **Prévias:** `node scripts/dispatch_tickets_previews.js` manda ao canal de homologação os painéis padrão, o personalizado e a recepção da sala.
