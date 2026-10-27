# 🌱 Comunidade

Exclusivo da Cringelândia (plano 5.9). Configurado no painel: `/dashboard` → Cringelândia → **Comunidade** (só o dono). Configuração em `data/guilds/<id>/community.json`.

## Fórum de hiperfocos

- Tópico novo num fórum configurado que fica 15 min (ajustável) sem resposta de outra pessoa ganha o primeiro comentário da Pyxie (falas prontas; o texto da pessoa não vai para IA).
- Moedinhas com trava (AGENTS §5): até 30 por vez (padrão 15), uma vez por dia por pessoa, só se o post original tiver o tamanho mínimo e não tiver sido editado.
- Nunca no fórum de desabafos.

## Radar de notícias e direitos

- A cada 2 h lê os feeds configurados (RSS/Atom).
- Notícias: o Groq resume em até 3 frases neutras. Reddit: só título e link (não copia o texto das pessoas).
- Tudo vai primeiro para o canal da staff com **Aprovar** / **Descartar** (precisa de Gerenciar Mensagens).
- A publicação sempre leva o link da fonte e o aviso "não é orientação jurídica nem médica".
- Itens vistos em `data/newsRadar.json`.
