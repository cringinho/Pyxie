---
name: discord-v2-multi-tenant
description: "Constrói comandos, embeds, interfaces Components V2, sincronização de Application Emojis e roteamento multi-tenant no Discord.js v14 da Pyxie. Utiliza-se ao criar ou editar comandos do bot, embeds, botões, emojis ou sistemas para o núcleo global, o Estúdio da Mary ou a Cringelândia."
---

# Protocolo de Engenharia Discord.js: Escopo Multi-Tenant, Interfaces e Application Emojis

## 1. Decisão de escopo multi-tenant

Ao criar ou modificar qualquer comando ou evento, classifique o escopo antes de escrever código:

- **Global (produto público da Pyxie)**: comando em `src/commands/` ou em um módulo global de `src/modules/<id>/`. Registro global via `src/registerSlashCommands.js`. Cabeçalhos usam `interaction.guild?.name ?? 'Pyxie'`.
- **Cringelândia**: lógica em `src/services/cringelandiaService.js` ou atrás de `guild.id === CRINGELANDIA_GUILD_ID`. Escopo configurado em `commandScopeManager.js` (`serverScope: 'cringelandia'`).
- **Estúdio da Mary**: tudo dentro de `src/modules/mary-studio/`, registrado apenas na guild `MARY_DEFAULT_GUILD_ID`.

Em todos os casos, siga o `AGENTS.md`:

1. Nome e descrição base em inglês, com `.setDescriptionLocalizations({ 'pt-BR': '...' })` no comando e em cada opção.
2. Aliases de prefixo `py!` em inglês e português.
3. Registro em `COMMAND_CATEGORY_MAP` / `MODULE_METADATA` (`src/commands/commandHelpers.js`) e no introspector (`src/services/commandIntrospector.js`).
4. Textos via `t(chave, source, replacements)` com chaves pareadas em `src/utils/i18n.js`.
5. `npm test` com 100% de aprovação.

## 2. Construção de interfaces

**Padrão atual: embeds** (`EmbedBuilder`) seguindo a Seção 9 do `AGENTS.md` e registrados em `src/utils/embedRegistry.js`. Toda alteração dispara preview no canal `1461937203214024891` via `src/utils/homologationPreviewDispatcher.js` (Seção 11).

**Components V2** (`MessageFlags.IsComponentsV2`) só deve ser adotado quando a interface precisar de galerias, seções com acessórios ou layout que embeds não suportam. Nesse caso:

- Nunca envie `content`, `embeds`, `stickers` ou `poll` no mesmo payload: a API do Discord rejeita a chamada.
- Estruture a mensagem a partir de um `ContainerBuilder` com a cor da Pyxie, usando `TextDisplayBuilder` para texto, `SeparatorBuilder` para divisão, `MediaGalleryBuilder` para imagens e `SectionBuilder` (sempre com ao menos um `TextDisplayBuilder`) para miniaturas ou botões laterais.
- Rótulos de botão: no máximo 34 caracteres com emoji, 38 sem.
- Em modais, posicione `TextInput` dentro de um `Label`.
- Para conteúdo sensível de saúde mental, use `.setSpoiler(true)` no contêiner.
- Confirme que a versão instalada do `discord.js` exporta esses builders antes de usá-los.

## 3. Application Emojis (cota de 2.000)

- Não dependa de `client.emojis` (cache global de guilds). Use `client.application.emojis` (`ApplicationEmojiManager`), que funciona em qualquer servidor sem a permissão `USE_EXTERNAL_EMOJIS`.
- Resolva emojis canonicamente via `getEmoji('CHAVE')` / `resolveEmoji(client, slot, 'discord')` (`src/utils/appEmojis.js`). O catálogo sincronizado vive em `src/data/discordAppEmojis.json`.
- Antes de `client.application.emojis.create({ attachment, name })`, converta o arquivo com `sharp` para 128x128 px, WebP, abaixo de 256 KiB.
- Proibido usar o emoji `portalframe98` (ID `1548444170488778954`). Use `getEmoji('MAP')` (Seção 7 do `AGENTS.md`).

## 4. Persona

Tom tsundere em jogos, economia e utilitários. Em fluxos de saúde mental, acolhimento, desabafo (`ventService.js`), check-in de novatos ou segurança: zero ironia ou sarcasmo, linguagem calorosa, previsível e protetora.
