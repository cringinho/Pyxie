# ☁️ Infraestrutura & Servidores: Oracle Cloud Infrastructure (OCI)

## 📌 Resumo da Instância (Pyxie Production)
- **Provedor**: Oracle Cloud Infrastructure (OCI)
- **Região**: US East (Ashburn) — `us-ashburn-1` (AD-2 / Fault-Domain-3)
- **Nome da VM**: `Pyxie` (`pyxie-vnic`)
- **Tipo de Instância (Shape)**: `VM.Standard.A1.Flex` (Arquitetura ARM Ampere)
- **Recursos**: 4 OCPUs / 24 GB RAM / 200 GB Armazenamento (Always Free Tier)
- **Sistema Operacional**: Ubuntu 22.04.5 LTS (aarch64)
- **IP Público**: `150.136.249.229`
- **IP Privado**: `10.0.0.195/24` (Gateway: `10.0.0.1`)
- **Domínio Dinâmico (DNS)**: `pyxie.duckdns.org`
- **Usuário SSH**: `ubuntu`
- **Chave SSH Local**: `~/.ssh/kuromi_access`
- **Diretório da Aplicação**: `/home/ubuntu/kuromi`

---

## 🔑 Acesso Rápido via SSH (PowerShell / VS Code)

Para conectar à máquina a partir do seu terminal local:

```powershell
ssh oracle
```
*(ou `ssh pyxie-oracle` / `ssh ubuntu@150.136.249.229`)*

### Configuração em `~/.ssh/config`:

```sshconfig
Host oracle
    HostName 150.136.249.229
    User ubuntu
    IdentityFile ~/.ssh/kuromi_access
    IdentitiesOnly yes

Host pyxie-oracle
    HostName 150.136.249.229
    User ubuntu
    IdentityFile ~/.ssh/kuromi_access
    IdentitiesOnly yes
```

---

## 🌐 Rede, Portas e Endereços Oficiais

### Portas Liberadas
| Porta | Protocolo | Finalidade | Configuração |
|---|---|---|---|
| **22** | TCP | Acesso SSH | Ingress Rule OCI + iptables |
| **80** | TCP | HTTP Padrão (Redirecionamento automático) | Caddy escuta e faz redirect permanente 308 para HTTPS |
| **443** | TCP | HTTPS Seguro (Web, Wiki, Bônus, API) | Caddy Reverse Proxy com SSL Let's Encrypt automático |
| **3000** | TCP | Painel Web & API Express | Porta interna da aplicação (Node.js/PM2) |

### Endereços do Ecossistema Pyxie
- **Website Principal**: [https://pyxie.duckdns.org](https://pyxie.duckdns.org)
- **Portal de Bônus (10s)**: [https://pyxie.duckdns.org/bonus](https://pyxie.duckdns.org/bonus)
- **Enciclopédia & Wiki**: [https://pyxie.duckdns.org/wiki](https://pyxie.duckdns.org/wiki)
- **API de Status**: [https://pyxie.duckdns.org/api/status](https://pyxie.duckdns.org/api/status)
- **Painel Administrativo do Criador**: [https://pyxie.duckdns.org/admin](https://pyxie.duckdns.org/admin) *(requer Magic Token HMAC gerado via `/py-admin` ou chave mestra)*
- **Mapeamento Visual de Emojis**: [https://pyxie.duckdns.org/admin/emojis](https://pyxie.duckdns.org/admin/emojis) *(galeria visual de slots de emojis)*

---

## ⚙️ Regras de Firewall e Proxy Reverso (Caddy + iptables)

Na VM Oracle, o tráfego web seguro é gerenciado pelo **Caddy** (serviço `caddy.service`), que obtém e renova automaticamente os certificados SSL/TLS da Let's Encrypt para `pyxie.duckdns.org`:

```bash
# Caddyfile (/etc/caddy/Caddyfile)
pyxie.duckdns.org {
    reverse_proxy 127.0.0.1:3000
}
```

- Porta **443**: Atende conexões HTTPS seguras e faz proxy reverso para `127.0.0.1:3000`.
- Porta **80**: Redireciona automaticamente qualquer conexão HTTP pura para HTTPS (308 Permanent Redirect).
- Firewall iptables: Portas 80, 443 e 3000 liberadas com persistência via `iptables-persistent`.

Na Oracle Cloud (VCN `vcn09250112` > Default Security List):
- **Ingress Rule**: CIDR `0.0.0.0/0`, TCP, Portas Destino `80,443,3000` (Stateless desmarcado).

---

## 🚀 Gerenciamento do Processo com PM2

A aplicação está configurada para rodar em segundo plano e iniciar automaticamente com o sistema operacional (systemd: `pm2-ubuntu.service`):

```bash
# Ver status do bot e métricas
pm2 status

# Ver logs em tempo real
pm2 logs pyxie

# Ver últimas 50 linhas de log
pm2 logs pyxie --lines 50 --nostream

# Reiniciar o bot (recarregando variáveis de ambiente)
pm2 restart pyxie --update-env

# Salvar lista de processos ativos para persistir reboots
pm2 save
```

---

## 🔒 Variáveis de Ambiente (`/home/ubuntu/kuromi/.env`)

```ini
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=1543650200718155897
STARTUP_CHANNEL_ID=1461937203214024891
LOOT_LABS_API_KEY=...
PANEL_PUBLIC_URL=https://pyxie.duckdns.org
PORT=3000
```
