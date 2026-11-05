# 11. Textos, i18n e coerência de informação

> Nota da área: 5,5/10 · Os preços batem em todo lugar e as páginas não quebram no celular. Os maiores problemas estão nos textos de crise: o Oráculo em inglês só passa o número brasileiro, o "Disque 100" aparece como linha de apoio e a Central de Autoajuda em inglês segue em português. Também há formulários do bot só em português, códigos técnicos de erro na tela de pagamento e um benefício do plano Básico que o plano grátis já tem.

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q201 | Básico vende "1 mensagem cíclica" que o grátis já tem? | 🔴 PROBLEMA | média |
| Q202 | Preços batem entre site, SEO, bot e cobrança? | ✅ OK | info |
| Q203 | QR Pix vence mesmo em 30 minutos? | 🔴 PROBLEMA | média |
| Q204 | Erro na compra do plano é compreensível? | 🔴 PROBLEMA | média |
| Q205 | Ranking de doadores mostra nome e valor em formato BR? | 🔴 PROBLEMA | média |
| Q206 | Ranking de doadores insere texto do servidor sem tratamento? | 🟡 PARCIAL | baixa |
| Q207 | Textos do bot e do painel têm pt/en completos e sem chave repetida? | 🟡 PARCIAL | baixa |
| Q208 | Foto dos achadinhos mostra o produto? | 🟡 PARCIAL | baixa |
| Q209 | Links e preços dos achadinhos estão certos e atualizados? | 🟡 PARCIAL | baixa |
| Q210 | Crise no Oráculo em inglês dá contato útil? | 🔴 PROBLEMA | alta |
| Q211 | Quadro de apoio das regras tem telefones de crise corretos? | 🔴 PROBLEMA | média |
| Q212 | Mensagens de crise usam os mesmos contatos e o mesmo tom? | 🟡 PARCIAL | média |
| Q213 | Central de Autoajuda da /cringelandia aparece em inglês? | 🔴 PROBLEMA | média |
| Q214 | Páginas legais em inglês estão completas? | 🟡 PARCIAL | média |
| Q215 | Página 404/500 aparece em inglês em /en/? | 🔴 PROBLEMA | baixa |
| Q216 | Formulários de sorteio e desabafo mudam de idioma? | 🔴 PROBLEMA | alta |
| Q217 | Textos seguem a voz Kuromi tsundere? | 🟡 PARCIAL | baixa |
| Q218 | Títulos de embeds seguem "título curto com um emoji"? | 🟡 PARCIAL | baixa |
| Q219 | Páginas cabem em 360/768/1280 px sem rolagem lateral? | ✅ OK | info |
| Q220 | Há textos menores que 12px nos cartões e selos? | 🟡 PARCIAL | baixa |

---

### Q201 — A tela /planos e a aba Planos vendem "1 mensagem cíclica" como vantagem do Básico. O grátis já tem essa mensagem?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- `src/config/planFeatures.js:33` `periodicMessages: { free: 1, basic: 1, founder: 4, premium: 10 }`
- `src/routes/dashboardRoutes.js:1202` comentário "Free e Básico 1"; o limite é aplicado em `dashboardRoutes.js:521-532`
- `public/planos.html:90` e `:99` "1 mensagem cíclica"; `client/src/dashboard/i18n.js:509` (`plan.intro`) e `:554` (`plan.perk.basic.2`); `src/utils/seoRenderer.js:70` e `:77` (descrição PT/EN)

**Achado:** O servidor grátis já pode manter 1 mensagem cíclica. O site e o painel apresentam essa mensagem como algo que o Básico libera. Quem paga R$ 7 por isso não ganha nada novo nesse ponto.

**Recomendação:** Escolher um caminho: (a) mudar o grátis para `free: 0`; ou (b) tirar "1 mensagem cíclica" da lista do Básico em planos.html, planos.en.html, seoRenderer.js e nas chaves `plan.intro` e `plan.perk.basic.2` do painel.

