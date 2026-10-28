# 9. Diretrizes de Engenharia de Interface: Embeds do Discord (Discord UI/UX SaaS)
Sempre que estruturar e implementar embeds do Discord no bot (utilizando `new EmbedBuilder()` do Discord.js v14):

1. **Título e Âncora Visual**:
   - O título deve ser curto, impactante e escaneável (**máximo 8 palavras**).
   - Deve iniciar com exatamente UM emoji funcional como âncora visual (ex: 📈, 🛑, 👤, 🔄, 🔮, 💎).
   - Os emojis devem ser resolvidos canonicamente via `src/utils/appEmojis.js` (`getEmoji('CHAVE')`), `themeEmojis.js` ou emojis nativos Unicode com fallbacks. Schemas dinâmicos customizáveis pelo Dashboard (/admin) são integrados via `src/utils/embedRegistry.js`.

2. **Espaçamento Obrigatório e Respiro Visual (Pulo de Linha Duplo `\n\n`)**:
   - **Regra de Ouro do Espaçamento**: É terminantemente PROIBIDO colar linhas de texto, tópicos ou diretrizes consecutivamente (usando apenas `\n` ou parágrafos compactos).
   - **Pulo de Linha entre Tópicos (`\n\n`)**: Toda frase informativa de destaque, regra de convivência, diretriz, bullet point (`•`) ou item de lista DEVE ser separado do próximo por quebra de linha dupla (`\n\n`). Isso cria o respiro visual essencial para legibilidade imediata em telas pequenas de smartphones.
   - Parágrafos de introdução ou contextualização devem ter no máximo 2 a 3 linhas antes de uma linha em branco.

3. **Tipografia Moderna & Markdown Nativo do Discord (Modern UI/UX)**:
   - **Cabeçalhos Nativos (`### Título da Seção`)**: Utilize subtítulos Markdown nativos do Discord (`### 📜 Diretrizes e Convivência`, `### ✍️ Como Utilizar`) para organizar grandes seções com tipografia destacada e elegante.
   - **Subtextos Muted (`-# Subtexto`)**: Utilize a sintaxe de texto pequeno do Discord (`-# 🌷 Lembrete ou dica secundária`) para avisos de rodapé inline, notas explicativas ou assinaturas sem poluir a leitura principal.
   - **Citações em Bloco (`>`)**: Para frases de efeito, perguntas de quiz, reflexões ou instruções de ação, utilize blockquotes com recuo visual (`> *Texto em destaque*`).
   - **Destaque Semântico Inicial**: Todo item de lista deve iniciar com seu identificador ou termo-chave em negrito (`• **Respeito Mútuo:** ...`), garantindo leitura em diagonal confortável.

4. **Erradicação Estrita de Design Legado e Antigo (Anti-Legacy & Anti-ASCII)**:
   - **Proibição de Divisores de Caracteres ASCII**: É expressamente PROIBIDO o uso de linhas pesadas ou divisores artificiais estilo bots de 2018 (ex: `━━━━━━━━━━━━━━━━━━━━`, `════════════════════`, `--------------------`, caixas ascii). A separação deve ser feita exclusivamente através de cabeçalhos (`###`) e espaçamento em branco (`\n\n`).
   - **Proibição de Listas Aglutinadas**: Nunca junte múltiplos bullet points (`•`) em uma massa única de texto sem quebras duplas. O design deve ser moderno, limpo, espaçado e minimalista.

5. **Campos (Fields) e Otimização Mobile**:
   - Utilize a propriedade `inline: true` para métricas e dados complementares que fiquem bem dispostos lado a lado.
   - Limite a no máximo 2 a 3 campos inline por linha para evitar que o cliente mobile do Discord force colunas caóticas.
   - Valores numéricos, saldos, valores monetários, IDs e códigos devem ser formatados em linha de código (Inline Code, entre crases `` `...` ``) para destaque visual limpo e neutro.
   - Nunca exiba URLs brutas no corpo ou campos: use sempre links mascarados na sintaxe `[Texto do Link](URL)`.

6. **Rodapé e Metadados (Footer & Timestamp)**:
   - O rodapé deve ser dinâmico e contextual: exibir o nome da aplicação (`Pyxie`) e o nome do servidor quando aplicável (`guild ? guild.name : 'Privado'`), com texto ou dicas rotativas de outros comandos e funções do bot.
   - Minigames rápidos, notificações efêmeras ou embeds compactos podem utilizar rodapés simplificados para priorizar a agilidade e evitar sobrecarga visual na tela.
   - Utilize `.setTimestamp()` nativo com a data/hora do evento em embeds que representem ações com temporalidade relevante (transações, logs, alertas).
