# 11. Protocolo Obrigatório de Preview Automático de Embeds e Mensagens (`1461937203214024891`)

### 1. Despacho Automático Sem Necessidade de Solicitação
- Toda vez que o Agente de IA criar um novo Embed, modificar um Embed existente ou alterar mensagens estruturadas do bot, ele é **OBRIGADO** a disparar automaticamente uma preview real do resultado final no canal de testes de ID **`1461937203214024891`** através do serviço `src/utils/homologationPreviewDispatcher.js`, mesmo que o criador não peça isso no prompt da tarefa.
- Isso garante que o proprietário visualize imediatamente no Discord como a formatação ficou sem precisar executar comandos manualmente para testar.

### 2. Blindagem Anti-Ping (Tags Sempre Entre Crases ```` ``` ````)
- No canal `1461937203214024891`, **NUNCA** mencione usuários, cargos ou `@everyone`/`@here` de forma ativa.
- Qualquer tag de usuário (`<@id>`), cargo (`<@&id>`) ou menção simulada na preview deve ser obrigatoriamente escapada entre crases triplas ```` ```<@id>``` ```` (ou inline `` `<@&id>` `` dentro de embeds) e enviada com `allowedMentions: { parse: [], users: [], roles: [], repliedUser: false }` no payload do Discord.js.
