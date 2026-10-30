# Módulo Pyxie Accounts (Contas e Identidades Unificadas)

Módulo responsável pela autenticação, segurança, registro por e-mail e senha, e conexão unificada de contas Discord com a plataforma web da Pyxie.

## 1. Responsabilidades
- **Autenticação Segura:** Hashing de senhas via `crypto.scrypt` (resistente a ataques de GPU, recomendação OWASP/NIST, sem dependência de binários nativos de compilação em ARM).
- **Proteção contra Força Bruta:** Rate limiting em memória para tentativas de login (máximo de 5 tentativas em 15 minutos por IP ou e-mail).
- **Tokens Criptográficos de Uso Único:**
  - Token de verificação de e-mail (expira em 24h).
  - Token de redefinição de senha (expira em 1h, invalidado após uso).
- **Sessões Web Seguras:** Cookies assinados `HttpOnly`, `SameSite=Lax` e `Path=/` (`pyxie_account`).
- **Unificação de Identidades:** Vinculação e fusão segura de contas de e-mail e Discord (mesma pessoa = uma conta única).
- **Preferências de Leitura Acessível:** Persistência de tema (escuro, sépia, alto contraste), tamanho de fonte e alternância de tipografia para dislexia.
- **Rascunhos Web:** Gestão de rascunhos de artigos escritos diretamente pelo site (`/meu-perfil/escrever`) e envio para moderação.

## 2. Estrutura de Arquivos
- `index.js`: Manifesto do módulo para o `moduleManager`.
- `accountStore.js`: Lógica de persistência, hashing scrypt, tokens e estatísticas de usuário.
- `README.md`: Documentação de ciclo de vida e responsabilidades.

## 3. Escopo e Segurança
- Módulo global (acessível por qualquer usuário do site e servidores da Pyxie).
- Mensagens de erro opacas para impedir enumeração de e-mails cadastrados.
- Zero mock policy: persistência via Drizzle PostgreSQL (`accounts` table) com fallback atômico em `data/accounts.json`.

