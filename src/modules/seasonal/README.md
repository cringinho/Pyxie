# 🎃 Eventos Sazonais & Temáticos

## 📖 O que é este módulo?
O módulo de Eventos Sazonais traz festividades e temas especiais para o servidor (como Halloween, Páscoa, Festa Junina, Natal e celebrações de aniversário). Ele movimenta o chat com itens temáticos, desafios, doces ou travessuras e uma moeda especial de evento.

Conta também com um ranking visual público para premiar os membros mais ativos durante o período da festividade.

---

## ✨ O que ele é capaz de fazer?
- **Moeda e Itens Festivos:** Introduz itens comemorativos exclusivos que os membros podem coletar conversando no chat.
- **Gotas de Evento (Drops):** Pequenas recompensas temáticas que caem aleatoriamente no chat enquanto os membros conversam.
- **Classificação Competitiva:** Acompanha quem acumulou mais itens ou pontos ao longo do evento.
- **Cartões de Ranking em Imagem:** Gera cartões ilustrados em imagem PNG com a foto de perfil, posição e pontuação do usuário.
- **Página de Ranking no Site:** Página web dinâmica (`/evento`) com o placar ao vivo dos líderes da temporada.
- **Painel Administrativo Próprio:** Página externa (`/admin/sazonal`) onde administradores alteram temas, datas de início/fim e itens especiais.

---

## 🎮 Comandos no Discord
| Comando | O que faz | Quem pode usar |
| :--- | :--- | :--- |
| `/py-evento` | Mostra as informações do evento em andamento | Todos os membros |
| `/py-rankseasonal` | Exibe o ranking dos melhores colocados do evento | Todos os membros |
| `/py-infoeventos` | Lista as regras e como participar do evento | Todos os membros |

*Aliases por prefixo:* `py!evento`, `py!ranking-evento`, `py!infoevento`.

---

## ⚙️ Configurações Recomendadas
- **Tema Ativo:** Nome do tema atual (ex: Halloween das Bruxas, Natal Encantado).
- **Canais Permitidos:** Canais onde os drops e a contagem de pontos do evento são válidos.
- **Período do Evento:** Data e hora de abertura e encerramento.

---

## 🌐 Recursos na Web
- **Placar do Evento:** Acessível em `/evento` enquanto o evento estiver aberto.
- **Painel Administrativo Dedicado:** Acessível em `/admin/sazonal` para a gerência da temporada.

---

## 📚 Bibliotecas e Recursos Utilizados
- **Canvas (node-canvas):** Biblioteca gráfica para desenhar o cartão de classificação e montar a arte do evento.
- **Discord.js (v14):** Para detectar conversas ativas e sortear drops.
- **Express & EJS:** Para exibir a página web do placar e o painel de controle.

