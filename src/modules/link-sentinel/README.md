# 🔗 Monitor de Links

Plano 5.6. Registro em `data/linkSentinel.json`; lógica em `src/services/linkSentinel.js`.

- **Fontes:** links dos guias da página `/cringelandia`, botões e embeds do estúdio de mensagens e os cadastrados no painel (`/dashboard` → Pyxie global → Links), cada um com link reserva opcional.
- **Quando:** uma vez por dia, a partir das 4h de Brasília (o módulo confere a cada 5 minutos se já rodou no dia).
- **Como:** `HEAD`; se o site recusar, `GET`. Timeout de 8 s e cabeçalho de navegador.
- **Alerta:** só depois de 2 falhas seguidas, por DM ao dono, com diagnóstico (`HTTP 404`, `timeout`), ação tomada e os botões **Trocar link**, **Testar de novo** e **Silenciar 7 dias**.
- **Redirecionamento:** para outro domínio nunca troca sozinho (domínio expirado pode virar golpe): vira proposta. No mesmo domínio, atualiza.
- **Enquanto estiver fora:** usa o link reserva ou a cópia mais recente do Web Archive (`resolveLiveUrl`).
