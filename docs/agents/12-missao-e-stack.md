# 12. Missão, Persona e Stack Imutável (Governança de Agentes `.agents/`)

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
- `.agents/skills/<nome>/SKILL.md`: procedimentos sob demanda (`discord-v2-multi-tenant`, `sharp-image-and-seo-saas`, `discord-minigame-module`).
- `.agents/hooks.json` + `.agents/hooks/pre-tool-validator.sh`: veto `PreToolUse` contra mocks, nomes de tenant em novos arquivos do núcleo e payloads Components V2 inválidos.
- `AGENTS.md` e `GEMINI.md` são mantidos idênticos.
