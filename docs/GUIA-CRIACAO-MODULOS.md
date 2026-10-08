# 🛠️ Guia Técnico Mestre: Criação e Integração de Novos Módulos na Pyxie

> **Público-alvo:** Agentes de IA autônomos, Engenheiros de Software e Desenvolvedores.  
> **Objetivo:** Fornecer um manual prescritivo, detalhado e à prova de falhas para criar módulos completos do zero sem deixar pontas soltas, sem causar erros de interação no Discord e sem exigir configurações manuais posteriores.
> **Arquitetura Base:** Padrão *Cog / Plug-in Modular Desacoplado* (inspirado no Red-DiscordBot), com **Zero Memory Leak**, Preservação Atômica de Dados, Painéis Administrativos Dedicados (Regra das 4+ Configurações), Paridade Bilíngue Mandatória (`pt-BR` & `en`) e Sincronização Dinâmica em Tempo Real com o Ecossistema Web.

---

## 🧭 Sumário Executivo
1. [Visão Geral da Arquitetura Modular](#1-visão-geral-da-arquitetura-modular)
2. [Estrutura Canônica de Pastas e Arquivos](#2-estrutura-canônica-de-pastas-e-arquivos)
3. [Obrigação do README.md por Módulo (Sem Jargões Complexos)](#3-obrigação-do-readmemd-por-módulo-sem-jargões-complexos)
4. [Ciclo de Vida de Interações no Discord.js v14: Modais, Respostas e Anti-Duplicação](#4-ciclo-de-vida-de-interações-no-discordjs-v14-modais-respostas-e-anti-duplicação)
5. [Publicação do Painel Inicial / Embed de Chamada nos Canais (`postPanel`)](#5-publicação-do-painel-inicial--embed-de-chamada-nos-canais-postpanel)
6. [Regra das 4+ Configurações: Página Administrativa Dedicada & Gestão por ID](#6-regra-das-4-configurações-página-administrativa-dedicada--gestão-por-id)
7. [Padrão Visual Mandatório para Páginas Web Públicas dos Módulos](#7-padrão-visual-mandatório-para-páginas-web-públicas-dos-módulos)
8. [Preservação de Dados, Concorrência e Atomicidade](#8-preservação-de-dados-concorrência-e-atomicidade)
9. [Prevenção Estrita de Vazamento de Memória (Zero Memory Leak)](#9-prevenção-estrita-de-vazamento-de-memória-zero-memory-leak)
10. [Dinamismo e Sincronização com o Website e Central de Ajuda](#10-dinamismo-e-sincronização-com-o-website-e-central-de-ajuda)
11. [Passo a Passo: Construindo um Módulo do Zero](#11-passo-a-passo-construindo-um-módulo-do-zero)
    - [Passo 1: Descritor do Módulo (`index.js`)](#passo-1-descritor-do-módulo-indexjs)
    - [Passo 2: Gerenciador de Negócios (`manager.js`)](#passo-2-gerenciador-de-negócios-managerjs)
    - [Passo 3: Comandos Slash & Prefixo no Módulo](#passo-3-comandos-slash--prefixo-no-módulo)
    - [Passo 4: Página Externa Administrativa (`views/adminModulo.ejs`)](#passo-4-página-externa-administrativa-viewsadminmoduloejs)
12. [Diretrizes Mandatórias de Internacionalização (i18n)](#12-diretrizes-mandatórias-de-internacionalização-i18n)
13. [Mapeamento de Categorias, Emojis e Quality Gate](#13-mapeamento-de-categorias-emojis-e-quality-gate)
14. [Checklist Final de Verificação (Quality Assurance para IAs)](#14-checklist-final-de-verificação-quality-assurance-para-ias)

---

## 1. Visão Geral da Arquitetura Modular

Na Pyxie, funcionalidades e novos sistemas **NUNCA são acoplados diretamente** em `src/index.js`, `src/commands/index.js` ou `server.js`. Em vez disso, todo subsistema opera como um módulo isolado gerenciado por [`src/services/moduleManager.js`](file:///e:/botMelody/src/services/moduleManager.js).

### Principais Pilares do Motor Modular:
1. **Descoberta Automática:** O `ModuleManager` varre a pasta `src/modules/` na inicialização e em recarregamentos (*hot-reload*).
2. **Ciclo de Vida Controlado:** Cada módulo possui métodos explícitos de inicialização (`onLoad`) e desligamento (`onUnload`).
3. **Escopo Isolado de Recursos:** Listeners do Discord, agendamentos cron, intervalos e timeouts pertencem ao módulo e são removidos sem deixar resíduos ao desativá-lo.
4. **Sincronização Bidirecional (Bot ↔ Web):** As alterações de estado feitas no painel web refletem instantaneamente no bot via comunicação IPC (`MODULE_TOGGLE`, `MODULE_RELOAD`).
5. **Catálogo Dinâmico:** Os comandos do módulo aparecem dinamicamente no comando `/py-help` e na rota pública `/api/commands` sem exigir alterações manuais no HTML do site.

```mermaid
flowchart TD
    A["Pasta src/modules/<id>/"] -->|Varredura Automática| B["ModuleManager (src/services/moduleManager.js)"]
    B -->|onLoad(ctx)| C["Escopo Isolado de Execução"]
    C -->|Registra| D["Comandos em commandsByName & Slash"]
    C -->|Rastreia via ctx| E["Eventos, Crons, Intervals & Timeouts"]
    C -->|setupWebRoutes(app)| F["Rotas Express & Páginas Dedicadas"]
    B -->|getHelpModules()| G["Central de Ajuda /py-help (Discord)"]
    B -->|/api/commands| H["Catálogo Interativo Web (index.html)"]
    B -->|/api/modules/status| I["Navegação Dinâmica (Navbar, Drawer & Footer)"]
```

---

## 2. Estrutura Canônica de Pastas e Arquivos

Todo novo módulo deve residir estritamente dentro de seu diretório próprio em `src/modules/<id-do-modulo>/`:

```text
src/modules/
└── meu-modulo/                      <-- ID canônico em kebab-case ou minúsculas
    ├── README.md                    <-- DOCUMENTAÇÃO OBRIGATÓRIA (sem jargões técnicos)
    ├── index.js                     <-- Ponto de entrada e descritor do módulo
    ├── meuModuloManager.js          <-- Lógica de negócio, leitura/escrita atômica e estado
    ├── commands/                    <-- Comandos exclusivos deste módulo
    │   └── pyMeuComando.js
    └── views/ (obrigatório se 4+ configs)
        └── adminMeuModulo.ejs       <-- Página administrativa dedicada externa
```

Arquivos de dados e persistência devem ser salvos exclusivamente na pasta global `data/`:
- `data/<modulo>Config.json` (configurações do módulo: canais, cargos, limites)
- `data/<modulo>Data.json` (dados operacionais gerados pelos usuários)

---

## 3. Obrigação do README.md por Módulo (Sem Jargões Complexos)

**Regra Absoluta:** Todo módulo criado **DEVE obrigatoriamente** incluir um arquivo `README.md` localizado na raiz de sua pasta (`src/modules/<id>/README.md`).

### Objetivo do README:
Permitir que qualquer membro da equipe, administrador de servidor ou moderador entenda exatamente do que o módulo se trata, o que ele faz, quais comandos ele oferece e como configurá-lo, **sem precisar ler código-fonte ou entender termos complexos de programação**.

### Diretrizes de Escrita:
- **Linguagem Acessível:** Proibido usar jargões técnicos herméticos (ex: "instanciação de singleton", "despachante polimórfico", "middleware de throttling"). Use termos comuns como "limite de tentativas", "painel de controle", "mensagem automática", "canal de avisos".
- **Estrutura Obrigatória:**
  1. **O que é este módulo?** (Explicação em 1 a 2 parágrafos simples).
  2. **O que ele é capaz de fazer?** (Lista em tópicos das principais funcionalidades).
  3. **Comandos no Discord** (Tabela com comando, para que serve e quem pode usar).
  4. **Canais e Cargos Necessários** (O que a staff precisa configurar para o módulo funcionar).
  5. **Recursos no Site e Web** (Se possui páginas públicas, mural, galeria ou painel próprio).
  6. **Ferramentas e Bibliotecas Usadas** (Ex: Canvas para imagens, Express para páginas web).

---

## 4. Ciclo de Vida de Interações no Discord.js v14: Modais, Respostas e Anti-Duplicação

> [!CAUTION]
> **Armadilha Crítica para IAs:**  
> A maior fonte de erros ("A interação falhou", mensagens enviadas duas vezes, ou timeout de 3 segundos) decorre de desatenção ao ciclo de vida de interações do Discord.js v14.

### 1. Regra de Ouro dos Modais (`showModal`):
- **NUNCA** chame `await interaction.deferReply()` ou `await interaction.deferUpdate()` antes de `await interaction.showModal(modal)`.
- O protocolo do Discord exige que `showModal` seja a **primeira resposta direta** à interação de um botão ou comando slash. Se a interação já tiver sido diferida ou respondida, o Discord rejeitará o modal com erro imediato.

```javascript
// ❌ ERRADO: O modal falhará imediatamente no Discord
async function handleBotao(interaction) {
  await interaction.deferUpdate(); // PROIBIDO antes de modal!
  const modal = new ModalBuilder()...;
  await interaction.showModal(modal);
}

// ✅ CORRETO: Modal exibido como primeira ação direta
async function handleBotao(interaction) {
  const modal = new ModalBuilder()...;
  await interaction.showModal(modal); // Primeira e única resposta direta à interação!
}
```

### 2. Tratamento de Submissão de Modais (`ModalSubmitInteraction`):
- Quando o usuário envia o modal, você tem **3 segundos** para responder.
- Se o processamento envolver envio de mensagens, validação de link ou persistência, use `deferReply` ou `deferUpdate` imediatamente:
```javascript
async function handleModalSubmit(interaction) {
  // 1. Difere a resposta de forma segura para ter até 15 minutos de processamento
  await interaction.deferReply({ ephemeral: true });

  try {
    // 2. Lógica de negócio (leitura, escrita atômica, envio a canais)
    await processarEnvio(interaction);

    // 3. Resposta final usando editReply
    await interaction.editReply({ content: '✅ Solicitação enviada com sucesso!' });
  } catch (err) {
    await interaction.editReply({ content: '❌ Ocorreu um erro ao processar seu envio.' });
  }
}
```

### 3. Prevenção de Mensagens Duplicadas e Erro "Unknown Interaction":
- **NUNCA adicione `client.on('interactionCreate', ...)` dentro de handlers de comando**.
- Se múltiplos componentes puderem interagir (ex: botão de aprovar/rejeitar pela staff), verifique o estado antes de responder:
```javascript
// Verifica se já foi adiada ou respondida antes de tentar responder
if (interaction.deferred || interaction.replied) {
  await interaction.followUp({ content: msg, ephemeral: true });
} else {
  await interaction.reply({ content: msg, ephemeral: true });
}
```

---

## 5. Publicação do Painel Inicial / Embed de Chamada nos Canais (`postPanel`)

> [!IMPORTANT]
> **O Problema Clássico:**  
> A IA cria o comando e a lógica de processamento, mas **esquece de criar a forma como o embed inicial aparece no canal** para os membros interagirem (ex: o embed fixo no canal `#parcerias` ou `#tickets` com o botão `📝 Iniciar Solicitação`).

Todo módulo que depender de um ponto de entrada público em um canal do Discord **DEVE implementar**:

### 1. Função `postPanel()` no Manager:
Monta o embed oficial com arte temática, título, regras e os botões de ação (`ButtonBuilder`), enviando-o para o canal configurado:

```javascript
async function postPanel() {
  const channelId = this.config.channels.requestChannelId;
  if (!channelId) return { ok: false, message: 'Canal de solicitações não configurado.' };

  const channel = await this.client.channels.fetch(channelId).catch(() => null);
  if (!channel) return { ok: false, message: 'Canal não encontrado ou sem permissão de envio.' };

  const embed = new EmbedBuilder()
    .setColor('#8B5CF6')
    .setTitle('🤝 Central de Solicitações de Parcerias')
    .setDescription('Clique no botão abaixo para preencher o formulário oficial de parceria com a Cringelândia.')
    .setImage('https://.../banner.png')
    .setFooter({ text: 'Pyxie • Sistema de Alianças' });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('parceria_start_wizard')
      .setLabel('Solicitar Parceria')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary)
  );

  const sent = await channel.send({ embeds: [embed], components: [row] });
  return { ok: true, channelId, messageId: sent.id };
}
```

### 2. Botão de Disparo no Painel Administrativo (`views/adminModulo.ejs`):
Na página administrativa dedicada do módulo, deve existir um botão em destaque:
```html
<button type="button" class="btn-action" onclick="postPanelToDiscord()">
  📢 Publicar Painel no Canal Discord
</button>
```
Com endpoint `POST /api/admin/modules/<id>/post-panel` protegido por `requireAdminAuth`.

---

## 6. Regra das 4+ Configurações: Página Administrativa Dedicada & Gestão por ID

Para manter a interface da Pyxie intuitiva, limpa e profissional, adotamos a seguinte regra de interface:

> **Regra de Ouro da Interface:**  
> Se um módulo possuir **4 ou mais configurações** (ex: canais de entrada, canais de aprovação, cargos de triagem, limites numéricos, filtros de mídia) ou envolver **gerenciamento de listas/ações complexas** (aprovação de pedidos, exclusão de itens por ID, auditoria):
> 
> 1. **NÃO poluir a barra de abas principal** do painel administrativo (`public/admin.html`).
> 2. O módulo **DEVE ter uma página externa administrativa própria** dentro do escopo administrativo (`src/modules/<modulo>/views/admin<Modulo>.ejs`), servida em `/admin/<modulo>`.
> 3. Na aba Módulos do painel administrativo geral (`public/admin.html`), o módulo deve exibir um cartão limpo com botão:
>    ```html
>    <a href="/admin/<modulo>" class="btn-module-panel">⚙️ Acessar Painel</a>
>    ```
> 4. Toda ação administrativa do módulo (como exclusão de registros por ID ou ajuste fino) deve ser feita dentro dessa página dedicada.

### Requisito Obrigatório: Exclusão e Gestão por ID
Se o módulo armazena registros operacionais (tickets, parceiros, artes do museu, denúncias):
- A página administrativa deve listar os registros em tabela ou cartões, exibindo claramente o identificador único (`ID`).
- Deve fornecer um botão de **Excluir por ID** chamando `DELETE /api/admin/modules/<modulo>/items/:id` com confirmação.

---

## 7. Padrão Visual Mandatório para Páginas Web Públicas dos Módulos

Sempre que um módulo incluir páginas web públicas para a comunidade (ex: `/parcerias`, `/museu`):

### 1. Botão de Retorno à Home com Pixel Art:
Na barra de navegação no topo de toda página pública, é **obrigatório** incluir o botão padronizado para a Home da Pyxie usando o ícone canônico em pixel art:
```html
<a href="/" class="brand-home-btn" title="Voltar para a página inicial da Pyxie">
  <img src="/assets/pyxie/pyxie_pixelart_face.png" class="brand-pixel-icon" alt="Pyxie" />
  <span>Pyxie</span>
</a>
```

### 2. Link do Servidor Oficial (Sempre `/discord`):
- **NUNCA escreva URLs fixas** como `discord.gg/<guild_id>` ou códigos soltos. O ID numérico da guilda falha no Discord!
- Use sempre o endpoint canônico interno:
```html
<a href="/discord" target="_blank" rel="noopener noreferrer" class="btn-nav btn-discord">
  <span>💬</span> <span>Cringelândia</span>
</a>
```
O servidor Express já redireciona `/discord` automaticamente para o convite permanente oficial.

### 3. Blocos de Anúncios Mandatórios (Shopee em PT / Adsterra em EN):
Toda página pública deve integrar monetização responsiva:
- **Português (`pt-BR`)**: Banner Shopee com classe `.monetization-pt`, atributo `data-hourly-promo="true"` e consumo da rota `/api/shopee/hourly-promo`.
- **Inglês (`en`)**: Bloco Adsterra com classe `.monetization-en`, script iframe desktop 468x60 e mobile 320x50.

### 4. Uso de Imagens Vetoriais (SVGs) vs. Ícones PNG:
- **Para Ícones Pequenos (16px a 32px - tabs, botões, badges, títulos)**:
  - Utilize estritamente as imagens PNG temáticas: `/assets/pyxie/emojis/astaroth_gem.png` e `/assets/pyxie/emojis/astaroth_icon2.png`.
  - SVGs não devem ser espremidos em tamanhos diminutos onde perdem a nitidez.
- **Para Ilustrações de Destaque (SVGs do Astaroth)**:
  - Devem ser exibidos em **formato maior** (120px a 240px) no Hero, em banners de ação e no rodapé, acompanhados de auras neon e animações de flutuação.

### 5. Submenu de Módulos na Página Inicial (`public/index.html`):
- Toda nova página de módulo deve ser integrada ao dropdown `#navModulesDropdown` no desktop e `#drawerModulesTitle` no mobile.
- Adicione a classe dinâmica correspondente (ex: `.<modulo>-dynamic-link` com `style="display: none;"`), que se torna visível apenas quando `/api/modules/status` indicar que o módulo está ativado.

---

## 8. Preservação de Dados, Concorrência e Atomicidade

A Pyxie opera simultaneamente com um processo bot (Discord) e um servidor web (Express). Portanto, erros de concorrência ou corrupção de arquivos são inaceitáveis.

### Diretrizes Mandatórias de Dados:
1. **Escrita Atômica Obrigatória:**
   - **NUNCA** utilize `fs.writeFileSync(caminho, json)` diretamente no arquivo final. Se o servidor for interrompido durante a escrita, o arquivo ficará corrompido ou vazio (0 bytes).
   - Utilize sempre `writeJsonAtomic(filePath, data)` de [`src/utils/atomicJson.js`](file:///e:/botMelody/src/utils/atomicJson.js), que salva primeiro em um arquivo temporário (`.tmp.<timestamp>`) e realiza `fs.renameSync` de forma atômica no sistema operacional.
2. **Separação de Configuração vs. Dados Operacionais:**
   - Configurações administrativas ficam em `data/<modulo>Config.json`.
   - Dados criados por usuários (tickets, artes, parcerias, registros) ficam em `data/<modulo>Data.json`.
3. **Prevenção de Condições de Corrida (Bot ↔ Web):**
   - Antes de modificar os dados em memória, invoque `this.refresh()` para carregar as modificações mais recentes feitas pela outra ponta.
   - Execute o ciclo **Ler do disco -> Modificar em memória -> Salvar atomicamente** de forma síncrona.

---

## 9. Prevenção Estrita de Vazamento de Memória (Zero Memory Leak)

O bot executa em ambiente de produção com limite estrito de memória (`--max-old-space-size=768` no Node.js). Vazamentos de memória degradam a máquina, travam respostas a interações e derrubam o processo.

### Práticas Mandatórias de Gerenciamento de Recursos:
1. **Uso Exclusivo do Contexto Seguro (`ctx`):**
   No método `onLoad(ctx)`, utilize estritamente as funções injetadas pelo `ModuleManager`:
   
   | ❌ Incorreto (Causa Vazamento de Memória) | ✅ Correto (Gerenciado com Limpeza Automática) |
   | :--- | :--- |
   | `client.on('messageCreate', handler)` | `ctx.registerListener('messageCreate', handler)` |
   | `cron.schedule('0 * * * *', task)` | `ctx.registerCron('0 * * * *', task)` |
   | `setInterval(fn, 1000)` | `ctx.registerInterval(fn, 1000)` |
   | `setTimeout(fn, 5000)` | `ctx.registerTimeout(fn, 5000)` |

2. **Proibição de Listeners Globais Duplicados:**
   - **NUNCA** registre `client.on('interactionCreate', ...)` dentro do seu manager de módulo se o bot já despacha interações centralmente em `index.js`.
   - Listeners duplicados causam **execuções em dobro**, respostas rejeitadas pelo Discord com erro `"Unknown interaction"` e modais abrindo duas vezes.

3. **Limpeza Explícita no `onUnload()`:**
   - Limpe estruturas em memória como `Map` ou `Set` que acumulam dados transitórios (ex: rate-limits por IP, caches de usuários):
     ```javascript
     async onUnload() {
       this.client = null;
       this.bumpHits.clear();
       this.activeSessions = {};
     }
     ```

---

## 10. Dinamismo e Sincronização com o Website e Central de Ajuda

O ecossistema da Pyxie é 100% integrado. Quando um módulo é ativado ou desativado, o comportamento deve se propagar automaticamente para:

### 1. Central de Ajuda no Discord (`/py-help`)
- A central consome `getHelpModules()` de [`src/commands/commandHelpers.js`](file:///e:/botMelody/src/commands/commandHelpers.js).
- `getHelpModules()` consulta dinamicamente `moduleManager.getActiveCommands()`.
- Os comandos de módulos ativos entram automaticamente no menu suspenso de categorias (`social`, `utilidades`, etc.).

### 2. Catálogo Interativo no Site (`public/index.html`)
- O front-end consome `/api/commands?lang=pt` e `/api/commands?lang=en`.
- Ao alternar categorias ou buscar comandos na barra de pesquisa, os comandos do módulo são renderizados em tempo real.

### 3. Navegação Dinâmica no Site Principal (`public/index.html`)
- Se o módulo possui uma página pública (como `/parcerias` ou `/museu`), os links no dropdown de módulos e no drawer mobile devem possuir a classe dinâmica correspondente com `style="display: none;"` por padrão.
- O front-end monitora `/api/modules/status` e exibe os links apenas quando o módulo estiver ativo no bot.

### 4. Embeds com Referência Web e Streaks
- Cada anúncio ou embed oficial publicado pelo módulo no Discord deve incluir:
  - O link de direcionamento para a página web correspondente (ex: `🌐 Mural no Site: https://.../parcerias`).
  - A contagem de impulsos, streaks ou visualizações dados via web (ex: `⚡ Impulsos no Site: 5`).
  - Ao receber interações na web (ex: bumps), o bot deve atualizar a mensagem original no canal e/ou emitir aviso no canal de radar.

---

## 11. Passo a Passo: Construindo um Módulo do Zero

### Passo 1: Descritor do Módulo (`index.js`)
Crie [`src/modules/<id>/index.js`](file:///e:/botMelody/src/modules/partnerships/index.js):

```javascript
// src/modules/meu-modulo/index.js
const meuModuloManager = require('./meuModuloManager');
const pyMeuComando = require('./commands/pyMeuComando');

module.exports = {
  id: 'meu-modulo',

  name: {
    'pt-BR': 'Nome em Português',
    en: 'Name in English',
  },
  description: {
    'pt-BR': 'Descrição amigável em português.',
    en: 'Friendly description in English.',
  },

  category: 'social', // 'economia' | 'loja' | 'tarot' | 'social' | 'utilidades'
  icon: '⭐',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  commands: [pyMeuComando],

  async onLoad(ctx) {
    meuModuloManager.init(ctx.client || null, ctx);
  },

  async onUnload() {
    meuModuloManager.destroy();
  },

  setupWebRoutes(app, ctx) {
    meuModuloManager.setupWebRoutes(app, ctx);
  },
};
```

---

### Passo 2: Gerenciador de Negócios (`manager.js`)
Crie [`src/modules/<id>/meuModuloManager.js`](file:///e:/botMelody/src/modules/partnerships/partnershipManager.js):

```javascript
// src/modules/meu-modulo/meuModuloManager.js
const path = require('path');
const { readJson, writeJsonAtomic } = require('../../utils/atomicJson');
const { t } = require('../../utils/i18n');

const CONFIG_PATH = path.join(process.cwd(), 'data', 'meuModuloConfig.json');
const DATA_PATH = path.join(process.cwd(), 'data', 'meuModuloData.json');

class MeuModuloManager {
  constructor() {
    this.client = null;
    this.sendIpc = null;
    this.config = {};
    this.data = { items: [] };
    this.tempCache = new Map();
  }

  init(client, ctx) {
    this.client = client || null;
    if (ctx && typeof ctx.sendIpc === 'function') this.sendIpc = ctx.sendIpc;
    this.refresh();

    // Registra cron com descarte automático garantido
    if (ctx && typeof ctx.registerCron === 'function') {
      ctx.registerCron('0 * * * *', () => this.tarefaHoraria());
    }
  }

  destroy() {
    this.client = null;
    this.tempCache.clear();
  }

  refresh() {
    this.config = readJson(CONFIG_PATH, { canalId: '', limite: 10 });
    this.data = readJson(DATA_PATH, { items: [] });
  }

  saveData() {
    return writeJsonAtomic(DATA_PATH, this.data);
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return writeJsonAtomic(CONFIG_PATH, this.config);
  }

  tarefaHoraria() {
    // Rotina automática protegida
  }

  setupWebRoutes(app, ctx) {
    if (ctx && typeof ctx.sendIpc === 'function') this.sendIpc = ctx.sendIpc;

    // Rota pública para visualização de dados
    app.get('/api/meu-modulo/items', (req, res) => {
      this.refresh();
      res.json({ success: true, items: this.data.items });
    });
  }
}

module.exports = new MeuModuloManager();
```

---

### Passo 3: Comandos Slash & Prefixo no Módulo
Crie os comandos na pasta `commands/`:

> [!NOTE]
> O nome canônico de um comando slash é **sempre em inglês** (ex: `py-partner`), enquanto os comandos por prefixo (`py!`) aceitam aliases em inglês e português (`['partner', 'parceria', 'py-parceria']`).

```javascript
// src/modules/meu-modulo/commands/pyMeuComando.js
const { SlashCommandBuilder } = require('discord.js');
const { t } = require('../../../utils/i18n');
const meuModuloManager = require('../meuModuloManager');

const name = 'py-mycommand'; // Nome canônico slash sempre em inglês
const aliases = ['mycommand', 'meucomando', 'py-meucomando'];

module.exports = {
  name,
  aliases,
  category: 'social',
  ephemeral: true,
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription('Execute the module action.')
    .setDescriptionLocalizations({
      'pt-BR': 'Executa a ação principal do módulo.',
    }),

  async executeSlash({ interaction }) {
    await interaction.reply({
      content: t('meumodulo.sucesso', interaction),
      ephemeral: true,
    });
  },

  async executePrefix({ message }) {
    await message.reply(t('meumodulo.sucesso', message));
  },
};
```

---

### Passo 4: Página Externa Administrativa (`views/adminModulo.ejs`)
Se o módulo tiver 4 ou mais configurações ou manipulação de listas, crie a view em `views/adminMeuModulo.ejs` e configure a rota com autenticação administrativa em `setupWebRoutes`:

```javascript
// Dentro de setupWebRoutes em meuModuloManager.js
const { requireAdminAuth, isValidAdminSession, isIpAllowed } = require('../../services/adminAuth');

app.get('/admin/meu-modulo', (req, res) => {
  const cookieHeader = req.headers.cookie;
  const sessionCookie = cookieHeader ? (cookieHeader.match(/(?:^|;\s*)pyxie_admin_session=([^;]*)/)?.[1] || null) : null;
  const isAuthed = (sessionCookie && isValidAdminSession(sessionCookie)) || isIpAllowed(req);

  if (!isAuthed) return res.redirect('/admin');

  this.refresh();
  res.render(path.join(__dirname, 'views', 'adminMeuModulo.ejs'), {
    config: this.config,
    items: this.data.items,
  });
});

app.delete('/api/admin/modules/meu-modulo/items/:id', requireAdminAuth, (req, res) => {
  this.refresh();
  const id = req.params.id;
  const idx = this.data.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Item não encontrado' });
  this.data.items.splice(idx, 1);
  this.saveData();
  res.json({ success: true, message: 'Item removido com sucesso!' });
});
```

---

## 12. Diretrizes Mandatórias de Internacionalização (i18n)

Conforme a Política de Arquitetura Bilíngue Mandatória ([`AGENTS.md`](file:///e:/botMelody/AGENTS.md)):

1. **Paridade Rigorosa de Chaves:**
   - Cada chave adicionada a `TRANSLATIONS.pt` em [`src/utils/i18n.js`](file:///e:/botMelody/src/utils/i18n.js) **DEVE ter sua contraparte idêntica** em `TRANSLATIONS.en`.
   - Placeholders (`{user}`, `{count}`, `{url}`) devem ser perfeitamente iguais nas duas versões.
2. **Sem Textos Fixos no Código:**
   - Mensagens em embeds, footers e respostas ao usuário utilizam sempre `t(chave, source, { ... })`.
3. **Slash Commands:**
   - `.setName()` e `.setDescription()` em inglês.
   - `.setDescriptionLocalizations({ 'pt-BR': '...' })` obrigatório.

---

## 13. Mapeamento de Categorias, Emojis e Quality Gate

1. **Mapeamento Canônico de Categorias:**
   - Em [`src/commands/commandHelpers.js`](file:///e:/botMelody/src/commands/commandHelpers.js), adicione o nome canônico e **todos os aliases** do comando em `COMMAND_CATEGORY_MAP`:
     ```javascript
     'mycommand': 'social',
     'py-mycommand': 'social',
     'meucomando': 'social',
     'py-meucomando': 'social',
     ```
2. **Política Estrita de Emojis:**
   - É expressamente proibido usar o emoji do portal de Minecraft (`portalframe98`).
   - Use o emoji oficial de mapa/galáxia da Pyxie (`<:map:1551355962974273546>`) ou `getThemeEmojiUrl()`.
3. **Quality Gate Automatizado:**
   - Execute o teste automatizado antes de qualquer commit:
     ```bash
     npm test
     ```
   - O teste audita a paridade de todas as chaves i18n e verifica se todos os comandos estão devidamente mapeados no catálogo.

---

## 14. Checklist Final de Verificação (Quality Assurance para IAs)

Antes de considerar qualquer novo módulo concluído, verifique rigorosamente cada item desta lista:

- [ ] **README.md do Módulo:** Criado em linguagem simples, sem termos complexos de programação, explicando o que faz, comandos, canais e bibliotecas.
- [ ] **Ciclo de Vida de Modais e Interações:** NENHUM `deferReply()` antes de `showModal()`. `deferReply({ ephemeral: true })` usado no submit de modais para evitar timeout de 3s. Nenhum listener global duplicado de `interactionCreate`.
- [ ] **Publicação do Painel Inicial (`postPanel`):** Se o módulo usa um embed com botão em canal público, implementada a função `postPanel()` e o botão correspondente no painel web para a staff postar no canal com 1 clique.
- [ ] **Regra das 4+ Configurações:** Se possuir 4 ou mais configurações ou gestão de listas, possui página própria em `/admin/<modulo>` acessada pelo botão `⚙️ Acessar Painel` na aba Módulos do painel admin.
- [ ] **Exclusão de Itens por ID:** Interface administrativa e endpoint `DELETE` permitindo que a staff exclua qualquer registro por ID.
- [ ] **Páginas Web Públicas:**
  - [ ] Botão de Home com o ícone em pixel art (`/assets/pyxie/pyxie_pixelart_face.png`).
  - [ ] Botões para o Discord usando estritamente `/discord` (e nunca `discord.gg/<id>` hardcoded).
  - [ ] Blocos de anúncios com Shopee em PT (`data-hourly-promo="true"`) e Adsterra em EN.
  - [ ] Mascotes SVGs do Astaroth em formato grande (120px - 240px) e ícones pequenos com PNGs (`astaroth_gem.png` e `astaroth_icon2.png`).
- [ ] **Submenu no Site Principal (`public/index.html`):** Adicionado ao dropdown de módulos para não estourar o header, com classe dinâmica exibida apenas quando ativo.
- [ ] **Preservação Atômica:** Dados salvos na pasta `data/` usando exclusivamente `writeJsonAtomic`.
- [ ] **Zero Memory Leak:** Listeners e crons registrados com `ctx.registerListener` e `ctx.registerCron`. `onUnload()` limpa referências e estruturas em memória.
- [ ] **Paridade i18n:** Todas as chaves e placeholders sincronizados em PT-BR e EN no `src/utils/i18n.js`.
- [ ] **Catálogo & Ajuda:** Comandos registrados em `COMMAND_CATEGORY_MAP` em `commandHelpers.js`.
- [ ] **Quality Gate:** Aprovado 100% no comando `npm test`.
