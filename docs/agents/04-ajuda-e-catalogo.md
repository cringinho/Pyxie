# 4. Política de Paridade Dinâmica: Comandos Web & Central de Ajuda (`help.js`)
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
