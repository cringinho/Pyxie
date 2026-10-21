const fs = require('node:fs');
const path = require('node:path');
const { OWNER_SNOWFLAKE } = require('./adminAuth');
const { buildStandardEmbed } = require('../utils/embedBuilderHelper');

const STATE_FILE = path.join(__dirname, '..', '..', 'data', 'schedulerState.json');
const HEARTBEAT_INTERVAL_MS = 30 * 1000; // 30 segundos
const ALERT_COOLDOWN_MS = 60 * 1000; // 60 segundos de cooldown por tipo de erro

let heartbeatTimer = null;
const lastAlertTimes = new Map();

function safeAtomicWrite(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, filePath);
  } catch (err) {
    console.error('[schedulerWatchdog] Erro ao gravar schedulerState.json:', err.message);
  }
}

function readSchedulerState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (_) {}
  return null;
}

/**
 * Atualiza o heartbeat da Pyxie em disco
 */
function recordHeartbeat(status = 'online') {
  const mem = process.memoryUsage();
  const state = {
    timestamp: Date.now(),
    pid: process.pid,
    uptimeSeconds: Math.floor(process.uptime()),
    status,
    memoryMb: Math.round(mem.rss / 1024 / 1024),
  };
  safeAtomicWrite(STATE_FILE, state);
  return state;
}

/**
 * Dispara notificação crítica em Embed Dark Kawaii na DM do Proprietário
 * @param {import('discord.js').Client} client
 * @param {Object} alertData
 * @param {string} alertData.title
 * @param {string} alertData.cause
 * @param {string} [alertData.module='Núcleo']
 * @param {string} [alertData.stack]
 * @param {'error'|'warning'|'info'} [alertData.variant='error']
 */
async function sendOwnerDmAlert(client, {
  title = 'Erro Crítico no Sistema',
  cause = 'Falha não tratada',
  module = 'Núcleo',
  stack = null,
  variant = 'error',
} = {}) {
  if (!client || !OWNER_SNOWFLAKE) return;

  const now = Date.now();
  const alertKey = `${module}:${cause.slice(0, 40)}`;
  const lastSent = lastAlertTimes.get(alertKey) || 0;
  if (now - lastSent < ALERT_COOLDOWN_MS) {
    return; // Rate limit contra inundações na DM
  }
  lastAlertTimes.set(alertKey, now);

  try {
    const owner = await client.users.fetch(OWNER_SNOWFLAKE).catch(() => null);
    if (!owner) return;

    const mem = process.memoryUsage();
    const rssMb = (mem.rss / 1024 / 1024).toFixed(1);

    const fields = [
      { name: 'Módulo', value: `\`${module}\``, inline: true },
      { name: 'Consumo RAM', value: `\`${rssMb} MB\``, inline: true },
      { name: 'Status PID', value: `\`PID ${process.pid}\``, inline: true },
      { name: 'Causa do Incidente', value: `\`\`\`${cause.slice(0, 500)}\`\`\``, inline: false },
    ];

    if (stack) {
      fields.push({
        name: 'Stack Trace Resumido',
        value: `\`\`\`${stack.slice(0, 600)}\`\`\``,
        inline: false,
      });
    }

    const embed = buildStandardEmbed({
      client,
      variant,
      title,
      description: '**Alerta de Watchdog da VM Oracle (Pyxie)**',
      fields,
      timestamp: true,
      footerText: 'Watchdog & Disaster Recovery',
    });

    await owner.send({ embeds: [embed] }).catch(() => null);
    console.log(`[schedulerWatchdog] Alerta crítico despachado para a DM do Dono (${OWNER_SNOWFLAKE}).`);
  } catch (err) {
    console.error('[schedulerWatchdog] Erro ao enviar DM para o Dono:', err.message);
  }
}

/**
 * Verifica se houve queda abrupta da VM ou do processo e executa auto-recuperação
 * @param {import('discord.js').Client} client
 * @param {Object} [reconcileCallbacks]
 */
async function checkPostCrash(client, reconcileCallbacks = {}) {
  const previousState = readSchedulerState();
  const now = Date.now();

  // Inicia gravação contínua do heartbeat a cada 30s
  recordHeartbeat('online');
  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => recordHeartbeat('online'), HEARTBEAT_INTERVAL_MS);
    if (heartbeatTimer.unref) heartbeatTimer.unref();
  }

  if (!previousState || !previousState.timestamp) {
    return;
  }

  const downtimeMs = now - previousState.timestamp;
  // Se o intervalo desde o último heartbeat for maior que 90 segundos, consideramos queda imprevista
  if (downtimeMs > 90 * 1000) {
    const downtimeMinutes = Math.round(downtimeMs / 60000);
    console.warn(`[schedulerWatchdog] ⚠️ Queda ou reinicialização detectada! Tempo offline estimado: ${downtimeMinutes} minuto(s).`);

    // Dispara relatório na DM do dono
    if (client) {
      const owner = await client.users.fetch(OWNER_SNOWFLAKE).catch(() => null);
      if (owner) {
        const embed = buildStandardEmbed({
          client,
          variant: 'warning',
          title: 'Relatório Pós-Queda (Post-Crash Report)',
          description: `A Pyxie reiniciou após um período offline de aproximadamente **${downtimeMinutes} minuto(s)**. O processo já está operacional na VM.`,
          fields: [
            { name: 'Último Heartbeat', value: `<t:${Math.floor(previousState.timestamp / 1000)}:R>`, inline: true },
            { name: 'Reinicialização', value: `<t:${Math.floor(now / 1000)}:R>`, inline: true },
            { name: 'Status PM2', value: `\`PID ${process.pid} (Online)\``, inline: true },
          ],
          timestamp: true,
          footerText: 'Conciliação Automática de Tarefas',
        });
        await owner.send({ embeds: [embed] }).catch(() => null);
      }
    }

    // Executa conciliação automática de tarefas perdidas
    try {
      if (typeof reconcileCallbacks.reconcileTasks === 'function') {
        await reconcileCallbacks.reconcileTasks();
      }
    } catch (recErr) {
      console.error('[schedulerWatchdog] Erro durante a conciliação de tarefas pós-crash:', recErr);
    }
  }
}

/**
 * Registra listeners globais de integridade do processo Node e cliente Discord
 * @param {import('discord.js').Client} client
 */
function attachProcessWatchdog(client) {
  process.on('uncaughtException', (err) => {
    console.error('[schedulerWatchdog] uncaughtException capturado:', err);
    sendOwnerDmAlert(client, {
      title: 'Exceção Não Tratada (Crash)',
      cause: err.message,
      stack: err.stack,
      variant: 'error',
    });
  });

  process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : null;
    console.error('[schedulerWatchdog] unhandledRejection capturado:', msg);
    sendOwnerDmAlert(client, {
      title: 'Rejeição de Promessa Não Tratada',
      cause: msg,
      stack,
      variant: 'error',
    });
  });

  if (client) {
    client.on('error', (err) => {
      console.error('[schedulerWatchdog] client.on(error):', err);
      sendOwnerDmAlert(client, {
        title: 'Erro no Gateway Discord',
        cause: err.message,
        stack: err.stack,
        variant: 'error',
      });
    });

    client.on('shardError', (err, shardId) => {
      console.error(`[schedulerWatchdog] Shard ${shardId} error:`, err);
      sendOwnerDmAlert(client, {
        title: `Erro de Shard (${shardId}) Discord`,
        cause: err.message,
        variant: 'error',
      });
    });
  }
}

module.exports = {
  recordHeartbeat,
  sendOwnerDmAlert,
  checkPostCrash,
  attachProcessWatchdog,
};