**Revisão:** Confirmado. O limite é o mesmo no servidor e não há outra trava que dê mais ao Básico. Rebaixado de alta para média: o texto não é falso (o Básico tem a mensagem), mas a vantagem não existe. As outras vantagens do Básico continuam reais.

---

### Q202 — Os preços batem entre planos.html, planos.en.html, SEO, textos do bot e o código que cobra?

**Veredito:** ✅ OK
**Severidade:** info

**Evidência:**
- `src/services/guildPlans.js:12-13` `PRICES = { basic: 700, premium: 2000 }`, `PRICES_ANNUAL = { basic: 7000, premium: 20000 }`
- `src/config/planAddons.js:17-18` `priceMonthly: 300`, `priceYearly: 3000`
- `src/services/battlePass.js:25` `PRICE = { BRL: 5 }`
- `public/planos.html:95-128` (R$ 7/70, R$ 20/200, R$ 3/30); `src/utils/seoRenderer.js:69-79`

**Achado:** Os valores são os mesmos nas páginas PT e EN, nos dados de SEO e no código que cria a cobrança. O cliente vê o mesmo preço do começo ao fim.

**Recomendação:** Nada a corrigir. Se um preço mudar, atualizar guildPlans.js, planAddons.js, as duas páginas de planos, seoRenderer.js e as chaves do Oráculo que citam preço.

**Revisão:** Confirmado por amostragem (código, página PT e SEO).

---

### Q203 — A página promete "QR com validade de 30 minutos". A cobrança no Mercado Pago vence mesmo em 30 minutos?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- `src/services/planPayments.js:16` `PIX_TTL_MS = 30 * 60 * 1000`
- `src/services/planPayments.js:136` `date_of_expiration: new Date(now + PIX_TTL_MS).toISOString().replace('Z', '-03:00')`
- Igual em `src/services/donations.js:81`
- `src/services/planPayments.js:382` o painel só mostra o QR pendente enquanto `charge.expiresAt > now`
- `src/services/planPayments.js:253-271` cada pagamento aprovado dá mais 1 mês (ou 12) de plano

**Achado:** O horário é calculado em UTC e só a etiqueta é trocada para horário de Brasília. Com isso, o QR vale cerca de 3h30 no Mercado Pago, não 30 minutos. Depois de 30 minutos, o painel considera o QR vencido e deixa gerar outro. Se a pessoa pagar o QR antigo e o novo, ela paga duas vezes. O segundo pagamento vira mais um mês de plano, que ela não pediu.

**Recomendação:** Enviar a data em UTC sem trocar a etiqueta (manter o "Z"), ou converter de verdade para -03:00. Corrigir nos dois arquivos.

**Revisão:** Confirmado. Ajuste no achado: o dinheiro não se perde, porque o segundo pagamento estende o plano. Mesmo assim é uma cobrança dupla não desejada. Severidade média mantida.

---

### Q204 — Quando a compra do plano falha na aba Planos, a pessoa recebe uma mensagem compreensível?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- `client/src/dashboard/Plans.jsx:125` `{error && <Notice tone="error">{t('error.generic', { error })}</Notice>}`
- `client/src/dashboard/i18n.js:15` `'error.generic': 'Algo deu errado: {error}'`
- `src/routes/dashboardRoutes.js:1061` `invalid_plan`, `:1065` `plan_lifetime`, `:1070` `checkout.reason || 'provider'` (`unavailable`, `qr_missing`...)
- Busca no painel: não existem chaves `error.unavailable`, `error.provider`, `error.plan_lifetime`, `error.invalid_plan`, `error.qr_missing`
- Contraponto: `client/src/dashboard/Dashboard.jsx:302-303` já procura o texto do erro antes de cair no genérico, mas Plans.jsx não faz isso

**Achado:** Na tela de pagamento, o cliente vê textos como "Algo deu errado: unavailable" ou "Algo deu errado: provider". Ele não sabe se pagou, se deve tentar de novo ou se precisa chamar o suporte.

**Recomendação:** Criar textos em pt e en para cada motivo de falha do checkout (unavailable, provider, qr_missing, plan_lifetime, invalid_plan). Em Plans.jsx, fazer como Dashboard.jsx: procurar `error.<código>` primeiro e usar o genérico só se não houver texto.

