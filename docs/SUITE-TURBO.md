# Suíte Turbo — testes rápidos sem perder verificação

> Criada em 31/10/2026. Substitui a cadeia `a.js && b.js && …` do `package.json`.
> Regra que continua valendo (AGENTS §2): `npm test` roda **a suíte inteira**.

## 1. Números medidos (mesma máquina, mesma suíte)

| Métrica | Antes (cadeia `&&`) | Depois (Suíte Turbo) |
|---|---|---|
| Arquivos | 72 | 72 |
| Verificações | 492 | **492** |
| Tempo de parede (suíte completa) | 73,9 s | **32,9 s** (2,3×) |
| Loop local (`--changed`, edição-folha) | 73,9 s | **0,7 s** (109×) |
| Falhas / instabilidade | — | 0 em 3 execuções seguidas |

O ganho maior vem do **loop local**, não da suíte completa: editar um módulo-folha roda
1 arquivo em menos de 1 s.

## 2. Por que a cadeia era lenta

- 71 processos Node, um por arquivo; cada um pagava `require('discord.js')` (~432 ms).
- Nenhuma forma de rodar só o que mudou.
- Uma falha no arquivo 60 obrigava a repetir tudo.
- Saída só em emoji: impossível comparar duas execuções.

## 3. Como funciona

### 3.1 Fonte única da ordem: `tests/steps.json`
Lista os 72 passos, na ordem original. **Nunca** leia `scripts.test` para isso: o
`npm test` aponta para o próprio runner (isso gerou uma recursão infinita na primeira
tentativa). Para acrescentar teste novo:

```bash
npm run test:steps          # acusa teste em disco fora da lista
npm run test:steps:write    # acrescenta (o smoke fica sempre por último)
npm run test:map            # remapeia quais arquivos de data/ cada teste toca
```

### 3.2 Isolamento de `data/`
O runner move `data/` para um backup temporário **no mesmo volume** (rename entre C: e E:
falha com `EXDEV`), semeia um `data/` mínimo (`scripts/seed_ci_fixtures.js`) e restaura no
`finally`. Se o processo for morto à força, `node scripts/capture-test-manifest.js --restore`
devolve tudo.

### 3.3 Escalonamento (o que dá para paralelizar com segurança)
O mapa `test-runs/data-touch-map.json` registra quais caminhos cada teste **modifica**:

- **Testes que não escrevem em `data/`** (47 de 72) → pool paralelo, 12 jobs.
- **Testes que escrevem** → série, **na ordem original**, para o estado bater com o baseline.
- **Cache** (`data/cache/**`) é descartável e não conta como conflito.

Por que não paralelizar também os que escrevem: um teste pode **ler** um arquivo que
outro está gravando (rename atômico deixa o leitor ver ENOENT por um instante). Foi
exatamente o que quebrou `lightweightGames` e `databaseIntegrity` na primeira tentativa.

### 3.4 Quarentena automática (`test-runs/solo.json`)
Se um teste "livre" falha no pool, ele é reexecutado sozinho. Se passar, entra no
`solo.json` e passa a rodar sempre em série. Ou seja: **a paralelização só acelera o que
provou ser segura**, e o veredito final é sempre de uma execução serial.

### 3.5 Gate de verificações (a garantia de qualidade)
`scripts/capture-test-manifest.js` gravou `test-runs/manifest.baseline.json` com cada
verificação (nome + contagem) dos 72 arquivos. A cada suíte completa o runner compara:

- arquivo ausente na execução → falha;
- `exitCode` mudou → falha;
- contagem de verificações caiu → falha;
- verificação do baseline não apareceu → falha.

Números dentro do nome são normalizados (`22 arquivos` → `23 arquivos`), porque são
dinâmicos — a contagem por arquivo continua sendo exigida separadamente.

## 4. Comandos

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm test` | suíte inteira + gate | antes de commit/deploy |
| `npm run test:fast` | só o que o `git diff` afeta | durante o desenvolvimento |
| `npm run test:file -- tests/x.test.js` | um arquivo | depurar |
| `npm run test:gate` | suíte + gate explícito | CI |
| `npm run test:map` | regera o mapa de conflitos | depois de criar teste novo |
| `npm run test:steps` | valida a lista de passos | idem |
| `node tests/run.js --failed` | repete só o que falhou | iterar |
| `node tests/run.js --repeat=3` | estabilidade | antes de mexer no runner |
| `node tests/run.js --jobs=4` | menos paralelismo | máquina carregada |

## 5. Limitações conhecidas (honestas)

1. **`--changed` não ajuda em arquivos-hub.** Mudar `src/utils/i18n.js` seleciona 63
   testes (quase tudo depende dele). É correto, mas o tempo fica igual ao da suíte.
2. **Leitores × escritores.** Sem instrumentar as leituras de `fs`, a única garantia
   segura é "não escreve → paralelo; escreve → série". Paralelizar escritores exigiria
   mapear leituras (próximo passo possível).
3. **`tests/bonusTimer.test.js` é sensível a carga** (asserção de tempo). Está em
   quarentena. Correção de raiz: fake timers — fica como pendência.
4. **Windows/PowerShell embaralha o acento na saída** quando se usa `*>`; os arquivos de
   manifesto são gravados em UTF-8 pelo Node e estão corretos.

## 6. Arquivos criados

- `tests/run.js` — runner (pool, quarentena, gate, `--changed`).
- `tests/steps.json` — ordem oficial dos 72 passos.
- `scripts/capture-test-manifest.js` — gera o baseline e restaura `data/`.
- `scripts/sync-test-steps.js` — acusa teste novo fora da lista.
- `scripts/lib/test-output.js` — parser único de saída (✅ e `: OK`).
- `test-runs/` — manifestos, mapa de conflitos e logs (ignorado no git).
