# Auditoria geral do Pyxie: 300 perguntas

**Data:** 2026-11-05
**Escopo:** site público, páginas de venda, painel (`/dashboard`), embeds e imagens do bot no Discord, textos PT/EN, SEO, pagamentos, segurança e economia.
**Foco principal:** layout, imagens, ícones, responsividade, informatividade, coerência, utilidade e viabilidade. Também campos, lógica, segurança e pagamentos.

## Como foi feito

- 15 áreas, 20 perguntas por área, 300 no total.
- Cada resposta tem evidência concreta: arquivo e linha do código, ou uma medição. Sem evidência, a resposta seria `NAO_VERIFICAVEL` (nenhuma ficou assim).
- Medições de layout com navegador em 360px (celular), 768px (tablet) e 1280px (computador), onde fazia sentido.
- Depois, uma segunda leitura cética reabriu o código de cada item. Ela confirmou, corrigiu linhas e rebaixou a severidade quando o efeito era menor que o descrito.
- O bot e o servidor não foram rodados (sem acesso ao Discord nem ao banco). Nenhum segredo aparece neste relatório.

## Placar geral

| Veredito | Quantidade | % |
|---|---:|---:|
| ✅ OK | 34 | 11% |
| 🟡 PARCIAL | 99 | 33% |
| 🔴 PROBLEMA | 167 | 56% |
| ⚪ NAO_VERIFICAVEL | 0 | 0% |
| **Total** | **300** | 100% |

| Severidade | Quantidade |
|---|---:|
| Crítica | 5 |
| Alta | 35 |
| Média | 132 |
| Baixa | 93 |
| Info (inclui os 34 OK) | 35 |

**Duplicatas filtradas.** Algumas falhas foram achadas por mais de uma área (por exemplo, o mesmo botão de cancelar plano em "Painel: gestão" e em "Pagamentos"). Contando cada falha uma vez só, os 266 itens PARCIAL/PROBLEMA viram **239 pontos distintos**. A tabela de duplicatas está no fim deste arquivo.

## Notas por área

| # | Área | Nota (0-10) | OK | Parcial | Problema | Resumo curto |
|---|---|---:|---:|---:|---:|---|
| 01 | [Site: Home, menu, rodapé](01-site-home.md) | 5 | 2 | 6 | 12 | Não escorrega no celular, mas mostra artistas, selos e comandos inventados e expõe IDs do Discord em `/api/stats`. |
| 02 | [Páginas institucionais](02-paginas-institucionais.md) | 4 | 0 | 5 | 15 | Código injetável em `/u/`, comando errado para apagar dados, cookies sem consentimento, menu que estoura no celular. |
| 03 | [Wiki e catálogo de comandos](03-wiki-comandos.md) | 4 | 0 | 6 | 14 | Cards sem descrição e filtros sem nome por causa de nomes de campo trocados; números e comandos fixos errados. |
| 04 | [Vendas, Planos, Passe, Cringelândia](04-vendas-planos-passe.md) | 5 | 3 | 3 | 14 | Preços certos, mas extra de R$ 3 promete o que o painel recusa e o cartão volta para a página errada. |
| 05 | [Páginas especiais (Bônus, Museu, Perfil, widget)](05-paginas-especiais.md) | 4 | 1 | 4 | 15 | Código injetável no Museu e em `/u/`; bônus sem retorno claro; widget bloqueado pelo próprio servidor. |
| 06 | [Painel: estrutura](06-painel-estrutura.md) | 5 | 1 | 9 | 10 | Boa base, mas lista de servidores estoura no celular, "7 dias" mostra 30 e cadeados que a compra não abre. |
| 07 | [Painel: conteúdo](07-painel-conteudo.md) | 5 | 1 | 5 | 14 | Preço vazio vira R$ 1,00, entrega por link sem campo de link, troca de emoji vaza da tela. |
| 08 | [Painel: gestão](08-painel-gestao.md) | 5 | 0 | 8 | 12 | Ações de um clique sem confirmação; regras de moderação invisíveis; canal de log que nada usa. |
| 09 | [Imagens, ícones, arquivos](09-imagens-icones-assets.md) | 6 | 1 | 8 | 11 | Nada quebra, mas tudo pesa demais: logos de 135 KB, SVG de 311 KB, fontes repetidas. |
| 10 | [Embeds e imagens no Discord](10-discord-embeds-imagens.md) | 6 | 3 | 14 | 3 | Catacumbas são o modelo; Galeria de Títulos quebra com 25+ opções; Hyperfokus cortado no celular. |
| 11 | [Textos e idiomas](11-textos-i18n.md) | 5,5 | 2 | 9 | 9 | Crise em inglês só dá o CVV brasileiro; formulários só em PT; códigos técnicos na tela de pagamento. |
| 12 | [SEO, acessibilidade, desempenho](12-seo-a11y-performance.md) | 4,5 | 4 | 5 | 11 | Base técnica boa; idioma ignora `/en/`, prévias de link erradas, código injetável no Museu. |
| 13 | [Pagamentos](13-pagamentos.md) | 4 | 2 | 5 | 13 | Valor sempre conferido no servidor, mas cartão libera plano em dobro e doações Pix não chegam ao ranking. |
| 14 | [Segurança](14-seguranca.md) | 5 | 8 | 5 | 7 | Painel novo bem protegido; "Esqueci a senha" entrega a conta de qualquer pessoa. |
| 15 | [Lógica e economia](15-logica-economia.md) | 6 | 6 | 7 | 7 | Diário, mercado e duelos protegidos; Date Night e Jokenpô criam moedas do nada. |