**Revisão:** Confirmado. Rebaixado de alta para média: nenhuma cobrança é criada quando dá esse erro, então o risco é confusão, não perda de dinheiro. O caso "plan_lifetime" é raro, porque a tela já mostra o plano vitalício (`Plans.jsx:61-62`). A medição "33 de 41 códigos sem texto" não foi refeita aqui.

---

### Q205 — O ranking "Quem apoia a Pyxie" em /planos mostra o nome de quem doou e o valor no formato brasileiro?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- `src/services/donations.js:66` o nome chega na criação do Pix, mas `:175` `return applyDonation(payment);` não passa o nome
- `src/services/donations.js:103` `function applyDonation(payment, { name = '' } = {})`
- `src/services/donations.js:144` `label: entry.anonymous ? null : entry.name || entry.userId`
- `server.js:610-617` a rota pública `/api/public/donations` devolve esse ranking
- `public/planos.html:175` `'</strong> — R$ ' + Number(row.amount).toFixed(2)`

**Achado:** O nome do doador nunca é gravado. No lugar dele, o ranking público mostra o número de ID do Discord da pessoa. A página em português mostra "R$ 10.00", com ponto em vez de vírgula. Quem doou não se reconhece e vê um ID que não escolheu expor.

**Recomendação:** Guardar o nome de exibição junto com a cobrança e usar esse nome quando o pagamento for aprovado. Sem nome, mostrar "Apoiador". Formatar o valor com `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })` na página em português.

**Revisão:** Confirmado. Não existe outra chamada de `applyDonation` que passe o nome.

---

### Q206 — O ranking de doadores coloca na página um texto vindo do servidor sem tratamento?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `public/planos.html:175` e `public/planos.en.html:175` `list.innerHTML = rows.map((row) => '<li><strong>' + (row.anonymous ? 'Anônimo' : row.label) + ...`
- `src/services/donations.js:117` `name: String(name || '').slice(0, 40)` sem filtro de caracteres

**Achado:** Hoje não há risco, porque o rótulo é sempre um ID só com números (ver Q205). Quando o nome do doador passar a ser gravado, um nome com código HTML poderia rodar na página pública de planos.

**Recomendação:** Montar a lista com `textContent` em vez de `innerHTML`, ou escapar `<`, `>`, `&` e aspas. Fazer isso junto com a correção do Q205.

**Revisão:** Confirmado como risco futuro. Severidade baixa mantida.

---

### Q207 — Todo texto do bot e do painel existe em pt e en, com os mesmos placeholders e sem chave repetida?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `src/utils/i18n.js:327-331` chaves `cringelandia.guild_only`, `lab_badge`, `welcome_special` só em PT; busca em `src/` e `client/src/`: nenhuma linha usa essas 3 chaves
- `client/src/dashboard/i18n.js:1070` `"error.invalid_role": "Esse cargo não é deste servidor (ou é o @everyone)."` e `:1573` `"error.invalid_role": "Algum cargo escolhido não é deste servidor."`

**Achado:** Faltam 3 textos em inglês, mas nenhum deles é usado, então ninguém vê isso. No painel, a mesma chave de erro aparece duas vezes. A segunda substitui a primeira sem aviso, e a explicação sobre "@everyone" nunca aparece.

**Recomendação:** Apagar as 3 chaves sem uso (ou criar a versão en). Deixar só uma `error.invalid_role`, com a frase mais completa. Criar um teste que acuse chaves repetidas.

**Revisão:** Confirmado em parte. O efeito das 3 chaves só em PT foi retirado do achado, porque elas não são usadas. Severidade baixa mantida.

---

