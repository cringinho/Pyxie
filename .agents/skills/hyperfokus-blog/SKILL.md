---
name: hyperfokus-blog
description: Diretrizes essenciais de arquitetura e regras de negócio do portal editorial Pyxie Hyperfokus (fórum Cringelândia -> site público).
---

# Pyxie Hyperfokus — Resumo Executivo e Regras de Negócio

## 1. Visão Geral
Portal editorial público da comunidade (`/hyperfokus`), alimentado organicamente a partir de tópicos criados no fórum de Hiperfocos da Cringelândia (`1453890868980482090`), curados no painel administrativo (`/dashboard`) e publicados com SEO de cauda longa, SSR obrigatório, coautoria e automações.

## 2. Ciclo de Vida do Conteúdo (Status Pipeline)
```
[Tópico Criado no Fórum] 
       │
       ▼
   DRAFT (Rascunho Protegido: Thread Guard ativo, só autor e coautores digitam, sticky orienta)
       │
       ▼ (Comando /py-concluir ou botão no sticky)
   PENDING_REVIEW (Tópico destrancado para o Discord; pacote enviado à fila de validação do painel)
       │
  ┌────┴───────────────────────────┐
  ▼                                ▼
REJECTED (Fica só no Discord)   PUBLISHED (Espelha mídia Discord -> WebP local, gera OG/Pin,
                                            notifica IndexNow, gera sitemap/RSS, celebra no tópico)
```

## 3. Autoria e Permanência
- Cada artigo possui autor principal (`index 0`) e coautores opcionais (`role: 'AUTHOR' | 'COLLABORATOR'`).
- Avatares convertidos para WebP local em `public/uploads/hyperfokus/avatars/`.
- Apagar o tópico no Discord **NUNCA** apaga o artigo publicado no site (backup diário em `data/backups/hyperfokus/`).
- Página do autor: `/hyperfokus/autor/:userId` (artigos, curtidas, comentários; sem auto-exclusão, remoção via ticket).

## 4. Rotas e Arquitetura
- **Públicas (SSR Obrigatório para bots e indexação):**
  - `/hyperfokus`: Home bento/magazine com abas e categorias.
  - `/hyperfokus/:slug`: Artigo completo com metadados, JSON-LD `BlogPosting` e controles de leitura acessíveis.
  - `/hyperfokus/categoria/:slug`: Páginas-pilar por categoria.
  - `/hyperfokus/autor/:userId`: Perfil público do autor.
  - `/hyperfokus/como-participar` e `/hyperfokus/termos-e-regras`.
  - `/hyperfokus/rss.xml` e `/sitemap-hyperfokus.xml`.
  - `/api/hyperfokus/share-image/:articleId`: Capa com marca d'água oficial.
- **Painel (`/dashboard` - Cringelândia / Dono):**
  - Fila de validação, editor Markdown com preview ao vivo, campos de SEO (`seoTitle` ≤ 60, `metaDescription` ≤ 160).
  - Gestão de fila do Pinterest e telemetria própria de leitura.
- **Privadas (Disallow no `robots.txt`):** `/meu-perfil`, `/api/hyperfokus/` (exceto share-image), `/auth/`.

## 5. Pinterest (Orçamento Estrito)
- **Máximo de 3 pins por dia** distribuídos em horários de pico (~12h30, ~18h30, ~21h30 com jitter ±20 min).
- Formato vertical 1000×1500, hashtags limitadas a ~5, descrição rica.
- A fila é alimentada pelo feed RSS com `releaseAt`. Itens novos nunca furam a fila.

## 6. Zero Mock e Paridade Bilíngue
- Persistência em PostgreSQL + Drizzle para tabelas transacionais (`hyperfokus_articles`, `hyperfokus_article_authors`, `hyperfokus_likes`, `hyperfokus_comments`, etc.).
- Estado efêmero e rascunhos em JSON atômico (`writeJsonAtomic`).
- Paridade 100% PT-BR e EN em todas as chaves, comandos e metadados.
