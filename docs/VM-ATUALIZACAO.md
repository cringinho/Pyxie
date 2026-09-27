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

## 🤖 Auto-Deploy Autônomo (Zero Esforço & Proteção Total)

A VM de produção conta com um **trabalhador autônomo** gerenciado via `systemd` timer (`pyxie-autodeploy.timer`) que verifica a branch `main` no GitHub **a cada 3 minutos**:

### Como Funciona:
1. **Pré-Checagem Ultra-Leve (< 0.2s)**:
   - Executa `git fetch origin main --quiet` e compara o hash local com o remoto.
   - Se **não houver** novos commits, o script encerra imediatamente sem tocar no bot, sem reinstalar dependências e sem gastar CPU ou memória.
2. **Deploy Seguro e Protegido (Quando há novos commits)**:
   - **Backup Atômico**: Salva cópia de segurança de `data/`, `.env`, `prefix.json` e arquivos dinâmicos em `~/backups/kuromi/auto-YYYYMMDD-HHMMSS/`.
   - **Preservação de Dados da IA**: Mescla os cenários de carreiras gerados pelo Groq localmente com os novos do repositório (`scripts/merge_minigames.js`), sem perda nem duplicidade.
   - **Quality Gate Obrigatório**: Executa `npm test` antes de qualquer alteração no processo.
   - **Rollback Automático**: Se os testes falharem, reverte o Git imediatamente para a versão estável anterior, restaura o backup e **não** reinicia o bot.
   - **Build Inteligente**: Só executa `npm ci` se `package.json` mudou, e só registra slash commands se comandos mudaram.
   - **Reload Gracioso**: Aplica `pm2 reload pyxie --update-env` sem interrupções bruscas.

### Comandos de Monitoramento do Auto-Deploy:
```bash
# Ver status do timer e próxima execução
systemctl list-timers pyxie-autodeploy.timer

# Ver histórico de deploys automáticos
cat ~/kuromi/logs/autodeploy.log

# Ver logs do serviço via journalctl
journalctl -u pyxie-autodeploy -n 50 --no-pager
```

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
