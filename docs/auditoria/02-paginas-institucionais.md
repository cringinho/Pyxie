# 02. Páginas institucionais e de erro

> Nota da área: 4/10 · As páginas existem e têm bom conteúdo de proteção a menores, mas no celular três delas estouram a tela e o inglês não funciona direito. Há uma falha de segurança grave no perfil público (/u/...) e várias promessas que o código não cumpre: comando de apagar dados errado, consentimento de cookies que não existe e aviso de "equipe notificada" que ninguém recebe.

## Tabela-resumo

| ID | Pergunta curta | Veredito | Severidade |
|---|---|---|---|
| Q021 | Menu do topo cabe no celular (360px)? | 🔴 PROBLEMA | alta |
| Q022 | Topo fixo de /termos e atalhos na página longa | 🔴 PROBLEMA | média |
| Q023 | Estrelas da 404/500 respeitam "reduzir movimento"? | 🔴 PROBLEMA | média |
| Q024 | Comando para apagar dados funciona para usuário comum? | 🔴 PROBLEMA | alta |
| Q025 | /en/... mostra o texto em inglês? | 🔴 PROBLEMA | média (era alta) |
| Q026 | Termos em inglês traduzem tudo? | 🔴 PROBLEMA | média |
| Q027 | Todas as páginas escolhem o idioma igual? | 🔴 PROBLEMA | baixa |
| Q028 | Emojis/ícones coerentes e acessíveis? | 🟡 PARCIAL | baixa |
| Q029 | Termos e "Para pais" falam igual da verificação de idade? | 🔴 PROBLEMA | média |
| Q030 | Responsável sem Discord acha contato nos Termos? | 🔴 PROBLEMA | média |
| Q031 | Termos e Privacidade têm data de atualização? | 🔴 PROBLEMA | média |
| Q032 | Termos cobrem Passe e Planos? | 🔴 PROBLEMA | média |
| Q033 | /u/:userId insere o ID com segurança? | 🔴 PROBLEMA | crítica |
| Q034 | Site pede consentimento antes de Analytics/AdSense? | 🔴 PROBLEMA | alta |
| Q035 | "Dados coletados" lista tudo? | 🟡 PARCIAL | média |
| Q036 | Linhas de ajuda clicáveis no celular? | 🔴 PROBLEMA | média |
| Q037 | 404 clara e em inglês? | 🟡 PARCIAL | baixa (era média) |
| Q038 | 500 diz a verdade sobre o aviso à equipe? | 🔴 PROBLEMA | baixa (era média) |
| Q039 | Logo do topo igual e sem distorção? | 🟡 PARCIAL | baixa |
| Q040 | /transparencia mostra para onde vai o dinheiro? | 🟡 PARCIAL | baixa (era média) |

---

### Q021 — No celular (360px), o menu do topo de /privacidade, /transparencia e /pais-e-profissionais cabe na tela, sem rolagem lateral?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `public/privacy.html:162` `.nav-links { display: flex; align-items: center; gap: 18px; }`. Não há `flex-wrap` nem regra de celular para o menu: o único `@media (max-width: 768px)` (`privacy.html:338`) só tira o desfoque. O menu tem 6 links e o botão de idioma (`privacy.html:358-367`). Medição (Playwright, Chrome, 360x800): largura da página 581px (privacidade), 752px (transparência) e 752px (pais), contra 360px de tela. A 768px não estoura.
- **Achado:** No celular a página fica mais larga que a tela e balança para os lados. Os últimos links (Museu, Termos e, na Transparência e em Pais, também "Para pais" e "Transparência") e o botão de idioma ficam fora da tela. Quem não lê português não acha o botão de trocar idioma.
- **Recomendação:** Abaixo de 768px, troque a fileira de links por um menu que abre num botão, ou deixe a fileira quebrar em várias linhas. Mantenha o botão de idioma sempre visível ao lado da logo.
- **Revisão:** Confirmado. Medi de novo e deu os mesmos números. Não há CSS externo nessas páginas que corrija isso. Ajustei a lista de links: a Privacidade não tem "Para pais" nem "Transparência" no menu.

