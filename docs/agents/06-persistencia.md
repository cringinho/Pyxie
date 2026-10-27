# 6. Camada Híbrida de Persistência: PostgreSQL (Drizzle ORM) & Arquivos Atômicos
- **PostgreSQL com Drizzle ORM (`src/database/`)**:
  - Camada primária estruturada para operações transacionais relacionais de alta concorrência: usuários, saldos econômicos, histórico de transações, matrimônio e álbum de cartas de tarot.
  - As transações utilizam travas e guardas de integridade para garantir que transferências e resgates sejam ACID.
- **Persistência Atômica JSON (`data/`)**:
  - Utiliza o padrão `writeAtomic` (escrita em arquivo temporário `.tmp` seguida de `renameSync`) para garantir resiliência contra corrupção em quedas de energia ou reinicializações forçadas da VM.
  - Mantém redundância, configurações dinâmicas de módulos, backups locais e capacidade de execução autônoma em modo de testes.