### Q208 — Nos cartões de achadinhos da Shopee em /cringelandia e /bonus, a foto mostra o produto anunciado?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `public/cringelandia.html:1775` `<img src="/assets/pyxie/pyxie_mascot.png" alt="Abafador de Ruído Sensorial Confortável" />` (4 cartões fixos com a mascote)
- `public/cringelandia.html:2776-2805` `loadShopeeShowcase()` busca `/api/showcase` e troca todos os cartões
- `server.js:1032-1035` `/api/showcase` lê `src/data/shopee.json`; nesse arquivo, 20 itens ativos, 0 imagens do Unsplash e todas as fotos vêm do CDN da Shopee
- `public/bonus.html:1438` `DEFAULT_SHOWCASE_ITEMS` com imagens do Unsplash; `:1687-1691` troca pelos itens da API

**Achado:** As fotos erradas (mascote e Unsplash) são só a reserva usada quando a API falha. No uso normal, os cartões mostram a foto real do produto. Mesmo assim, os cartões de reserva aparecem por um instante ao carregar e têm um texto alternativo que descreve um produto que não está na imagem.

**Recomendação:** Nos cartões de reserva, usar `alt=""` e uma imagem neutra, ou mostrar só um "carregando". Melhor: deixar a reserva usar os mesmos dados de shopee.json.

**Revisão:** Rebaixado de PROBLEMA/alta para PARCIAL/baixa. O auditor olhou só o HTML fixo e não viu que a vitrine é trocada pela API com fotos reais.

---

### Q209 — Os links e preços dos achadinhos apontam para o produto certo e se mantêm atualizados?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `public/cringelandia.html:1773`, `:1801`, `:1815` três cartões de reserva com o mesmo link `https://s.shopee.com.br/BU6Bod6Sw`
- `src/data/shopee.json`: 58 itens, 0 links repetidos, campo `lastChecked` preenchido; o link `1BMdNQEU79` é "Kuromi Sanrio Boneca", igual em `public/bonus.html:1447`
- `src/data/shopee.json`: preços digitados como texto (`preco: "R$ 55,99"`, `preco_en: "$10.77"`); `src/services/shopeeManager.js:357` preço padrão `'R$ 29,90'` quando não informado

**Achado:** Os links repetidos e o "Fidget Pad" com link de pelúcia estão só nos cartões de reserva. Os dados reais não têm links repetidos. O problema que sobra é o preço: ele é digitado à mão e pode ficar velho. Em inglês aparece um valor em dólar, mas a Shopee Brasil cobra em reais.

**Recomendação:** Tirar o `preco_en` em dólar e escrever "price in BRL on Shopee". Mostrar "preço conferido em DD/MM" usando o `lastChecked`. Corrigir os links dos cartões de reserva (ver Q208).

**Revisão:** Rebaixado de PROBLEMA/alta para PARCIAL/baixa. A parte grave (links trocados) só afeta a reserva, que quase nunca aparece.

---

### Q210 — Quando o /py-oracle detecta sofrimento em servidor em inglês, a mensagem de crise dá um contato que a pessoa consegue usar?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta

**Evidência:**
- `src/utils/i18n.js:3861` (en) `"hotline": "CVV 188 · free call, 24h · cvv.org.br"`
- `src/commands/oraculo.js:64` a mensagem usa só `oracle.crisis.body` e `oracle.crisis.hotline`
- `src/utils/i18n.js:13-30` `getLanguage()`: servidor sem idioma salvo e fora da Cringelândia fica em `en`
- Contraponto: `src/utils/i18n.js:681-682` (`autos.crisis`) já tem findahelpline.com e SAMU 192

**Achado:** Quem fala inglês, e provavelmente não está no Brasil, recebe só o número do CVV brasileiro. Não há link internacional nem aviso para ligar para a emergência local. Na hora da crise, a pessoa fica sem um contato útil.

**Recomendação:** Na versão en de `oracle.crisis.hotline`, colocar primeiro findahelpline.com e "call your local emergency number". Deixar o CVV como opção para quem está no Brasil. No português, incluir o SAMU 192, como em `autos.crisis.emergency`.

**Revisão:** Confirmado. Nenhum outro trecho do Oráculo acrescenta contatos internacionais. Severidade alta mantida por ser texto de crise.

---