### Q022 — No celular, o topo fixo de /termos deixa espaço para ler, e a página longa tem algum atalho?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:155-157` `.navbar { position: sticky; top: 0; ... }`. Medição a 360x800: topo com 220px de altura (27% da tela) e página com 10.893px. Não há índice: o único âncora é `terms.html:763` `id="passe"`, e nenhum `href="#..."`. A tabela rola por dentro (`terms.html:457` `.terms-table-wrap { overflow-x: auto; }`).
- **Achado:** No celular, os botões do topo ficam empilhados e grudados no alto, tampando mais de um quarto da tela o tempo todo. O texto ocupa umas 13 telas e não tem índice para pular até "Passe" ou "Apoio emocional".
- **Recomendação:** No celular, deixe o topo numa linha só (só ícones, ou menu) e não fixe ele. Ponha um índice no começo com links para as seções 1 a 6.
- **Revisão:** Confirmado com nova medição (220px a 360, 70px a 768).

### Q023 — A animação de estrelas da 404/500 respeita quem pediu menos movimento no aparelho?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/404.html:142` e `public/500.html:144` `requestAnimationFrame(loop);`. Nos dois arquivos não aparece `prefers-reduced-motion`, `matchMedia` nem `visibilitychange`.
- **Achado:** As estrelas piscam sem parar mesmo para quem ativou "reduzir movimento" no sistema. Para o público neurodivergente, que chega à página de erro já frustrado, isso pode incomodar. A animação também gasta bateria sem fim.
- **Recomendação:** Se o aparelho pedir menos movimento, desenhe as estrelas uma vez só e não anime. Pare a animação quando a aba ficar escondida.
- **Revisão:** Confirmado. Procurei a checagem nos dois arquivos e ela não existe.

### Q024 — O comando que a Política de Privacidade indica para apagar os próprios dados funciona para um usuário comum?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `public/privacy.html:464`, `:538` e `:584` "utilizando o comando `<code>/py-reseteco</code>`". `src/commands/resetareconomia.js:42` e `:56` `if (!isOwner(...))` → `admin.onlyOwner`. O comando certo é `src/commands/privacidade.js:15` `const name = 'py-privacy';`.
- **Achado:** A página manda usar /py-reseteco, que só o dono do bot pode usar. Quem tenta recebe uma recusa e acha que não consegue apagar os próprios dados. O comando que realmente apaga (/py-privacy) não aparece na página. Existe a saída "abrir chamado no suporte", mas o caminho principal está errado.
- **Recomendação:** Troque /py-reseteco por /py-privacy em PT e EN. Explique em uma linha que ele mostra o que existe e pede confirmação antes de apagar.
- **Revisão:** Confirmado. A trava de dono está no código, no caminho por prefixo e no de barra.

### Q025 — Quem abre a versão em inglês (/en/terms, /en/privacy, /en/parents, /en/transparency) vê o texto em inglês?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média (rebaixado de alta)
- **Evidência:** `src/utils/seoRenderer.js:372-374` decide o idioma pela URL (`/en/`). `seoRenderer.js:386` só usa outro arquivo se houver `fileEn`, e só `planos` tem um (`seoRenderer.js:66`). Para essas páginas, o servidor só troca `<html lang>` e as metas (`:391-400`). O script ignora isso: `public/terms.html:873-878` usa `?lang`, `localStorage` ou o navegador. `public/privacy.html:613-617` faz o mesmo.
- **Achado:** Os links em inglês (sitemap e hreflang) mostram a página em português para quem tem o navegador em português ou em outra língua (por exemplo, espanhol na Privacidade) ou já salvou PT antes. O script ainda troca o `lang` que o servidor colocou.
- **Recomendação:** Faça o script ler primeiro o `lang` que o servidor coloca em `<html>` e só depois o idioma salvo. Ao trocar o idioma, vá para a URL do outro idioma (/termos ou /en/terms).
- **Revisão:** Confirmado no código. Rebaixado para média: quem tem o navegador em inglês (o público principal de /en/ e o robô do Google) vê inglês. O erro atinge quem tem o navegador em outra língua ou já salvou PT.

