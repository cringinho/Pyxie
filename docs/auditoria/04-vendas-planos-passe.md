# 04. Páginas de venda: planos, passe, mercado, Cringelândia

> Nota da área: 5/10 · O layout aguenta bem celular e PC, e os preços batem em todo lugar. Mas há falhas que custam dinheiro e confiança: o extra de R$ 3 promete o status da loja e não entrega, quem assina no cartão volta para a página errada, o QR do Pix vale 3h30 em vez de 30 min, e a Cringelândia infla o contador de "pessoas ajudadas" com cliques da Shopee.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q061 | Cards de /planos cabem em 360/768/1280 px | ✅ OK | info |
| Q062 | Carrossel da Cringelândia, /passe e /mercado legíveis no celular | 🟡 PARCIAL | baixa |
| Q063 | /planos mostra o que o grátis já tem | 🔴 PROBLEMA | média |
| Q064 | Estúdio de Loja entrega o "status da loja" | 🔴 PROBLEMA | alta |
| Q065 | Assinatura no cartão volta para tela de confirmação | 🔴 PROBLEMA | alta |
| Q066 | QR do Pix vence em 30 minutos | 🔴 PROBLEMA | média |
| Q067 | Reembolso e cancelamento dos planos aparecem antes de pagar | 🔴 PROBLEMA | média |
| Q068 | Mesmo canal de suporte em /planos, /passe e Termos | 🔴 PROBLEMA | média |
| Q069 | Preços batem entre PT, EN, JSON-LD, Termos e cobrança | ✅ OK | info |
| Q070 | /planos em inglês diz o mesmo que em português | ✅ OK | info |
| Q071 | /en/pass e /en/market aparecem em inglês | 🔴 PROBLEMA | média |
| Q072 | Preço do Passe aparece mesmo se a API falhar | 🔴 PROBLEMA | baixa |
| Q073 | "Média 7 dias" e aviso de vazio do /mercado estão certos | 🔴 PROBLEMA | média |
| Q074 | /passe e /mercado têm caminho de volta para o site | 🔴 PROBLEMA | baixa |
| Q075 | Ranking "Quem apoia a Pyxie" mostra nome e valor certo | 🔴 PROBLEMA | média |
| Q076 | "Bot 100% gratuito" combina com as páginas de venda | 🔴 PROBLEMA | média |
| Q077 | Cards da Shopee mostram foto, link e preço reais | 🔴 PROBLEMA | média |
| Q078 | Contador "já ajudou X pessoas" conta só canais de ajuda | 🔴 PROBLEMA | alta |
| Q079 | /planos tem ícone, imagem e fontes da marca | 🟡 PARCIAL | baixa |
| Q080 | Botão de idioma fácil de tocar e com nome para leitor de tela | 🟡 PARCIAL | baixa |

---

### Q061 — Os cards de preço de /planos (Básico, Premium e Estúdio de Loja) cabem na tela em 360, 768 e 1280 px sem rolagem lateral e com botões fáceis de tocar?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `public/planos.html:40` `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`. Medição Playwright do auditor: largura da página = largura da tela em 360/768/1280, botão mais baixo com 48px. Captura `/tmp/aud-vendas-planos-passe/planos.html-360.png`: o primeiro preço só aparece perto do fim da primeira tela.
**Achado:** No celular os cards empilham; no PC ficam lado a lado. Nada corta e os botões "Assinar no painel" têm bom tamanho. Ponto fraco: o parágrafo de abertura é longo e empurra o primeiro preço para baixo.
**Recomendação:** Manter o layout. Encurtar o parágrafo de abertura para 2 linhas, assim o preço aparece antes no celular.
**Revisão:** Confirmado por amostragem (CSS e captura conferem).

