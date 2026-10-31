# Estúdio de Loja — extra de R$ 3 (estado e plano)

> Extra mensal que libera o módulo `mary-studio` para qualquer servidor.
> Preço: **R$ 3/mês** ou **R$ 30/ano**. Disponível também no plano Free (é o degrau de entrada).
> Regra que não muda (AGENTS §5): extra libera **módulo**, nunca vantagem econômica.

## 1. O que já está pronto (E0 — 31/10/2026)

| Peça | Onde | O que faz |
|---|---|---|
| Catálogo | `src/config/planAddons.js` | Preço mensal/anual em centavos, textos PT/EN, módulos que libera |
| Estado por servidor | `src/services/guildAddons.js` | `status`, `isActive`, `grant`, `revoke`, `listForGuild` — JSON atômico + lock |
| Gate da API | `src/routes/dashboardRoutes.js` | `requireMaryOrAddon` em 11 rotas (zona Mary **ou** extra ativo) |
| Visibilidade no menu | `getSections` | Seção entra por zona ou por extra (quando liberado) |
| API do painel | `GET /api/dashboard/guilds/:id/addons` · `POST .../addons/:addon/grant` | Catálogo + estado; concessão manual (dono do servidor) |
| Estúdio de mensagens | guarda de botões `mary` | Botão de lojinha aceito na zona Mary ou com extra |
| Testes | `tests/planAddons.test.js` | 10 verificações (preço, validade, vitalício, revogação, trava) |
| Concessão vitalícia | `scripts/grantLifetime.js` | Mary e Cringelândia com plano + extra vitalícios |

## 2. Trava de lançamento (importante)

`planAddons.isReadyForSale()` está **`false`**. Enquanto isso:

- servidor com o extra recebe **409 `addon_not_ready`** nas rotas da loja;
- a tela do Estúdio de Loja **não aparece** no menu do painel.

**Motivo:** `mary-studio` guarda **um único estado global** (`data/maryStudioConfig.json`,
`data/maryStoreData.json`). Abrir para compradores agora faria qualquer um ler e editar
estoque, chave PIX, macros e perfil da Mary. A trava existe para impedir vazamento —
não é excesso de zelo.

## 3. E1 — dados por servidor (em andamento)

### 3.1 Feito (E1a — 31/10/2026)

| Item | Onde | Resultado |
|---|---|---|
| Caminhos por servidor | `maryStudioManager` | `configFileFor`, `storeFileFor`, `uploadsDirFor` — Mary no arquivo legado, cliente em `data/guilds/<id>/store/` |
| Padrões por servidor | `defaultConfigFor` | Mary mantém os dela; servidor novo nasce **offline, estoque 0, sem PIX e sem macros** |
| Config e dados com escopo | `loadConfig(guildId)`, `saveConfig(data, guildId)`, `loadStoreData(guildId)`, `saveStoreData(data, guildId)` | Retrocompatível: sem argumento = Mary |
| Uploads | `saveUpload(buffer, guildId)` + rota `/api/store/media/:guildId/:file` | Pastas e URLs separadas; `/api/mary/media/<arquivo>` continua válida |
| Painel ligado ao escopo | `maryDashboard.getStore/saveStore/getProfile/saveProfile/calc` + rotas | Todas as chamadas passam `req.params.guildId` |
| Perfil da Pyxie | `updateLocalProfile(guildId)` | Carrega e grava no arquivo do servidor editado |
| Teste de isolamento | `tests/storeScope.test.js` | 6 verificações: Mary intacta, cliente neutro, arquivos separados, tickets isolados, uploads separados |

Suíte: **75 arquivos · 514 verificações · gate OK** (rodou também na VM).

### 3.2 Falta (E1b) — é o que ainda bloqueia a venda

1. **Handlers do Discord** (`buttonActionHandler`, `ticketHandler`, `reviewHandler`, `giveawayHandler`,
   `stickyAndFaqHandler`): hoje só respondem no servidor da Mary. Precisam resolver o `guildId` do
   interaction e checar o extra — sem isso o painel do cliente funciona e os botões não.
2. **`/py-mary` (central na DM)**: escolher qual servidor abrir quando o usuário tem mais de um.
3. **Migração**: script que leva o estado atual da Mary para `data/guilds/<MARY>/store/` com backup
   (opcional: o fallback legado já cobre a leitura).
4. **Aceite de termos** no primeiro acesso do cliente (checkbox + data + IP).
5. **Flip de `READY_FOR_SALE`** para `true` — só depois de 1–4 verdes.


## 4. E2 — telas e cobrança

1. Card "Estúdio de Loja +R$ 3" na aba **Planos** do painel (`client/src/dashboard/Plans.jsx`),
   com mensal/anual e estado atual.
2. Checkout: `external_reference = extra|<guildId>|lojinha` no mesmo fluxo Pix/Preapproval de
   `planPayments.js` (idempotência por `paymentId` já existe).
3. Webhook: ramo novo em `server.js` para ativar o extra; carência de 7 dias; aviso por DM.
4. Flip de `isReadyForSale()` para `true` **só** com E1 verde.

## 5. Riscos que precisam de decisão do dono

- **Roblox**: revenda de Robux fora da plataforma viola os termos do Roblox. O produto é
  ferramentaria de loja; o dono do servidor responde pelo que vende. Recomendo aceite de termos
  no primeiro acesso ao módulo (checkbox + data + IP no banco).
- **Discord**: denúncia de "comércio proibido" atinge o aplicativo do bot — que é o ativo principal.
- **Preço**: R$ 3 no Pix perde ~10–15% na taxa do gateway. O anual de R$ 30 (~3%) é a saída.
- **Suporte**: R$ 3 tem que ser autoatendimento. Se cada cliente custar 1 hora sua, o preço é irreal.