### Q211 — O quadro de apoio emocional das regras (terms.fieldSupportValue) indica telefones de crise corretos?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- `src/utils/i18n.js:3105` "ligue **188 (CVV gratuito 24h)** no Brasil, **Disque 100**, ou acesse **findahelpline.com**"
- `src/utils/i18n.js:6202` (en) "call **188 (CVV free 24/7)** in Brazil, dial **100**, or visit **findahelpline.com**"
- Contraponto: `src/services/ventService.js:93` descreve o Disque 100 corretamente: "Direitos Humanos e proteção a vulneráveis"

**Achado:** O Disque 100 recebe denúncias de violação de direitos humanos. Ele não é linha de apoio para pensamentos suicidas. Em inglês, "dial 100" manda um estrangeiro ligar para um número que, em vários países, é de outro serviço. O próprio bot descreve o Disque 100 do jeito certo em outro lugar.

**Recomendação:** Tirar o Disque 100 da frase sobre ideação suicida, ou deixá-lo separado como "denúncia de violência". No inglês, trocar "dial 100" por "call your local emergency number". No português, incluir o SAMU 192.

**Revisão:** Confirmado. Rebaixado de alta para média: o CVV e o findahelpline.com, que são corretos, aparecem na mesma frase.

---

### Q212 — As mensagens de crise e acolhimento do bot passam os mesmos contatos e usam o mesmo jeito de falar?

**Veredito:** 🟡 PARCIAL
**Severidade:** média

**Evidência:**
- `src/utils/i18n.js:678-683` (`autos.crisis`): CVV, findahelpline.com, SAMU 192; "Você não está sozinhe"
- `src/utils/i18n.js:761-764` (`oracle.crisis`): só CVV; "sozinho"
- `src/services/ventService.js:83-104`: CVV, Pode Falar, Disque 100, 180, CAPS, contatos internacionais, sem SAMU 192; "sozinho(a)"

**Achado:** Cada parte do bot dá uma lista diferente de contatos de crise. Só uma delas lembra do SAMU 192 para perigo imediato. O tratamento muda entre "sozinhe", "sozinho" e "sozinho(a)". Para quem está sofrendo, essa variação passa insegurança.

**Recomendação:** Criar um bloco único de contatos de crise em pt e en e usar esse bloco nos quatro lugares. Escolher uma forma neutra de tratamento ("Você não está só") e aplicar em todos.

**Revisão:** Confirmado. Severidade média mantida.

---

### Q213 — Na /cringelandia em inglês, a Central de Autoajuda (CVV, CAPS, SAMU, 988, Samaritans) aparece traduzida e sem erros?

**Veredito:** 🔴 PROBLEMA
**Severidade:** média

**Evidência:**
- Medição nesta revisão: 34 das 119 chaves `data-i18n` de `public/cringelandia.html` não existem no dicionário da página (ex.: `br.cvv.desc`, `br.samu.desc`, `intl.us.desc`, `intl.uk.desc`, `bully.100.desc`, `laudo.c1.t`)
- `public/cringelandia.html:2707-2711` sem tradução, o texto em PT fica na tela
- `public/cringelandia.html:2068` `data-i18n="intl.us.desc"` "988 Suicide & Crisis Lifeline: apoio gratuito e confidencial 24h para quem vive nos Estados Unidos ou Canadá."
- Botões sem `data-i18n`: `:2006` "Acessar Chat CVV", `:2039` "Ligar SAMU 192"
- `src/utils/seoRenderer.js:391-401` a versão /en/ só troca título e metadados, não o corpo
- Erros de português: `:2015` "no Centros de Atenção Psicossocial", `:2090` "confidencias"

**Achado:** O visitante estrangeiro chega à área de crise e encontra a maior parte em português, até nos cartões dos serviços dos EUA e do Reino Unido. Os números (988, 116 123) aparecem, mas a explicação não. A versão em português tem dois erros: "no Centros" e "confidencias".

**Recomendação:** Traduzir as 34 chaves no dicionário en da página. Colocar `data-i18n` nos botões. Corrigir para "nos Centros" e "confidenciais".

**Revisão:** Confirmado (34 chaves medidas de novo). Rebaixado de alta para média: os números e nomes dos serviços continuam visíveis e clicáveis, e o público principal da página é brasileiro. A contagem "134 textos em PT" não foi refeita.