### Q026 — Os Termos em inglês traduzem todo o conteúdo: leis, linhas de ajuda e tabela?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:601-608` (lista de leis), `:641-643` (Tolerância Zero, Direito de Remoção), `:667-691` (cartões de ajuda) e `:755-757` (formas de pedir exclusão) não têm `data-i18n`, então nunca são traduzidos. Na Privacidade, `privacy.html:426-427` tem dois links do Google, mas o dicionário (`:525` PT e `:571` EN) troca esse texto por uma versão sem links.
- **Achado:** Em inglês só os títulos e as caixas mudam. As leis, as regras contra assédio, os cartões de apoio emocional e o jeito de pedir exclusão ficam em português. Um leitor estrangeiro não entende justo as partes de segurança. Isso fere a regra bilíngue do projeto (AGENTS.md §1). Na Privacidade, os links para desligar anúncios personalizados somem **nos dois idiomas**, porque o script aplica o dicionário também em PT ao abrir.
- **Recomendação:** Dê uma chave de tradução a cada item de lista, cartão e célula da tabela, com o texto EN equivalente. Na Privacidade, ponha os links `<a>` de volta dentro do texto de `sec3.p3`, em PT e EN.
- **Revisão:** Confirmado. Ampliado: a perda dos links do Google afeta também o PT, não só o EN.

### Q027 — As páginas institucionais escolhem o idioma inicial do mesmo jeito?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** baixa
- **Evidência:** `public/terms.html:876` `startsWith('pt') ? 'pt' : 'en'` contra `public/privacy.html:616`, `public/transparencia.html:508` e `public/pais-e-profissionais.html:555` `startsWith('en') ? 'en' : 'pt'`. Só os Termos mudam a URL ao trocar o idioma (`terms.html:904` `replaceState`).
- **Achado:** Com o navegador em espanhol, por exemplo, os Termos abrem em inglês e a Privacidade abre em português. Ao navegar entre elas, o idioma parece mudar sozinho.
- **Recomendação:** Use uma única função de idioma, compartilhada por todas as páginas, com a mesma regra e o mesmo comportamento ao trocar.
- **Revisão:** Confirmado. Na prática, o idioma salvo depois da primeira troca reduz o efeito, por isso fica baixa.

### Q028 — Os ícones (emojis) dos botões e títulos são coerentes entre as páginas e acessíveis a leitores de tela?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `aria-hidden` aparece 0 vezes em terms, privacy, pais, transparencia, 404 e 500. `public/terms.html:565` `<span>🇧🇷</span> <span>PT-BR</span>` (idioma atual). `public/privacy.html:366` `🌐 <span id="langBtnText">EN</span>` (idioma de destino). Títulos: Termos usa emoji (`terms.html:595`) e Privacidade usa número (`privacy.html:382` "01.").
- **Achado:** O mesmo botão de idioma diz coisas diferentes: nos Termos mostra o idioma atual com bandeira, na Privacidade mostra o idioma para onde vai. O leitor de tela lê cada emoji em voz alta antes do texto. No Windows, a bandeira 🇧🇷 aparece como as letras "BR".
- **Recomendação:** Padronize o botão como "🌐 EN" (destino) em todas as páginas. Ponha `aria-hidden="true"` nos emojis decorativos. Use o mesmo estilo de título em todas as páginas institucionais.
- **Revisão:** Confirmado. O efeito é de polimento, então segue PARCIAL e baixa.

### Q029 — Termos e página "Para pais" descrevem do mesmo jeito como a idade é verificada para os canais +18?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:626` "em canais fechados, isolados por cargos verificados". `public/pais-e-profissionais.html:386` "cada pessoa informa a faixa etária ao entrar". Busquei verificação de idade em `src/` (`ageVerif`, "verificação de idade") e não achei nada.
- **Achado:** Os Termos passam a ideia de idade verificada. A página para pais diz que a própria pessoa declara a idade. Um responsável pode achar que há checagem de documento, e isso abala a confiança.
- **Recomendação:** Use a mesma frase honesta nas duas páginas: "a idade é informada pela pessoa ao entrar; a staff revê casos suspeitos". Tire "verificados" dos Termos.
- **Revisão:** Confirmado. "Cargos verificados" pode querer dizer só "cargo dado depois da verificação do Discord", mas o leitor comum entende verificação de idade.

