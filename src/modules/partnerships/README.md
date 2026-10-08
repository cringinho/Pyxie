# 🤝 Central de Parcerias da Cringelândia

## 📖 O que é este módulo?
A Central de Parcerias é um sistema completo e organizado para receber, avaliar e divulgar projetos parceiros dentro da comunidade e no site oficial. Ele permite que criadores de conteúdo, servidores amigos, streamers e bots enviem suas propostas diretamente pelo Discord através de formulários interativos.

A equipe da moderação pode aprovar ou recusar cada pedido com um único clique. Quando aprovado, o anúncio é publicado automaticamente no canal oficial e no mural público do nosso site.

---

## ✨ O que ele é capaz de fazer?
- **Formulário Passo a Passo no Discord:** Os usuários escolhem a categoria do seu projeto (Comunidades, Criadores de Conteúdo, Serviços/Bots ou Causas Sociais) e preenchem as informações sem bagunçar os canais.
- **Canal de Avaliação da Staff:** Os moderadores recebem um cartão com todos os detalhes do projeto e botões para aprovar, recusar ou abrir uma conversa com o autor.
- **Publicação Automática:** Ao aprovar, o anúncio é postado no canal de parcerias com imagem, descrição, link do projeto, link do mural web e contagem de impulsos.
- **Mural Público no Site:** Todas as parcerias aprovadas aparecem no site (`/parcerias`), organizadas por categorias e em destaque.
- **Sistema de Impulsos (Bumps de 24h):** Qualquer visitante do site pode "impulsionar" uma parceria a cada 24 horas. Os impulsos aumentam o destaque do projeto e disparam um aviso em tempo real no canal de radar do Discord.
- **Painel Administrativo Dedicado:** Página própria na web (`/admin/parcerias`) para a equipe configurar canais, cargos e excluir parcerias antigas por ID.

---

## 🎮 Comandos no Discord
| Comando | O que faz | Quem pode usar |
| :--- | :--- | :--- |
| `/py-partner` | Abre o menu para solicitar uma nova parceria | Todos os membros |
| `/py-partner action:panel` | Publica a mensagem com botão de solicitação no canal de parcerias | Administradores |

*Aliases por prefixo:* `py!parceria`, `py!partner`, `py!py-parceria`.

---

## ⚙️ Canais e Cargos Recomendados
Para o módulo funcionar perfeitamente, o administrador configura:
- **Canal de Solicitações:** Onde fica a mensagem fixa com o botão para novos pedidos.
- **Canal de Avaliação da Moderação:** Onde a staff recebe os pedidos com botões de aprovar/recusar.
- **Canal Público de Parcerias:** Onde os anúncios aprovados são postados para todos os membros verem.
- **Canal do Radar de Impulsos:** Onde o bot avisa quando alguém dá um "boost/bump" em uma parceria no site.
- **Cargo de Triagem:** Cargo temporário opcional concedido enquanto o usuário preenche a solicitação.

---

## 🌐 Recursos na Web
- **Mural Público de Parcerias:** Acessível em `/parcerias` (ou `/partnerships`). Mostra os projetos aprovados, filtros de categoria e botão para impulsionar.
- **Painel Administrativo Próprio:** Acessível em `/admin/parcerias` para a gerência configurar canais, cargos e remover parcerias cadastradas.

---

## 📚 Bibliotecas e Recursos Utilizados
- **Discord.js (v14):** Para exibir botões, janelas de formulário (modais) e cartões visuais (embeds).
- **Express:** Servidor que exibe as páginas do site e recebe os impulsos diários.
- **Armazenamento Seguro em Arquivo:** Guarda as configurações e parcerias com proteção contra perda de dados.