### Q062 — O carrossel de achadinhos da Cringelândia e as páginas /passe e /mercado ficam legíveis no celular?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/cringelandia.html:745` `.product-tag` e `public/cringelandia.html:792` `.product-btn` com `font-size: 11px`. Medição do auditor: nenhuma das 3 páginas tem rolagem lateral.
**Achado:** Nenhuma página corta para o lado. Mas a etiqueta e o botão "Ver na Shopee" dos cards usam letra de 11px, difícil de ler no celular.
**Recomendação:** Subir etiquetas e botões dos cards para pelo menos 13px.
**Revisão:** Confirmado. O CSS dos cards tem 11px; não há regra de celular que aumente.

### Q063 — A página /planos mostra o que o servidor grátis já tem, para o cliente entender o ganho real do Básico?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/config/planFeatures.js:33` `periodicMessages: { free: 1, basic: 1, founder: 4, premium: 10 }`; `public/planos.html:99` `<li>1 mensagem cíclica (o Estúdio repete sozinho no canal)</li>`; `src/routes/dashboardRoutes.js:1202` comentário "Free e Básico 1".
**Achado:** O Básico vende "1 mensagem cíclica" como vantagem, mas o grátis já tem 1. O cliente paga achando que ganha algo que já tinha. Também não há coluna "Grátis" para comparar.
**Recomendação:** Adicionar uma coluna "Grátis" (tabela Grátis x Básico x Premium). Tirar "1 mensagem cíclica" da lista do Básico ou subir o limite do Básico (ex.: 3).
**Revisão:** Confirmado. O limite é aplicado de verdade no servidor (`dashboardRoutes.js:520-531`) com o mesmo número para grátis e Básico.

### Q064 — O Estúdio de Loja (extra de R$ 3) entrega mesmo o "status da loja" que a página promete?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `public/planos.html:133` `Preço do 1k de Robux, chave e nome do Pix e status da loja`; `src/config/planAddons.js` descrição do extra começa com "Status da loja"; `src/routes/dashboardRoutes.js:603-607` mudar `statusLoja` chama `planGate(req, 'storeStatus')` e devolve 403 `plan_required`; `src/config/planFeatures.js:22` `storeStatus` com `plan: 'premium'`.
**Achado:** Quem está no grátis ou no Básico e compra o extra de R$ 3 não consegue trocar o status da loja (online, fila, fechada): o painel recusa e pede Premium. A mesma página ainda diz no card do Básico "Status da lojinha fica no Premium" (`planos.html:102`), então ela se contradiz.
**Recomendação:** Escolher um lado: ou o extra libera o status da loja (o servidor aceita quem tem o extra), ou tirar "status da loja" do card do Estúdio e da descrição em `planAddons.js`, escrevendo "status da loja só no Premium".
**Revisão:** Confirmado. Procurei outro caminho para o cliente mudar o status: o botão rápido do Discord (`src/modules/mary-studio/index.js:31-42`) só funciona para usuários autorizados da equipe, não para clientes.

### Q065 — Depois de assinar um plano no cartão, o cliente volta para uma tela que confirma a assinatura?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `src/services/planPayments.js:176` `` back_url: `${publicUrl()}/passe?status=plan...` ``; `public/passe.html:253` só reconhece `{ ok, pending, fail, cancel }`; sem token a página mostra a mensagem `needToken` ("Para comprar, abra /py-pass...").
**Achado:** Quem paga o plano do servidor no cartão volta para a página do Passe de batalha, sem nenhuma mensagem de "assinatura recebida". A tela ainda manda comprar o Passe. O cliente fica sem saber se deu certo e pode pagar de novo ou pedir estorno.
**Recomendação:** Mudar o retorno do cartão para o painel (aba Planos do servidor) ou para /planos, com a mensagem "Assinatura recebida. O plano ativa quando o pagamento for confirmado".
**Revisão:** Confirmado. Não há tratamento de `status=plan` no servidor nem na página (busca sem resultado).

