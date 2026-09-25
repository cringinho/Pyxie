# ☁️ Infraestrutura & Servidores: Oracle Cloud Infrastructure (OCI)

## 📌 Resumo da Instância (Pyxie Production / Staging)
- **Provedor**: Oracle Cloud Infrastructure (OCI)
- **Região**: US East (Ashburn) — `us-ashburn-1`
- **Nome da VM**: `Pyxie` (`pyxie-vnic`)
- **Tipo de Instância (Shape)**: `VM.Standard.A1.Flex` (Arquitetura ARM Ampere)
- **Recursos**: 4 OCPUs / 24 GB RAM / Always Free Tier
- **Sistema Operacional**: Ubuntu 22.04 LTS (aarch64)
- **IP Público**: `150.136.249.229`
- **IP Privado**: `10.0.0.195`
- **Usuário SSH Padrão**: `ubuntu`
- **Chave SSH Local Registrada**: `~/.ssh/kuromi_access`

---

## 🔑 Acesso Rápido via SSH (PowerShell / VS Code)

Para conectar à máquina a partir do seu terminal local:

```powershell
ssh oracle
```
*(ou `ssh pyxie-oracle` / `ssh ubuntu@150.136.249.229`)*

---

## 📋 Configuração de Atalho em `~/.ssh/config`

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

