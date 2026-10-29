---
name: discord-mcp-integration
description: "Integração e automação de prévias, webhooks e inspeção de estado do Discord da Pyxie. Dispara mensagens no canal de homologação, valida payloads de embeds e botões diretamente na API do Discord sem overhead de contexto."
---

# Integração e Automação Discord

Esta skill orienta a interação direta com o ambiente do Discord da Pyxie, reduzindo o consumo de tokens ao delegar validações estruturais para scripts executáveis e chamadas diretas de webhook/API.

## 1. Regra de Prévia Real (AGENTS.md §11)
- Toda alteração em embeds, componentes v2 ou mensagens de sistema deve emitir prévia real no canal de homologação `1461937203214024891`.
- Use sempre o despachante central: `src/utils/homologationPreviewDispatcher.js`.
- **Zero pings**: menções de cargos/usuários devem estar entre crases e `allowedMentions: { parse: [] }`.

## 2. Validação Direta via CLI / Scripts
Em vez de inspecionar manualmente arquivos de mensagens no chat, execute scripts dedicados:

```javascript
// Exemplo de envio de prévia direta
const { sendHomologationPreview } = require('./src/utils/homologationPreviewDispatcher');
const { EmbedBuilder } = require('discord.js');

async function testEmbedPreview(embedData) {
  const embed = new EmbedBuilder(embedData);
  return sendHomologationPreview({ embeds: [embed] });
}
```

## 3. Inspeção de Permissões e Diagnóstico
- Use o serviço central `src/services/commandDiagnostics.js` para auditar permissões de comandos e canais diretamente.
- O endpoint `/api/dashboard/guilds/:guildId/commands/:name/diagnose` provê a árvore completa de validação sem necessidade de ler arquivos fonte durante o debug.

