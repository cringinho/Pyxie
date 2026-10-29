# 🎀 Plano Estratégico: Nova Personalidade da Pyxie & Motor de Falas Infinitas (Kuromi Tsundere)

Este documento estabelece o plano mestre para a transição completa de todas as falas, mensagens de sistema, dicas e interações da Pyxie para o arquétipo **Kuromi Tsundere / Dark-Kawaii**, além do ecossistema de geração via Groq e governança via Dashboard.

---

## 1. O Arquétipo Oficial da Pyxie (Gap Moe Kuromi)

1. **A Máscara de Vilã Rebelde:** Se proclama a líder criminosa mais intimidadora do servidor; trata os usuários como "subordinados" ou "meus súditos incompetentes".
2. **A Realidade Mesquinha e Cômica:** Guarda rancores infantis e anota desaforos em seu caderninho negro de vinganças com caneta permanente.
3. **O Vazamento de Romance & Fofura (Gap Moe):** Romântica incurável em segredo; surta com cartas românticas de Tarot e pontuações altas no `/py-ship`, entra em pânico tsundere e nega tudo aos berros.
4. **Supervisão Dramática:** Ajuda o usuário de verdade, mas finge que é apenas para "evitar que um subordinado passe vergonha no chat".
5. **Acolhimento com Marra vs. Sofrimento Severo:** No dia a dia, acolhe com marra (*"Bebe uma água agora, fantasma desnutrido!"*). Em sofrimento sério/crise (CVV 188 / automutilação), a ironia é **100% proibida** e prevalece o acolhimento seguro e protetor (AGENTS.md §12).

---

## 2. Análise Técnica: Geração Infinita via Groq em Background

### Compensa?
**Sim, absolutamente.** A melhor arquitetura para o Discord é o **Offline Voice Seeder & Staging Buffer**:
- **Zero Latência no Discord:** Os comandos respondem instantaneamente (< 1ms) lendo do cache em memória e JSON atômico (`data/voiceBank.json`).
- **Custo Zero Vitalício:** Aproveita a cota diária gratuita do Groq através de `src/services/groqClient.js`, que já possui fila com espaçamento mínimo, controle de 429 e persistência de agendador.
- **Deduplicação & Validação Sintática:** Falas geradas passam por `cleanLine()` e expressões regulares de termos proibidos antes de serem salvas.
- **Paridade Bilíngue Obrigatória:** Todo ciclo gera pares estritos `{ pt, en }` com os mesmos gatilhos contextuais.

---

## 3. Matriz de Integração dos Assets de Fala

| Canal / Sistema | Arquivo / Ponto de Injeção | Estilo e Finalidade |
| :--- | :--- | :--- |
| **Dicas Rotativas nos Embeds** | `src/utils/pyxieVoice.js` (`ROTATING_TIPS`) | Dicas afiadas nos footers de todos os comandos (`pyxieFooter`), mandando o usuário trabalhar, tirar daily ou parar de preguiça. |
| **Comentários Pós-Comando** | `src/data/pyxieQuips.json` -> `src/services/pyxieQuips.js` | Falas curtas no primeiro embed (`-# 💬 ...`) de mais de 30 comandos interativos. |
| **Comandos Centrais** | `src/services/pyxieVoice.js` & `src/utils/i18n.js` | Respostas contextuais do `/py-daily`, `/py-work`, `/py-tarot`. |
| **Boas-Vindas & Avisos** | `src/utils/pyxieVoice.js` (`PYXIE_PHRASES`) & módulo `welcome` | Reações dramáticas a novos membros no servidor. |
| **Animador de Chat** | `src/modules/chat-animator/` | Puxadas de conversa provocativas quando o canal fica em silêncio. |

---

## 4. Governança no Dashboard (`/dashboard`)

- **Tela Global do Dono (`#/global/voice`):**
  - Métricas do acervo de falas (total, ativas, categorias mais frequentes).
  - Controle do Seeder Groq: status, último ciclo, disparador manual de geração em lote.
  - Tabela interativa com busca, filtro, edição in-line de texto PT/EN e exclusão.
- **Configurações por Servidor:**
  - Ajuste de intensidade da marra da Pyxie (Kuromi Pura vs. Fada Suave).
  - Frequência de exibição dos quips nos embeds.

---

## 5. Cronograma das 4 Fases

1. **Fase 1 (Governança & Fundação):** Inserção da regra `.agents/rules/pyxie-persona-voice.md`, documentação canônica em `docs/agents/14-personalidade-e-voz.md`, atualização de `AGENTS.md` e `GEMINI.md`, e substituição imediata das frases e dicas antigas em `src/utils/pyxieVoice.js`.
2. **Fase 2 (Enriquecimento do Acervo Estático):** Atualização de `src/data/pyxieQuips.json` e das falas em `src/utils/i18n.js` incorporando o novo corpus Kuromi.
3. **Fase 3 (Voice Seeder Groq):** Criação de `src/services/voiceSeederService.js` com persistência em `data/voiceBank.json` e execução periódica em horários ociosos.
4. **Fase 4 (Dashboard & Moderação):** Implementação dos endpoints em `src/routes/dashboardRoutes.js` e do componente React no dashboard.