### Q030 — Um responsável sem conta no Discord encontra nos Termos um contato para pedir a remoção de conteúdo do filho?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:643` "através de nossa ouvidoria oficial". A seção 5 (`terms.html:755-757`) só oferece "ticket interno de suporte no servidor Discord". Nenhum `contato@` ou `mailto` nos Termos. `public/privacy.html:475` e `public/pais-e-profissionais.html:426` mostram `contato@pyxie.com.br`. Já `public/planos.html:148` diz "Suporte único: cringe.support@gmail.com".
- **Achado:** Os Termos prometem uma "ouvidoria" e não dizem onde ela fica. Só oferecem ticket no Discord, que um pai sem conta não consegue usar. O site ainda mostra dois e-mails de suporte diferentes, e um deles se diz "único".
- **Recomendação:** Na seção 5 dos Termos, ponha o e-mail clicável ao lado do ticket e troque "ouvidoria oficial" por "e-mail ou ticket (veja a seção 5)". Escolha um único e-mail de suporte para todo o site.
- **Revisão:** Confirmado e ampliado com o e-mail divergente de /planos.

### Q031 — Termos e Privacidade informam quando foram atualizados pela última vez?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** A busca por `atualiza|updated|vigência|last update` em `public/terms.html` e `public/privacy.html` não acha data de atualização. O único resultado é `terms.html:717` ("assinatura artística"), que não tem relação.
- **Achado:** O usuário não sabe se o texto que está lendo vale hoje nem se algo mudou desde a compra do Passe. Recursos novos, como o Passe (seção 6), entraram sem nenhum aviso de mudança.
- **Recomendação:** Ponha "Última atualização: dd/mm/aaaa" no topo das duas páginas, em PT e EN. Mude a data a cada alteração.
- **Revisão:** Confirmado.

### Q032 — Os Termos cobrem todas as compras com dinheiro real que o site oferece (Passe e Planos do servidor)?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:763-778` traz só a seção 6, sobre o Passe ("Preço: R$ 5", igual a `src/services/battlePass.js:25` `PRICE = { BRL: 5 }`). `public/planos.html:90` vende "Assinatura mensal ou anual" e `:148` "cartão recorrente". `planos.html:162` aponta para `/termos`. A busca por `plano|assinatura|recorrente` nos Termos só acha "assinatura artística" (`:717`).
- **Achado:** Quem assina um plano com cartão cobrado todo mês clica em "Termos" e só acha regras do Passe. Não há regra de renovação, cancelamento, reembolso do anual nem arrependimento de 7 dias para os planos. O preço do Passe bate com o código.
- **Recomendação:** Crie uma seção 7, "Planos do servidor", com preço, renovação automática, como cancelar, o que acontece sem pagamento e a regra de reembolso, em PT e EN.
- **Revisão:** Confirmado. /planos também não tem regra de cancelamento ou reembolso própria (só fala de "renovação" em `:144`).

### Q033 — A página de perfil público /u/:userId insere o ID da URL no HTML com segurança?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** crítica
- **Evidência:** `server.js:805-806` `app.get('/u/:userId', ...)` → `String(req.params.userId || '').trim()`, sem checar o formato. `server.js:823` `` const canonical = `https://pyxie.com.br/u/${userId}`; `` e `:827` cola esse texto dentro de `<link rel="canonical" href="...">` e `og:url`, sem escapar nada. `getUserAccount` (`src/services/economy.js:235-238`) não falha com ID estranho, então a troca sempre acontece. A política de segurança permite script embutido (`server.js:285` `script-src 'self' 'unsafe-inline' 'unsafe-eval'`). Teste com Express 5.3: `/u/%22%3E%3Cscript%3Ealert(1)%3C%2Fscript%3E` chega à rota como `"><script>alert(1)</script>`.
- **Achado:** Um link como esse roda o código de quem montou o link dentro do domínio pyxie.com.br. Se a vítima estiver logada no painel (ou for a dona), o código pode agir como ela, por exemplo mudando configurações do servidor. A página também responde 200 para qualquer ID, mesmo inexistente.
- **Recomendação:** Na rota /u/:userId, aceite só números de 15 a 25 dígitos (igual à API) e responda 404 com a página de erro nos outros casos. Escape qualquer texto antes de colocar no HTML (nome, ID, título).
- **Revisão:** Confirmado com teste real da decodificação do Express. Nenhum middleware antes da rota barra esses caracteres (`server.js:263-353`).

