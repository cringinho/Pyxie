# Diretrizes Mandatórias de Desenvolvimento: Pyxie & Cringelândia

## 1. Política Mandatória de Arquitetura Bilíngue (PT-BR & EN)
Este projeto possui um ecossistema com dupla finalidade:
- **Cringelândia (Guild ID `1453890868980482090`)**: É o servidor oficial do criador e ambiente principal de uso. Em português brasileiro (`pt-BR`), os textos, comandos, gírias, piadas, lore e descrições DEVEM ser 100% naturais, imersivos e impecáveis.
- **Servidores Globais / Discord Internacional**: A Pyxie é desenhada para expansão global (Top.gg, bots lists, comunidades internacionais). O inglês (`en`) é o idioma padrão para servidores externos e usuários que utilizam o Discord em inglês.

---

### Regra de Ouro: Proibido Implementar Funcionalidades em Apenas Um Idioma
Sempre que uma nova feature, comando, botão, minigame, desafio, embed, item de loja ou página web for criada ou alterada:

1. **Dicionário Central de Traduções (`src/utils/i18n.js`)**:
   - Cada chave adicionada a `TRANSLATIONS.pt` **DEVE** ter sua contraparte exatamente equivalente em `TRANSLATIONS.en`.
   - Placeholders dinâmicos (`{user}`, `{coins}`, `{time}`, `{amount}`, etc.) **DEVEM** ser idênticos nas duas versões.
   - O teste automatizado `tests/i18nParity.test.js` trava o build se houver qualquer assimetria de chaves ou parâmetros.

2. **Comandos Slash (Discord.js v14)**:
   - O nome canônico e a descrição base do comando são sempre em inglês (`.setName()`, `.setDescription()`).
   - É obrigatório incluir a localização nativa em português via `.setDescriptionLocalizations({ 'pt-BR': '...' })`.
   - Todas as opções/parâmetros devem conter descrição base em inglês e `.setDescriptionLocalizations({ 'pt-BR': '...' })`.
   - Opções com escolhas pré-definidas (choices) devem ter labels traduzidos ou localizados.

3. **Comandos por Prefixo (`py!`)**:
   - Devem fornecer aliases tanto em inglês quanto em português (ex: `aliases: ['work', 'trabalho', 'py-trabalho', 'py-work']`).

4. **Respostas e Embeds**:
   - É proibido escrever mensagens ao usuário fixas (*hardcoded*) no código.
   - Utilize sempre `t(chave, source, replacements)` ou lógica de seleção de idioma via `getLanguage(source)`.
   - O método `.setFooter({ text: ... })` do Discord.js v14 exige estritamente um objeto `{ text: string }`.

5. **Páginas Web e Portais de Bônus (ex: `public/bonus.html`)**:
   - Devem aceitar os parâmetros `?lang=pt` e `?lang=en` da URL.
   - Devem possuir dicionário front-end (`I18N`) com suporte a detecção de navegador (`navigator.language`).
   - As APIs do backend devem retornar mensagens localizadas de acordo com o idioma do token.

6. **Desafios e Minigames com Conteúdo (ex: `/py-work`, `/py-cookie`, `/py-likely`)**:
   - Conjuntos de perguntas, cenários, sabedorias ou desafios devem ser criados em pares `{ pt: ..., en: ... }`.

---

## 2. Portão de Testes Automático (Quality Gate)
- Antes de considerar qualquer modificação pronta, execute obrigatoriamente:
  ```bash
  npm test
  ```
- O comando executa todos os 10 arquivos de testes, incluindo `tests/i18nParity.test.js` que audita recursivamente todas as chaves e comandos.
