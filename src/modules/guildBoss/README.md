# Módulo Chefe da Semana (Weekly Boss)

Toda segunda-feira à meia-noite (Brasília), um guardião das Catacumbas de Veludo sobe para cada
servidor. Todo mundo luta junto até ele cair. Faz parte do Mundo Pyxie: some quando o servidor
está no modo clássico (`/py-setup`).

## Como funciona
- **Comando:** `/py-boss` (ou `py!boss`, `py!chefe`, `py!raid`) mostra o painel público do chefe.
- **Vida:** `2000` de base e `+600` para cada pessoa nova que entra na luta. Servidores pequenos e
  grandes têm o mesmo desafio por pessoa.
- **Ataques:** `3` por pessoa por dia (BRT). O chefe anuncia o plano do dia:

| Plano do dia | Postura certa (dano ×2) | Postura fraca (dano ×½) |
| --- | --- | --- |
| 💢 Investida | 🛡️ Defender | 🔮 Magia |
| 🪨 Casca de Pedra | 🔮 Magia | ⚔️ Golpe |
| 🌀 Feitiço Carregando | ⚔️ Golpe | 🛡️ Defender |

- **Força:** `40` + `8` por andar recorde nas Catacumbas + `5` por vitória (até 10), mais sorte;
  10% de crítico (×1,5).
- **Ranking:** dano total da semana. O painel é público; o que é de cada pessoa (ataques que
  restam, recompensa) vai em resposta privada.

## Recompensas (AGENTS.md §5)
Pagas uma única vez, sob trava de arquivo, quando o chefe cai:
- Quem bateu: `40` moedinhas, `3` Ecos (talentos das Catacumbas) e o **Estandarte da Vitória**.
- Pódio: `+60`, `+40` e `+20` moedinhas; o primeiro lugar leva o **Troféu do Chefe da Semana**.
- Teto de `2000` moedinhas por servidor por semana.
- Se a semana vira sem vitória, o chefe vai embora sem recompensa e o resumo aparece no painel.

## Arquivos
- `bossData.js`: chefes (guardiões da dungeon), posturas e planos do dia (PT/EN).
- `bossStore.js`: estado em `data/guildBoss.json`, ataques, queda e recompensas.
- `bossViews.js`: painel do chefe e a linha pública de cada golpe.
- `commands/pyBoss.js`: comando e botões `boss:hit:<postura>` e `boss:view`.