### Q066 — O QR do Pix do plano expira mesmo em 30 minutos, como a página /planos diz?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/planos.html:149` "QR com validade de 30 minutos"; `src/services/planPayments.js:136` `date_of_expiration: new Date(now + PIX_TTL_MS).toISOString().replace('Z', '-03:00')`; mesmo padrão em `src/services/donations.js:81`.
**Achado:** O código pega a hora em UTC e só troca o rótulo para fuso de Brasília. O Mercado Pago recebe uma validade 3 horas maior: o QR vale cerca de 3h30, não 30 minutos. O painel considera o QR vencido em 30 min (`planPayments.js:153`), mas o banco ainda aceita o pagamento. O cliente pode gerar outro QR e acabar pagando os dois.
**Recomendação:** Enviar a validade em UTC sem trocar o "Z" (ou converter de verdade para -03:00). Testar com um Pix real e conferir o horário de expiração no Mercado Pago.
**Revisão:** Confirmado pela leitura do código. O efeito final no banco não foi testado (sem rede).

### Q067 — A política de reembolso e cancelamento dos planos do servidor e do Estúdio de Loja aparece para o cliente antes de pagar?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** busca por `reembolso|arrepend|refund` em `public/planos.html` e `public/planos.en.html`: 0 resultados; `public/terms.html:763-776` seção 6 fala só do "Passe da Pyxie" (R$ 5). No painel: `client/src/dashboard/i18n.js:513` "Cancelar assinatura" e `:517` "cancele quando quiser".
**Achado:** Cancelar existe no painel, mas reembolso não está escrito em lugar nenhum para planos e extra. Os Termos só falam do Passe. Quem assina no cartão recorrente não tem regra escrita de arrependimento de 7 dias (CDC art. 49) nem do que acontece com o anual.
**Recomendação:** Criar nos Termos uma seção "Planos do servidor e extras" (cancelamento no painel, 7 dias de arrependimento, regra do anual) e um link "Reembolso e cancelamento" logo abaixo dos cards de /planos.
**Revisão:** Rebaixado de alta para média: o painel já tem botão "Cancelar assinatura" e avisa que dá para cancelar quando quiser. Falta a regra de reembolso.

### Q068 — O canal de suporte para dúvidas de pagamento é o mesmo em /planos, /passe e nos Termos?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/planos.html:149` "Suporte único: (e-mail de `SUPPORT_EMAIL`)"; `src/config/support.js:1-3` "Suporte único da Pyxie: um e-mail"; `public/terms.html:775` e `:864` "Dúvidas sobre pagamento: ticket de suporte no servidor oficial". `public/passe.html` não mostra nenhum contato.
**Achado:** Planos e o código dizem que o suporte é só por e-mail; os Termos (PT e EN) mandam abrir ticket no Discord. O /passe não mostra contato. O cliente com problema de pagamento não sabe onde pedir ajuda.
**Recomendação:** Trocar o texto dos Termos (PT e EN) para o e-mail único e mostrar o mesmo e-mail na página /passe.
**Revisão:** Confirmado.

### Q069 — Os preços batem entre página PT, página EN, JSON-LD, Termos e código de cobrança?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `src/services/guildPlans.js:12-13` `PRICES = { basic: 700, premium: 2000 }`, `PRICES_ANNUAL = { basic: 7000, premium: 20000 }`; `src/config/planAddons.js` `priceMonthly: 300`, `priceYearly: 3000`; `src/services/battlePass.js:25` `PRICE = { BRL: 5 }`; JSON-LD em `planos.html:29` e `planos.en.html:29` com 7/70/20/200/3/30; `terms.html:772` "R$ 5".
**Achado:** Todos os preços conferem. O desconto anual (10 meses) está certo nos três produtos.
**Recomendação:** Nada urgente. No futuro, gerar os preços da página a partir de `guildPlans`/`planAddons` para não saírem de sincronia.
**Revisão:** Confirmado por amostragem (conferi os 6 preços do JSON-LD nas duas línguas).