### Q034 — A Privacidade diz que os cookies de anúncio dependem de consentimento; o site pede esse consentimento antes de carregar Google Analytics e AdSense?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** alta
- **Evidência:** `public/privacy.html:440` "Consentimento (Art. 7º, I): Aplicável aos cookies de publicidade e navegação que podem ser gerenciados livremente". `privacy.html:3-22` carrega GTM, `gtag('config', ...)` e `adsbygoogle.js` direto no `<head>`. A busca por `consent` em `public/*.html`, `public/js/`, `server.js` e `seoRenderer.js` só acha textos, nenhum aviso nem `gtag('consent', ...)`.
- **Achado:** A página afirma que o usuário consente e controla os cookies de anúncio, mas eles carregam assim que a página abre, sem pergunta. Os links para desligar anúncios personalizados também somem (ver Q026). A promessa não se cumpre e expõe o projeto à LGPD, num público com muitos menores.
- **Recomendação:** Ponha um aviso de cookies simples (Aceitar / Só os necessários) e só carregue Analytics e AdSense depois do "Aceitar". Outra opção é ligar o Consent Mode do Google com tudo negado por padrão. Ajuste o texto da Privacidade para o que existe de fato.
- **Revisão:** Confirmado no código. Ressalva: um aviso configurado dentro da conta do GTM ou do AdSense não aparece no repositório. Mesmo assim, o `gtag('config')` roda antes de qualquer escolha.

### Q035 — A lista de "Dados coletados" da Privacidade inclui tudo o que o bot e o site guardam?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** média
- **Evidência:** `public/privacy.html:397-407` lista ID, nome/avatar, ID do servidor, cookies, logs "com endereço IP anônimo", login e IA. Fora da lista: `src/commands/aniversario.js:22` (dia e mês de aniversário). `src/services/passPayments.js:150` grava `paymentId`, provedor e valor do Mercado Pago. `src/routes/dashboardRoutes.js:621` envia `meta: { acceptTerms, ip: req.ip }`, e `src/modules/mary-studio/maryDashboard.js:67` grava `termsAcceptedIp` com o IP completo.
- **Achado:** Quem lê acha que a Pyxie guarda só o ID e o nome. Na prática ela também guarda aniversário, histórico de pagamento e o IP completo de quem aceita os termos da lojinha. "IP anônimo" não confere com o código.
- **Recomendação:** Acrescente à lista: aniversário (opcional), registros de compra (sem dados de cartão), IP no aceite da lojinha e por quanto tempo cada coisa fica guardada. Tire a palavra "anônimo" ou passe a guardar o IP mascarado.
- **Revisão:** Confirmado, com um ajuste: tirei `server.js:510` da evidência, porque ali o IP só fica na memória por pouco tempo (`src/services/growthFunnel.js:182-186`) e não é gravado.

### Q036 — No celular, dá para ligar ou abrir as linhas de ajuda em crise com um toque?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** média
- **Evidência:** `public/terms.html:670` `<div class="helpline-phone">Ligue 188</div>`, `:676` "Ligue 100 ou 180", `:682` "21 354 45 45", `:688` "findahelpline.com". `public/pais-e-profissionais.html:416` "ligue 188 ... ou acesse cvv.org.br". `tel:` aparece 0 vezes nos dois arquivos, e esses cartões não têm `<a>`.
- **Achado:** Quem está em crise precisa decorar o número e discar à mão. Os sites do CVV e do findahelpline também não são clicáveis. Isso atrapalha justo quem mais precisa de agilidade.
- **Recomendação:** Transforme cada número em link de discagem (tel:188, tel:100, tel:180, tel:+351213544545) e cada site em link clicável, nas duas páginas e nos dois idiomas.
- **Revisão:** Confirmado.

