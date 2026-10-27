# Guia do estúdio de mensagens

O estúdio cria mensagens bonitas e úteis para o servidor sem precisar de outro bot. Ele fica no painel: entre em `https://pyxie.com.br/dashboard` com o Discord, escolha o servidor e abra a aba **Mensagens**.

## 1. Criar uma mensagem

1. Toque em **+ Nova mensagem** e dê um nome (só você vê o nome).
2. Escolha o formato:
   - **Clássico (embeds):** texto e até 10 embeds com autor, título, descrição, campos, miniatura, imagem e rodapé.
   - **Formato novo:** blocos com cor lateral, seções com um botão ou imagem ao lado, galeria de até 10 imagens e divisórias. Esse formato não aceita texto avulso nem embeds clássicos.
3. Escreva o conteúdo. A **Prévia** mostra como vai ficar no Discord enquanto você digita.
4. Toque em **Salvar**. Se algo passar dos limites do Discord, o painel mostra o que arrumar.

## 2. Variáveis e emojis

| Escreva | Vira |
|---|---|
| `{user}` | menção de quem clicou (só em respostas a botões) |
| `{user.avatar}` | foto de quem clicou |
| `{server}` | nome do servidor |
| `{server.icon}` | ícone do servidor |
| `{bot.avatar}` | foto da Pyxie |
| `{date}` | data de hoje (horário de Brasília) |
| `{emoji:nome}` | emoji da Pyxie (use o botão **Emojis da Pyxie** para copiar o código) |

Markdown do Discord funciona: `### título`, `-# texto pequeno`, `> citação`, `**negrito**`.

## 3. Botões

- **Abrir link:** precisa começar com `https://` (ou `discord://`).
- **Dar ou tirar cargo:** escolha o cargo e se o botão alterna, só dá ou só tira. A Pyxie precisa de **Gerenciar Cargos** e o cargo precisa estar abaixo do cargo dela.
- **Abrir formulário:** até 5 perguntas; as respostas chegam como embed no canal escolhido, sem marcar ninguém.
- **Trocar de aba:** mostra outra aba da mensagem, para todo mundo ou só para quem clicou.
- **Alternar marcação silenciosa:** a pessoa passa a aparecer em negrito, sem ping, nos anúncios.

## 4. Enviar

- Escolha o canal e toque em **Enviar no canal**. O envio usa a versão salva.
- **Atualizar enviadas** troca o conteúdo das mensagens que já estão no Discord pela versão salva. O Discord não deixa trocar o formato (clássico ↔ novo) de uma mensagem já enviada.
- **Enviar sem notificar ninguém** manda como mensagem silenciosa.

## 5. Envio automático

- **Agendar um envio:** data e hora no horário do seu aparelho. Sai uma vez só.
- **Repetir:** a cada X horas, mas só se o canal teve o número mínimo de mensagens de pessoas desde o último envio.
- **Fixar no fim do canal:** quando a conversa acalma, a Pyxie apaga a cópia antiga e manda a mensagem de novo no fim, sempre sem notificar.
- **Puxar o texto de um tópico de fórum:** a Pyxie usa a última mensagem de uma pessoa naquele tópico. Bom para textos que a staff edita no próprio Discord.
- **Nome e foto próprios:** a Pyxie cria um webhook dela no canal (precisa de **Gerenciar Webhooks**). Os botões continuam funcionando.

## 6. Histórico

Cada vez que você salva, a versão anterior vai para **Versões anteriores** (até 10). **Restaurar** volta a versão escolhida.

## 7. Só na Cringelândia

- **DM de parceria aprovada:** em **Ferramentas**, informe o tópico do fórum onde você escreve o texto de boas-vindas aos parceiros. Ao aprovar uma parceria, a Pyxie copia a sua última mensagem do tópico e manda por DM; depois ela conta se deu certo, se não achou o texto ou se a DM do parceiro está fechada.
- **Prévia na homologação:** só o dono da Pyxie manda prévias para o canal de homologação da staff.
