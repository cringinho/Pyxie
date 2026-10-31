# 11. Prévias no canal de homologação (`1461937203214024891`) — sob demanda

### 1. Nada é enviado por conta própria
- **Desligado por padrão.** Nenhum agente, teste ou automação manda prévia no canal de homologação só porque criou ou alterou um embed/mensagem.
- A prévia só sai quando **o dono pedir explicitamente** (ex.: "manda a prévia no canal de testes").
- Quando ele pedir, o envio é única e exclusivamente da prévia pedida — nada de lote extra "de brinde".

### 2. Como ligar (opt-in)
O despachante `src/utils/homologationPreviewDispatcher.js` checa o portão `previewsEnabled()`:

- `PYXIE_PREVIEWS=on` no ambiente (também aceita `1`, `true`, `yes`); ou
- `force: true` na chamada de `dispatchHomologationPreview`.

Sem isso, a chamada devolve `{ success: true, skipped: true, simulated: true }` e **não** toca na API do Discord (nem via client, nem via REST).

Exemplos (Windows/PowerShell e Linux):

```powershell
$env:PYXIE_PREVIEWS='on'; node scripts/dispatch_previews.js store pt
```

```bash
PYXIE_PREVIEWS=on node scripts/dispatch_previews.js store pt
```

Módulos disponíveis no despachante: `store` (vitrine com o menu de compra), `store-stock`
(alerta de estoque baixo) e `home` (loja do dia da Casinha). O segundo argumento é o idioma
(`pt` ou `en`).

### 3. Blindagem anti-ping (vale sempre que houver envio)
- No canal `1461937203214024891`, **nunca** mencione usuários, cargos, `@everyone` ou `@here` de forma ativa.
- Tags de usuário (`<@id>`), cargo (`<@&id>`) e canal (`<#id>`) ficam entre crases (`` `<@&id>` ``), e o payload sempre leva `allowedMentions: { parse: [], users: [], roles: [], repliedUser: false }` — o despachante já sanitiza tudo em `shieldAntiPing`/`sanitizeEmbed`.