**Média geral: 4,9.**

## O que já está bom

- Preços batem em todas as páginas, e o valor cobrado é sempre conferido no servidor ([13](13-pagamentos.md)).
- A Home não rola para o lado e o botão principal aparece na primeira tela do celular (Q001, Q012).
- O painel novo confere o login do Discord e a permissão em cada servidor a cada pedido (Q264).
- As páginas das 78 cartas do Tarot e o embed das Catacumbas servem de modelo ([12](12-seo-a11y-performance.md), [10](10-discord-embeds-imagens.md)).
- Compressão, cache e sitemap estão configurados.

## Corrigir primeiro (top 15)

Itens críticos e altos, sem repetir a mesma falha. Entre parênteses, os IDs duplicados que a mesma correção resolve.

| # | ID | Sev. | O que o usuário sofre | Correção em uma linha |
|---|---|---|---|---|
| 1 | [Q261](14-seguranca.md) | crítica | Qualquer pessoa digita o e-mail de outra, recebe o código na tela e rouba a conta. | Tirar o código da resposta, enviar só por e-mail e derrubar as sessões ao trocar a senha. |
| 2 | [Q033](02-paginas-institucionais.md) (+Q099, Q221) | crítica | Um link `/u/...` montado roda código no site; se a vítima estiver logada no painel, o código age como ela. | Aceitar só ID numérico em `/u/` (404 no resto) e escapar todo texto antes de pôr no HTML. |
| 3 | [Q222](12-seo-a11y-performance.md) (+Q099) | crítica | Um membro posta uma obra com texto malicioso e o código roda para todo visitante daquela obra. | Escapar título, descrição e autor do Museu no HTML do servidor. |
| 4 | [Q143](08-painel-gestao.md) (+Q252) | crítica | Um clique em "Cancelar" apaga na hora os meses já pagos e até o plano vitalício. | Pedir confirmação, cancelar só a renovação e manter o plano até o fim do prazo pago; bloquear em vitalício. |
| 5 | [Q241](13-pagamentos.md) | alta | Quem assina no cartão ganha cerca de 2 meses pagando 1 (a Pyxie perde receita). | Liberar tempo só quando chega uma cobrança aprovada e conferir valor e moeda. |
| 6 | [Q242](13-pagamentos.md) | alta | Qualquer admin do servidor, não só o dono, cancela o plano pago; dá para cancelar o de outro servidor. | Deixar o cancelamento só para o dono e usar só a assinatura guardada daquele servidor. |
| 7 | [Q263](14-seguranca.md) | alta | Um site malicioso aberto pelo dono em casa pode disparar drops, apagar parcerias ou editar emojis sem login. | Tirar a liberação por IP e exigir login do painel nas rotas antigas do dono. |
| 8 | [Q020](01-site-home.md) | alta | `/api/stats` entrega para qualquer um os IDs do Discord de quem fala com a Pyxie (risco LGPD). | Devolver só números agregados, como a contagem `uniqueUsersCount`. |
| 9 | [Q210](11-textos-i18n.md) | alta | Quem fala inglês em crise recebe só o CVV brasileiro, sem contato útil no país dele. | No texto EN, pôr primeiro findahelpline.com e "ligue para a emergência local"; manter o CVV para o Brasil. |
| 10 | [Q283](15-logica-economia.md) e [Q281](15-logica-economia.md) | alta | No Jokenpô o vencedor recebe mesmo se o perdedor não tem saldo; no Date Night o casal abre vários encontros e recebe várias vezes. | Reter a aposta no aceite; no Date Night, um encontro aberto por casal e cooldown marcado na abertura. |
| 11 | [Q144](08-painel-gestao.md) (+Q251) | alta | O navegador bloqueia o pop-up do cartão e a tela não mostra nada: parece que o botão não funciona e a venda se perde. | Mostrar sempre o botão "Ir para o pagamento" na tela; o pop-up vira só atalho. |
| 12 | [Q065](04-vendas-planos-passe.md) (+Q254) | alta | Quem paga o plano no cartão volta para a página do Passe, sem "assinatura recebida", e pode pagar de novo. | Voltar para a aba Planos do painel com a mensagem de pagamento recebido. |
| 13 | [Q243](13-pagamentos.md) | alta | A pessoa doa por Pix, mas a doação não entra no ranking nem no total. | Mandar o aviso da doação para a rota que trata doações e conferir as pendentes de tempos em tempos. |
| 14 | [Q064](04-vendas-planos-passe.md) | alta | O extra de R$ 3 promete o status da loja, mas o painel recusa e pede Premium. | Escolher um lado: o extra libera o status, ou o texto do extra deixa de prometer. |
| 15 | [Q101](06-painel-estrutura.md) | alta | No celular, um servidor de nome longo deixa todos os cartões com 631px e metade some à direita. | Grade de uma coluna com `minmax(0,1fr)` e `min-w-0`; o nome longo termina em "...". |

