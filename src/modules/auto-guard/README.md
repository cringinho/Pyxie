# 🪶 Moderação Leve

## O que é este módulo?

Sete ajudas de moderação que não punem ninguém à toa. Cada servidor liga em Painel → **Automações** (grupo Moderação). Desligadas por padrão. A staff (Gerenciar Mensagens) não é afetada pelos filtros de mensagem.

## O que ele é capaz de fazer?

- **Menção fantasma:** marcou e apagou em até X s → a Pyxie conta no canal (sem marcar ninguém de novo).
- **Registro de calls:** entrou, saiu, trocou, numa linha discreta.
- **Sem caps lock:** lembrete gentil (ou apaga), um a cada 10 min por pessoa.
- **Canal só de mídia:** só ficam imagens, vídeos, figurinhas (e links, se quiser).
- **Limite de divulgação:** um link a cada X horas por pessoa.
- **Imagem como spoiler:** reenvia imagem/vídeo escondido em canais sensíveis (até 8 MB), sem perder o conteúdo.
- **Quem convidou:** qual convite cada pessoa usou e quem o criou (inclusive convites de uso único).

## Comandos no Discord

Nenhum.

## Canais, cargos e permissões

Gerenciar Mensagens, Anexar Arquivos (spoiler), Gerenciar Servidor (ler convites).

## Recursos no site e web

Painel → servidor → **Automações**.

## Ferramentas e bibliotecas usadas

`src/services/autoRules3.js`, `src/services/autoState.js`.
