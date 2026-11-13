// Acesso vitalício dos servidores que já tinham a Pyxie quando ela deixou de ser pública.
// Roda UMA vez (marcador em data/legacyLifetime.json): quem entrar depois precisa de uma chave
// (founderProgram) ou de concessão do dono. Nunca rebaixa nem sobrescreve um plano já existente.
const fs = require('node:fs');
const path = require('node:path');
const plans = require('./guildPlans');
const guildAddons = require('./guildAddons');
const { withFileLock } = require('../utils/fileLock');

const fileFor = () => path.join(process.env.PYXIE_DATA_DIR || path.join(__dirname, '..', '..', 'data'), 'legacyLifetime.json');

function readState() {
  try {
    const data = JSON.parse(fs.readFileSync(fileFor(), 'utf8')) || {};
    return { doneAt: Number(data.doneAt) || 0, guilds: Array.isArray(data.guilds) ? data.guilds : [] };
  } catch (_) {
    return { doneAt: 0, guilds: [] };
  }
}

function writeState(state) {
  const file = fileFor();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify({ version: 1, ...state }, null, 2));
  fs.renameSync(`${file}.tmp`, file);
}

const isDone = () => readState().doneAt > 0;

/**
 * Concede vitalício a todos os servidores da lista que ainda não têm plano ativo.
 * `guildIds` vem do cache do cliente do Discord já pronto (nunca de lista inventada).
 */
function run(guildIds = [], { now = Date.now() } = {}) {
  return withFileLock(fileFor(), () => {
    const state = readState();
    if (state.doneAt) return { ok: true, skipped: true, granted: [] };
    const granted = [];
    for (const raw of guildIds) {
      const id = String(raw || '');
      if (!/^\d{17,20}$/.test(id)) continue;
      const current = plans.getPlan(id, now);
      if (!current.active) {
        const res = plans.grantPlan(id, 'founder', { lifetime: true, source: 'legacy', note: 'servidor existente na saída do modo público', now });
        if (!res.ok) continue;
      }
      guildAddons.grant(id, 'lojinha', { lifetime: true, source: 'legacy', note: 'servidor existente na saída do modo público', now });
      granted.push(id);
    }
    writeState({ doneAt: now, guilds: granted });
    return { ok: true, skipped: false, granted };
  });
}

module.exports = { run, isDone, readState };
