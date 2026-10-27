# Plano Cringelândia: foco, painel novo, estúdio de mensagens e comunidade

> **Status:** aprovado pelo dono em 27/10/2026. Nada deste plano foi implementado ainda.
> **Base do código conferida:** `main` no commit `f27affd` (merge do PR #2).
> **Origem:** conversa com o Gemini ("Plano Diretor de Reestruturação da Pyxie", 6 mensagens do dono),
> revisada contra o código real, mais as respostas do dono às perguntas da revisão.

---

## 0. Como usar este arquivo (para o agente que for executar)

1. Leia este arquivo inteiro antes de mexer em qualquer coisa. Ele substitui a conversa original:
   não peça para colar o chat do Gemini de novo.
2. Faça **uma etapa da seção 6 por sessão**. Cada etapa termina com testes passando, prévias
   enviadas, commit e push. Nunca deixe uma etapa pela metade sem commit.
3. Respeite o `AGENTS.md` (bilíngue PT/EN, embeds, anti-inflação, homologação, `npm test` 100%).
4. Quando uma decisão estiver marcada como **"proposta, confirmar"**, pergunte ao dono antes.
5. Ao terminar uma etapa, atualize a seção 6 marcando o que foi feito (`[x]`) e o commit.
6. O que o Gemini escreveu e **não existe no código** (não procure): `ndGateway`, `autoPartnerGuard`,
   `communityShield`, `ephemeralTranslator`, `publicCommandsCatalog`, `customEmbeds.json`, `/py-sue`,
   módulo `gloom` ativo, repositório `zululuga/kuromi`. O repositório é `cringinho/Pyxie`, clonado na
   VM em `~/kuromi`.

---

## 1. Visão em uma página

- A Pyxie passa a ter **foco total na Cringelândia** (servidor brasileiro, ~500 membros, a maioria
  neurodivergente). O objetivo é ser um ambiente amigável, divertido e seguro, respeitado por pais e
  profissionais de saúde, **sem perder o sarcasmo e as gracinhas da Pyxie**.
- O bot continua funcionando em outros servidores (global, PT/EN), mas sem a obrigação de atender a
  comunidade internacional. Estrangeiros ganham um cantinho dentro da própria Cringelândia (tags
  Poliglota e Mora no Exterior).
- **Pyxie's Realm** existe só na lore. Não vira servidor.
- O **módulo de RP** foi abandonado.
- Funções "muito específicas" (sazonal, Catacumbas, Casinha, mercado, Passe e afins) ficam **só na
  Cringelândia**.
- O painel administrativo é **refeito do zero**, com login pelo Discord e controle por servidor.
- O site vira **50% bot / 50% Cringelândia** e precisa funcionar bem no celular.
- Regra de tom (já no `AGENTS.md` §12): debochada nos jogos e no cotidiano, **calorosa e sem ironia**
  em acolhimento, desabafo, crise e segurança. Zoar situações (tirou A Torre, pegou o diário às 4h),
  nunca traços da pessoa (inteligência, lentidão, deficiência, identidade).

---

## 2. Decisões do dono

| # | Assunto | Decisão |
|---|---|---|
| D1 | Foco | 100% Cringelândia. Bot global continua, sem obrigação com estrangeiros. |
| D2 | Pyxie's Realm | Só lore. Remover do código o que não for lore (conferido: não há nada além de texto de lore). |
| D3 | Módulo de RP | Abandonado. Limpar sobras. |
| D4 | Museu | "Museu da Pyxie" é o museu da Cringelândia. Mantém o nome no site. |
| D5 | Escopo Cringelândia | Sazonal, Catacumbas (`/py-dungeon`), chefe semanal (`/py-boss`), Festival (`/py-festival`), **Casinha (`/py-home`)**, **mercado (`/py-market`)** e **Passe (`/py-pass`)** ficam só na Cringelândia. |
| D6 | Repositório da VM | `~/kuromi` aponta para `github.com/cringinho/Pyxie`. |
| D7 | Login no painel | Login com Discord (OAuth2) aprovado. O dono adiciona a URL de retorno no Developer Portal e o `DISCORD_CLIENT_SECRET` no `.env`. |
| D8 | Mary | O painel dela existe para ajudar a **lojinha de Robux**: "quanto mais opções, melhor". Ela tem no servidor dela o mesmo nível de controle que o dono tem na Cringelândia (não é "VIP global"). |
| D9 | Groq e privacidade | O Groq **não lê desabafos**. **Sem opção de desativar**: a leitura de conversas tensas é pela segurança do ambiente. |
| D10 | Música | O dono ainda não sabe. Decidir com a comunidade (ver 5.10). |
| D11 | Ordem | Começar pelo **mais demorado** (painel novo e estúdio), depois do conserto de segurança obrigatório (etapa 0). |
| D12 | Whitelist do painel | Desligada por padrão: qualquer administrador do servidor entra. O dono do servidor liga a whitelist se quiser. |
| D13 | Painel antigo | Sai a aba de terminal e tudo o que não é usado. Nada de métricas falsas. |

---

## 3. Fatos conferidos no código (27/10/2026)

**Escopo de comandos**
- `src/registerSlashCommands.js` registra **todos** os comandos com `guildScope` só no
  `TARGET_GUILD_ID` (Cringelândia), inclusive os que deveriam ser do servidor da Mary.
- `src/services/commandIntrospector.js` tem `MARY_DEFAULT_GUILD_ID = '1453890868980482090'` (é o ID da
  Cringelândia: está errado). O certo, em `src/modules/mary-studio/maryStudioManager.js`, é
  `1557399041443111025`.
- Só `seasonal` declara `guildScope` no módulo hoje. `giveaways` declara `guildScope: null`.
- `deploy.sh` só registra os comandos de novo quando muda algo em `src/commands` ou
  `src/registerSlashCommands.js`. Comandos dentro de `src/modules/*/commands` não disparam o registro.
- Os comandos `py-dungeon`, `py-home`, `py-craft`, `py-market`, `py-festival` e `py-pass` estão na lista
  de comandos instaláveis no perfil do usuário (`USER_INSTALLABLE_MODULE_COMMANDS`).
- `src/services/guildFeatures.js` tem o "modo Mundo Pyxie" (MMO) ligado por padrão em todos os
  servidores, com teste de 7 dias e propaganda no `/py-setup`. Com o D5 isso perde o sentido fora da
  Cringelândia.

**RP e Realm**
- O módulo de RP (`gloom`, "Bosque") **não existe mais** no repositório. Sobras: chaves de emoji e
  textos sobre o "Bosque da Penumbra" em `src/utils/appEmojis.js`, `src/data/emojis.json`,
  `src/utils/i18n.js`, `src/services/professions.js`, `src/data/generated_work_minigames.json`, a chave
  `grimorio` em `server.js` e a linha que apaga `data/gloom.json` em `deploy.sh` e
  `scripts/auto_deploy.sh`. O `AGENTS.md` §7 cita o Bosque da Penumbra.
- "Realm" só aparece em texto de lore (profissões e minigames). O botão de suporte do bot já leva à
  Cringelândia (`/discord`).

**Painel atual**
- `public/admin.html` tem 6.457 linhas e 13 abas: `bot`, `database`, `emojis`, `guilds`, `logs`,
  `modules`, `museum`, `routes`, `scopes`, `shopee`, `telemetry`, `trust`, `vm`.
- `server.js` tem 2.586 linhas e ~94 rotas próprias (fora `src/routes/adminMasterRoutes.js`).
- Existe `POST /api/admin/terminal/exec` (CLI com comandos prontos, inclusive `restart`) e um canal de
  logs em tempo real por SSE.
- **Autenticação frágil** (`src/services/adminAuth.js` e `requireAdminAuth` em `server.js`):
  - Se `PANEL_SECRET`/`API_SECRET_TOKEN` não estiverem no `.env`, vale um segredo reserva que está
    escrito no código (que é público). Esse segredo também assina os links mágicos do `/py-admin`.
  - Sem segredo configurado, a liberação por IP confia no cabeçalho `X-Forwarded-For` enviado pelo
    cliente.
  - O Estúdio da Mary (`src/modules/mary-studio/utils/securityGuard.js`) também tem segredo reserva no
    código.
  - A documentação (`docs/INFRAESTRUTURA-ORACLE.md`) lista a porta **3000** como liberada, além do
    Caddy na 443.
  - O comando `/py-admin` **não cria** o `PANEL_SECRET`: ele gera um link temporário assinado com o
    segredo. O segredo precisa estar no `.env`.

**Embeds e mensagens**
- `src/utils/embedRegistry.js` tem 50 embeds registrados. O painel só troca os **emojis** deles.
- Nenhum uso do formato novo de mensagens do Discord (Components V2).
- O **Estúdio da Mary** (`src/modules/mary-studio/`, ~4.900 linhas) já tem editor de embeds com prévia,
  botões com ações, uploads, histórico de versões, mensagem fixa (sticky) e FAQ
  (`handlers/stickyAndFaqHandler.js`), tickets, avaliações e sorteio. **É a base natural do estúdio
  novo.**
- `src/services/ventService.js` já mantém uma mensagem fixa no fim do canal de desabafos
  (reposicionamento com espera).

**Outros**
- Parcerias: a DM de aprovação usa texto fixo (`partnerships.dm_approved` no `i18n.js`), em
  `src/modules/partnerships/partnershipManager.js` (~linha 474).
- Evento sazonal: os premiados por presença no chat recebem **ping normal**
  (`src/modules/seasonal/activityHandler.js`, ~linhas 181 a 312).
- Groq: hoje só em `quizSeederService.js`, `workSeederService.js` e `arcaneMathService.js`.
- Tickets: o botão de **remoção de arte** já existe (`src/modules/tickets/ticketManager.js`, canal
  `1557534749310976141`).
- Acolhimento: `welcomeCheckinService.js` (check-in de novatos) e `ventService.js` já existem.
- Nenhuma integração com o AutoMod nativo do Discord.
- `npm audit --omit=dev`: 5 alertas (1 crítico `proxy-addr`, 2 altos `body-parser` e `undici`,
  2 moderados `fflate`/`satori`). Os três primeiros se resolvem com atualização simples.
- discord.js instalado: 14.27.0 (suporta Components V2).
- Site: `public/cringelandia.html` tem 2.819 linhas; já existe `client/` (React + Vite + Tailwind +
  Framer Motion + Lenis + Three.js).

**IDs úteis**

| O quê | ID |
|---|---|
| Dono (OWNER_SNOWFLAKE) | `214153735281180673` |
| Cringelândia | `1453890868980482090` |
| Servidor da Mary | `1557399041443111025` |
| Usuária Mary | `1463644930080637140` |
| Canal de homologação (prévias) | `1461937203214024891` |
| Canal da staff para remoção de arte | `1557534749310976141` |

---

## 4. Ação imediata do dono (antes de qualquer sessão)

Isso fecha o buraco de segurança do painel atual enquanto o painel novo não fica pronto. Leva poucos
minutos, na VM:

1. Gerar dois segredos longos: `openssl rand -hex 32` (rode duas vezes).
2. Colocar no `~/kuromi/.env`:
   - `PANEL_SECRET=<primeiro valor>`
   - `MARY_STUDIO_SECRET=<segundo valor>`
3. Reiniciar: `pm2 reload ecosystem.config.js --update-env`.
4. No console da Oracle (Security List / Ingress Rules), **remover a regra que libera a porta 3000**
   para a internet. O site continua funcionando pela 443 (Caddy).
5. Conferir só os nomes das variáveis (sem mostrar valores): `cut -d= -f1 ~/kuromi/.env`.

Os links mágicos antigos do `/py-admin` e da Mary deixam de valer depois disso. Basta gerar de novo.

---

## 5. Arquitetura alvo

### 5.1 Zonas e escopo

Uma única fonte de configuração: `src/config/scopes.js`, com os IDs vindos do `.env` e os valores da
tabela da seção 3 como padrão.

| Zona | Onde | Módulos e comandos |
|---|---|---|
| **Global** | Todos os servidores | Economia (`/py-daily`, `/py-wallet`, `/py-rank`), trabalho e profissões, quiz e minigames de recreação, tarot e álbum, perfil, casamento (com a Força do Laço), utilitários, convite, idioma, `/py-setup`, tickets e sorteios |
| **Cringelândia** | Só `1453890868980482090` | Sazonal, Catacumbas, chefe semanal, Festival, Casinha, mercado, Passe, oficina (proposta, confirmar), museu e Arte da Semana, parcerias, acolhimento, desabafos, fórum de hiperfocos, radar, controle de brigas e tudo o que for de comunidade |
| **Mary** | Só `1557399041443111025` | Estúdio da Mary (lojinha de Robux, tickets, avaliações, gamepass, estúdio de mensagens) |

Mudanças necessárias:

- `registerSlashCommands.js` **agrupa por servidor**: um `PUT applicationGuildCommands` por guild que
  aparece em algum `guildScope`, e um `PUT applicationCommands` para o resto.
- Declarar `guildScope` nos módulos `dungeon`, `guildBoss`, `festival`, `home`, `market`,
  `battlePass` (e `pyCraft`, que mora em `home`).
- Tirar esses comandos de `USER_INSTALLABLE_MODULE_COMMANDS` (comando de servidor não funciona instalado
  no perfil).
- **Ganchos em comandos globais** (proposta, confirmar):
  - Materiais do `/py-work` e Fagulhas do Festival só caem quando o turno acontece **na
    Cringelândia**. Fora dela, a linha de material não aparece (ela cita `/py-craft`).
  - XP do Passe só conta para atividades feitas **na Cringelândia** (o Passe é "da Cringelândia").
  - O daily e o trabalho continuam globais.
- `/py-setup`: o modo "Mundo Pyxie" sai dos outros servidores (sem teste de 7 dias, sem propaganda). Na
  Cringelândia ele fica sempre ligado.
- Dados existentes ficam como estão (`data/dungeon.json`, `data/homes.json` etc.). Quem jogava em outro
  servidor continua com tudo e pode jogar entrando na Cringelândia: isso vira chamada no site e na ajuda.
- `deploy.sh` e `scripts/auto_deploy.sh`: registrar os comandos também quando mudar algo em
  `src/modules/**/commands/` ou em qualquer `src/modules/*/index.js`.
- Ajuda (`commandHelpers.js`), `/api/commands` e catálogo do site: comandos da Cringelândia aparecem
  marcados como "exclusivo da Cringelândia" (é propaganda do servidor, não segredo). Os da Mary nunca
  aparecem.

### 5.2 Painel novo (login com Discord)

**Objetivo:** cada pessoa vê só os servidores que administra e só o que é útil. O dono edita a
Cringelândia isoladamente. A Mary edita o servidor dela com todas as opções.

**Login**
- Rotas: `GET /auth/discord` (redireciona com `state` aleatório guardado em cookie), `GET
  /auth/discord/callback` (troca o `code`, busca `/users/@me` e `/users/@me/guilds`), `POST
  /auth/logout`.
- Escopos: `identify guilds`. Não pedir `email`.
- Sessão: cookie `HttpOnly`, `Secure`, `SameSite=Lax`, assinado com `PANEL_SECRET`, validade de 7 dias.
  Guardar sessões em `data/panelSessions.json` (escrita atômica) para sobreviver a reinícios.
- Não guardar o access token do Discord depois do login. A lista de servidores é lida no login e
  atualizada sob demanda ("Atualizar servidores").
- Variáveis novas: `DISCORD_CLIENT_SECRET`, `PANEL_PUBLIC_URL` (padrão `https://pyxie.com.br`). A URL
  de retorno a cadastrar no Developer Portal: `https://pyxie.com.br/auth/discord/callback`.
- Remover do código todos os segredos reserva (painel e Mary). Sem `PANEL_SECRET`, o painel não sobe e
  o log diz por quê.
- Não confiar em `X-Forwarded-For` do cliente. Se precisar do IP real, usar `app.set('trust proxy',
  'loopback')` (o Caddy está na mesma máquina).

**Quem acessa o quê**

| Papel | Como é detectado | Vê |
|---|---|---|
| Dono | `userId === OWNER_SNOWFLAKE` | Todos os servidores da Pyxie, mais a área "Pyxie (global)": módulos globais, emojis do app, saúde da VM, monitor de links, erros dos comandos |
| Mary no servidor dela | Administradora/dona do `1557399041443111025` | Tudo do servidor dela, inclusive lojinha, tickets, avaliações, gamepass e perfil local da Pyxie |
| Administrador de servidor | Dono da guild ou permissão `Administrator` (bit `0x8`) | Só os servidores onde é admin **e** a Pyxie está. Só funções úteis: módulos públicos, canais e cargos, estúdio de mensagens, tickets, sorteios, idioma, whitelist |

- A permissão é **conferida pelo bot a cada ação** (o membro e os cargos atuais na guild), não só no
  login. Quem perde o cargo perde o acesso na hora.
- Whitelist por servidor (`data/guilds/<guildId>/panelAccess.json`): desligada por padrão (D12). Só o
  dono da guild liga ou desliga, e escolhe usuários ou cargos.
- Funções da Cringelândia e da Mary **nunca** aparecem para outros servidores, nem pela API (o backend
  recusa, não é só esconder na tela).

**Ponte entre o site e o bot**
- O `server.js` é o processo do site e cria o processo do bot (`sendIpcToBot`). Hoje a comunicação é
  só de ida.
- Criar um canal de pedido e resposta pelo IPC (`{ id, type, payload }` → `{ id, ok, data }`, com
  timeout de 5s) para: listar canais e cargos, conferir permissão de membro, enviar ou editar mensagem,
  ler mensagem de fórum. O bot já tem esses dados em cache.
- Leituras que podem esperar (estatísticas, configuração) continuam pelos arquivos em `data/`.

**Telas (React em `client/`, mobile primeiro)**
- Seletor de servidor.
- Por servidor: Visão geral, Módulos (liga e desliga, com os do escopo certo), Canais e Cargos,
  Estúdio de mensagens, Tickets, Sorteios, Acesso e whitelist.
- Cringelândia (só o dono): Sazonal, Museu e Arte da Semana, Parcerias, Acolhimento, Moderação, Radar.
- Mary (só no servidor dela): Lojinha, Gamepass, Avaliações, Perfil da Pyxie no servidor.
- Dono (global): Saúde da VM (memória do processo, tempo ligado, conexão com o Discord, uso de disco
  da pasta `data/`), Erros recentes dos comandos (de `commandTelemetry`), Emojis do app, Monitor de
  links, Módulos globais.

**O que sai**
- Aba de terminal, SSE de logs, métricas falsas, abas não usadas.
- `public/admin.html` vira só leitura durante a transição e é apagado quando o painel novo cobrir o que
  o dono usa (confirmar a lista com ele antes de apagar).
- Atualizar `robots.txt` (`/dashboard`, `/auth/` com `Disallow`) e o `AGENTS.md` §10, que hoje descreve
  as abas antigas.

### 5.3 Estúdio de mensagens

**Base:** generalizar o estúdio que já existe no módulo da Mary (prévia, botões, uploads, histórico,
sticky) para servir a qualquer servidor. O estúdio da Mary vira só uma configuração com mais opções.

**Modelo de dados** (`data/guilds/<guildId>/messages.json`, escrita atômica):

```json
{
  "id": "boas-vindas-hiperfoco",
  "name": "Boas-vindas do fórum de hiperfocos",
  "mode": "classic",
  "envelope": {
    "content": "",
    "silent": true,
    "identity": { "useWebhook": false, "username": "", "avatarUrl": "" }
  },
  "embeds": [
    {
      "color": "#8b5cf6",
      "author": { "name": "", "iconUrl": "", "url": "" },
      "title": "", "url": "", "description": "",
      "fields": [{ "name": "", "value": "", "inline": true }],
      "thumbnailUrl": "", "imageUrl": "", "footer": { "text": "", "iconUrl": "" },
      "timestamp": false
    }
  ],
  "v2": null,
  "tabs": [],
  "buttons": [],
  "delivery": {
    "channelId": "",
    "schedule": null,
    "repeat": null,
    "sticky": null,
    "source": null
  },
  "history": []
}
```

**Funções**
- **Dois formatos:**
  - Clássico: texto + até 10 embeds com autor, título com link, descrição, até 25 campos, miniatura,
    imagem, rodapé e data.
  - Formato novo do Discord (Components V2, flag `IsComponentsV2`): blocos com cor lateral, seções com
    botão ou miniatura ao lado, galeria de até 10 imagens, divisórias e texto. **Nesse formato a
    mensagem não pode ter texto avulso nem embeds clássicos**, por isso são modos separados no editor.
- **Botões:** link (inclusive atalhos do Discord para "Canais e Cargos"), dar ou tirar cargo, modo
  silencioso (5.5), abrir formulário (modal), trocar de aba.
- **Abas:** cada aba tem o próprio conteúdo. O criador escolhe se o clique troca a mensagem para todos
  ou abre a aba só para quem clicou (resposta privada).
- **Envio:**
  - agendado (data e hora, fuso `America/Sao_Paulo`);
  - repetição a cada X horas, **só se o canal tiver tido N mensagens novas** desde o último envio;
  - mensagem fixa no fim do canal (sticky) com espera de alguns segundos para não virar flood e envio
    silencioso;
  - nome e foto próprios via webhook **criado pela própria Pyxie** (precisa de `ManageWebhooks`; só
    webhook da aplicação aceita botões interativos);
  - texto puxado de um tópico de fórum (5.4).
- **Emojis:** seletor com os emojis do app (`src/data/discordAppEmojis.json`) e marcação `{emoji:chave}`
  resolvida no envio.
- **Variáveis:** `{user}`, `{user.avatar}`, `{server}`, `{server.icon}`, `{bot.avatar}`, `{date}`.
- **Validação antes de salvar** (limites do Discord): 6.000 caracteres somando os embeds, título 256,
  descrição 4.096, campo 256/1.024, rodapé 2.048, 25 campos, 10 embeds, 5 fileiras de 5 botões, rótulo
  de botão 80, 40 componentes no formato novo.
- **Prévia** igual ao Discord no painel, e **prévia real** no canal de homologação
  `1461937203214024891` ao salvar (menções escapadas, `allowedMentions` vazio).
- **Histórico:** últimas 10 versões, com restaurar.
- **Agendador:** um único agendador por processo (via `ctx.registerCron`/`registerInterval`), que lê os
  envios pendentes de todos os servidores.
- **Documentação:** guia passo a passo em `docs/GUIA-ESTUDIO-MENSAGENS.md` e uma regra curta no
  `AGENTS.md` ("mensagens customizadas de servidor nascem no estúdio").
- **Fora do escopo:** migrar os 50 embeds de sistema do bot para o estúdio. Eles continuam no
  `embedRegistry`.

### 5.4 Parcerias pelo fórum

- Configuração da Cringelândia: canal ou tópico de fórum fonte + ID do autor (o dono).
- Ao aprovar uma parceria: a Pyxie lê a **última mensagem do dono** nesse tópico (texto, embeds e
  anexos), monta a mensagem e manda por DM ao parceiro.
- **Retorno para o dono** (DM, ou canal da staff configurado):
  - deu certo: "já mandei para @Fulano" + cópia exata do que foi enviado;
  - não achou a mensagem: "não achei o texto no fórum, mande você para @Fulano (ID ...)";
  - DM fechada (erro 50007): "a DM de @Fulano está fechada, mande por outro caminho".
- Mensagem com mais de 2.000 caracteres vira embed. Anexos são reenviados como link.
- Se a fonte não estiver configurada, usa o texto fixo atual (`partnerships.dm_approved`).

### 5.5 Modo silencioso nas marcações

- Preferência por pessoa: `data/guilds/<guildId>/mentionPrefs.json`.
- No anúncio dos premiados do sazonal: quem está no modo silencioso aparece em negrito, sem ping
  (`allowedMentions.users` só com quem aceita ping). Opção de mandar a mensagem inteira com a flag de
  notificação silenciosa.
- Botão "🔕 Alternar marcação silenciosa" no próprio anúncio, com resposta privada confirmando.
- Depois, usar a mesma preferência em sorteios e outros anúncios.

### 5.6 Monitor de links

- Registro de links: `data/linkSentinel.json` (links das mensagens do estúdio, dos guias da página
  `/cringelandia`, do radar e cadastrados no painel), cada um com um link reserva opcional.
- Verificação diária às 4h (BRT): `HEAD`, e se recusado `GET`, timeout de 8s, cabeçalho de navegador.
- Alerta só depois de **2 falhas seguidas**.
- **Redirecionamento: não trocar sozinho.** Propor a troca ao dono (domínio expirado pode virar golpe).
  Trocar sozinho só se o destino for o mesmo domínio.
- Enquanto o link estiver fora: mostrar o reserva cadastrado ou a cópia mais recente no Web Archive
  (API de disponibilidade do Wayback).
- DM para o dono com: onde quebrou, diagnóstico (`HTTP 404`, `timeout`), ação tomada e botões
  **Trocar link** (abre formulário), **Testar de novo**, **Silenciar 7 dias**.

### 5.7 Controle de brigas e "modo blindagem"

- **Segurar a mensagem antes de aparecer só é possível com o AutoMod nativo do Discord.** A Pyxie
  cria, liga e desliga regras de palavras-chave com mensagem personalizada (precisa de `ManageGuild`).
  Interruptor "🛡️ Modo blindagem" no painel (eleições, tragédias): lista de termos editável, canais
  isentos (ex.: um canal de debate com regras próprias).
- **Detector de troca rápida:** em memória, conta respostas diretas entre duas pessoas (ex.: mais de 4
  em 2 minutos no mesmo canal) ou aumento brusco de mensagens longas.
- **Groq só entra quando o detector dispara:** recebe as últimas 6 mensagens das duas pessoas e
  classifica "conversa animada" ou "discussão hostil". **Nunca em canais de desabafo ou acolhimento**
  (D9).
- **Ações, em ordem:**
  1. Aviso leve da Pyxie no canal (bem-humorado, sem humilhar ninguém).
  2. Modo lento temporário (ex.: 30s por 10 min), voltando ao valor anterior (guardar em arquivo para
     sobreviver a reinício).
  3. Se continuar: castigo nativo do Discord (timeout de 15 min) nas duas pessoas, sem anúncio público,
     com mensagem privada acolhedora para cada uma.
  4. Registro no canal da staff com o trecho da conversa.
- **Nunca banir automaticamente.** Decisões mais graves ficam com a staff.
- Botão opcional no aviso: "resolver num duelo de quiz" (o duelo já existe).
- Transparência: a política de privacidade passa a dizer que mensagens de conversas tensas podem ser
  analisadas por IA para segurança (D9 manteve sem opção de desativar; a transparência continua sendo
  recomendada pela LGPD).

### 5.8 Voz da Pyxie com o Groq

- Serviço único `src/services/pyxieVoice.js`: persona, regras, contexto, limite de tamanho,
  temperatura, cache curto e **falas prontas como reserva** se o Groq falhar ou demorar mais de 3s.
- Usar primeiro em: `/py-daily` (o diário é o maior sucesso), `/py-work`, reações do tarot, ship,
  drops e prêmios.
- Contexto enviado: apelido, horário, profissão, se é casada no bot, última carta. **Nunca o texto
  das mensagens da pessoa.**
- Só na Cringelândia. Fora dela, falas prontas (ampliar o banco de falas prontas também).
- **Regras da persona:** presunçosa, dramática, "desaforada"; zoa situações e escolhas, nunca traços da
  pessoa; nada de política, religião, sexualidade ou saúde; nunca em fluxos de acolhimento.
- Filtro da resposta antes de enviar (tamanho, menções, links, palavras proibidas).

### 5.9 Comunidade

**Estrutura do servidor (feita pelo dono no Discord, com apoio do bot)**
- Onboarding nativo do Discord só com o básico (idioma, idade +18/-18, pronomes). Conferir os limites
  atuais do Onboarding antes de planejar as perguntas.
- Lá dentro, um painel da Pyxie com botões que liberam setores aos poucos: Arte e Escrita, RPG e Jogos,
  Estudos e Superação, Poliglota / Mora no Exterior, Acolhimento e Saúde Mental. Feito com o estúdio
  (botões de cargo).
- Guia "Meu primeiro dia no Discord" (canais, Canais e Cargos, silenciar notificações), também pelo
  estúdio, com imagens feitas por artistas da comunidade.
- Não abrir muitos canais de uma vez (público com TDAH): liberação por cargos, como já é hoje.

**Funções do bot**
- **Fórum de hiperfocos:** se um tópico novo ficar 15 min sem resposta, a Pyxie faz o primeiro
  comentário (via 5.8) e dá moedinhas com teto diário, tamanho mínimo de texto e sem recompensa por
  edição (AGENTS.md §5). Nunca em fóruns de desabafo.
- **Radar de notícias e direitos:** coletor de fontes (RSS do r/teabrasil, sites de notícia e de leis).
  O Groq resume, mas **o resumo vai primeiro para a staff aprovar**. Publicação sempre com o link da
  fonte e o aviso "não é orientação jurídica nem médica". Do Reddit, só título e link (não copiar o
  texto das pessoas). Falar com a moderação do r/teabrasil antes de divulgar lá.
- **`[Título] Nick`:** a pessoa escolhe um dos títulos que já tem no bot para aparecer antes do apelido
  (precisa de `ManageNicknames`; não funciona no dono do servidor; limite de 32 caracteres).
- **RPG com mestres humanos:** canais liberados por tag, fichas em tópicos de fórum, `/py-dice` já
  existe. Nada de IA mestrando (fácil de burlar).
- **Profissionais verificados** (saúde, direito, proteção e educação): cargo só depois de verificação
  manual pelo dono (CRM, CRP, OAB ou equivalente), regra de não conversar em privado com menores e aviso
  de que aquilo não é atendimento.
- **Tags sensíveis** (neurodivergência, pronomes, saúde): sempre escolha da pessoa, nunca atribuídas
  pelo bot, e explicadas na política de privacidade.
- **Arte humana no lugar da IA:**
  - Registro dos assets da Pyxie (`src/data/pyxieAssets.json`) dizendo quais são de IA, para
    acompanhar a substituição.
  - Campo de crédito do artista exibido no rodapé dos embeds e no site.
  - Missões de arte (temas mensais) anunciadas pelo estúdio e integradas ao Museu.
  - Regra "100% arte humana" em concursos, histórias e Museu.
  - O grupo do Roblox entra nas votações e nas missões; integração técnica fica para depois.

**O que não fazer**
- **Não criar "modo discreto" para esconder atividade de adolescentes dos pais.** Isso é exatamente o
  que pais e a Vara da Infância veem como sinal de perigo, e contradiz o objetivo de conquistar a
  confiança deles. No lugar: cara pública neutra (estudos, arte, leitura), página clara para pais e
  profissionais, e indicação de serviços reais (CVV 188, Disque 100, Conselho Tutelar, Casa 1).
- **Não monitorar escondido** quem "visita" canais sensíveis: o bot nem consegue saber quem lê um
  canal, e traçar perfil de pessoas vulneráveis sem elas saberem quebra a confiança.

### 5.10 Música (decidir com a comunidade)

O dono não sabe ainda (D10). Passo 1: uma **enquete nativa do Discord** na Cringelândia com as opções
abaixo. Construir só o que ganhar.

- **Clube do Álbum semanal** (não precisa do Last.fm): votação do álbum da semana, tópico no fórum para
  ouvir junto, notas de 1 a 10 por botão, resultado na semana seguinte.
- **Vínculo com o Last.fm** (chave grátis da API; dados públicos, sem login): "o que a comunidade está
  ouvindo", retrospectiva mensal só com quem aceitou participar.
- **Compatibilidade musical** entre duas pessoas (artistas em comum), no estilo do `/py-ship`.
- **Quiz com dicas em emoji** (sem trechos de letra, por direitos autorais).
- **Cargos por gênero musical** e tag de música no fórum de hiperfocos, para achar quem gosta do mesmo.
- O bot do Last.fm continua. A Pyxie não duplica os comandos dele.

### 5.11 Site

- **50% bot / 50% Cringelândia.** O topo apresenta as duas coisas. A Cringelândia ganha seção própria
  no `index.html` e a página `/cringelandia`.
- **Mobile primeiro.** Na `/cringelandia`:
  - artes flutuantes só no fundo no celular (`opacity` baixa, `pointer-events: none`, sem rolagem
    lateral);
  - seletor nativo para os 27 estados (CIPTEA) no lugar de grades largas;
  - acordeões para o conteúdo longo.
- Conferir com capturas do Playwright em 390px de largura, sem rolagem horizontal.
- **Páginas novas:**
  - "Para pais e profissionais": regras, separação +18/-18, moderação, ECA, Estatuto da Pessoa com
    Deficiência, LGPD, contato.
  - "Transparência e impacto": doações a ONGs com comprovantes, dados bancários tarjados, recibos da
    própria ONG quando houver.
- Cada página nova segue o `AGENTS.md` §8 (SEO bilíngue, um `<h1>`, JSON-LD, sitemap, IndexNow).
- **Não migrar o site inteiro para React de uma vez.** Three.js pesa no celular. O React do `client/`
  fica para o painel e, se fizer sentido, para páginas novas.
- Atualizar a política de privacidade: Groq em conversas tensas e no fórum de hiperfocos, tags
  sensíveis, login do painel.

### 5.12 Wick

1. Agora: o Wick fica mudo nos canais, só com a proteção contra destruição do servidor (anti-nuke) e
   anti-raid.
2. A Pyxie assume toda a moderação visível (5.7, tickets, acolhimento, logs para a staff).
3. Futuro: anti-nuke próprio (monitorar o registro de auditoria para exclusão em massa de canais e
   cargos e tirar os cargos de quem fez; precisa do cargo da Pyxie no topo). Só então aposentar o Wick.

---

## 6. Ordem de execução

Cada etapa = uma sessão = um PR. A ordem segue o D11: depois da etapa 0 (curta e obrigatória), as mais
demoradas primeiro.

### Etapa 0 — Segurança e base (curta, obrigatória antes de tudo)
- [ ] Remover os segredos reserva do código (`adminAuth.js` e `securityGuard.js` da Mary; o
      `museumManager.js` já recusa quando falta segredo e serve de modelo). Sem segredo no `.env`, a
      rota recusa e o log explica.
- [ ] Não confiar em `X-Forwarded-For` vindo do cliente (`trust proxy` só para o loopback).
- [ ] `npm audit fix` (sem atualizações que quebrem compatibilidade) e rodar a suíte.
- [ ] `src/config/scopes.js` com os IDs, corrigir o ID da Mary em `commandIntrospector.js`.
- [ ] `registerSlashCommands.js` agrupando por servidor.
- [ ] `deploy.sh` e `scripts/auto_deploy.sh` registrando comandos quando mudar `src/modules/**`.
- [ ] `scripts/test-safe.sh`: faz backup de `data/`, roda a suíte com segredos em branco e restaura
      (hoje isso é feito à mão em toda sessão).
- **Pronto quando:** `npm test` 100% e o painel antigo recusa acesso sem segredo configurado.

### Etapa 1 — Painel novo, parte A: login, permissões e ponte com o bot
- [ ] Rotas `/auth/discord`, `/auth/discord/callback`, `/auth/logout`, sessões em arquivo.
- [ ] Papéis (dono, admin de servidor, Mary no servidor dela) e conferência ao vivo pelo bot.
- [ ] Whitelist por servidor (desligada por padrão).
- [ ] IPC de pedido e resposta site ↔ bot.
- [ ] API `/api/dashboard/*` com testes de permissão (admin de um servidor não lê outro; não-dono não
      vê Cringelândia; só a Mary e o dono veem o servidor da Mary).

### Etapa 2 — Painel novo, parte B: telas e limpeza
- [ ] Telas React em `client/` (seletor de servidor, módulos, canais e cargos, acesso, saúde da VM,
      erros dos comandos), mobile primeiro.
- [ ] Telas da Cringelândia e da Mary (lojinha, gamepass, avaliações, perfil local).
- [ ] Remover terminal e SSE de logs. Painel antigo só leitura, e apagar depois de o dono confirmar.
- [ ] Atualizar `AGENTS.md` §10, `robots.txt` e a política de privacidade.

### Etapa 3 — Estúdio de mensagens, parte A
- [ ] Extrair o estúdio da Mary para um serviço comum por servidor (a Mary continua funcionando igual).
- [ ] Modelo de dados, validação de limites, envio clássico e formato novo, botões, emojis e variáveis.
- [ ] Prévia no painel e prévia real no canal de homologação.

### Etapa 4 — Estúdio de mensagens, parte B + ganhos rápidos
- [ ] Abas, agendamento, repetição com atividade mínima, sticky, identidade por webhook.
- [ ] Fonte de fórum + **DM de parceria pelo fórum** (5.4).
- [ ] **Modo silencioso** no sazonal (5.5).
- [ ] Guia `docs/GUIA-ESTUDIO-MENSAGENS.md` e regra curta no `AGENTS.md`.

### Etapa 5 — Escopo Cringelândia
- [ ] `guildScope` nos módulos do D5, fora da instalação no perfil, ganchos do `/py-work` e do Passe só
      na Cringelândia (confirmar), `/py-setup` sem o pitch do Mundo Pyxie fora dela.
- [ ] Limpar as sobras do RP (seção 3) e o §7 do `AGENTS.md`.
- [ ] Ajuda, `/api/commands`, site e `README` com "exclusivo da Cringelândia".
- [ ] Teste automático que roda o handler de **todos** os comandos com interação simulada em PT e EN e
      lista os que quebram.
- [ ] Lista de testes manuais no Discord para o dono (por bloco: utilitários, economia, místico e
      social, comunidade e escopos).

### Etapa 6 — Moderação e monitor de links
- [ ] Modo blindagem com AutoMod nativo, detector de troca rápida + Groq, ações graduais, registro.
- [ ] Monitor de links com reserva, Web Archive e DM com botões.

### Etapa 7 — Voz da Pyxie e comunidade
- [ ] `pyxieVoice` com Groq e reservas, aplicado no daily, trabalho, tarot, ship e drops.
- [ ] Fórum de hiperfocos, radar de notícias com aprovação da staff, `[Título] Nick`.
- [ ] Registro de assets da Pyxie e créditos de artistas.

### Etapa 8 — Site
- [ ] 50/50, mobile da `/cringelandia`, páginas para pais e profissionais e de transparência.

### Depois
- [ ] Música (depois da enquete, 5.10).
- [ ] Anti-nuke próprio e saída do Wick (5.12).
- [ ] Integração com o grupo do Roblox.

---

## 7. Cuidados que valem para todas as etapas

- **Dados de produção:** nunca rodar teste ou prévia contra `data/` sem backup. Usar
  `PYXIE_DATA_DIR` e `MARRIAGE_DATA_PATH`/`DUNGEON_DATA_PATH` temporários. `economy.json` não respeita
  `PYXIE_DATA_DIR`: fazer backup e restaurar.
- **Segredos:** o `.env` nunca vai para o git nem aparece em log. Testes rodam com `DISCORD_TOKEN=`,
  `GROQ_API_KEY=` e `DATABASE_URL=` em branco. Prévias usam só a REST do Discord.
- **Anti-inflação (§5):** toda moedinha nova tem teto e trava. Recompensas de comunidade preferem itens,
  títulos e cargos a moedinhas.
- **Menores de idade:** separação +18/-18, nenhuma função que esconda atividade dos responsáveis,
  profissionais verificados sem contato privado com menores.
- **IA:** o Groq nunca lê desabafos (D9). Resumos de notícias e leis passam por aprovação humana.
- **Permissões do Discord que as etapas vão pedir:** `ManageWebhooks` (estúdio), `ManageGuild`
  (AutoMod), `ModerateMembers` (timeout), `ManageChannels` (modo lento), `ManageNicknames`
  (`[Título] Nick`), `ManageRoles` (botões de cargo). Conferir a hierarquia do cargo da Pyxie.

---

## 8. Guia operacional para o agente

**Rodar a suíte sem tocar nos dados locais** (até existir `scripts/test-safe.sh`):

```bash
cp data/economy.json /tmp/economy.bak.json
mv data /tmp/data-local-bak
node scripts/seed_ci_fixtures.js >/dev/null
DISCORD_TOKEN= GROQ_API_KEY= DATABASE_URL= PYXIE_CI_FIXTURES=1 npm test > test.log 2>&1; echo EXIT $?
rm -rf data && mv /tmp/data-local-bak data
cp /tmp/economy.bak.json data/economy.json
```

**Prévias de homologação:** seguir o padrão de `scripts/dispatch_*_previews.js` (dados temporários,
contas `user_test_*`, `economy.purgeTestAccounts()` no fim), em PT e EN.

**Deploy:** é feito pelo dono na VM com `./deploy.sh` (exige estar na `main`). Quando uma etapa mudar
comandos de módulo, avisar o dono para rodar `./deploy.sh --force` até a etapa 0 corrigir o registro
automático.

**Acesso à VM:** uma sessão na nuvem não alcança a VM. Para trabalhar direto nela, o dono roda
`claude remote-control` dentro de `~/kuromi` na VM (ou usa o app Desktop). Sem isso, pedir ao dono a
saída de um diagnóstico só de leitura, por exemplo:

```bash
cd ~/kuromi && git remote -v && git log --oneline -1 && pm2 status && node -v \
  && df -h . && du -sh data && cut -d= -f1 .env && sudo ss -ltnp | grep -E ':(3000|443)\b'
```

**Git:** trabalhar no branch indicado pela sessão, commits pequenos por item da etapa, PR para a
`main` só quando o dono pedir.

---

## 9. Economia de tokens e nível de esforço

- **O que mais pesa hoje:** o `AGENTS.md` tem 27 KB e é carregado em toda sessão; o `GEMINI.md` é uma
  cópia idêntica. Proposta (confirmar com o dono): um núcleo de 3 a 4 KB com as regras inegociáveis e
  um índice, e o detalhe em `docs/` (SEO, embeds, painel, módulos), lido só quando o assunto aparecer.
- **Este arquivo substitui conversas longas.** Novas decisões entram aqui, não em chats colados.
- **Uma etapa por sessão**, com commit no fim. Sessão nova começa lendo só este arquivo e os arquivos
  da etapa.
- **Testes:** durante o trabalho, rodar só os testes da área; a suíte inteira só antes do commit.
- **Erros e logs:** mandar como texto, com as linhas relevantes, não como print.
- **Outras IAs:** links compartilhados (como o do Gemini) funcionam. Não é preciso deixar abas abertas.
- **Esforço:** o mais alto disponível nas etapas 0, 1, 2 e 6 (segurança, login, permissões e
  moderação). Médio basta para texto, conteúdo e telas simples.
- **"Tudo numa sessão" não cabe nem é seguro:** são cerca de 8 etapas, cada uma publicável sozinha.

---

## 10. Referências técnicas

- Discord, OAuth2: https://discord.com/developers/docs/topics/oauth2
- Discord, permissões (bit `Administrator` = `0x8`): https://discord.com/developers/docs/topics/permissions
- Discord, componentes (Components V2): https://discord.com/developers/docs/components/reference
- Discord, mensagens e flags (`SUPPRESS_NOTIFICATIONS`, `IS_COMPONENTS_V2`): https://discord.com/developers/docs/resources/message
- Discord, webhooks: https://discord.com/developers/docs/resources/webhook
- Discord, AutoMod: https://discord.com/developers/docs/resources/auto-moderation
- Discord, limites de embed: https://discord.com/developers/docs/resources/message#embed-object-embed-limits
- discord.js: https://discord.js.org
- Last.fm API: https://www.last.fm/api
- Wayback Machine, API de disponibilidade: https://archive.org/help/wayback_api.php
- RSS do r/teabrasil: https://www.reddit.com/r/teabrasil/.rss
- LGPD (Lei 13.709/2018): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- ECA (Lei 8.069/1990): https://www.planalto.gov.br/ccivil_03/leis/l8069.htm
- Estatuto da Pessoa com Deficiência (Lei 13.146/2015): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm
- CVV: ligue 188 (24h, gratuito). Disque Direitos Humanos: 100.

Conferir os links antes de usar em mensagens públicas (é o próprio caso de uso do monitor de links).

---

## 11. Perguntas ainda abertas

1. **Oficina (`/py-craft`):** vai junto com a Casinha para a Cringelândia? (Proposta: sim, os móveis só
   servem na Casinha.)
2. **Ganchos globais:** materiais e Fagulhas do `/py-work` e XP do Passe só contam quando a atividade
   acontece na Cringelândia? (Proposta: sim.)
3. **Página `/mercado`** do site: continua pública como vitrine da Cringelândia?
4. **Painel antigo:** quais telas do `admin.html` o dono realmente usa hoje (para não perder nada na
   troca)?
5. **`AGENTS.md` enxuto:** pode dividir em núcleo + `docs/`?
6. **Música:** resultado da enquete (5.10).
