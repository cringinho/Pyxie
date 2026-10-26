#!/usr/bin/env node
/**
 * Publica (ou atualiza no lugar) as mensagens fixas do Pyxie's Realm: boas-vindas, lore e leis em #realm-laws.
 * Os IDs das mensagens ficam em data/realmState.json; rodar de novo só edita. Requer provision.js antes.
 * Uso: node scripts/realm/publish.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { buildLawsMessage } = require('../../src/modules/realm');

const STATE_FILE = path.join(__dirname, '..', '..', 'data', 'realmState.json');
const API = 'https://discord.com/api/v10';

async function api(method, route, body) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`${API}${route}`, {
      method,
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'DiscordBot (pyxie-realm, 1.0)' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 429) {
      const wait = Number((await res.json().catch(() => ({}))).retry_after || 1);
      await new Promise((r) => setTimeout(r, (wait + 0.3) * 1000));
      continue;
    }
    const text = await res.text();
    if (!res.ok) return { error: res.status, text };
    return text ? JSON.parse(text) : null;
  }
  throw new Error('rate limit persistente');
}

(async () => {
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  state.messages = state.messages || {};
  const channelId = state.channels.rules;
  const payload = buildLawsMessage('en');
  let message = state.messages.laws ? await api('PATCH', `/channels/${channelId}/messages/${state.messages.laws}`, payload) : null;
  if (!message || message.error) {
    message = await api('POST', `/channels/${channelId}/messages`, payload);
    if (message.error) throw new Error(`POST → ${message.error} ${message.text}`);
    console.log('✅ Leis publicadas em #realm-laws');
  } else {
    console.log('✅ Leis atualizadas em #realm-laws');
  }
  state.messages.laws = message.id;
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
})().catch((err) => {
  console.error('❌ [publish]', err.message);
  process.exit(1);
});
