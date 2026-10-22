# 🎉 Módulo de Sorteios & Recompensas Estilo Loritta

O módulo de Sorteios da Pyxie traz um sistema moderno e completo de sorteios interativos para comunidades no Discord, com apuração imparcial e agendamento autônomo.

## 🌟 Funcionalidades Principais

- **Comando `/py-sorteio` e `py!sorteio`:**
  - Acesso restrito a moderadores com permissão de `ManageGuild` ou `ManageChannels`.
  - Hub administrativo ephemeral com opções de criação guiada e cancelamento antecipado.

- **Assistente Interativo de Criação (Wizard em 6 Passos):**
  1. **Dados Básicos:** Título, data/hora de início (`DD/MM/AAAA HH:mm` ou `AGORA`), término e quantidade de ganhadores (1 a 5).
  2. **Definição de Prêmios:** Campo único para 1 ganhador ou lista por colocação para múltiplos vencedores.
  3. **Canal de Publicação:** Seletor nativo de canais de texto do Discord.
  4. **Restrições & Requisitos:** Seletores de cargos permitidos (Whitelist), cargos bloqueados (Blacklist), cargos bônus (2x chances) e idade mínima de conta no Discord.
  5. **Emoji de Participação:** Seleção do emoji personalizado para o botão de ação.
  6. **Resumo & Confirmação:** Revisão detalhada de todos os parâmetros antes do agendamento ou publicação.

- **Card Público & Participação com Debounce:**
  - Card moderno com formatação Dark Kawaii e timestamps nativos do Discord.
  - Botão interativo com toggle automático (Entrar / Sair).
  - Agrupador debounced de 1.5s para atualizações visuais do botão e contador, evitando rate limits.

- **Worker em Background (15 segundos) & Apuração Fisher-Yates:**
  - Transição automática de `SCHEDULED` para `ACTIVE` e de `ACTIVE` para `FINISHED`.
  - Embaralhamento criptográfico com pesos de cargos bônus.
  - Seleção de vencedores únicos (zero duplicidade).
  - Anúncio público mencionando estritamente os ganhadores (sem `@everyone` ou `@here`).
