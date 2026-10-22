---
trigger: always_on
description: "Proíbe dados fictícios (mocks e placeholders) em painéis, APIs e embeds e garante o isolamento multi-tenant entre o núcleo global da Pyxie, o Estúdio da Mary e a Cringelândia."
---

# Regra Invariante: Zero-Mock e Isolamento Multi-Tenant

## Proibição absoluta de mocks e placeholders

- Nunca entregue componentes do painel `/admin`, rotas de API (`server.js`, `src/routes/`) ou embeds com constantes estáticas que simulem dados reais (`mockData`, `MOCK_DATA`, `placeholderData`, `placeholderStats`, arrays literais de servidores ou usuários fictícios).
- Toda métrica, listagem ou configuração deve ler a fonte real:
  - **PostgreSQL via Drizzle ORM** (`src/database/index.js`, `src/database/schema.js`) para usuários, saldos, transações, matrimônio e álbum de tarot.
  - **Arquivos atômicos em `data/`** via `writeAtomic` (`src/utils/atomicJson.js`) para configuração de módulos e estado auxiliar.
  - **Telemetria real** (`src/services/resourceTelemetry.js`, `moduleManager.getStatus()`, `truthReconciliationEngine.js`) para CPU, RAM e rede.
- Proibido deixar blocos incompletos marcados com `TODO: implement` / `FIXME: connect` ou botões sem handler real.
- Valores exibidos no site público vêm de `/api/public/system-truth` e `truthHydrator.js`, nunca de números fixos no HTML.

## Isolamento de identidade multi-tenant

A Pyxie é um produto global. A Cringelândia (`1453890868980482090`) é o servidor oficial do criador e o Estúdio da Mary (`MARY_DEFAULT_GUILD_ID`) é um tenant SaaS isolado.

- **Núcleo global** (`src/commands/`, `src/services/`, `src/utils/`, `index.js`, módulos globais em `src/modules/`): títulos, embeds e descrições usam `guild?.name ?? 'Pyxie'`. Nunca fixe "Cringelândia", "Lojinha da Mary" ou "Estúdio da Mary" em texto exibido a servidores de terceiros.
- **Referências de infraestrutura são permitidas**: constantes de escopo (`CRINGELANDIA_GUILD_ID`), `commandScopeManager.js`, `commandIntrospector.js`, `guildDirectory.js` e checagens `guild.id === CRINGELANDIA_GUILD_ID` são o mecanismo legítimo de roteamento.
- **Conteúdo exclusivo da Cringelândia** fica em `src/services/cringelandiaService.js`, `data/cringelandia/` ou atrás de uma checagem explícita de guild ID.
- **Conteúdo do Estúdio da Mary** fica confinado em `src/modules/mary-studio/`, nas rotas `/mary` e `/api/mary/*` e em `data/maryStudioConfig.json`.
- Comandos restritos a uma guild são registrados com escopo de guild (`Routes.applicationGuildCommands`) e configurados na aba "Escopo & Acesso" do `/admin`; nunca aparecem em `/api/commands`, na Wiki ou no `/py-help` de outros servidores.
