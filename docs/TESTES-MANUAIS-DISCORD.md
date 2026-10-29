# Testes manuais no Discord (depois do deploy das etapas 0 a 5)

O teste automático `node scripts/smoke_all_commands.js` já roda todos os 59 comandos em PT e EN com uma interação simulada. Esta lista cobre o que só dá para conferir no Discord de verdade. Marque cada item e anote o que estranhar.

## 0. Antes de tudo (na VM)

- [ ] `PANEL_SECRET` e `DISCORD_CLIENT_SECRET` no `.env` (`cut -d= -f1 .env` mostra os nomes).
- [ ] `https://pyxie.com.br/auth/discord/callback` cadastrado em Developer Portal → OAuth2 → Redirects.
- [ ] `./deploy.sh` rodou e o log mostra um registro de slash commands para a Cringelândia e outro para o servidor da Mary.

## 1. Painel novo (`/dashboard`)

- [ ] Entrar com Discord pelo celular e pelo PC.
- [ ] Você vê "Pyxie (global)" e todos os servidores; Saúde, Erros e Módulos mostram números reais.
- [ ] Na Cringelândia: aba **Ferramentas** abre Sazonal, Parcerias e o painel antigo sem pedir senha.
- [ ] Peça para alguém que é admin de outro servidor (e não da Cringelândia) entrar: essa pessoa **não** vê a Cringelândia nem o servidor da Mary.
- [ ] A Mary entra e vê o servidor dela, com Lojinha, Ferramentas Robux e Aparência da Pyxie no menu. O `py!mary` manda o link do painel na DM.
- [ ] `/admin` antigo: só Shopee, Emojis, Módulos e Museu.

## 2. Estúdio de mensagens

- [ ] Criar uma mensagem clássica com botão de cargo e mandar num canal de teste; clicar no botão (dá e tira o cargo).
- [ ] Criar uma no **Formato novo** com seção + botão ao lado e galeria; mandar.
- [ ] Botão de formulário: responder e ver o embed chegar no canal escolhido.
- [ ] Botão de aba (privada e pública).
- [ ] Editar e usar **Atualizar enviadas**.
- [ ] Agendar para daqui a 5 minutos; conferir que saiu uma vez só.
- [ ] Fixar no fim de um canal movimentado; conferir que volta para o fim sem notificar.
- [ ] Enviar com nome e foto próprios (webhook); botões continuam funcionando.

## 3. Economia e utilitários (em outro servidor e na Cringelândia)

- [ ] `/py-daily` nos dois: moedinhas nos dois; XP do Passe só na Cringelândia (`/py-pass`).
- [ ] `/py-work` nos dois: materiais e Fagulhas só aparecem no turno feito na Cringelândia.
- [ ] `/py-help` e o catálogo do site: Catacumbas, Casinha, Oficina, Mercado, Festival, Passe e chefe aparecem com "Exclusivo da Cringelândia"; nada da Mary aparece.
- [ ] `/py-setup` em outro servidor: sem seção "Mundo Pyxie", sem teste de 7 dias.

## 4. Místico e social

- [ ] `/py-tarot` e `/py-album` no servidor e instalados na conta (DM).
- [ ] `/py-marriage`, `/py-ship`, `/py-profile`.

## 5. Comunidade (Cringelândia)

- [ ] Sazonal: num anúncio de premiados, clicar em **Marcação silenciosa**; no próximo anúncio seu nome vem em negrito e você não recebe ping.
- [ ] Parcerias: configurar o tópico do fórum em Ferramentas → **DM de parceria aprovada**, aprovar uma parceria de teste e receber o retorno ("mandei", "não achei" ou "DM fechada").
- [ ] `/py-dungeon`, `/py-boss`, `/py-home`, `/py-craft`, `/py-market`, `/py-festival`, `/py-pass` funcionam na Cringelândia e não aparecem em outros servidores.
- [ ] `/py-character` sumiu (roleplay removido). As fichas antigas foram para `data/_arquivados/` na VM.
