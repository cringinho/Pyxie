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
- O comando executa todos os **25 arquivos de testes** do ecossistema, incluindo testes de segurança, integridade econômica, tarot, SEO, paridade i18n, módulos desacoplados, Drizzle ORM, estúdio SaaS, master dashboard SaaS, integridade do banco de dados, Discord health, homologation preview dispatcher e novos sistemas (Acolhimento 24h, Desabafos, py!set e Tarot Global).
- **100% dos testes devem passar** sem exceções antes de finalizar qualquer turno ou enviar commits para produção.

---

## 3. Arquitetura de Subsistemas & Módulos Dinâmicos (`src/services/moduleManager.js`)
A Pyxie utiliza uma arquitetura de **Monólito Modular** com subsistemas isolados gerenciados pelo `moduleManager`:
1. **Módulos Opcionais Nativos do Bot (`src/modules/*`)**:
   - Módulos como Matrimônio (`marriage`) e Eventos Sazonais (`seasonal`) pertencem ao ecossistema global do bot, mas operam desacoplados com ciclo de vida próprio (`onLoad`, `onUnload`, listeners dedicados e crons).
   - Podem ser ligados ou desligados dinamicamente em tempo de execução sem reinicializar o processo e sem interferir nos comandos principais.
2. **Módulo SaaS Isolado (Estúdio da Mary - `src/modules/mary-studio/`)**:
   - Opera como um subsistema SaaS restrito e dedicado exclusivamente ao servidor e à identidade da Mary (`MARY_DEFAULT_GUILD_ID`).
   - Possui rotas web Express dedicadas (`/mary`, `/api/mary/*`), autenticação por Magic Link HMAC de uso único, controle de sessões e banco de configuração isolado (`data/maryStudioConfig.json`).
   - Permite personalização do perfil local da Pyxie (`PATCH /guilds/{guildId}/members/@me` para nick, avatar e banner) exclusivamente na guilda da Mary, sem alterar em nada a identidade visual global da Pyxie em outros servidores.
3. **Monitoramento e Condição dos Subsistemas**:
   - A condição operacional, status de ativação e saúde de cada módulo são monitorados e expostos via `moduleManager.getStatus()`, rota `/api/status`, painel `/admin` e comando `/py-status`.

---

## 4. Política de Paridade Dinâmica: Comandos Web & Central de Ajuda (`help.js`)
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

## 5. Política de Integridade e Proteção Econômica (Zero Impacto Não Planejado)
- **Minigames de Recreação Pura**: Jogos casuais focados em entretenimento (ex: Matemática Arcana `/py-matematica`, Jogo da Velha `/py-jogodavelha`, Campo Minado `/py-campominado`, Biscoito da Sorte, Provável) NÃO devem conceder saldo, moedas ou feijões mágicos sem cálculo e autorização explícita do criador.
- **Proteção Anti-Inflação**: O ganho de moedas é restrito estritamente a fluxos econômicos regulados: trabalho formal com turnos (`/py-work`), bônus diário regular (`/py-daily`), bônus web cronometrado (24h de cooldown) e recompensas limitadas de oráculo/conquistas.
- **Prevenção de Exploits**: Nenhuma funcionalidade nova de comunidade, mini-evento ou utilidade pode injetar moeda no banco sem travas de cooldown, atomicidade e validação de permissões.

---

## 6. Camada Híbrida de Persistência: PostgreSQL (Drizzle ORM) & Arquivos Atômicos
- **PostgreSQL com Drizzle ORM (`src/database/`)**:
  - Camada primária estruturada para operações transacionais relacionais de alta concorrência: usuários, saldos econômicos, histórico de transações, matrimônio e álbum de cartas de tarot.
  - As transações utilizam travas e guardas de integridade para garantir que transferências e resgates sejam ACID.
- **Persistência Atômica JSON (`data/`)**:
  - Utiliza o padrão `writeAtomic` (escrita em arquivo temporário `.tmp` seguida de `renameSync`) para garantir resiliência contra corrupção em quedas de energia ou reinicializações forçadas da VM.
  - Mantém redundância, configurações dinâmicas de módulos, backups locais e capacidade de execução autônoma em modo de testes.

