# 2. Portão de Testes Automático (Quality Gate)
- Antes de considerar qualquer modificação pronta, execute obrigatoriamente:
  ```bash
  npm test
  ```
- O comando executa todos os arquivos de teste do ecossistema e o teste de fumaça de todos os comandos (`scripts/smoke_all_commands.js`), incluindo testes de segurança, integridade econômica, tarot, SEO, paridade i18n, módulos desacoplados, Drizzle ORM, estúdio SaaS, master dashboard SaaS, integridade do banco de dados, Discord health, homologation preview dispatcher e novos sistemas (Acolhimento 24h, Desabafos, py!set e Tarot Global).
- **100% dos testes devem passar** sem exceções antes de finalizar qualquer turno ou enviar commits para produção.
- **Fora da VM:** com `data/` limpo, rode `node scripts/seed_ci_fixtures.js` antes do `npm test` (o CI do GitHub já faz isso). Sem o registro do Criador em `data/economy.json`, o `phase3DashboardSass` falha.

## Suíte Turbo (desde 31/10/2026)
`npm test` agora chama `tests/run.js`: pool paralelo para os testes que não escrevem em `data/`,
série para os que escrevem, quarentena automática para os sensíveis a concorrência e **gate de
verificações** contra `test-runs/manifest.baseline.json` (nenhuma verificação pode desaparecer).
Detalhes, comandos e limitações: [`docs/SUITE-TURBO.md`](../SUITE-TURBO.md).

Para o loop local use `npm run test:fast` (só o que o `git diff` afeta). Teste novo precisa
entrar em `tests/steps.json` (`npm run test:steps` acusa; `npm run test:steps:write` corrige) e
depois `npm run test:map` para o mapa de conflitos.
