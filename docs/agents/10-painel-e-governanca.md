# 10. Painel e governança (VM ↔ painel ↔ site)

Nada está pronto se existir só no código do bot. Toda entrega precisa aparecer nas três camadas:

1. **Código e estado na VM** (`src/` e `data/`).
2. **Painel** (`/dashboard`, React em `client/src/dashboard/`, API em `src/routes/dashboardRoutes.js`).
3. **Site público**, quando houver número ou catálogo (`/api/public/system-truth`, `/api/commands`).

## Painel novo (`/dashboard`)

- Login com Discord (escopos `identify guilds`), sessão em `data/panelSessions.json`, cookie assinado com `PANEL_SECRET`. Sem segredo, o painel recusa tudo.
- Papéis em `src/services/panelAccess.js`, conferidos ao vivo pelo bot (`src/services/botBridge.js`) a cada pedido:
  - dono da Pyxie: Cringelândia, servidor da Mary e área global (saúde, lista pública de servidores, erros, módulos). Nos outros servidores, só se for admin lá, como qualquer pessoa. A lista de servidores mostra só dados públicos (nome, ID, dono, membros, descrição) e não dá acesso a nada;
  - Cringelândia: só o dono;
  - servidor da Mary: só a Mary e o dono;
  - outros servidores: dono da guild ou `Administrator`, com whitelist opcional (`data/guilds/<id>/panelAccess.json`).
- O backend recusa o que a tela esconde. Pedidos que mudam algo exigem o cabeçalho `X-Pyxie-Panel: 1`.
- Uma seção nova só entra em `getSections()` quando a tela e a API dela existem (política zero-mock).

## Ao criar ou mudar algo

- **Módulo (`src/modules/<id>/`):** ciclo de vida com `ctx.registerListener`, `ctx.registerCron`, `ctx.registerInterval`; agendadores só no processo do bot (`ctx.isBotProcess`); `README.md` obrigatório; aparece em Módulos (global) do painel.
- **Comando:** registrar em `COMMAND_CATEGORY_MAP`, escopo certo (`guildScope` com IDs de `src/config/scopes.js`), textos PT/EN. Comandos da Mary nunca aparecem na ajuda/site; os da Cringelândia aparecem marcados.
- **Configuração por servidor:** tela no painel, guardada em `data/guilds/<guildId>/` com escrita atômica.
- **Rotas web:** `robots.txt` com `Disallow` para `/admin`, `/dashboard`, `/api/dashboard/`, `/auth/`, `/mary`.

## Painel antigo (`/admin`)

Desligado. `/admin`, `/admin/emojis`, `/admin/sazonal` e `/admin/parcerias` redirecionam para as telas do `/dashboard` (Pyxie global: Saúde, Servidores, Módulos, Museu, Shopee, Emojis; Cringelândia: Evento sazonal, Parcerias). As APIs `/api/admin/*` continuam e aceitam a sessão do dono no painel. O `py!admin` abre a Área do dono dentro do `/py-setup`.

## Antes de encerrar

- `npm test` 100% (inclui `scripts/smoke_all_commands.js`). No Windows, use `scripts/test-safe.sh`.
- Prévias de homologação das mensagens novas (§11).
