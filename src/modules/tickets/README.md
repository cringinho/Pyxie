# 📩 Módulo de Tickets & Atendimento (Multi-Tenant) • v2.0

Central de atendimento nativa da Pyxie, bilíngue (PT/EN pelo idioma do servidor), com salas privadas, registros para a Staff e o fluxo exclusivo de remoção de artes da Cringelândia.

## 🌟 Funcionalidades

- **Configuração via `py!set tickets <#canal>` ou `/py-set tickets`:**
  - Define o canal do painel público.
  - Menu de categoria das salas ou botão **Crie pra mim** (cria `📩・ATENDIMENTO` no topo com acesso da Staff).
  - Menu opcional de **canal de registros da Staff** (`ticketLogChannelId`).

- **Painel público por escopo:**
  - **Servidores externos:** Ajuda e Denúncia.
  - **Cringelândia (`1453890868980482090`):** adiciona **Remoção de Conteúdo** do Museu.
  - Painéis já publicados são **editados no lugar** quando o bot inicia (`refreshTicketPanels`), sem postar mensagens novas.

- **Salas privadas numeradas:** `ajuda-0004-usuario`, com trava contra clique duplo, uma sala por tipo e no máximo 2 abertas por membro.

- **Assumir atendimento:** botão **Assumir** (só Staff) registra quem está cuidando do caso.

- **Fechamento com transcrição:**
  - Autor ou Staff podem fechar (botão com confirmação ou `py!fechar [motivo]` / `/py-close`).
  - Transcrição `.txt` vai para o canal de registros (com autor, tipo, quem assumiu, quem fechou, duração e mensagens) e para a DM do autor.
  - Salas apagadas manualmente são encerradas automaticamente (`channelDelete`).

- **Remoção de Conteúdo (Cringelândia):** modal, confirmação na DM com prazo de 48h, cartão para a Staff no canal `1557534749310976141` e aviso na DM ao concluir.

- **Estatísticas:** `getTicketStats()` (total, abertos, assumidos, tempo médio de resolução e remoções pendentes) exposto via `getStats` do módulo.
