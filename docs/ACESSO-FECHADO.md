# Pyxie fechada: sem cobrança e com acesso vitalício

Decisão do dono (13/11/2026):

1. **Pyxie fora do público.** Sem convite do bot, sem instalação na conta, sem divulgação comercial. `/invite`, `/install` e `/vote` só redirecionam para `/`.
2. **Página inicial = Cringelândia.** `/` e `/en/` servem `public/cringelandia.html`; `/cringelandia` virou 301 para `/`. Os links oficiais ficam na seção `#links`.
3. **Zero paywall.** Planos, Passe pago, extras e checkouts saíram (`PYXIE_PAYMENTS` desligado; páginas `/planos` e `/passe` removidas e redirecionadas). O Passe tem a trilha premium grátis.
4. **Vitalício.** Servidores que já tinham a Pyxie ganharam vitalício (migração única, `src/services/legacyLifetime.js`). Quem chegar depois entra por **chave**.
5. **Chaves** (`src/services/founderProgram.js`): o dono gera no painel e entrega a quem quiser; `/py-fundador chave:...` liga o servidor ao vitalício. Sem limite de 20 vagas, sem pausa por inatividade.
6. **Renda mantida:** carrossel e `/promo` da Shopee, parcerias e divulgações. As doações voluntárias do `/py-home` continuam como estavam.
7. **Pyxie Devs** (grupo de desenvolvimento de jogos do Roblox): uso futuro; ainda não implementado.