---

### Q214 — As páginas legais em inglês estão traduzidas por completo, incluindo rodapé e cláusulas de proteção de menores?

**Veredito:** 🟡 PARCIAL
**Severidade:** média

**Evidência:**
- `public/terms.html:641` "Tolerância Zero contra Grooming ou Assédio", `:642` "Direito de Remoção pelos Responsáveis Legais" sem `data-i18n`
- Rodapé fixo "© 2026 Pyxie • Cringelândia. Todos os direitos reservados." em `public/privacy.html:491`, `public/transparencia.html:407`, `public/pais-e-profissionais.html:443`
- `src/utils/seoRenderer.js:386` só a página de planos tem arquivo próprio em inglês (`fileEn: 'planos.en.html'`)

**Achado:** Pais estrangeiros que leem os termos em inglês não entendem as cláusulas sobre grooming e remoção de dados de menores. O rodapé continua em português em três páginas.

**Recomendação:** Colocar `data-i18n` nas listas legais de terms.html e traduzir. Passar o rodapé para o dicionário de cada página.

**Revisão:** Confirmado por amostragem. A contagem de 45 trechos não foi refeita. Severidade média mantida.

---

### Q215 — Quem abre um link quebrado em /en/... vê a página 404 ou 500 em inglês?

**Veredito:** 🔴 PROBLEMA
**Severidade:** baixa

**Evidência:**
- `public/404.html` e `public/500.html`: 0 ocorrências de `data-i18n`, `lang=en` ou `navigator.language`
- `public/404.html:86` "Dimensão Não Encontrada!", `:99` "Voltar para um Lugar Seguro"
- `server.js:1779-1780` e `:1832-1834` sempre enviam o mesmo `404.html`
- `src/utils/seoRenderer.js:428` `res.status(404).send('Page not found')` só quando falta o arquivo da página

**Achado:** O visitante estrangeiro que erra um endereço vê uma página só em português, com tom místico. O botão de voltar funciona, mas ele não entende a mensagem. O "Page not found" em texto puro só aparece se faltar um arquivo da página, o que é raro.

**Recomendação:** Criar uma versão em inglês da 404 e da 500, escolhida pelo caminho /en/ ou pelo idioma do navegador.

**Revisão:** Confirmado. Rebaixado de média para baixa: o botão leva de volta para a home e o caso do texto puro é raro.

---

### Q216 — Os campos do assistente de sorteio (/py-giveaway) e do desabafo anônimo mudam de idioma conforme o servidor?

**Veredito:** 🔴 PROBLEMA
**Severidade:** alta

**Evidência:**
- `src/modules/giveaways/giveawayManager.js:214` `.setLabel('Título / Nome do Sorteio')`, `:222` `'Início: AGORA, Duração ou Data'`, `:680` "use ... (`DD/MM/AAAA HH:mm`)"
- `src/commands/sorteio.js:35` resposta fixa "Você não possui permissão..."
- `src/services/ventService.js:217-227` "Título do Desabafo", "Mensagem de Desabafo", placeholders fixos
- `src/commands/setup.js:366` o canal de desabafo é configurável em qualquer servidor (opção "Vent channel")
- `AGENTS.md:5` regra 1: "zero texto fixo ao usuário (`t()`)"

**Achado:** O sorteio e o desabafo funcionam em qualquer servidor, mas o formulário vem todo em português, inclusive o formato de data brasileiro. Em um servidor em inglês, o dono não entende os campos.

**Recomendação:** Passar rótulos, placeholders e respostas do giveawayManager.js, sorteio.js e ventService.js para chaves `t()` em pt e en. Mostrar o formato de data esperado no idioma do servidor.

**Revisão:** Confirmado. Os dois recursos não estão presos à Cringelândia. A contagem de "370 textos fixos" não foi refeita.

---

