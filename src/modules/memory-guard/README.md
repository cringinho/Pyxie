# 🧯 Disjuntor de Memória

## O que é este módulo?

O bot roda com um teto de memória de 768 MB. Num pico (uma raid, muita gente usando comandos com imagem), ele pode encostar no teto e cair. O disjuntor percebe antes e alivia: esvazia os caches de imagem e deixa o cartão de perfil só em texto até a memória baixar. Moderação, segurança e economia seguem normais.

## O que ele é capaz de fazer?

- **Confere a cada 15 segundos** a memória usada e o atraso do processamento.
- **Acima de 85% do teto:** esvazia os caches de imagem (tarô, Catacumbas, Casinha, cartão de perfil), o `/py-perfil` responde sem imagem e o dono recebe uma DM (no máximo a cada 6 horas).
- **Abaixo de 75%:** volta ao normal. A folga entre 75% e 85% evita ligar e desligar sem parar.
- **No painel:** Pyxie global → Saúde mostra a memória, o atraso e se o disjuntor está ligado.

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Nenhum.

## Recursos no site e web

Painel → Pyxie global → **Saúde**.

## Ferramentas e bibliotecas usadas

- `node:v8` (teto de memória) e `perf_hooks.monitorEventLoopDelay` (atraso), sem dependência nova.
- Regras em `src/services/memoryGuard.js`; cada cache de imagem se inscreve com `onPressure`.