### Q070 — A versão em inglês de /planos diz as mesmas coisas que a versão em português, inclusive na prévia de compartilhamento?
**Veredito:** ✅ OK
**Severidade:** info
**Evidência:** `public/planos.en.html:17` e `:26` têm descrição antiga ("/py-daily bonus, custom colors"). Mas `src/utils/seoRenderer.js:396-399` troca `og:description` e `twitter:description` pela versão do `SEO_CONFIG.plans.en.ogDesc` (`seoRenderer.js:79`: "full Pyxie profile, cyclic messages per plan, store status and the AI Oracle").
**Achado:** O texto da página é igual nas duas línguas. A prévia ao colar o link em inglês sai certa, porque o servidor reescreve essas tags antes de enviar.
**Recomendação:** Só limpeza: atualizar o texto parado no arquivo `planos.en.html` para ninguém se confundir ao editar.
**Revisão:** Rebaixado de PARCIAL/baixa para OK: o servidor já corrige a prévia em inglês.

### Q071 — Ao abrir /en/pass ou /en/market, a página aparece em inglês para qualquer visitante?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/utils/seoRenderer.js:372-375` idioma vem do caminho `/en/`; `seoRenderer.js:412-423` `?lang=` vira 301 e tira o `lang` da URL. Mas `public/passe.html:222` e `public/mercado.html:123` `let lang = params.get('lang') || (navigator.language ... 'pt' : 'en')`, e `passe.html:250` reescreve `document.documentElement.lang`. Captura `/tmp/aud-vendas-planos-passe/passe.html-360.png` (navegador em inglês) mostra a página PT em inglês.
**Achado:** O servidor marca a página como inglês, mas o script ignora o `/en` e usa o idioma do navegador. Quem tem navegador em português e abre /en/pass vê tudo em português, e vice-versa. Os links de retorno do pagamento com `?lang=en` também perdem o idioma no redirecionamento.
**Recomendação:** Fazer o script de /passe e /mercado ler o idioma do caminho (`/en/`) ou do `lang` da página antes de olhar o navegador.
**Revisão:** Confirmado. `passe.html` e `mercado.html` não têm arquivo EN separado (`SEO_CONFIG.pass`/`market` sem `fileEn`), então o script decide sozinho.

### Q072 — O preço do Passe Premium aparece na página /passe mesmo se o servidor demorar ou falhar?
**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** `public/passe.html:122` `<p id="price" class="muted">…</p>`, preenchido só por `/api/pass/info` (`passe.html:261`); no erro (`passe.html:289`) mostra `dict.error` "Não consegui abrir o pagamento agora". Captura `passe.html-360.png`: subtítulo, nível 50 e preço em "…" e o aviso de checkout.
**Achado:** O preço de R$ 5 não está escrito na página. Se a API falha, o cliente vê reticências no lugar do preço e uma mensagem errada ("não consegui abrir o pagamento") sem ter clicado em pagar.
**Recomendação:** Escrever "R$ 5" e o texto do nível 50 direto no HTML (a API só atualiza). Usar uma mensagem própria: "Não consegui carregar os dados do Passe agora".
**Revisão:** Rebaixado de média para baixa: só acontece quando a API cai, e a descrição do Google (`seoRenderer.js` `pass.pt.description`) já mostra "R$ 5".

### Q073 — Os números do /mercado ("Média 7 dias" e o aviso de vazio) mostram o que dizem?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/mercado.html:119` `avg: 'Média 7 dias'`; `server.js:645` `market.topTraded({ days: 30, limit: 24 })`; `src/services/market.js:321` `priceSummary(key, { days, now })` recebe os 30 dias. Erro: `mercado.html:155-156` mostra `dict.empty` "Ainda não teve venda no mercado".
**Achado:** A "Média 7 dias" é na verdade a média de 30 dias. O jogador decide o preço com um número errado. E se a API cair, a página diz "ainda não teve venda", parecendo mercado morto em vez de falha.
**Recomendação:** Calcular a média com `days: 7` (ou trocar o rótulo e o SEO para "Média 30 dias"). Criar uma mensagem de erro própria: "Não consegui carregar os preços agora".
**Revisão:** Confirmado.

