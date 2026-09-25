# ☁️ Guia de Atualização & Manutenção da VM (Produção)

Este manual orienta como publicar atualizações com total segurança na máquina virtual (VM) de produção na **Oracle Cloud Infrastructure (OCI)** sem risco de perda de dados do banco de dados em produção. Para detalhes da topologia completa da VM, consulte [INFRAESTRUTURA-ORACLE.md](INFRAESTRUTURA-ORACLE.md).

---

## 🔒 Regra de Ouro da Produção
> **Nunca copie a pasta `data/` nem o arquivo `.env` do computador local para a VM.**  
> Os dados de saldo, casamentos, inventário e transações de produção vivem exclusivamente na VM. O script de deploy cuida de fazer backup e preservar todos os dados automaticamente.

---

## ⚡ Passo a Passo para Atualizar a VM

### 1️⃣ No seu Computador (Local)
Certifique-se de que os testes passaram, adicione as alterações e envie para o GitHub:

```powershell
# 1. Executa todos os testes unitários
npm test

# 2. Salva e envia as alterações para o GitHub
git add .
git commit -m "Novas atualizações da Pyxie"
git push origin main
```

---

### 2️⃣ Conectar na VM e Executar o Deploy
Abra o terminal SSH conectado à VM (`ssh oracle` ou `ssh ubuntu@150.136.249.229`) e execute:

```bash
cd ~/kuromi
chmod +x deploy.sh
./deploy.sh
```

O script `deploy.sh` executa automaticamente:
1. Criação de backup com timestamp em `~/backups/kuromi/`.
2. `git pull --ff-only origin main` para baixar apenas o novo código.
3. Restauração e preservação de `data/`, `.env` e `prefix.json` da VM.
4. Instalação de dependências limpas (`npm ci --omit=dev`).
5. Registro dos Slash Commands na API do Discord.
6. Reinicialização sem downtime no PM2 (`pm2 restart pyxie --update-env`).

---

### 3️⃣ Confirmar o Status da Aplicação na VM

```bash
# Ver tabela de processos do PM2
pm2 status

# Ver logs em tempo real
pm2 logs pyxie --lines 50
```

> Pressione `Ctrl + C` para sair da visualização dos logs. O bot continuará rodando em segundo plano.

---

## 🔄 Comandos Úteis do Dia a Dia na VM

| Ação | Comando na VM |
| :--- | :--- |
| **Ver status do bot** | `pm2 status` |
| **Ver logs em tempo real** | `pm2 logs pyxie` |
| **Reiniciar o bot** | `pm2 restart pyxie --update-env` |
| **Parar o bot** | `pm2 stop pyxie` |
| **Monitor de CPU e Memória** | `pm2 monit` |
| **Verificar espaço e memória** | `free -h && df -h` |

---

## 🛠️ Otimização de Memória na VM (Swap)
A instância oficial na Oracle Cloud (`VM.Standard.A1.Flex`) conta com 24 GB de RAM nativa. Caso esteja configurando uma nova VM ou queira garantir uma salvaguarda adicional de Swap, execute **uma única vez** na VM:

```bash
# 1. Cria e ativa um arquivo de Swap de 2GB
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 2. Configura para persistir após reinicializações
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. Otimiza a prioridade de uso de Swap (swappiness = 10)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# 4. Verifica se o Swap foi ativado com sucesso
free -h
```
