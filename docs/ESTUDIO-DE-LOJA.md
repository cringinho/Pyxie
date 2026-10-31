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

## 3. E1 — dados por servidor (bloqueia a venda)

Objetivo: cada servidor com o extra tem a **sua** configuração, isolada da Mary.

1. `maryStudioManager.js`: `getStore(guildId)`, `saveStore(guildId, ...)`, `getProfile(guildId)`,
   `saveProfile(guildId, ...)`. Arquivo por servidor: `data/guilds/<guildId>/store.json`
   (fallback de leitura no global **só** para a zona Mary, para migrar sem perder nada).
2. `maryStoreData.json` (tickets, avaliações, cupons, sorteios) → por servidor, mesmo padrão.
3. Uploads: `data/uploads/mary/` → `data/uploads/store/<guildId>/`; rota de mídia resolve por servidor.
4. Handlers `mary_btn:*`, tickets, avaliações e sorteios: resolver `guildId` do interaction e
   checar o extra (não mais "só no servidor da Mary").
5. `commands/pyMaryStudio.js` (central na DM): listar os servidores do usuário com o extra e
   pedir qual abrir quando houver mais de um.
6. Migração: script `scripts/migrateMaryStoreToGuilds.js` copiando o estado atual da Mary para
   o diretório dela, com backup antes.

**Portão do E1:** teste que cria dois servidores com o extra, grava estoques diferentes e prova
que um não vê o outro; e que a Mary continua com os dados atuais.

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
