# 🎨 Museu de Arte da Comunidade

## 📖 O que é este módulo?
O Museu de Arte é uma galeria viva que celebra a criatividade da comunidade. Ele transforma desenhos, ilustrações, pinturas e artes digitais postadas pelos membros em uma exposição virtual acessível no site oficial.

Ele conta com um sistema de colheita diária que percorre o canal de arte do servidor, organizando as mídias postadas pelos artistas e dando a eles uma vitrine pública permanente.

---

## ✨ O que ele é capaz de fazer?
- **Galeria Virtual no Site:** Exibe todas as obras da comunidade em uma página elegante e responsiva (`/museu`).
- **Colheita Automática e Gradual:** Diariamente, o bot vasculha mensagens antigas do canal de arte em pequenos lotes seguros, salvando imagens sem sobrecarregar a memória do servidor.
- **Filtro por Artista:** Visitantes podem filtrar as obras de um criador específico ou navegar por todas as criações.
- **Edição de Legendas:** Os próprios artistas podem personalizar a descrição de suas obras cadastradas.
- **Estatísticas em Tempo Real:** Mostra a quantidade total de artes catalogadas e artistas participantes.

---

## 🎮 Comandos no Discord
| Comando | O que faz | Quem pode usar |
| :--- | :--- | :--- |
| `/py-museum` | Envia o link e o resumo da galeria do museu | Todos os membros |

*Aliases por prefixo:* `py!museu`, `py!museum`, `py!py-museu`.

---

## ⚙️ Canais e Configurações Recomendados
- **Canal de Arte:** Canal de texto do Discord onde os membros postam seus desenhos e fotos.
- **Lote de Colheita:** Quantidade de mensagens que o bot lê a cada ciclo (padrão de 50 mensagens para não pesar o sistema).
- **Formatos Aceitos:** Imagens nos formatos PNG, JPG, JPEG, GIF e WebP.

---

## 🌐 Recursos na Web
- **Página Pública do Museu:** Disponível em `/museu` (ou `/museum`). Exibe a galeria com miniaturas em alta qualidade e detalhes dos autores.
- **Painel de Controle:** Integrado às opções administrativas para iniciar a varredura manual de artes ou pausar o processo.

---

## 📚 Bibliotecas e Recursos Utilizados
- **Discord.js (v14):** Para coletar mensagens dos canais e enviar embeds informativos.
- **Express:** Servidor web para entregar as imagens e a galeria aos visitantes.
- **Cache de Imagens:** Otimização para carregar as fotos rapidamente sem gastar tráfego excessivo.