---

## 7. Política Visual de Emojis: Proibição Estrita do Portal de Minecraft (`portalframe98`)
- **Regra de Estilo Visual**: É expressamente PROIBIDO utilizar o emoji do portal do Minecraft (`portalframe98`, ID `1548444170488778954`) em qualquer parte do ecossistema da Pyxie (Discord, embeds, website, wiki ou portal de bônus).
- **Substituto Canônico Obrigatório**: Para ilustrar cenários, navegação, viagens entre locais, portais arcanos e exploração do Bosque da Penumbra, deve-se utilizar estritamente o emoji oficial de mapas / galáxia violeta da Pyxie:
  - **Discord**: `<:map:1551355962974273546>` ou alias `MAP` / `PORTAL` via `getEmoji('MAP')` em `src/utils/appEmojis.js`.
  - **Web / Front-end**: `https://cdn.discordapp.com/emojis/1551355962974273546.png`.

---

## 8. Política Mandatória de SEO Profissional e Dinâmico (Web & Search Engine Trust)
Toda página web pública (`public/*.html`), rota servida pelo Express (`server.js`) ou módulo que disponibilize interface pública DEVE seguir rigorosamente os padrões de SEO técnico, rastreabilidade e integridade para mecanismos de busca (Google, Bing, Yandex, Yahoo, DuckDuckGo):

### 1. Paridade Bilíngue Mandatória no SEO
- Toda página DEVE ter metadados equivalentes e otimizados em `src/utils/seoRenderer.js` para `pt` (pt_BR) e `en` (en_US).
- **Hreflang Bidirecional Obrigatório**:
  - `<link rel="alternate" hreflang="pt-BR" href="https://pyxie.com.br/rota" />`
  - `<link rel="alternate" hreflang="en" href="https://pyxie.com.br/rota?lang=en" />`
  - `<link rel="alternate" hreflang="x-default" href="https://pyxie.com.br/rota" />`
- **Canonical URLs Estritas**:
  - A URL canônica nunca deve conter query parameters acidentais ou fragmentos hash (ex: `https://pyxie.com.br/tarot` é a canônica principal; variações `?lang=en` devem possuir tags canônicas coerentes e links alternativos autorreferenciais).
- **Sitemap Dinâmico/Estático (`public/sitemap.xml`)**:
  - Toda nova página DEVE ser registrada no `public/sitemap.xml` com as entradas canônicas em português, versões em inglês (`?lang=en`) e os blocos `xhtml:link rel="alternate"` correspondentes.

