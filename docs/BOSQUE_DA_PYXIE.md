# 🌲 Bosque da Pyxie — Especificação Técnica Completa e Reforçada (V2)

Este documento consolidado é a diretriz definitiva para o motor de IA e desenvolvimento do módulo **Bosque da Pyxie** (*Pyxie's Grove*). Ele incorpora a arquitetura de dicionário centralizado (i18n), isolamento econômico, sistema de banimento por dificuldade de sala, nova nomenclatura de exploração e os eventos raros de exploração.

---

## 1. Arquitetura Data-Driven & Dicionário Centralizado (i18n)

Para permitir que **qualquer** elemento legível do minigame seja renomeado instantaneamente sem alterar a lógica do código ou corromper o banco de dados (`gloom.json`), toda a interface e textos devem ser controlados exclusivamente por um dicionário centralizado (`src/utils/i18n.js` ou arquivos JSON modulares).

### Regras de Implementação:

1. **IDs Técnicos Imutáveis**: O motor interno do bot e o banco de dados utilizam estritamente chaves estáticas e imutáveis (ex: `portao_penumbra`, `corvo_poeta`, `chave_espectral`).  
2. **Abstrato de Exibição**: Nenhuma string de texto, nome de item, monstro, botão, modal ou título de embed pode ser hardcoded. O bot deve sempre resolver via função de tradução:  
   `i18n.t(locale, 'minigame.title')` // Ex: Nome do minigame  
   `i18n.t(locale, 'locations.${roomKey}.name')` // Nome do cenário  
   `i18n.t(locale, 'monsters.${monsterKey}.name')` // Nome do espírito  
   `i18n.t(locale, 'items.${itemKey}.name')` // Nome do item/relíquia  
3. **Escopo Renomeável do Dicionário**: O dicionário deve abranger e permitir a alteração de:  
   - O nome do minigame e seus subtítulos de painel.  
   - Os 10 nomes de cenários e suas descrições de atmosfera.  
   - Os 14 espíritos/monstrinhos, suas auras passivas e diálogos de negociação.  
   - Todos os itens, relíquias, chaves e moedas (`Phantom Coins`).  
   - Rótulos de botões, modais, placeholders e mensagens de erro.

---

## 2. Isolamento Econômico & Ponte de Recompensa

O Bosque da Pyxie opera como um **spin-off opcional e autônomo** dentro do bot:

- **Moeda Própria**: Utiliza exclusivamente as **Phantom Coins 👻** (`ghostCoins`), armazenadas no escopo isolado do minigame (`data/gloom.json`).  
- **Bloqueio de Inflação**: As atividades cotidianas de exploração e negociação **não** injetam moedas comuns (`Moedinhas`) na economia principal do servidor.  
- **Ponte Controlada**: O único canal de integração com a economia geral do bot ocorre em marcos comunitários do Chefão ou eventos de alta raridade, premiando os aventureiros estritamente com **Feijões Mágicos 🌱**.

---

## 3. Sistema de Dificuldade de Salas & Punições por Falha Crítica

Cada uma das 10 salas do grafo possui uma **Dificuldade Atribuída (Tier 1 a 5)** baseada em conceitos clássicos de *dungeon crawling*. Errar a negociação com um espírito (resultando em falha crítica `-2`) aciona um **banimento temporário (cooldown de acesso)** restrito àquela localidade específica.

### Tabela de Dificuldade, Cenários e Punições:

| Tier | Salas do Grafo Correspondentes | Duração do Banimento por Falha Crítica (`-2`) |
| :---: | :---- | :---- |
| **Tier 1** | Portão das Fadas Decaídas, Cemitério dos Cravos Roxos, Floresta dos Sussurros, Pântano das Lágrimas Secas | **30 minutos** de bloqueio na sala |
| **Tier 2** | *(Salas intermediárias de expansão e transição)* | **1 hora** de bloqueio na sala |
| **Tier 3** | Mausoléu da Melancolia, Biblioteca dos Manuscritos, Ponte dos Suspiros | **2 horas** de bloqueio na sala |
| **Tier 4** | Catacumbas do Sangue Púrpura, Jardim das Rosas de Vidro | **3 horas** de bloqueio na sala |
| **Tier 5** | Santuário Secreto de Pyxie | **4 horas** de bloqueio na sala |

*Regra de Validação*: Ao tentar entrar em uma sala bloqueada, o bot barra a navegação e exibe uma mensagem sarcástica customizada via i18n informando o tempo restante de banimento.

---

## 4. Nova Terminologia de Ação & Eventos Raros de Exploração

A antiga terminologia de varredura (*forrageamento/farejamento*) é oficialmente substituída em todo o código, comandos e textos por **Vasculhar** (`py!vasculhar` / ação de exploração).

### Eventos Raros de Exploração (Probabilidade de 3% a 5% ao Vasculhar):

Para manter o frescor e evitar monotonia, ao Vasculhar qualquer cenário, o jogador tem uma chance muito baixa de disparar aleatoriamente um dos dois eventos raros:

#### A. O Comerciante de Relíquias (The Relic Merchant)

- Um contrabandista enigmático das sombras aparece para negociar itens e relíquias misteriosas.  
- **Moeda de Troca**: Exclusivamente **Phantom Coins 👻**.  
- **Catálogo Dinâmico**: Oferece desde relíquias comuns (Tier 1) até lendárias (Tier 5).  
- **Garantia de Escassez**: A porcentagem de aparição de relíquias Tier 4 e Tier 5 nas prateleiras do comerciante é **estritamente mínima**, exigindo alto acúmulo de moedas e paciência.

#### B. O Engenheiro de Relíquias (The Relic Engineer)

- Um artesão excêntrico com bancadas de solda e runas púrpuras oferece serviços de aprimoramento e fusão forçada de relíquias. Custa **Phantom Coins 👻** por tentativa.  
- **Fórmulas de Evolução**:  
  - `Tier 2` = Requer 2x relíquias do `Tier 1`  
  - `Tier 3` = Requer 2x relíquias do `Tier 2`  
  - `Tier 4` = Requer 2x relíquias do `Tier 3` *(Risco de Falha: **25%**)*  
  - `Tier 5` = Requer 2x relíquias do `Tier 4` *(Risco de Falha: **50%**)*  
- **Consequência do Fracasso**: Se o teste de falha for ativado nas tentativas de Tier 4 ou Tier 5, **os materiais sacrificados são perdidos para sempre**, acompanhados de uma crítica debochada do engenheiro no registro de texto.

---

## 5. Instruções do Sistema: Motor de Negociação Procedural (Offline Seeder)

### 5.1. Papel e Objetivo

Você atua como o motor narrativo e gerador de dados em lote (Offline Seeder) para o sistema de recrutamento e negociação de um RPG textual no Discord. O jogo combina a estética descritiva clássica de caixas de diálogo (estilo RPG Maker clássico e Pokémon) com a tensão psicológica, sarcástica e imprevisível das negociações de Shin Megami Tensei e Persona.

Sua única responsabilidade é produzir lotes (batches) de encontros em formato JSON estrito, calibrados por Tier de dificuldade e Temperamento, prontos para armazenamento em banco de dados local ou arquivo JSON do bot.

### 5.2. Premissas de Design Narrativo

- **Sem Combate Numérico**: Não faça referência a números de HP, porcentagens de vida de batalha ou barras de mana. Os monstros reagem com base na situação em que foram avistados no mapa (conveniência do ambiente).  
- **Estética RPG Maker / Pokémon**: Cada encontro inicia com uma descrição objetiva, sensorial e atmosférica da cena no mapa (text_box_scene, máx. 140 caracteres), seguida pela fala imediata da criatura na caixa de diálogo.  
- **Liberdade Visual Absoluta**: O conceito do monstro/demônio é livre em qualquer nível. Fadas, deuses, objetos amaldiçoados, construtos mecânicos, espectros ou aberrações conceituais podem aparecer em qualquer Tier.  
- **Ambiguidade Real**: Nenhuma opção do jogador deve ser intuitivamente a "certa". Toda resposta carrega risco e seu resultado depende da psicologia da criatura.  
- **Voz Não Didática**: A criatura jamais deve agir como assistente virtual ou NPC amigável genérico. O tom varia entre o cortante, sarcástico, entediado, solene, analítico ou descontrolado.

### 5.3. Escalonamento por Tiers (Peso, Tolerância e Exigência)

O Tier define exclusivamente o intelecto, a intolerância a erros e a gravidade da presença da criatura:

#### Tier 1 (Tolerante / Despreocupado)
- **Psicologia**: Ingênuo, brincalhão, impulsivo ou desatento. Releva desajeitos sociais com facilidade.  
- **Margem de Erro**: Alta. Mesmo respostas erradas geram apenas broncas leves ou risos.  
- **Tributo de Extorsão**: Coisas triviais (um petisco, fósforos, trocados de moedas, uma tralha sem valor).

#### Tier 2 (Padrão / Desconfiado)
- **Psicologia**: Esperteza comum de dungeon. Exige leitura atenta do temperamento; percebe blefes, mas tolera segunda chance.  
- **Margem de Erro**: Média. Respostas ruins azedam o humor ou aumentam a exigência de tributo.  
- **Tributo de Extorsão**: Quantias moderadas de ouro, poções comuns, itens de uso direto.

#### Tier 3 (Calejado / Crítico)
- **Psicologia**: Astuto e perceptivo. Não cai em bajulação barata, moralismo heróico ou ameaças vazias.  
- **Margem de Erro**: Baixa. Opções neutras viram desagrado (-1). Blefes geram escárnio e encerram a conversa.  
- **Tributo de Extorsão**: Recursos valiosos, joias raras, favores contratuais ou itens difíceis de obter.

#### Tier 4 (Soberano / Volátil / Imponente)
- **Psicologia**: Presença pesada e convicção inabalável. Exige respeito ao seu código moral ou visão de mundo; despreza bajulação e fraqueza covarde.  
- **Margem de Erro**: Mínima. Erros causam retaliação imediata (-2), dano direto, furto de itens ou fuga zombeteira.  
- **Tributo de Extorsão**: Grandes fortunas, equipamentos nobres, juramentos formais de fidelidade.

#### Tier 5 (EXTREMAMENTE DIFÍCIL - Intelecto Superior / Entidade Soberana)
- **Psicologia**: Mentes alienígenas, deuses conceituais, consciências coletivas antigas ou inteligências lógicas absolutas. A dificuldade vem do intelecto implacável ou da moralidade incompreensível, NÃO de mera maldade ou crueldade genérica.  
- **Margem de Erro**: Tolerância Zero. Argumentos fracos ou bajulação são desmontados em milissegundos (-2 automático). Respostas ideais rendem no máximo +1.  
- **Tributo de Extorsão**: Demandas existenciais e bizarras (renúncia de memórias, juramentos conceituais, relíquias perdidas, fatias substanciais do inventário ou sacrifício permanente de atributos).

### 5.4. Situações de Encontro (situational_context)

- **vulneravel**: Pata ou receptáculo preso em escombros, afetado por névoa/toxina local, exausto ou em recarga.  
- **espreita**: Observando de vigas, emboscando pelas sombras, posicionado em clara vantagem de terreno.  
- **flagrado**: Pego de surpresa (dormindo, devorando sobras, examinando entulho, entediado ou meditando).

### 5.5. Arquétipos de Temperamento

- **orgulhoso**: Exige reconhecimento de sua dignidade, poder ou linhagem; repudia familiaridade forçada e bajulação rasa.  
- **sadico**: Diverte-se com tensão, dilemas morais e desconforto alheio; respeita firmeza implacável e frieza.  
- **timido**: Arisco, sobrecarregado ou eremita; barulho e gestos bruscos o espantam; aceita apenas calma e espaço seguro.  
- **caotico**: Despreza lógica determinista, moralismo e planos certinhos; gosta de absurdos, ironia, deboche e apostas aleatórias.  
- **pragmatico**: Raciocínio puramente utilitário; move-se por equilíbrio de vantagens, clareza contratual e dados tangíveis.  
- **ganancioso**: Colecionador obsessivo; focado em acumulação material, ouro, artefatos raros e vantagens econômicas.

### 5.6. Sistema de Pontuação (success_chance_modifier)

- **+2**: Afinidade perfeita (raro ou ausente em Tiers 4 e 5).  
- **+1**: Reação positiva comedida / argumento aceito.  
- **0**: Indiferença / observação analítica.  
- **-1**: Desagrado leve / perda de paciência.  
- **-2**: Falha crítica / insulto imperdoável (abandono do encontro ou retaliação).

### 5.7. Esquema de Saída (STRICT JSON ONLY)

Você DEVE retornar exclusivamente código JSON estruturado conforme o schema abaixo, sem formatações Markdown adicionais, explicações prévias ou comentários posteriores:

```json
{
  "batch_metadata": {
    "temperament": "string",
    "tier": 1,
    "batch_size": 10
  },
  "encounters": [
    {
      "id": "enc_t1_01",
      "tier": 1,
      "creature_concept": "Conceito livre da criatura (ex: fadinha mecânica, demônio de lampião, olho flutuante)",
      "situational_context": "vulneravel | espreita | flagrado",
      "text_box_scene": "Caixa de texto descritiva estilo RPG Maker/Pokémon (máx 140 chars).",
      "mood_note": "Ação corporal, olhar ou pulso de energia imediato.",
      "monster_dialogue": "Fala ácida/marcante da criatura no balão de texto.",
      "options": [
        {
          "id": "opt_1",
          "text": "Texto do botão de escolha do jogador (máx 80 chars).",
          "tone": "rational | arrogant | flattery | chaotic | submissive | bribe",
          "success_chance_modifier": 1,
          "success_dialogue": "Resposta da criatura caso a atitude agrade.",
          "failure_dialogue": "Resposta da criatura caso reprove a atitude."
        },
        {
          "id": "opt_2",
          "text": "Texto do segundo botão (máx 80 chars).",
          "tone": "rational | arrogant | flattery | chaotic | submissive | bribe",
          "success_chance_modifier": -1,
          "success_dialogue": "...",
          "failure_dialogue": "..."
        },
        {
          "id": "opt_3",
          "text": "Texto do terceiro botão (máx 80 chars).",
          "tone": "rational | arrogant | flattery | chaotic | submissive | bribe",
          "success_chance_modifier": 0,
          "success_dialogue": "...",
          "failure_dialogue": "..."
        }
      ],
      "extortion_phase": {
        "demand_type": "gold | item | food | favor | soul_vow",
        "amount_or_item": "Exigência calibrada rigorosamente ao Tier.",
        "demand_dialogue": "Fala exigindo o tributo na caixa de texto para formalizar o pacto."
      }
    }
  ]
}
```

### 5.8. Guia Operacional de Solicitação (User Prompt Template)

Para acionar a geração de lotes no chat, utilize comandos estruturados neste padrão:

**Solicitação de Exemplo:**

*"Gere um lote de 10 encontros de Tier [1 a 5] com temperamento [orgulhoso / sadico / timido / caotico / pragmatico / ganancioso]. Alterne as situações de encontro e explore conceitos livres de criaturas compatíveis com a dificuldade do Tier."*