### Q217 — Os textos do bot seguem a voz Kuromi tsundere (§14), sem frases de assistente?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `src/utils/i18n.js:1162` `"error": "❌ Ocorreu um erro ao processar sua solicitação."`
- `src/utils/i18n.js:1606` `"✅ Compra realizada com sucesso! ..."`
- `src/utils/i18n.js:3070` (`mary.hub_desc`) "Oi, Mary! Aqui está a sua lojinha."
- `src/modules/giveaways/giveawayManager.js:978` "Configuração de sorteio descartada com sucesso."
- `AGENTS.md:18` regra 14 proíbe tom de assistente ("Claro!", "Aqui está")

**Achado:** A voz tsundere aparece nos jogos, mas erros e confirmações comuns soam como atendimento automático. A personalidade da Pyxie some nas mensagens que o usuário mais vê.

**Recomendação:** Reescrever `common.error`, `buy.success`, `mary.hub_desc` e as confirmações "com sucesso" no tom de "ajudar bufando". Exemplo: "Hmph, travou aqui. Tenta de novo, tá?". Manter tom calmo e acolhedor só em crise e segurança.

**Revisão:** Confirmado. Rebaixado de média para baixa: é questão de estilo de marca, sem dano para o usuário.

---

### Q218 — Os títulos de embeds de acolhimento, check-in e sorteio seguem a regra de "título curto com um emoji" (§9)?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `src/services/ventService.js:21` `.setTitle('💜  ✦  Espaço de Acolhimento & Desabafos')`
- `src/services/welcomeCheckinService.js:33` `'🌸  ✦  Pouso Suave na {server}'`
- `src/modules/giveaways/giveawayManager.js:729` `'🎁  ✦  Passo 2: Definição dos Prêmios'`
- `AGENTS.md:13` regra 9: "Título curto com um emoji"

**Achado:** Esses títulos juntam um emoji, um símbolo decorativo ✦ e espaços duplos. Eles ficam mais longos e com visual diferente dos outros embeds.

**Recomendação:** Tirar o "  ✦  " e deixar um emoji e um título curto. Exemplos: "💜 Espaço de desabafo", "🎁 Passo 2: prêmios".

**Revisão:** Confirmado. A afirmação de que o título quebra em duas linhas no celular foi retirada, porque não há medição.

---

### Q219 — As páginas públicas cabem em 360, 768 e 1280 px sem rolagem lateral nem imagem local quebrada?

**Veredito:** ✅ OK
**Severidade:** info

**Evidência:** Medição do auditor com Playwright (`/tmp/aud-textos-i18n/measure.js`, capturas `/tmp/aud-textos-i18n/*_360.png`): em 8 páginas × 3 larguras, `scrollWidth == innerWidth` e 0 imagens locais com `naturalWidth` 0. O que passa da borda é o carrossel da Shopee e o fundo decorativo `.pyx-aurora`.

**Achado:** Nenhuma página cria rolagem lateral no celular, e todas as imagens locais carregam.

**Recomendação:** Nada urgente. Na tabela de terms.html em 360 px, mostrar um sinal de que dá para arrastar para o lado.

**Revisão:** Mantido OK. Os arquivos da medição e as capturas existem; a medição não foi refeita.

---

### Q220 — Há textos menores que 12px nos cartões e selos de /cringelandia, / e /bonus no celular?

**Veredito:** 🟡 PARCIAL
**Severidade:** baixa

**Evidência:**
- `public/cringelandia.html:752` e `:793` `font-size: 11px;` em `.product-tag` e `.product-btn`
- `public/index.html:2363` selo "v14 • Online" (9px na medição do auditor, `/tmp/aud-textos-i18n/tiny.js`)
- `public/cringelandia.html:2786` o selo da vitrine real usa `tag_en` em inglês

**Achado:** Selos e botões dos achadinhos têm de 9 a 11px. Isso é difícil de ler no celular para quem tem baixa visão. O selo em português ao lado do botão em inglês só acontece nos cartões de reserva; a vitrine real traduz o selo.

**Recomendação:** Usar no mínimo 12px nos selos e 14px nos botões clicáveis.

**Revisão:** Confirmado o tamanho da fonte. A parte "selo em PT e botão em EN" foi limitada aos cartões de reserva (ver Q208).