### Q074 — Quem chega em /passe ou /mercado consegue voltar ao site, ver os planos ou outras páginas?
**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa
**Evidência:** contagem de `<a `: `public/mercado.html` = 0; `public/passe.html` = 1 (`passe.html:142`, só /termos). `public/cringelandia.html` tem link para "/" (`:1661`, `:2484`) mas nenhum para /planos ou /passe.
**Achado:** O /mercado não tem nenhum link e o /passe só leva aos Termos. Quem chega pelo Google fica sem caminho para a home, os planos ou o bot.
**Recomendação:** Colocar um rodapé igual ao de /planos (Home, Planos, Passe, Mercado, Termos, Privacidade) e um botão "Adicionar a Pyxie" no topo.
**Revisão:** Confirmado.

### Q075 — O ranking "Quem apoia a Pyxie" em /planos mostra nome e valor de forma correta e segura?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `src/services/donations.js:144` `label: entry.anonymous ? null : entry.name || entry.userId`; `donations.js:175` `return applyDonation(payment);` sem nome (é a única chamada); `planos.html:175` `innerHTML = ... row.label ... 'R$ ' + Number(row.amount).toFixed(2)`.
**Achado:** O nome de quem doa nunca é salvo, então o ranking público mostra o número de ID do Discord da pessoa em vez do nome. O valor sai como "R$ 10.00" (ponto em vez de vírgula). A lista é montada com innerHTML: se um dia o nome for salvo, um apelido malicioso pode injetar código.
**Recomendação:** Guardar o apelido na doação e mostrar o apelido (ou "Apoiador"). Formatar com `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`. Montar a lista com `textContent`.
**Revisão:** Confirmado. Hoje o risco de injeção é baixo (o rótulo é só número), mas o ID exposto e o valor mal formatado já acontecem.

### Q076 — A Cringelândia diz que o bot é "100% gratuito". Isso combina com as páginas de venda?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/cringelandia.html:1755` e `:2520` "viabiliza o funcionamento 100% gratuito do bot"; `:2611` "powers our 100% free bot"; `public/planos.html:95,108` Básico R$ 7 e Premium R$ 20; Passe R$ 5 em `passe.html`.
**Achado:** A comunidade diz que o bot é 100% grátis e que só a vitrine da Shopee paga as contas, enquanto o site vende planos, Passe e extra. Quem compara as páginas perde confiança.
**Recomendação:** Trocar por "O essencial da Pyxie é grátis; planos e Passe são opcionais e ajudam a manter o projeto" (PT e EN), com link para /planos.
**Revisão:** Confirmado. Tirei do achado a parte "conflita com 'sem vantagem no jogo'": essa frase em /planos (`planos.html:157`) fala só de doação, não dos planos.

### Q077 — Os cards de produto da vitrine da Shopee na Cringelândia mostram foto, link e preço reais do produto?
**Veredito:** 🔴 PROBLEMA
**Severidade:** média
**Evidência:** `public/cringelandia.html:1773-1823` 4 cards fixos com `/assets/pyxie/pyxie_mascot.png` ou `pyxie_pixelart_face.png` e alt "Abafador de Ruído...", "Luminária Projetora..."; 3 dos 4 links iguais (`s.shopee.com.br/BU6Bod6Sw`); preços fixos "R$ 54,90", "R$ 68,00". Os cards só são trocados se `/api/showcase` devolver itens (`cringelandia.html` função `loadShopeeShowcase`), e itens sem imagem também caem na mascote.
**Achado:** Enquanto a página carrega, quando a API falha ou quando a vitrine está vazia, aparecem 4 "produtos" com a foto da mascote. Abafador, luminária e pelúcia levam ao mesmo link. Os preços estão escritos à mão e podem estar velhos.
**Recomendação:** Não mostrar cards fixos (esconder o carrossel até a API responder) ou usar foto e link reais de cada item. Tirar os preços fixos. Deixar claro "links de afiliado: a Pyxie recebe comissão".
**Revisão:** Rebaixado de alta para média: só aparece quando a vitrine da API não carrega, e o balão da Pyxie (`cringelandia.html:1755`) já diz que o carrossel ajuda a pagar o projeto, o que é um aviso parcial de afiliado.