Logo depois deste top 15 vêm outros altos que mexem com confiança: Q024 (Privacidade manda usar comando só do dono para apagar dados), Q034 (anúncios e analytics sem consentimento), Q041 e Q042 (Wiki sem descrições e sem nomes de categoria), Q006 (artistas inventados no Museu) e Q078 (cliques da Shopee contados como "pessoas ajudadas").

## Temas recorrentes

1. **Dados inventados ou fixos no lugar do real.** Artistas fictícios, "99.9%", selos "Online" que nunca mudam, cooldown "3 segundos" para todos, prévia de embed com valores falsos, números de vocações e comandos errados. Quebra a regra "zero mock" e a confiança. IDs: Q006, Q091, Q007, Q008, Q225, Q009, Q047, Q048, Q057, Q058, Q078, Q097, Q098.
2. **O rótulo diz uma coisa e entrega outra.** "7 dias" com dados de 30, extra que não libera o prometido, Básico vendendo o que o grátis já tem, QR Pix de "30 min" que vale 3h30, globo 3D que é uma grade, "equipe notificada" que não notifica. IDs: Q064, Q063, Q073, Q104, Q103, Q113, Q066, Q086, Q038, Q076.
3. **Celular estoura em 360px pelo mesmo motivo.** Itens de grade e flex sem `min-w-0` ou `minmax(0,1fr)`, e menus de topo que não quebram linha. A correção é a mesma em todos. IDs: Q021, Q223, Q168, Q101, Q124, Q125, Q149, Q192, Q002, Q128.
4. **Idioma: a URL `/en/` é ignorada e muito texto está fixo em português.** O idioma vem do navegador, não do endereço. Formulários, erros, 404/500 e a Central de Autoajuda ficam só em PT. IDs: Q010, Q224, Q025, Q071, Q237, Q026, Q214, Q060, Q085, Q216, Q213, Q154, Q215, Q210.
5. **Ações destrutivas em um clique.** Cancelar plano, apagar produto, revogar advertência, revogar vaga de fundador, trancar o servidor, remover link e sair do editor sem salvar. IDs: Q143, Q123, Q140, Q146, Q147, Q152, Q157.
6. **Erro que some, "Carregando" eterno ou mensagem técnica.** A pessoa não sabe se deu certo. IDs: Q046, Q087, Q105, Q108, Q111, Q119, Q127, Q129, Q133, Q141, Q142, Q153, Q204, Q257, Q084.
7. **O campo aceita e o servidor muda sem avisar.** Preço vazio vira R$ 1,00, intervalo vazio vira 2h, textos cortados, `http` apagado, só o primeiro cargo salvo. IDs: Q121, Q122, Q126, Q128, Q129, Q130, Q137, Q136, Q180.
8. **HTML montado com texto sem escape.** É a origem dos três itens críticos de injeção e de dois riscos futuros. IDs: Q033, Q099, Q221, Q222, Q206, Q269.
9. **Peso das imagens e fontes.** Logos de 36px que custam 135 KB, SVG de 311 KB, banner de 552 KB, GIF de 2,5 MB, mesma fonte baixada com nomes diferentes, cena 3D baixada no celular sem uso. IDs: Q015, Q164, Q227, Q165, Q163, Q175, Q090, Q228, Q115, Q161.
10. **Código antigo rodando junto do novo.** HTML antigo animando e consultando a API por baixo do React, duas Homes com menus diferentes, rotas antigas do dono liberadas por IP. IDs: Q016, Q017, Q094, Q236, Q263, Q279.
11. **Letra e alvo de toque pequenos demais.** Textos de 9 a 11px e botões de 15 a 24px. IDs: Q019, Q233, Q053, Q062, Q117, Q138, Q220, Q187, Q193.
12. **Moedas sem atomicidade.** Pagamentos feitos antes de cobrar ou travar, ganhos fora do teto diário, arquivos sem backup. IDs: Q281, Q282, Q283, Q284, Q288, Q300.
13. **Dados pessoais e privacidade.** IDs do Discord em APIs e no ranking de doações, cookies sem consentimento, caminho errado para apagar dados. IDs: Q020, Q075, Q205, Q244, Q034, Q024.

