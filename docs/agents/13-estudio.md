# 13. Estúdio de Mensagens
- Mensagens customizadas de servidor (boas-vindas, regras, painéis de cargos, avisos fixos) nascem no estúdio do painel (`/dashboard` → Mensagens), não em código. Guia: `docs/GUIA-ESTUDIO-MENSAGENS.md`.
- Embeds de sistema do bot continuam no `src/utils/embedRegistry.js`.
- Qualquer embed que a Pyxie manda na Cringelândia pode ser mudado pelo dono no painel (`/dashboard` → Embeds): cor, textos com `{original}`, imagens, emojis do app e o rostinho do rodapé. O gancho fica no REST do bot (`src/services/embedOverrides.js`), então comando novo não precisa de nada para aparecer lá.
