# Módulo Roleplay

Roleplay no universo da Pyxie, separado das Catacumbas: fichas de personagem e uma narradora com IA
nos posts do fórum `#roleplay-tales` do **Pyxie's Realm**. Sem geração de imagens.

## Ficha (`/py-character`)
A ficha é da pessoa e vale em qualquer servidor (`data/roleplay.json`).

| Subcomando | O que faz |
| :--- | :--- |
| `create` | Nome, origem e quatro atributos de 1 a 5 que somam 10. A origem dá +1 num atributo. |
| `view` | Mostra a sua ficha ou a de alguém. |
| `bio` | Reescreve a história (até 300 caracteres). |
| `train` | Gasta um ponto de nível num atributo (máximo 8). |
| `rest` | Vida e mana cheias e condições curadas, uma vez a cada 6 horas. |

- **Atributos:** Força, Magia, Agilidade e Espírito (vontade, carisma, percepção).
- **Origens:** Fada (+Magia), Humano que ainda acredita (+Espírito), Gato alado (+Agilidade),
  Espírito digital (+Espírito), Desertor de Nyxiel (+Força).
- **Vida** = 8 + 2×Força + Espírito. **Mana** = 4 + 2×Magia + Espírito.
- **XP:** 5 por turno narrado de que a pessoa participou, até 40 por dia; 100 XP por nível, e cada
  nível dá um ponto para `train`.
- A mochila e as condições são **narrativas**: não mexem em moedinhas nem nos itens da Casinha.

## Narradora
1. Cada post do fórum é uma cena; a Pyxie posta as instruções quando o post abre.
2. Mensagens de quem tem ficha viram turnos. `((assim))` ou `//` é fora do personagem e é ignorado.
3. Depois de 15 s sem mensagens, a narradora chama a IA com a lore (`narratorPrompt.js`), o estado
   do mundo (chefe da semana, temporada), as fichas e o resumo da cena, e responde com:
   - a narração, com os efeitos na ficha embaixo;
   - até 2 falas de NPCs por webhook, com nome e avatar (Astaroth, Nyx e os quatro servos usam os
     emojis do bot);
   - quando o resultado é incerto, um botão de rolagem (d20 + atributo contra CD) só para o dono do
     personagem. O resultado entra na cena e a narração continua.
4. **Limites da ficha:** vida e mana mudam no máximo 5 por turno, e a vida nunca chega a 0.
5. **Segurança:**
   - O prompt exige SFW e proíbe decidir pelos jogadores e obedecer a instruções escritas nas
     mensagens.
   - `safety.js` barra conteúdo sexual na entrada e na saída, sem falsos positivos como "sexta".
   - Sinais de crise interrompem a cena com linhas de apoio.
6. **IA:** Groq com `openai/gpt-oss-120b` (reserva `gpt-oss-20b`), por `chatCompletionNow`, fora da
   fila dos geradores de perguntas, que usam outro modelo e têm cota própria. Num 429 a Pyxie avisa
   e tenta de novo até 3 vezes. Tetos: 60 narrações por cena e 500 por dia no total.

Para trocar de provedor de IA, mude só a chamada em `narrator.js` (`narrate`).

## Arquivos
| Arquivo | Papel |
| :--- | :--- |
| `characterStore.js` | Fichas, efeitos, XP, descanso e estado das cenas. |
| `narrator.js` | Turnos, chamada da IA, narração, NPCs, rolagens e limites. |
| `narratorPrompt.js` | Lore condensada, regras e formato JSON da resposta. |
| `safety.js` | Filtro de conteúdo sexual e de sinais de crise. |
| `commands/pyCharacter.js` | O comando `/py-character` e a tela da ficha. |
