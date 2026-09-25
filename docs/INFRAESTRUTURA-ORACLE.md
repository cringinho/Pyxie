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
| **80** | TCP | HTTP Padrão (Web, Wiki, Bônus) | Redirecionamento NAT iptables para `3000` |
| **3000** | TCP | Painel Web & API Express | Porta nativa da aplicação |
| **443** | TCP | HTTPS (futuro SSL/TLS) | Aberta no firewall |

### Endereços do Ecossistema Pyxie
- **Website Principal**: [http://pyxie.duckdns.org](http://pyxie.duckdns.org) *(ou com porta: [http://pyxie.duckdns.org:3000](http://pyxie.duckdns.org:3000))*
- **Portal de Bônus (10s)**: [http://pyxie.duckdns.org/bonus](http://pyxie.duckdns.org/bonus)
- **Enciclopédia & Wiki**: [http://pyxie.duckdns.org/wiki](http://pyxie.duckdns.org/wiki)
- **API de Status**: [http://pyxie.duckdns.org/api/status](http://pyxie.duckdns.org/api/status)
- **Painel Administrativo do Criador**: [http://pyxie.duckdns.org/admin/login.html](http://pyxie.duckdns.org/admin/login.html) *(requer Magic Token HMAC gerado via `/py-admin`)*

---

## ⚙️ Regras de Firewall e Roteamento (iptables)

Na VM Oracle, a porta 80 é roteada diretamente para o servidor Express na porta 3000 através da tabela NAT:

```bash
# Redirecionamento de porta 80 externa para a porta 3000 interna
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
sudo iptables -t nat -A OUTPUT -p tcp -d 127.0.0.1 --dport 80 -j REDIRECT --to-ports 3000

# Liberação de entrada nas tabelas filter
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT

# Persistência das regras após reboots
sudo netfilter-persistent save
```

Na Oracle Cloud (VCN `vcn09250112` > Default Security List):
- **Ingress Rule**: CIDR `0.0.0.0/0`, TCP, Portas Destino `80,3000` (Stateless desmarcado).

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
PANEL_PUBLIC_URL=http://pyxie.duckdns.org
PORT=3000
```
