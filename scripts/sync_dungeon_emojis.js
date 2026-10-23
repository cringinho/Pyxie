#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { listEmojiRefs, resolveEmojiRef } = require('../src/modules/dungeon/dungeonRenderer');

/**
 * Empacota em assets/dungeon/emojis os Application Emojis do bot (Developer Portal) usados nas
 * cenas das Catacumbas de Veludo, baixando da CDN do Discord pelos IDs do catálogo
 * src/data/discordAppEmojis.json. Assim o renderizador funciona offline e sem latência.
 * Emojis do Astaroth e da Pyxie vêm dos assets próprios (já com o recorte corrigido).
 * Arquivos do pacote que a cena deixou de usar são removidos.
 * Uso: node scripts/sync_dungeon_emojis.js [--force]
 */

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'dungeon', 'emojis');
const OWN_ASSETS = path.join(ROOT, 'assets', 'pyxie', 'emojis');

async function main() {
  const force = process.argv.includes('--force');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let downloaded = 0;
  let missing = 0;
  const used = new Set();
  for (const ref of listEmojiRefs()) {
    const info = resolveEmojiRef(ref);
    if (info) used.add(`${info.name}.png`);
    if (!info) {
      missing++;
      console.warn(`⚠️ ${ref}: não está no catálogo de emojis do bot (o renderizador usa o glifo de reserva)`);
      continue;
    }
    if (fs.existsSync(path.join(OWN_ASSETS, `${info.name}.png`))) continue;
    const target = path.join(OUT_DIR, `${info.name}.png`);
    if (!force && fs.existsSync(target)) continue;
    const res = await fetch(`https://cdn.discordapp.com/emojis/${info.id}.png?size=128`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      missing++;
      console.warn(`⚠️ ${info.name} (${info.id}): HTTP ${res.status}`);
      continue;
    }
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    downloaded++;
    console.log(`✅ ${info.name}`);
  }
  // Remove do pacote os emojis que a cena deixou de usar
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith('.png') && !used.has(file)) {
      fs.unlinkSync(path.join(OUT_DIR, file));
      console.log(`🧹 removido ${file}`);
    }
  }
  console.log(`${downloaded} emoji(s) baixados, ${missing} indisponível(is).`);
}

main().catch((err) => {
  console.error('[sync_dungeon_emojis] Erro:', err);
  process.exit(1);
});
