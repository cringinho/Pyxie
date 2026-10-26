# Módulo Pyxie's Realm

Módulo do servidor oficial **Pyxie's Realm** (guild `1564375898851909653`). Só age nessa guild
(`guildScope`). O plano completo do servidor está em `docs/realm/PROMPT-PYXIES-REALM.md`.

## O que o módulo faz
- **Leis em três idiomas:** a mensagem fixa de `#realm-laws` (boas-vindas, lore e as 7 leis, em
  inglês) tem os botões `realm:laws:pt` e `realm:laws:es`, que respondem só para quem clicou com a
  versão em português ou espanhol.
- **Desabafos "Just Listening":** quando alguém abre um post em `#support-pods` com a tag
  *Just Listening*, a Pyxie posta uma mensagem acolhedora com linhas de apoio (CVV 188, 988, 024,
  findahelpline.com). Respostas de outras pessoas são apagadas e quem respondeu recebe uma DM
  explicando; reações continuam liberadas.

## Arquivos
| Arquivo | Papel |
| :--- | :--- |
| `realmBlueprint.js` | Estrutura do servidor: cargos, categorias, canais, tags de fórum, Comunidade, AutoMod, Onboarding e tela de boas-vindas. |
| `realmContent.js` | Textos fixos em EN, PT e ES (traduções revisadas) e a mensagem de apoio. |
| `index.js` | Botões de tradução e proteção dos posts *Just Listening*. |

## Scripts
- `node scripts/realm/provision.js` mostra o que mudaria; com `--apply` aplica o blueprint. É
  idempotente: acha tudo pelo ID salvo em `data/realmState.json` ou pelo nome, e nunca apaga nada.
- `node scripts/realm/publish.js` publica ou atualiza as leis em `#realm-laws`.

Os dois usam o token do `.env` e falam direto com a API do Discord, então rodam de qualquer máquina.
O `data/realmState.json` fica só onde os scripts rodaram; o módulo acha os canais pelo nome.