### 2. Entrega Dinâmica Otimizada para Crawlers (`seoRenderer.js`)
- Os motores de busca e rastreadores de redes sociais (WhatsApp, Twitterbot, Discordbot, Pinterestbot, Bingbot, Googlebot) NÃO esperam execução de scripts pesados do lado do cliente.
- O Express DEVE utilizar `getLocalizedHtml(pageKey, lang, publicDir)` em `server.js` para injetar em tempo de compilação/serviço os metadados corretos de `<title>`, `<meta name="description">`, OpenGraph (`og:title`, `og:description`, `og:image`, `og:locale`), Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`) e Schema.org no cabeçalho antes de entregar o HTML.

### 3. Integridade On-Page e Acessibilidade (Core Web Vitals)
- **Hierarquia Semântica Estrita**:
  - Cada página DEVE conter **exatamente 1 tag `<h1>`** descritiva e orientada a intenção de busca.
  - Subseções devem usar hierarquia estrita `<h2>` e `<h3>`.
- **Imagens e Mídia**:
  - É expressamente PROIBIDO tags `<img>` sem o atributo `alt` ou com `alt=""` vazio. Toda imagem deve ter texto alternativo descritivo em seu respectivo idioma.
  - Imagens de destaque (`og:image`) DEVEM possuir dimensões mínimas recomendadas (ex: 1200x630 para banners horizontais ou proporção 2:3 / 9:16 para cards de Tarot/Pinterest).
- **Dados Estruturados Schema.org (`application/ld+json`)**:
  - Toda página pública deve conter bloco JSON-LD válido com `@context: "https://schema.org"`.
  - Páginas de utilidades e oráculos: tipo `WebApplication` ou `CreativeWork`.
  - Documentação/Guias: tipo `TechArticle` ou `AboutPage`.
  - Página inicial: tipo `SoftwareApplication` com `offers` e `applicationCategory`.

### 4. Protocolo IndexNow e Sindicação Autônoma
- Sempre que novas rotas, páginas ou conteúdos dinâmicos forem publicados, o serviço [`src/services/indexNowService.js`](file:///e:/botMelody/src/services/indexNowService.js) DEVE ser acionado para notificar instantaneamente os mecanismos de busca parceiros (Bing, Yandex, Seznam, Naver).
- Manter feeds de sindicação (`/rss.xml`, `/atom.xml`, `/feed.json`) sempre válidos e sincronizados via [`src/services/feedGenerator.js`](file:///e:/botMelody/src/services/feedGenerator.js) com tags de mídia enriquecidas (`<enclosure>`, `<media:content>`) para alimentar Pinterest e agregadores externos.

### 5. Prevenção de Erros de Desindexação e Penalidades (Anti-Blackhat)
- **Proibido Cloaking ou Conteúdo Oculto Danoso**: O conteúdo entregue ao bot/crawler de busca deve refletir fielmente o conteúdo consumido pelo usuário humano.
- **Proteção do `robots.txt`**: Rotas administrativas (`/admin`, `/api/admin/`, `/console`, `/mary`) DEVEM permanecer com `Disallow` explícito no `public/robots.txt` para preservar a segurança e evitar indexação de telas de login ou dados confidenciais.
- **Quality Gate de SEO**: O teste `tests/seoBilingual.test.js` é executado obrigatoriamente dentro de `npm test`. Nenhuma alteração web pode quebrar os requisitos auditados de tags, canonicals, sitemap ou robots.

---

## 9. Diretrizes de Engenharia de Interface: Embeds do Discord (Discord UI/UX SaaS)
Sempre que estruturar e implementar embeds do Discord no bot (utilizando `new EmbedBuilder()` do Discord.js v14):

1. **Título e Âncora Visual**:
   - O título deve ser curto, impactante e escaneável (**máximo 8 palavras**).
   - Deve iniciar com exatamente UM emoji funcional como âncora visual (ex: 📈, 🛑, 👤, 🔄, 🔮, 💎).
   - Os emojis devem ser resolvidos canonicamente via `src/utils/appEmojis.js` (`getEmoji('CHAVE')`), `themeEmojis.js` ou emojis nativos Unicode com fallbacks. Schemas dinâmicos customizáveis pelo Dashboard (/admin) são integrados via `src/utils/embedRegistry.js`.

2. **Espaçamento Obrigatório e Respiro Visual (Pulo de Linha Duplo `\n\n`)**:
   - **Regra de Ouro do Espaçamento**: É terminantemente PROIBIDO colar linhas de texto, tópicos ou diretrizes consecutivamente (usando apenas `\n` ou parágrafos compactos).
   - **Pulo de Linha entre Tópicos (`\n\n`)**: Toda frase informativa de destaque, regra de convivência, diretriz, bullet point (`•`) ou item de lista DEVE ser separado do próximo por quebra de linha dupla (`\n\n`). Isso cria o respiro visual essencial para legibilidade imediata em telas pequenas de smartphones.
   - Parágrafos de introdução ou contextualização devem ter no máximo 2 a 3 linhas antes de uma linha em branco.

3. **Tipografia Moderna & Markdown Nativo do Discord (Modern UI/UX)**:
   - **Cabeçalhos Nativos (`### Título da Seção`)**: Utilize subtítulos Markdown nativos do Discord (`### 📜 Diretrizes e Convivência`, `### ✍️ Como Utilizar`) para organizar grandes seções com tipografia destacada e elegante.
   - **Subtextos Muted (`-# Subtexto`)**: Utilize a sintaxe de texto pequeno do Discord (`-# 🌷 Lembrete ou dica secundária`) para avisos de rodapé inline, notas explicativas ou assinaturas sem poluir a leitura principal.
   - **Citações em Bloco (`>`)**: Para frases de efeito, perguntas de quiz, reflexões ou instruções de ação, utilize blockquotes com recuo visual (`> *Texto em destaque*`).
   - **Destaque Semântico Inicial**: Todo item de lista deve iniciar com seu identificador ou termo-chave em negrito (`• **Respeito Mútuo:** ...`), garantindo leitura em diagonal confortável.

