# Diretrizes Mandatórias de Desenvolvimento: Pyxie & Cringelândia

## 1. Política Mandatória de Arquitetura Bilíngue (PT-BR & EN)
Este projeto possui um ecossistema com dupla finalidade:
- **Cringelândia (Guild ID `1453890868980482090`)**: É o servidor oficial do criador e ambiente principal de uso. Em português brasileiro (`pt-BR`), os textos, comandos, gírias, piadas, lore e descrições DEVEM ser 100% naturais, imersivos e impecáveis.
- **Servidores Globais / Discord Internacional**: A Pyxie é desenhada para expansão global (Top.gg, bots lists, comunidades internacionais). O inglês (`en`) é o idioma padrão para servidores externos e usuários que utilizam o Discord em inglês.

---

### Regra de Ouro: Proibido Implementar Funcionalidades em Apenas Um Idioma
Sempre que uma nova feature, comando, botão, minigame, desafio, embed, item de loja ou página web for criada ou alterada:

1. **Dicionário Central de Traduções (`src/utils/i18n.js`)**:
   - Cada chave adicionada a `TRANSLATIONS.pt` **DEVE** ter sua contraparte exatamente equivalente em `TRANSLATIONS.en`.
   - Placeholders dinâmicos (`{user}`, `{coins}`, `{time}`, `{amount}`, etc.) **DEVEM** ser idênticos nas duas versões.
   - O teste automatizado `tests/i18nParity.test.js` trava o build se houver qualquer assimetria de chaves ou parâmetros.

2. **Comandos Slash (Discord.js v14)**:
   - O nome canônico e a descrição base do comando são sempre em inglês (`.setName()`, `.setDescription()`).
   - É obrigatório incluir a localização nativa em português via `.setDescriptionLocalizations({ 'pt-BR': '...' })`.
   - Todas as opções/parâmetros devem conter descrição base em inglês e `.setDescriptionLocalizations({ 'pt-BR': '...' })`.
   - Opções com escolhas pré-definidas (choices) devem ter labels traduzidos ou localizados.

3. **Comandos por Prefixo (`py!`)**:
   - Devem fornecer aliases tanto em inglês quanto em português (ex: `aliases: ['work', 'trabalho', 'py-trabalho', 'py-work']`).

4. **Respostas e Embeds**:
   - É proibido escrever mensagens ao usuário fixas (*hardcoded*) no código.
   - Utilize sempre `t(chave, source, replacements)` ou lógica de seleção de idioma via `getLanguage(source)`.
   - O método `.setFooter({ text: ... })` do Discord.js v14 exige estritamente um objeto `{ text: string }`.

5. **Páginas Web e Portais de Bônus (ex: `public/bonus.html`)**:
   - Devem aceitar os parâmetros `?lang=pt` e `?lang=en` da URL.
   - Devem possuir dicionário front-end (`I18N`) com suporte a detecção de navegador (`navigator.language`).
   - As APIs do backend devem retornar mensagens localizadas de acordo com o idioma do token.

6. **Desafios e Minigames com Conteúdo (ex: `/py-work`, `/py-cookie`, `/py-likely`)**:
   - Conjuntos de perguntas, cenários, sabedorias ou desafios devem ser criados em pares `{ pt: ..., en: ... }`.

---

## 2. Portão de Testes Automático (Quality Gate)
- Antes de considerar qualquer modificação pronta, execute obrigatoriamente:
  ```bash
  npm test
  ```
- O comando executa todos os 10 arquivos de testes, incluindo `tests/i18nParity.test.js` que audita recursivamente todas as chaves e comandos.

---

## 3. Política de Paridade Dinâmica: Comandos Web & Central de Ajuda (`help.js`)
- **Fonte Única da Verdade**: A lista oficial de módulos e categorização de comandos reside estritamente em `src/commands/commandHelpers.js` (`MODULE_METADATA` e `COMMAND_CATEGORY_MAP`) e no comando central `src/commands/help.js`.
- **Regra Obrigatória para Novos Comandos**: Sempre que um novo comando for criado ou alterado no bot:
  1. O nome e todos os aliases DEVEM ser registrados em `COMMAND_CATEGORY_MAP` vinculado à sua categoria correspondente em `MODULE_METADATA`.
  2. As descrições e títulos DEVEM ser fornecidos em pares idênticos (`PT` e `EN`) no `src/utils/i18n.js`.
- **Proibição de Listas Estáticas Isoladas**: É terminantemente proibido manter listas manuais "hardcoded" de comandos em arquivos HTML do front-end. O website DEVE consumir a API `/api/commands` para renderizar as abas e cartões de comandos em tempo de execução.
- **Ciclo de Vida do Front-end (`public/index.html`)**:
  - A inicialização da página e qualquer troca de idioma (`applyLang`, `toggleLanguage`) **DEVEM invocar explicitamente** `fetchCommands(lang)` para sincronizar e renderizar as abas de categorias (`#categoryTabs`) e o grid de comandos (`#commandsGrid`).
  - O cálculo de `uptime` recebido de `/api/status` ou `/api/stats` é retornado em **milissegundos** e DEVE ser convertido para segundos (`Math.floor(data.uptime / 1000)`) antes de extrair dias, horas e minutos.
  - O catálogo de abas deve suportar busca textual (`filterCommands`), seleção de abas (`selectCategory`), estado de carregamento e mensagens localizadas de lista vazia (`catalog.empty`).
- **Quality Gate Automatizado**: O teste `tests/i18nParity.test.js` audita se 100% dos comandos exportados em `src/commands/index.js` estão mapeados em `COMMAND_CATEGORY_MAP`. Se um comando estiver fora do catálogo, o comando `npm test` falha imediatamente.
- **Comandos de Manipulação de Economia Restritos ao Criador**:
  - Comandos que alteram saldo, resetam dados econômicos ou configuram parâmetros de economia (`/py-seteco`, `/py-reseteco`, `/py-ecoconfig`, `/py-admin`) são estritamente exclusivos do Criador da Pyxie (`OWNER_SNOWFLAKE = '214153735281180673'`). Administradores de servidor NÃO possuem permissão para executá-los.
  - Esses comandos são filtrados dinamicamente na Central de Ajuda (`/py-help`) e na Web (`/api/commands`), sendo exibidos exclusivamente quando solicitados pelo snowflake do dono (`214153735281180673`) ou sessão administrativa autenticada.

---

## 4. Política Visual de Emojis: Proibição Estrita do Portal de Minecraft (`portalframe98`)
- **Regra de Estilo Visual**: É expressamente PROIBIDO utilizar o emoji do portal do Minecraft (`portalframe98`, ID `1548444170488778954`) em qualquer parte do ecossistema da Pyxie (Discord, embeds, website, wiki ou portal de bônus).
- **Substituto Canônico Obrigatório**: Para ilustrar cenários, navegação, viagens entre locais, portais arcanos e exploração do Bosque da Penumbra, deve-se utilizar estritamente o emoji oficial de mapas / galáxia violeta da Pyxie:
  - **Discord**: `<:map:1551355962974273546>` ou alias `MAP` / `PORTAL` via `getEmoji('MAP')` em `src/utils/appEmojis.js`.
  - **Web / Front-end**: `https://cdn.discordapp.com/emojis/1551355962974273546.png`.



