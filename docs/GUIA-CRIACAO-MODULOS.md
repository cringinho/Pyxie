# 🛠️ Guia Técnico de Criação e Integração de Novos Módulos na Pyxie

> **Público-alvo:** Desenvolvedores, Engenheiros de Software e Agentes de IA autônomos.  
> **Arquitetura Base:** Padrão *Cog / Plug-in Modular Desacoplado* (inspirado no Red-DiscordBot), com **Zero Memory Leak**, Paridade Bilíngue Mandatória (`pt-BR` & `en`) e Sincronização Dinâmica em Tempo Real com o Ecossistema Web.

---

## 🧭 Sumário Executivo
1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Pastas e Convenção Canônica](#2-estrutura-de-pastas-e-convenção-canônica)
3. [Passo a Passo: Construindo um Módulo do Zero](#3-passo-a-passo-construindo-um-módulo-do-zero)
   - [Passo 1: Criar o Descritor do Módulo (`index.js`)](#passo-1-criar-o-descritor-do-módulo-indexjs)
   - [Passo 2: Construir o Gerenciador Isolado (`manager.js`)](#passo-2-construir-o-gerenciador-isolado-managerjs)
   - [Passo 3: Criar Comandos Slash & Prefixo no Módulo](#passo-3-criar-comandos-slash--prefixo-no-módulo)
4. [Dinamismo e Sincronização Obrigatória com a Web](#4-dinamismo-e-sincronização-obrigatória-com-a-web)
   - [Como o `/api/commands` descobre seu módulo](#como-o-apicommands-descobre-seu-módulo)
   - [Ciclo de Vida do Front-end (`public/index.html` e `public/wiki.html`)](#ciclo-de-vida-do-front-end-publicindexhtml-e-publicwikihtml)
   - [Expondo Rotas Web Próprias (`setupWebRoutes`)](#expondo-rotas-web-próprias-setupwebroutes)
5. [Prevenção Estrita de Vazamento de Memória (Zero Memory Leak)](#5-prevenção-estrita-de-vazamento-de-memória-zero-memory-leak)
6. [Diretrizes Mandatórias de Internacionalização (i18n)](#6-diretrizes-mandatórias-de-internacionalização-i18n)
7. [Mapeamento de Categoria e Quality Gate Automático](#7-mapeamento-de-categoria-e-quality-gate-automático)
8. [Checklist de Verificação Antes de Commitar](#8-checklist-de-verificação-antes-de-commitar)

---

## 1. Visão Geral da Arquitetura

Na Pyxie, os módulos **não são fragmentos colados** diretamente em `src/index.js` ou `server.js`. Em vez disso, o bot adota um motor modular em [`src/services/moduleManager.js`](file:///e:/botMelody/src/services/moduleManager.js) que:
1. **Descobre automaticamente** diretórios em `src/modules/` na inicialização e em recarregamentos em tempo real (*hot-reload*).
2. **Isola o escopo de recursos** de cada módulo (comandos, listeners do Discord, crons e timers).
3. **Controla ativação e persistência** de estado em `data/modulesConfig.json` via painel administrativo ou comando `/py-admin modulos`.
4. **Alimenta dinamicamente** o comando de ajuda (`/py-help`) e a API Web (`/api/commands`), permitindo que novos módulos apareçam nas abas do site e da central de ajuda instantaneamente sem tocar em linhas de HTML.

```mermaid
flowchart TD
    A["Pasta src/modules/novo-modulo/"] -->|Varredura Automática| B["ModuleManager (src/services/moduleManager.js)"]
    B -->|Ativação & onLoad| C["Escopo Isolado (Contexto Protegido)"]
    C -->|Registra| D["Comandos no commandsByName"]
    C -->|Rastreia| E["Listeners, Crons & Timers"]
    C -->|Expõe| F["Rotas Express (setupWebRoutes)"]
    B -->|getHelpModules()| G["/py-help (Discord)"]
    B -->|getHelpModules()| H["/api/commands (Website)"]
    H -->|fetchCommands(lang)| I["Frontend (index.html: #categoryTabs & #commandsGrid)"]
```

---

## 2. Estrutura de Pastas e Convenção Canônica

Todo módulo novo deve residir dentro de sua própria pasta isolada em `src/modules/<id-do-modulo>/`:

```text
src/modules/
└── novo-modulo/                     <-- ID em kebab-case ou lowercase
    ├── index.js                     <-- PONTO DE ENTRADA OBRIGATÓRIO (Descritor do Módulo)
    ├── novoModuloManager.js         <-- Gerenciador da lógica de negócios, banco e crons
    ├── commands/                    <-- Comandos pertencentes exclusivamente ao módulo
    │   └── pyMeuComando.js
    └── views/ (opcional)            <-- Templates ou páginas HTML complementares se houver
```

---

## 3. Passo a Passo: Construindo um Módulo do Zero

### Passo 1: Criar o Descritor do Módulo (`index.js`)
Crie o arquivo [`src/modules/<id-do-modulo>/index.js`](file:///e:/botMelody/src/modules/seasonal/index.js). Ele deve exportar um objeto estritamente estruturado:

```javascript
// src/modules/exemplo/index.js
const exemploManager = require('./exemploManager');
const pyExemploCmd = require('./commands/pyExemploCmd');

module.exports = {
  // Identificador único (letras minúsculas e hífens)
  id: 'exemplo',

  // Metadados bilíngues obrigatórios
  name: {
    'pt-BR': 'Módulo de Exemplo',
    en: 'Example Module',
  },
  description: {
    'pt-BR': 'Descrição clara em português para a central de ajuda e admin.',
    en: 'Clear English description for the help center and admin panel.',
  },

  // Categoria oficial onde os comandos serão catalogados:
  // 'economia' | 'loja' | 'tarot' | 'social' | 'utilidades'
  category: 'utilidades',
  icon: '✨',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: false, // se inicia ativo por padrão na primeira execução

  // Lista de comandos fornecidos por este módulo
  commands: [
    pyExemploCmd,
  ],

  // Hook chamado quando o módulo é ativado
  async onLoad(ctx) {
    // ctx injeta métodos seguros para não causar vazamento de memória:
    // ctx.registerListener(event, handler)
    // ctx.registerCron(cronTime, onTick)
    // ctx.registerInterval(fn, ms)
    // ctx.registerTimeout(fn, ms)
    if (ctx.client) {
      exemploManager.init(ctx.client, ctx);
    }
  },

  // Hook chamado na desativação ou reload do módulo
  async onUnload(ctx) {
    // Pare qualquer processo específico do seu manager
    exemploManager.stop();
  },

  // (Opcional) Registro de rotas HTTP no Express
  setupWebRoutes(app, ctx) {
    if (typeof exemploManager.setupWebRoutes === 'function') {
      exemploManager.setupWebRoutes(app);
    }
  },
};
```

---

### Passo 2: Construir o Gerenciador Isolado (`manager.js`)
O manager encapsula as regras de negócio, dados e crons do módulo.

```javascript
// src/modules/exemplo/exemploManager.js
const EventEmitter = require('events');

class ExemploManager extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.cronJob = null;
    this.running = false;
  }

  init(client, ctx) {
    this.client = client;
    this.running = true;

    // Use SEMPRE o ctx.registerCron para garantir limpeza automática no unhook
    if (ctx && typeof ctx.registerCron === 'function') {
      ctx.registerCron('0 * * * *', () => {
        this.executarTarefaHoraria();
      });
    }
  }

  executarTarefaHoraria() {
    if (!this.running) return;
    console.log('[Exemplo] Tarefa horária executada com sucesso.');
  }

  stop() {
    this.running = false;
    // O ModuleManager já limpa automaticamente os crons e listeners registrados via ctx!
  }

  setupWebRoutes(app) {
    // API pública ou interna do módulo
    app.get('/api/exemplo/dados', (req, res) => {
      res.json({ success: true, timestamp: Date.now() });
    });
  }
}

module.exports = new ExemploManager();
```

---

### Passo 3: Criar Comandos Slash & Prefixo no Módulo
Os comandos do módulo seguem o padrão Discord.js v14 do projeto, com nomes canônicos em inglês e localização nativa em português.

```javascript
// src/modules/exemplo/commands/pyExemploCmd.js
const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../../utils/i18n');

module.exports = {
  name: 'py-exemplo',
  aliases: ['exemplo', 'example', 'py-example'],
  category: 'utilidades', // Categoria canônica do comando

  data: new SlashCommandBuilder()
    .setName('py-example')
    .setNameLocalizations({
      'pt-BR': 'py-exemplo',
    })
    .setDescription('Execute an example action in Pyxie.')
    .setDescriptionLocalizations({
      'pt-BR': 'Executa uma ação de exemplo na Pyxie.',
    }),

  async execute(interaction) {
    // Resposta bilíngue utilizando a função t()
    const msg = t('exemplo.sucesso', interaction);
    await interaction.reply({ content: msg, ephemeral: true });
  },

  async executePrefix(message, args) {
    const msg = t('exemplo.sucesso', message);
    await message.reply(msg);
  },
};
```

---

## 4. Dinamismo e Sincronização Obrigatória com a Web

### Como o `/api/commands` descobre seu módulo
O website oficial consome o endpoint central [`/api/commands`](file:///e:/botMelody/server.js#L393) fornecido pelo Express no arquivo [`server.js`](file:///e:/botMelody/server.js).

1. Quando o website solicita `/api/commands?lang=pt` ou `/api/commands?lang=en`, o servidor invoca `getHelpModules(source, { lang, isOwner })` de [`src/commands/commandHelpers.js`](file:///e:/botMelody/src/commands/commandHelpers.js).
2. O `commandHelpers.js` consulta dinamicamente `moduleManager.getActiveCommands()`.
3. Todos os comandos do seu novo módulo que estiver habilitado são **agrupados na categoria informada** (`mod.category` ou `cmd.category`).
4. **Resultado:** O novo comando aparece instantaneamente no JSON retornado da API com seu nome, descrição, aliases e categoria, sem que nenhuma linha de JSON estático precise ser escrita!

---

### Ciclo de Vida do Front-end (`public/index.html` e `public/wiki.html`)
Para preservar a integridade do ecossistema, o front-end respeita três regras críticas:

1. **Proibição de Listas Estáticas Isoladas**:
   - É expressamente proibido adicionar `<div class="command-card">` manualmente no HTML.
   - Todo card de comando é renderizado em tempo de execução via `renderCommands()` a partir de `allModules`.
2. **Atualização Dinâmica de Categorias e Contadores**:
   - `renderTabs()` gera os botões de categoria (`#categoryTabs`) calculando dinamicamente a contagem de comandos ativos:
     ```javascript
     const count = mod.id === 'todos' ? totalCommands : (mod.commands ? mod.commands.length : 0);
     ```
   - Ao ativar um módulo via painel administrativo, o total de comandos e abas se ajusta sozinho no próximo `fetchCommands(lang)`.
3. **Detecção e Alternância de Idioma**:
   - Na inicialização da página e em chamadas de `applyLang(lang)` / `toggleLanguage()`, o script dispara obrigatoriamente `fetchCommands(currentLang)`.
   - Se o seu comando estiver com chaves em `i18n.js` ou metadados traduzidos no módulo, o card web exibirá o texto no idioma selecionado pelo visitante.

---

### Expondo Rotas Web Próprias (`setupWebRoutes`)
Se o seu novo módulo precisa de uma API para o front-end (como o módulo sazonal que fornece `/api/sazonal/ranking` ou o tarot que fornece `/api/tarot/card-preview`):
- Declare a função `setupWebRoutes(app, ctx)` no seu `index.js`.
- O `moduleManager.init({ app })` monta automaticamente essas rotas no Express durante o boot do servidor.
- Lembre-se de aplicar sanitização de entradas e cabeçalhos de segurança CORS já configurados no servidor.

---

## 5. Prevenção Estrita de Vazamento de Memória (Zero Memory Leak)

Quando um módulo é recarregado ou desativado em tempo de execução, qualquer resíduo em segundo plano causa degradação de performance e comportamentos duplicados.

Para evitar isso, o `ModuleManager` injeta um `ctx` (contexto seguro) no hook `onLoad(ctx)`. **NUNCA** registre eventos globais diretamente em `process` ou instâncias puras de `client.on` sem usar o `ctx`:

| ❌ Prática Incorreta (Causa Memory Leak) | ✅ Prática Mandatória (Gerenciada pelo Módulo) |
| :--- | :--- |
| `client.on('messageCreate', handler)` | `ctx.registerListener('messageCreate', handler)` |
| `cron.schedule('0 * * * *', task)` | `ctx.registerCron('0 * * * *', task)` |
| `setInterval(fn, 1000)` | `ctx.registerInterval(fn, 1000)` |
| `setTimeout(fn, 5000)` | `ctx.registerTimeout(fn, 5000)` |

Ao invocar `moduleManager.disableModule(id)` ou `reloadModule(id)`:
- Todos os listeners registrados em `ctx.registerListener` são desatrelados via `client.removeListener`.
- Todos os cron jobs são interrompidos via `job.stop()`.
- Todos os intervalos e timeouts são limpos via `clearInterval` e `clearTimeout`.
- Todos os comandos e aliases são removidos do mapa `commandsByName`.

---

## 6. Diretrizes Mandatórias de Internacionalização (i18n)

Conforme as diretrizes arquiteturais do projeto ([`AGENTS.md`](file:///e:/botMelody/AGENTS.md) e [`GEMINI.md`](file:///e:/botMelody/GEMINI.md)), **é proibido implementar funcionalidades em apenas um idioma**.

Ao adicionar respostas, embeds ou mensagens no seu módulo:

1. Abra [`src/utils/i18n.js`](file:///e:/botMelody/src/utils/i18n.js).
2. Adicione a chave no bloco `TRANSLATIONS.pt`:
   ```javascript
   exemplo: {
     sucesso: '✨ {user}, o comando de exemplo funcionou com sucesso!',
   },
   ```
3. Adicione a contraparte **exatamente idêntica** no bloco `TRANSLATIONS.en`:
   ```javascript
   exemplo: {
     sucesso: '✨ {user}, the example command worked successfully!',
   },
   ```
4. **Placeholders dinâmicos**: Nomes de variáveis como `{user}`, `{coins}`, `{time}`, etc., devem ser idênticos em `pt` e `en`.
5. **No comando**: Chame `t('exemplo.sucesso', interaction, { user: interaction.user.displayName })`.

---

## 7. Mapeamento de Categoria e Quality Gate Automático

O bot possui um sistema automatizado de testes que trava o build caso algum comando fique "órfão" sem categoria.

1. Abra [`src/commands/commandHelpers.js`](file:///e:/botMelody/src/commands/commandHelpers.js).
2. Localize `COMMAND_CATEGORY_MAP`.
3. Registre o nome principal do comando e **todos os seus aliases**:
   ```javascript
   // Módulo de Exemplo
   'example': 'utilidades',
   'py-example': 'utilidades',
   'exemplo': 'utilidades',
   'py-exemplo': 'utilidades',
   ```
4. Se o módulo for exportado como comando raiz em `src/commands/index.js`, certifique-se de adicioná-lo à lista `commands`.

---

## 8. Checklist de Verificação Antes de Commitar

Antes de considerar qualquer novo módulo concluído, siga esta lista:

- [ ] A pasta do módulo foi criada em `src/modules/<id>/` com um `index.js` descritor válido.
- [ ] O `index.js` implementa `onLoad(ctx)` e `onUnload(ctx)` com descarte limpo de memória.
- [ ] O comando possui suporte Slash (com `.setDescriptionLocalizations`) e Prefixo (`py!`).
- [ ] Todas as novas mensagens foram inseridas em paridade perfeita em `src/utils/i18n.js` (`pt` e `en`).
- [ ] Todos os nomes e aliases foram mapeados em `COMMAND_CATEGORY_MAP` em `src/commands/commandHelpers.js`.
- [ ] Nenhum emoji proibido foi utilizado (ex: portal do Minecraft `portalframe98`).
- [ ] O Quality Gate foi executado e aprovado com 100% de sucesso:
  ```bash
  npm test
  ```
  *(Audita sintaxe, paridade i18n de 370+ chaves, integridade do catálogo do Help/Web e ciclo de vida de módulos).*