### Q078 — O contador "A Cringelândia já ajudou X pessoas" conta só cliques em canais de ajuda, como o texto promete?
**Veredito:** 🔴 PROBLEMA
**Severidade:** alta
**Evidência:** `public/cringelandia.html:1742` "ajudou ... pessoas através de nossos links de autoajuda e ONGs" e `impact.desc` "Cada clique em telefones de crise, órgãos públicos..."; cards da Shopee com `onclick="trackClick(this.href)"` (`:1773`, `:1787`, `:1801`, `:1815` e no HTML montado pela API); `trackClick` soma +1 e chama `/api/cringelandia/track-help-click`; `src/services/cringelandiaService.js:56-68` soma +1 por clique (só 5 s de espera por IP); valor inicial fixo `currentHelpedCount = 1420`.
**Achado:** Clicar num produto da Shopee soma +1 em "pessoas ajudadas". O número de impacto social cresce com cliques de compra, e conta cliques, não pessoas (a mesma pessoa conta de novo a cada 5 segundos). Isso engana visitantes e apoiadores numa comunidade de acolhimento.
**Recomendação:** Tirar `trackClick` dos cards da Shopee (contar vendas em outro lugar). Contar pessoas únicas por dia, não cliques. Mostrar "–" até a API responder em vez de 1.420.
**Revisão:** Confirmado e reforçado: o servidor não separa tipo de clique, só limita por 5 s.

### Q079 — A página /planos tem ícone de aba, imagem ou fontes da marca como as outras páginas de venda?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/planos.html` e `planos.en.html`: 0 `rel="icon"`, 0 `<img`, nenhum carregamento de fonte; CSS usa `'Outfit'` (`:34`) e `'Cinzel'` (`:38`, `:49`). `public/favicon.ico` existe e é servido por `express.static` (`server.js:407`). Captura `planos.html-360.png`: título em serifada genérica.
**Achado:** O ícone da aba aparece mesmo assim (o navegador busca /favicon.ico sozinho). Mas a página que mais vende não tem nenhuma imagem da Pyxie e as fontes da marca não carregam: o título sai numa fonte padrão do sistema. Parece menos cuidada que o Passe.
**Recomendação:** Carregar Outfit e Cinzel (ou trocar por fontes do sistema), colocar a Pyxie no topo e ícones simples em cada card. Copiar as linhas de favicon do /passe para ter o ícone em alta resolução no celular.
**Revisão:** Mantido PARCIAL/baixa, mas corrigido: a parte "sem ícone na aba" foi refutada pelo `favicon.ico` na raiz.

### Q080 — Os botões de idioma de /passe e /mercado e o botão de pagar são fáceis de tocar e de entender para leitor de tela?
**Veredito:** 🟡 PARCIAL
**Severidade:** baixa
**Evidência:** `public/passe.html:71` `.lang { ... padding: 8px 12px }`; `public/passe.html:110` e `public/mercado.html:104` `<button class="lang" id="langBtn" type="button">EN</button>` sem `aria-label`. Medição do auditor: 33px de altura.
**Achado:** O botão de idioma tem cerca de 33px de altura, abaixo dos 44px recomendados para o dedo, e o leitor de tela só lê "EN", sem dizer que troca o idioma. O botão de pagar está em bom tamanho.
**Recomendação:** Aumentar o botão de idioma para 44px de altura e adicionar `aria-label` "Mudar idioma para inglês" / "Switch to Portuguese".
**Revisão:** Confirmado.
