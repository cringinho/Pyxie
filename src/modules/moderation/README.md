# 🛡️ Controle de Brigas e Modo Blindagem

Exclusivo da Cringelândia (plano 5.7). Configurado no painel: `/dashboard` → Cringelândia → **Moderação** (só o dono).

## Controle de brigas (este módulo)

1. **Detector em memória:** conta respostas diretas entre duas pessoas no mesmo canal. Mais de 4 em 2 minutos dispara.
2. **Groq só quando dispara:** lê as últimas 6 mensagens de cada uma e classifica `animada` ou `hostil`. Nunca roda no canal de desabafos nem nos canais isentos (decisão D9).
3. **Ações em ordem**, para o mesmo par dentro de 10 minutos:
   - aviso leve no canal (sem marcar ninguém);
   - modo lento de 30 s por 10 min (o valor anterior volta sozinho, mesmo depois de reinício: `data/guilds/<id>/moderation.json`);
   - castigo nativo de 15 min nas duas pessoas, sem anúncio público, com DM acolhedora.
4. **Registro para a staff** no canal configurado, com o trecho da conversa (menções escapadas).

Nunca bane. Sem resposta do Groq, só registra para a staff decidir.

## Modo blindagem (`src/services/shieldMode.js`)

Regra de palavras-chave do AutoMod nativo do Discord, criada e ligada/desligada pela Pyxie (precisa de **Gerenciar Servidor**). Lista de termos editável, mensagem própria e canais isentos. Para momentos tensos (eleições, tragédias).