### Q037 — A página 404 explica com clareza o que houve e funciona em inglês?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa (rebaixado de média)
- **Evidência:** `public/404.html:86` "Dimensão Não Encontrada!" e `:90` "essa página parece ter sumido no vácuo do espaço". `data-i18n` aparece 0 vezes. `server.js:1772-1781` e `:1830-1839` servem esse arquivo para qualquer endereço desconhecido, inclusive /en/... Botões para `/` e `/wiki` em `404.html:94-109`. Medição: sem estouro a 360 e 768.
- **Achado:** Os botões ajudam, mas o texto é só metáfora e nunca diz o simples: "esse endereço não existe ou mudou". Quem lê de forma literal pode se confundir. Quem visita em inglês recebe a página só em português.
- **Recomendação:** Ponha uma frase direta antes da brincadeira ("Não achamos esse endereço. Talvez o link esteja errado ou a página tenha mudado."). Crie a versão EN (pelo caminho /en ou pelo idioma do navegador) e um link para o Discord de suporte.
- **Revisão:** Confirmado. Rebaixado para baixa porque a pessoa consegue sair da página com um toque. O dano é de clareza, não de bloqueio.

### Q038 — A página de erro 500 diz a verdade sobre o que acontece depois do erro?
- **Veredito:** 🔴 PROBLEMA
- **Severidade:** baixa (rebaixado de média)
- **Evidência:** `public/500.html:7` "Nossos magos já foram notificados." e `:90` "Nossos alquimistas já estão estabilizando a rede." O tratador em `server.js:1842-1843` só faz `console.error('[Internal Error]', err)`. O outro tratador (`server.js:356-361`) só trata JSON malformado, e a telemetria (`src/services/resourceTelemetry.js:151`) só mede uso, sem alerta.
- **Achado:** A página promete que a equipe já foi avisada, mas ninguém recebe aviso: o erro fica só no log do servidor. O usuário espera uma correção e não sabe que precisa avisar.
- **Recomendação:** Ou mande um aviso real (canal de log da staff no Discord) quando acontecer um 500, ou troque o texto por "Algo deu errado do nosso lado. Tente de novo em alguns minutos; se continuar, avise no servidor de suporte."
- **Revisão:** Confirmado. Rebaixado para baixa: é um texto enganoso numa página rara, sem perda de dados nem de dinheiro.

### Q039 — A logo do topo é a mesma em todas as páginas institucionais e aparece sem distorção?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa
- **Evidência:** `public/terms.html:553` usa `pyxie_pixelart_face.png` (172x153, 48 KB). `public/privacy.html:355` e `public/transparencia.html:353` usam `pyxie_mascot.png` (576x1024, 138 KB) em `.brand img { width: 36px; height: 36px; border-radius: 50%; }` sem `object-fit` (`privacy.html:155-160`, `transparencia.html:153-158`). `public/pais-e-profissionais.html:352` usa `sticker/sticker_smile.png` com `object-fit: contain`.
- **Achado:** Cada página mostra uma Pyxie diferente no topo. Na Privacidade e na Transparência, uma imagem em pé (576x1024) é espremida num círculo de 36px e sai achatada. Ela ainda baixa 138 KB para um ícone pequeno.
- **Recomendação:** Use uma única logo quadrada e leve (por exemplo uma versão 72x72) em todas as páginas institucionais, com `object-fit: cover`.
- **Revisão:** Confirmado. Medi as dimensões direto dos arquivos PNG.

### Q040 — A página /transparencia mostra para onde vai o dinheiro do Passe, dos Planos e das doações?
- **Veredito:** 🟡 PARCIAL
- **Severidade:** baixa (rebaixado de média)
- **Evidência:** `src/data/transparency.json` `{"donations": []}`. A página busca `/api/public/transparency` e, com a lista vazia, mostra `s2.empty` (`public/transparencia.html:468-471`, texto em `:432`). A descrição da página (`transparencia.html:46`) promete só "doações a ONGs com comprovante e recibo". `/api/public/donations` (`server.js:610`) é outra coisa (ranking de quem doou) e a página não usa.
- **Achado:** Hoje a página só mostra "Ainda não há doações registradas". Ela não diz quanto entra nem para que serve a receita do Passe e dos Planos. A mensagem vazia é honesta, mas a página fica sem utilidade.
- **Recomendação:** Acrescente um bloco curto: de onde vem o dinheiro (Passe, Planos, doações) e a regra de uso (por exemplo, X% para ONGs). Enquanto não houver registros, diga quando sai o primeiro.
- **Revisão:** Rebaixado para baixa. A página só promete mostrar doações a ONGs e cumpre isso com uma mensagem honesta. Mostrar a receita é melhoria, não erro. A ideia de reaproveitar `/api/public/donations` foi retirada: é outro tipo de dado.