4. **Erradicação Estrita de Design Legado e Antigo (Anti-Legacy & Anti-ASCII)**:
   - **Proibição de Divisores de Caracteres ASCII**: É expressamente PROIBIDO o uso de linhas pesadas ou divisores artificiais estilo bots de 2018 (ex: `━━━━━━━━━━━━━━━━━━━━`, `════════════════════`, `--------------------`, caixas ascii). A separação deve ser feita exclusivamente através de cabeçalhos (`###`) e espaçamento em branco (`\n\n`).
   - **Proibição de Listas Aglutinadas**: Nunca junte múltiplos bullet points (`•`) em uma massa única de texto sem quebras duplas. O design deve ser moderno, limpo, espaçado e minimalista.

5. **Campos (Fields) e Otimização Mobile**:
   - Utilize a propriedade `inline: true` para métricas e dados complementares que fiquem bem dispostos lado a lado.
   - Limite a no máximo 2 a 3 campos inline por linha para evitar que o cliente mobile do Discord force colunas caóticas.
   - Valores numéricos, saldos, valores monetários, IDs e códigos devem ser formatados em linha de código (Inline Code, entre crases `` `...` ``) para destaque visual limpo e neutro.
   - Nunca exiba URLs brutas no corpo ou campos: use sempre links mascarados na sintaxe `[Texto do Link](URL)`.

6. **Rodapé e Metadados (Footer & Timestamp)**:
   - O rodapé deve ser dinâmico e contextual: exibir o nome da aplicação (`Pyxie`) e o nome do servidor quando aplicável (`guild ? guild.name : 'Privado'`), com texto ou dicas rotativas de outros comandos e funções do bot.
   - Minigames rápidos, notificações efêmeras ou embeds compactos podem utilizar rodapés simplificados para priorizar a agilidade e evitar sobrecarga visual na tela.
   - Utilize `.setTimestamp()` nativo com a data/hora do evento em embeds que representem ações com temporalidade relevante (transações, logs, alertas).

---

## 10. Constituição de Governança Contínua (Princípio da Sincronização Tripla)

### 1. Princípio da Sincronização Tripla (VM <-> Painel /admin <-> Site Público)
Nenhuma funcionalidade, módulo, comando, profissão, moeda, rota web ou regra de segurança é considerada implementada na Pyxie se existir apenas no código do bot. Toda entrega no repositório kuromi exige homologação simultânea em 3 camadas:
1. **Código e Estado na VM** (`src/` e `data/`).
2. **Controle, Telemetria e Visualização no Painel Master** (`/admin`).
3. **Reflexo Automático nos Placeholders da API de Verdade Absoluta do Site** (`/api/public/system-truth` e `truthHydrator.js`).

