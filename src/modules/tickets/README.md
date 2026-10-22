# 📩 Módulo de Tickets & Atendimento (Multi-Tenant)

O módulo de Tickets da Pyxie implementa uma infraestrutura completa e isolada para atendimento de membros em servidores Discord, com suporte multi-tenant e regras especiais para a Cringelândia.

## 🌟 Funcionalidades Principais

- **Configuração Simples via `py!set tickets <#canal>` ou `/py-set tickets`:**
  - Define o canal onde o painel público de atendimento será publicado.
  - Oferece um seletor nativo de categorias do Discord e o botão `[ ➕ Crie pra mim ]`, que gera automaticamente a categoria `📩・ATENDIMENTO` posicionada no topo com permissões estritas para a Staff.

- **Painel Público Adaptativo por Escopo:**
  - **Servidores Externos:** Renderiza 2 botões (`[ 🆘 Ajuda ]` e `[ 🚨 Denúncia ]`).
  - **Cringelândia (`1453890868980482090`):** Renderiza 3 botões (adiciona `[ 🖼️ Remoção de Conteúdo ]` para o Museu).

- **Fluxo Exclusivo de Remoção de Conteúdo:**
  - Abertura de Modal (`tkt:modal:art_removal`) sem poluição de canais.
  - Confirmação imediata na DM do artista com SLA de 48 horas.
  - Despacho da pendência no canal de aprovações `1557534749310976141` com botão interativo `[ ✅ Concluir Exclusão ]` para a Staff.
  - Notificação automática na DM do solicitante ao concluir.

- **Salas Privadas com Trava de Segurança:**
  - Criação de canais privados com sobreposição de permissões seguras.
  - Recepção com instruções e botão `[ 🔒 Fechar Atendimento ]`.
  - Fechamento seguro restrito exclusivamente a membros com permissão de `ManageChannels` (tanto pelo botão quanto pelo comando `py!fechar`).
