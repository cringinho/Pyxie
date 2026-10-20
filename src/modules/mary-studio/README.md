# Módulo Mary Studio & Hub (Pyxie Robux Store & Embed Studio)

Módulo exclusivo de painel administrativo web e estúdio visual de mensagens, embeds, botões interativos e gestão de lojinha de Robux para a Mary (`1463644930080637140`).

## Funcionalidades Principais
- **Acesso Sem Códigos / Sem Senhas (Link Mágico HMAC)**: Login instantâneo de 1 clique gerado pelo comando `/py-mary` ou menu de contexto `✏️ Editar na Pyxie`, com token de uso único (HMAC-SHA256) e tela intermediária anti-crawler para proteção contra `Discordbot`.
- **Estúdio Visual de Embeds & Mensagens**: Construtor de mensagens com preview fiel ao Discord, editor de rodapé, campos, uploads de imagens persistidos em `data/uploads/mary/` e histórico de 5 versões (Undo) via `message.edit()`.
- **Botões Interativos com Ações Automáticas**:
  - Resposta secreta (`ephemeral`) com imagem explicativa e sub-botões de ação.
  - Calculadora automática da taxa de 30% do Roblox ($\lceil \text{Robux} / 0.70 \rceil$).
  - Validador público de nick e avatar do Roblox.
  - Sistema opcional de Tickets de atendimento com macros de 1 clique para a Mary.
  - Sistema de avaliações (1 a 5 estrelas) com numeração sequencial.
  - Entrega e remoção automática de cargos por botão.
- **Customização Local de Perfil**: Edição local de avatar, banner, apelido e biografia da Pyxie exclusivamente no servidor da Mary via `PATCH /guilds/{guildId}/members/@me`.
- **Persistência Atômica Blindada em `data/`**: Gravação segura e atômica fora de `src/` em `data/maryStudioConfig.json`, `data/marySavedMessages.json`, `data/maryStoreData.json` e `data/marySecurity.json`.
- **Zero Memory Leak**: Gerenciamento de ciclo de vida através de `moduleManager.js` e métodos injetados por `ctx`.

