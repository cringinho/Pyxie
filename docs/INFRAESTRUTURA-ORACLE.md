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
- **Domínio Oficial**: `https://pyxie.com.br` (com SSL/TLS automático Caddy + Let's Encrypt)
- **Domínio Dinâmico (Legado/Redirecionado)**: `pyxie.duckdns.org` -> `https://pyxie.com.br`
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
| **80** | TCP | HTTP Padrão (Redirecionamento automático) | Gerenciado pelo Caddy (redirect 308 para HTTPS) |
| **443** | TCP | HTTPS Seguro (Let's Encrypt Automático) | Caddy Proxy Reverso -> `localhost:3000` |
| **3000** | TCP | Painel Web & API Express | Porta nativa da aplicação Node.js |

### Configuração do Caddy (`/etc/caddy/Caddyfile` na VM)
```caddy
www.pyxie.com.br, pyxie.duckdns.org {
    redir https://pyxie.com.br{uri} permanent
}

pyxie.com.br {
    reverse_proxy 127.0.0.1:3000
}
```

### Endereços do Ecossistema Pyxie
- **Website Principal**: [https://pyxie.com.br](https://pyxie.com.br)
- **Portal de Bônus (10s)**: [https://pyxie.com.br/bonus](https://pyxie.com.br/bonus)
- **Mural de Parcerias**: [https://pyxie.com.br/parcerias](https://pyxie.com.br/parcerias)
- **Museu de Artes da Comunidade**: [https://pyxie.com.br/museu](https://pyxie.com.br/museu)
- **Enciclopédia & Wiki**: [https://pyxie.com.br/wiki](https://pyxie.com.br/wiki)
- **API de Status**: [https://pyxie.com.br/api/status](https://pyxie.com.br/api/status)
- **Painel Administrativo do Criador**: [https://pyxie.com.br/admin](https://pyxie.com.br/admin) *(requer Magic Token HMAC gerado via `/py-admin` ou chave mestra)*
- **Mapeamento Visual de Emojis**: [https://pyxie.com.br/admin/emojis](https://pyxie.com.br/admin/emojis) *(galeria visual de slots de emojis)*

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
