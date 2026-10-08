# 🔮 Tarot Místico dos 78 Arcanos

## 📖 O que é este módulo?
O módulo de Tarot é o oráculo mágico da Pyxie. Ele permite que os aventureiros do servidor façam leituras diárias das cartas de tarot, recebendo orientações, conselhos arcanos e reflexões espirituais.

O baralho é composto pelos 78 arcanos completos (22 Maiores e 56 Menores), todos ilustrados com artes góticas e místicas geradas com exclusividade para a Pyxie.

---

## ✨ O que ele é capaz de fazer?
- **Tiragem Diária com Arte:** Gera uma imagem de alta definição com a carta sorteada, moldura mágica e posição (Direta ou Invertida).
- **Interpretação Completa:** Apresenta o significado tradicional, palavras-chave e um conselho prático com a personalidade tsundere e afetuosa da Pyxie.
- **Álbum de Coleção Pessoal:** Cada carta tirada pelo membro é registrada em seu grimório pessoal (`/py-album`). Os membros podem tentar completar os 78 arcanos!
- **Oráculo da Comunidade:** Reinicia as tiragens automaticamente à meia-noite (horário de Brasília).

---

## 🎮 Comandos no Discord
| Comando | O que faz | Quem pode usar |
| :--- | :--- | :--- |
| `/py-tarot` | Tira a carta do dia e revela o conselho arcano | Todos os membros |
| `/py-album` | Exibe o álbum e o progresso da coleção de cartas | Todos os membros |

*Aliases por prefixo:* `py!tarot`, `py!album`, `py!albumdetarot`.

---

## ⚙️ Configurações Recomendadas
- **Canal de Leituras:** Embora funcione em qualquer canal permitido, ter um canal místico ou de oráculo melhora a imersão da comunidade.
- **Reinicialização Diária:** O oráculo se renova diariamente sem necessidade de comandos manuais da moderação.

---

## 📚 Bibliotecas e Recursos Utilizados
- **Canvas (node-canvas):** Responsável por montar e renderizar a carta, efeitos de brilho, moldura e arte final.
- **Discord.js (v14):** Para exibir as cartas e menus de navegação do álbum.
- **Dicionário Bilíngue (i18n):** Garante interpretações completas e naturais em Português e em Inglês.

