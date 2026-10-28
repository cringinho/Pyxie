# 2. Portão de Testes Automático (Quality Gate)
- Antes de considerar qualquer modificação pronta, execute obrigatoriamente:
  ```bash
  npm test
  ```
- O comando executa todos os arquivos de teste do ecossistema e o teste de fumaça de todos os comandos (`scripts/smoke_all_commands.js`), incluindo testes de segurança, integridade econômica, tarot, SEO, paridade i18n, módulos desacoplados, Drizzle ORM, estúdio SaaS, master dashboard SaaS, integridade do banco de dados, Discord health, homologation preview dispatcher e novos sistemas (Acolhimento 24h, Desabafos, py!set e Tarot Global).
- **100% dos testes devem passar** sem exceções antes de finalizar qualquer turno ou enviar commits para produção.
- **Fora da VM:** com `data/` limpo, rode `node scripts/seed_ci_fixtures.js` antes do `npm test` (o CI do GitHub já faz isso). Sem o registro do Criador em `data/economy.json`, o `phase3DashboardSass` falha.
