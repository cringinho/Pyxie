# Planos (mensal/anual) e bloqueio de recursos

## 1. Ciclo anual

| Plano | Mensal | Anual | Economia |
|---|---|---|---|
| Básico | R$ 7 | R$ 70 | 16,7% (2 meses grátis) |
| Premium | R$ 20 | R$ 200 | 16,7% (2 meses grátis) |

- Preços em `src/services/guildPlans.js` (`PRICES`, `PRICES_ANNUAL`, `priceOf(plan, cycle)`).
- Referência do pagamento: **mensal continua `plan|<guild>|<plano>`** (3 partes, cobranças já
  emitidas seguem válidas) e o **anual ganha `|year`**. `parseReference` aceita as duas.
- Webhook: ciclo anual concede **12 meses** (`grantPlan({ months: 12 })`), no Pix e no cartão.
- Cartão anual: `auto_recurring.frequency = 12`.
- Tela: alternador **Mensal/Anual** com selo de economia; o preço e o checkout seguem o ciclo.

## 2. Bloqueio por plano (estilo Probot)

Fonte única: **`src/config/planFeatures.js`**.

```js
{ id: 'embeds', kind: 'section', plan: 'premium', pt: 'Mensagens personalizadas', en: 'Custom embeds' }
```

| Recurso | Plano | Onde |
|---|---|---|
| Cores e temas do painel | Básico | seção `theme_custom` |
| Mensagens personalizadas (embeds) | Premium | seção `embeds` |
| Comunidade e eventos | Premium | seção `community` |
| Eventos sazonais | Premium | seção `seasonal` |
| Oráculo com IA / Quiz IA | Premium | comandos |
| Blog Hyperfokus | Premium | módulo |

**Por que automações, mensagens periódicas e boas-vindas ficaram livres:** já são usadas por
servidores sem plano. Trancar agora tiraria recurso de quem está usando — diferencial de plano
tem de ser *recurso novo*, não retrocesso.

### Na tela
- O menu recebe `lockedSections` do backend e marca o item com **cadeado + nome do plano**.
- Cor por plano, como no Probot: **Básico = azul (`sky-300`)**, **Premium = dourado (`amber-300`)**;
  o item fica esmaecido (`text-white/45`) para não competir com o que está liberado.
- `title` do item explica o bloqueio (acessível por teclado e leitor de tela).

### No backend
`requireGuild` recusa com **403**:

```json
{ "error": "plan_required", "feature": "embeds", "requiredPlan": "premium", "currentPlan": "free" }
```

Regra: a tela esconde **e** o backend recusa (AGENTS §10). Cortesias não são barradas —
`lifetime`, dono do painel, zona Mary e zona Cringelândia passam direto.

## 3. Testes

`tests/planCycles.test.js` (10 verificações): preço anual, referência com e sem ciclo,
Pix anual de R$ 200, 12 meses concedidos, preço de mês recusado no ciclo anual, cartão
repetindo a cada 12 meses, `canUse`/`planFor`/`lockedFor`, founder no topo e catálogo bilíngue.

## 4. Falta

1. Paywall amigável dentro da seção bloqueada (hoje ela mostra o erro genérico de API).
2. Site público (`/planos`) com os mesmos preços — hoje a página é estática.