### 2. Regra de Criação, Modificação e Exclusão no Painel (/admin)
Sempre que um Agente de IA criar, atualizar ou remover qualquer elemento do sistema, ele é OBRIGADO a executar o seguinte protocolo de homologação em todas as abas envolvidas do `/admin`:
1. **Se criar ou alterar um MÓDULO (`src/modules/<id>/`)**:
   - Registrar o módulo no ModuleManager com suporte a hot-reload e Zero Memory Leak (`ctx.registerListener`, `ctx.registerCron`, `ctx.registerInterval`).
   - Conectar o módulo ao Profiler Real da aba "Recursos VM" (medindo CPU em ms, RAM em MB e Rede em KB reais — proibido usar valores fixos/placeholders).
   - Expor o status do módulo na aba "Módulos" e na aba "Visual DB -> Estado Global", especificando claramente se ele está Ativo Globalmente, Ativo em Escopo Restrito (ex: Cringelândia) ou Pausado.
   - Se o sistema novo ainda não possuir controle visual no painel, o Agente DEVE criar a interface de controle correspondente no `/admin` (e registrá-la no monitor de Sub-Painéis se tiver rota própria).
   - Se um módulo ou sistema for removido ou desativado, o Agente deve limpar ou atualizar suas configurações em todas as abas afetadas do painel.
2. **Se criar, editar ou remover um COMANDO (Slash ou Prefixo `py!`)**:
   - Registrar o comando no introspector (`src/services/commandIntrospector.js`) para que apareça imediatamente na aba "Analytics & Ranking" (mesmo com 0 chamadas), extinguindo em definitivo o placeholder `/none`.
   - Configurar explicitamente seu escopo na aba "Escopo & Acesso": definir se é Global, Exclusivo da Cringelândia, Exclusivo do Estúdio da Mary (`mary-studio`) ou de outra guilda; definir se é Público, Staff, Whitelist de Usuários ou Exclusivo do Owner (`ownerOnly`).
   - Garantir que comandos marcados como `ownerOnly` ou restritos a servidores privados sejam automaticamente filtrados e ocultados do guia público de comandos do site e da Wiki.
   - Registrar os embeds utilizados pelo comando no `src/utils/embedRegistry.js` seguindo a paleta padrão da Pyxie e usando `resolveEmoji(client, slot, 'discord')`.
3. **Se criar ou alterar DADOS DE USUÁRIOS, ECONOMIA, CARREIRAS ou ACERVO**:
   - Atualizar o mapeamento na aba "Visual DB -> Usuários / Economia" e no "Dicionário de Metadados", garantindo que profissões, níveis de carreira (L1-L4 do `/py-work`), saldos e cooldowns exibam seus valores reais e nomes de usuário (`@username`) resolvidos.
   - Atualizar a aba "Controle & Acervo" (Inspetor Real de Acervo), garantindo que todos os contadores reflitam os arquivos reais em disco e que todas as tags de emojis do Discord (`<:nome:id>`) sejam convertidas em imagens (`<img>`) pela CDN do Discord via `src/utils/emojiResolver.js`.
   - Expor qualquer novo contador ou categoria no endpoint `/api/public/system-truth` para alimentar os placeholders automáticos do site.
4. **Se adicionar/alterar ROTAS WEB, SUBDOMÍNIOS ou REGRAS DE TRUST & SAFETY**:
   - Atualizar o "Mapa Web" interativo com o status real da rota/subdomínio (Ativo vs. Pausado) e seu toggle de manutenção.
   - Sincronizar novas regras de moderação, detecção de anomalias e blacklists de servidores/usuários com as abas "Trust & Safety" e "Servidores".

### 3. Protocolo Obrigatório de Homologação Antes do Commit (Quality Gate)
Antes de encerrar qualquer tarefa ou responder ao criador que o trabalho foi concluído, o Agente DEVE obrigatoriamente:
1. Disparar uma Onda de Verificação completa (`POST /api/admin/reconcile?force=true`) e verificar se todas as abas do `/admin` retornam dados reais da VM sem valores "undefined", "/none" ou placeholders estáticos.
2. Validar o retorno do endpoint `GET /api/public/system-truth` para confirmar que os placeholders do site público estão recebendo os números e catálogos atualizados.
3. Executar a suíte de testes automatizados (`npm test`) e garantir 100% de aprovação em todos os testes de sintaxe, paridade bilíngue (`i18nParity.test.js`) e integridade de módulos.

---