## Plano em 3 ondas

### Onda 1: agora (dinheiro, contas, crise e dados pessoais)

- **Segurança:** Q261, Q262, Q033 (+Q099, Q221), Q222, Q263, Q100, Q020, Q267.
- **Pagamentos:** Q143 (+Q252), Q241, Q242, Q243, Q144 (+Q251), Q065 (+Q254), Q064, Q253, Q066 (+Q203, Q249).
- **Economia:** Q281, Q282, Q283.
- **Crise e privacidade:** Q210, Q211, Q024, Q034.

### Onda 2: próximas semanas (layout, informação e coerência)

- **Celular estourando:** Q021 (+Q223, Q168), Q101, Q124, Q125, Q149, Q192, Q183, Q002, Q004, Q022, Q082, Q128.
- **Trocar dado falso por real ou por estado vazio honesto:** Q006 (+Q091), Q007 (+Q008, Q225), Q009, Q047, Q048, Q057, Q058, Q078, Q076, Q086, Q098, Q097 (+Q277), Q073, Q104, Q103, Q113, Q063 (+Q201).
- **Wiki e catálogo:** Q041, Q042, Q043, Q044, Q046, Q049, Q050.
- **Idioma:** Q010 (+Q224), Q025, Q071, Q237, Q026 (+Q214), Q060, Q085, Q216, Q213, Q154, Q159, Q212.
- **Retorno e erros no painel e no site:** Q105, Q108, Q111, Q118, Q119, Q127, Q133, Q204 (+Q257), Q083, Q084, Q087, Q088.
- **Campos e confirmações no painel:** Q121, Q122, Q123, Q126, Q129, Q130, Q135, Q136, Q140, Q141, Q142, Q146, Q147, Q148, Q152, Q156, Q157.
- **Textos legais e contato:** Q013, Q029, Q030 (+Q068), Q031, Q032, Q035, Q036, Q067.
- **Pagamentos (informação):** Q075 (+Q205, Q244), Q245, Q246, Q250, Q255, Q092, Q077 (+Q167, Q208).
- **Lógica da economia:** Q284, Q288, Q290, Q291, Q292, Q296.
- **Segurança média:** Q268, Q271, Q272.
- **Páginas duplicadas e scripts antigos:** Q016, Q017, Q094, Q236, Q095, Q096.
- **Navegação do site:** Q005 (links /#pilares e /#comandos caem no lugar errado).
- **Contraste e Discord:** Q232, Q194.

### Onda 3: quando der (peso, acessibilidade e acabamento)

- **Peso de imagens e fontes:** Q015, Q164 (+Q227), Q165, Q163, Q175, Q174, Q090 (+Q228), Q115, Q161, Q162, Q179, Q173, Q172.
- **Imagens, ícones e prévias de link:** Q226 (+Q178), Q170, Q234, Q171, Q177, Q166, Q180, Q160, Q114, Q134, Q039, Q079, Q014, Q056, Q116, Q158, Q176, Q196, Q200.
- **Letra e toque:** Q019 (+Q233), Q053, Q062, Q117, Q220, Q193, Q187, Q188, Q080, Q102, Q054.
- **Acessibilidade e movimento:** Q018, Q023, Q051, Q052, Q106, Q107, Q138, Q151, Q089.
- **Estilo dos embeds no Discord:** Q181, Q182, Q184, Q185, Q186, Q190, Q195, Q197, Q199, Q217, Q218.
- **Coerência e detalhes:** Q003, Q011, Q027, Q028, Q037 (+Q215), Q038, Q040, Q045, Q055, Q072, Q074, Q093, Q109, Q110, Q112, Q131, Q132, Q137, Q145, Q150, Q153, Q155, Q207, Q209, Q259, Q260, Q293, Q294.
- **SEO:** Q230, Q235, Q238.
- **Técnico e segurança baixa:** Q059, Q206, Q247 (+Q273), Q248, Q269, Q276, Q279, Q298, Q299, Q300.

## Duplicatas filtradas

A mesma falha aparece em mais de um relatório. Corrija pelo ID principal; os outros fecham juntos.

| ID principal | Repetições | Falha |
|---|---|---|
| Q033 | Q099, Q221 | Código injetável em `/u/:userId` |
| Q222 | (Q099 cobre as duas) | Código injetável no Museu |
| Q143 | Q252 | Cancelar plano em um clique apaga dias pagos e vitalício |
| Q144 | Q251 | Cartão some quando o pop-up é bloqueado |
| Q065 | Q254 | Retorno do cartão cai na página do Passe |
| Q021 | Q223, Q168 | Menu das páginas institucionais estoura no celular |
| Q097 | Q277 | Widget bloqueado pelo próprio servidor |
| Q066 | Q203, Q249 | QR Pix vale 3h30 em vez de 30 min |
| Q063 | Q201 | Básico vende mensagem cíclica que o grátis já tem |
| Q075 | Q205, Q244 | Ranking de doação mostra ID do Discord |
| Q006 | Q091 | Artistas inventados na cena 3D do Museu |
| Q007 | Q225 | Selo "99.9%" e "Online" fixos (Q008 é parte do mesmo tema) |
| Q010 | Q224 | Idioma vem do navegador, não de `/en/` |
| Q077 | Q167, Q208 | Cards reserva da Shopee com foto da mascote |
| Q226 | Q178 | og:image em pé declarada como 1200x630 |
| Q164 | Q227 | Logo de 36px que pesa até 138 KB |
| Q090 | Q228 | Cena 3D baixada no celular sem uso |
| Q019 | Q233 | Textos de 9 a 11px no menu |
| Q247 | Q273 | Webhook aceita aviso sem segredo configurado |
| Q037 | Q215 | 404/500 só em português |
| Q026 | Q214 | Termos em inglês com partes em português |
| Q030 | Q068 | E-mails e canais de suporte divergentes |
| Q204 | Q257 | Erro de pagamento mostra código técnico |

São 27 repetições: 266 itens PARCIAL/PROBLEMA, 239 falhas distintas.

## Legenda

**Vereditos**

| Veredito | Significado |
|---|---|
| ✅ OK | Funciona como deveria. Evidência no código ou na medição. |
| 🟡 PARCIAL | Funciona em parte, ou funciona mas confunde, pesa ou cansa. |
| 🔴 PROBLEMA | Não funciona, engana o usuário ou abre risco. |
| ⚪ NAO_VERIFICAVEL | Sem como provar sem rodar o bot ou o banco. Nenhum item ficou assim. |

**Severidades**

| Severidade | Significado | Prazo sugerido |
|---|---|---|
| Crítica | Perda de conta, dinheiro do cliente ou ataque contra quem visita. | Agora |
| Alta | Venda perdida, dado pessoal exposto, informação falsa importante ou tela quebrada no celular. | Esta semana |
| Média | Atrapalha, confunde ou passa informação errada, mas tem contorno. | Próximas semanas |
| Baixa | Acabamento, peso, estilo ou risco futuro. | Quando der |
| Info | Só registro; normalmente acompanha um OK. | — |

Cada relatório de área traz, por pergunta: veredito, severidade, evidência (arquivo:linha), achado (efeito para o usuário), recomendação (o que mudar) e a nota da revisão.
