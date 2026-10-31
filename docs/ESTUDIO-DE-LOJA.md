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


## 4. Funções da lojinha (o que o extra entrega)

Lista fechada — a mesma que aparece no painel (**Planos → O que vem no Estúdio de Loja**) e no
site (`/planos`):

1. **Vitrine no Discord**: painel de produtos publicado num canal, com botão de compra.
2. **Pedidos e tickets**: abrir, confirmar entrega e registrar falha do pedido.
3. **Estoque**: quantidade por produto, códigos de entrega e alerta de estoque baixo.
4. **Preços e Pix**: preço do 1k de Robux, chave e nome do Pix e status da loja.
5. **Avaliações**: nota média, total e canal das avaliações.
6. **Cargo de cliente** automático e **filtro de convites**.
7. **Respostas rápidas** com estoque, preço e status preenchidos sozinhos (`{estoque}`, `{preco_1k}`, `{status_loja}`).
8. **Ferramentas Robux**: calculadora dos 30%, conferir gamepass e conferir nick do Roblox.
9. **Recibo de entrega** com botão de avaliação.
10. **Sorteios, cupons** e modelos prontos de mensagem.

Cada item tem rota e serviço próprios (`storeProducts`, `maryDashboard`, `storefront`,
`src/modules/mary-studio/*`); o teto de mensagens cíclicas e o perfil da Pyxie seguem o plano
do servidor (ver `PLANOS-E-BLOQUEIOS.md`).

## 5. E2 — telas e cobrança

1. Card "Estúdio de Loja +R$ 3" na aba **Planos** do painel (`client/src/dashboard/Plans.jsx`),
   com mensal/anual e estado atual.
2. Checkout: `external_reference = extra|<guildId>|lojinha` no mesmo fluxo Pix/Preapproval de
   `planPayments.js` (idempotência por `paymentId` já existe).
3. Webhook: ramo novo em `server.js` para ativar o extra; carência de 7 dias; aviso por DM.
4. Flip de `isReadyForSale()` para `true` **só** com E1 verde.

### 5.1 Estado real (31/10/2026)

Tudo acima está no ar: `READY_FOR_SALE = true`, Pix de R$ 3/R$ 30 validado em teste,
webhook decidindo por `external_reference` (`addon|guildId|lojinha|ciclo`) e avisos
D-7/D-3/D-0 por DM ao dono do servidor.

**Formas de pagamento:**

| Meio | Função | Cobrança | Ciclos |
|---|---|---|---|
| Pix | `createPixCharge` | única | mês e ano |
| Cartão | `createCardSubscription` | recorrente (Preapproval) | mês (R$ 3) e ano (R$ 30 a cada 12 meses) |

A rota `POST /api/dashboard/guilds/:guildId/addons/:addonId/checkout` aceita `{ cycle, method }`
(`method: 'pix' | 'card'`). No cartão o painel exibe o `initPoint` do Mercado Pago — o mesmo
tratamento vale para planos (era um bug: o retorno do cartão não aparecia).

**Venda pelo Discord (31/10/2026):** o painel publica a vitrine num canal
(`POST /api/dashboard/guilds/:id/store/panel`) e o cliente compra pelo menu (`storefront:*`).
O estoque baixa na hora (`storeProducts.deliver`); entrega manual fica pendente e o dono recebe DM
com o link. Quando o estoque fica no mínimo, o módulo manda DM de reposição uma vez por dia
(`storeAlerts.scan`, a cada 6 h).

**Regra de ouro:** o extra libera **módulo**, nunca vantagem econômica (§5 do AGENTS.md).
Quando expira, os dados ficam guardados e voltam na renovação.

## 6. Riscos que precisam de decisão do dono

- **Roblox**: revenda de Robux fora da plataforma viola os termos do Roblox. O produto é
  ferramentaria de loja; o dono do servidor responde pelo que vende. Recomendo aceite de termos
  no primeiro acesso ao módulo (checkbox + data + IP no banco).
- **Discord**: denúncia de "comércio proibido" atinge o aplicativo do bot — que é o ativo principal.
- **Preço**: R$ 3 no Pix perde ~10–15% na taxa do gateway. O anual de R$ 30 (~3%) é a saída.
- **Suporte**: R$ 3 tem que ser autoatendimento. Se cada cliente custar 1 hora sua, o preço é irreal.