## 11. Protocolo Obrigatório de Preview Automático de Embeds e Mensagens (`1461937203214024891`)

### 1. Despacho Automático Sem Necessidade de Solicitação
- Toda vez que o Agente de IA criar um novo Embed, modificar um Embed existente ou alterar mensagens estruturadas do bot, ele é **OBRIGADO** a disparar automaticamente uma preview real do resultado final no canal de testes de ID **`1461937203214024891`** através do serviço `src/utils/homologationPreviewDispatcher.js`, mesmo que o criador não peça isso no prompt da tarefa.
- Isso garante que o proprietário visualize imediatamente no Discord como a formatação ficou sem precisar executar comandos manualmente para testar.

### 2. Blindagem Anti-Ping (Tags Sempre Entre Crases ```` ``` ````)
- No canal `1461937203214024891`, **NUNCA** mencione usuários, cargos ou `@everyone`/`@here` de forma ativa.
- Qualquer tag de usuário (`<@id>`), cargo (`<@&id>`) ou menção simulada na preview deve ser obrigatoriamente escapada entre crases triplas ```` ```<@id>``` ```` (ou inline `` `<@&id>` `` dentro de embeds) e enviada com `allowedMentions: { parse: [], users: [], roles: [], repliedUser: false }` no payload do Discord.js.


---

## 12. Missão, Persona e Stack Imutável (Governança de Agentes `.agents/`)

### 1. Missão e Persona
- A Pyxie constrói uma comunidade acolhedora e segura para pessoas neurodivergentes (TDAH, autismo) e para quem enfrenta depressão, ansiedade ou histórico de self-harm, unindo adolescentes e adultos sem julgamentos.
- A mascote tem estética fofa e personalidade **tsundere** em jogos, economia, perfil e utilitários.
- Em fluxos de **saúde mental, acolhimento, desabafo, check-in de novatos, crise ou segurança**, ironia e sarcasmo são proibidos: a comunicação é calorosa, previsível, protetora e segue UX informado por trauma (transparência, previsibilidade, clareza, feedback acolhedor, autonomia, ritmo calmo e pertencimento).

### 2. Stack Imutável (Proibição de Indecisão Tecnológica)
- **Bot**: Node.js 22 (CommonJS) + discord.js v14, processo único `server.js` no PM2 (`ecosystem.config.js`).
- **Web**: Express 5 servindo `public/` com SEO via `src/utils/seoRenderer.js`; frontend React + Vite + Tailwind + Three.js em `client/`.
- **Dados**: PostgreSQL 16 com Drizzle ORM (`src/database/`) + arquivos JSON atômicos em `data/`.
- **Imagem**: `sharp`, `@napi-rs/canvas`, `satori` e `@resvg/resvg-js`.
- **Infra**: VM Ubuntu ARM64 na Oracle Cloud (24 GB RAM), repositório em `~/kuromi`, deploy via `./deploy.sh`.
- É proibido introduzir Next.js, Prisma, TypeScript, PNPM/Turborepo, Redis ou outro framework sem decisão explícita do criador. Propostas de migração são registradas como plano, nunca aplicadas de forma parcial.

### 3. Política Zero-Mock
- Painéis (`/admin`, `/mary`), APIs e embeds leem dados reais (PostgreSQL, `data/`, telemetria). Proibido `mockData`, `placeholderData`, `TODO: implement` ou botões sem handler.

### 4. Arquivos de Governança do Agente
- `.agents/rules/*.md`: regras com frontmatter YAML (`trigger`: `always_on`, `model_decision`, `glob` ou `manual`), sem subpastas.
- `.agents/skills/<nome>/SKILL.md`: procedimentos sob demanda (`discord-v2-multi-tenant`, `sharp-image-and-seo-saas`).
- `.agents/hooks.json` + `.agents/hooks/pre-tool-validator.sh`: veto `PreToolUse` contra mocks, nomes de tenant em novos arquivos do núcleo e payloads Components V2 inválidos.
- `AGENTS.md` e `GEMINI.md` são mantidos idênticos.
