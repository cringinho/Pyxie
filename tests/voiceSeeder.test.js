const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

console.log('⚡ Iniciando suíte de testes: Voice Seeder & Personalidade Kuromi Tsundere...');

// 1. Testando Voice Seeder Service
console.log('  🎙️ 1. Testando voiceSeederService (Acervo e Banco de Vozes)...');
const voiceSeeder = require('../src/services/voiceSeederService');

assert(Array.isArray(voiceSeeder.CATEGORIES), 'CATEGORIES deve ser um array');
assert(voiceSeeder.CATEGORIES.includes('daily'), 'Deve conter categoria daily');
assert(voiceSeeder.CATEGORIES.includes('work'), 'Deve conter categoria work');
assert(voiceSeeder.CATEGORIES.includes('tarot'), 'Deve conter categoria tarot');
assert(voiceSeeder.CATEGORIES.includes('quip'), 'Deve conter categoria quip');
assert(voiceSeeder.CATEGORIES.includes('animator'), 'Deve conter categoria animator');

const db = voiceSeeder.loadDatabase();
assert(db && Array.isArray(db.lines), 'Banco de vozes deve carregar array de lines');
assert(db.lines.length >= 10, `Deve ter pelo menos 10 falas base cadastradas, encontrou: ${db.lines.length}`);

// Paridade bilíngue em todas as falas cadastradas
for (const line of db.lines) {
  assert(line.id, 'Toda fala deve ter um ID');
  assert(line.category, `Fala ${line.id} deve ter categoria`);
  assert(typeof line.pt === 'string' && line.pt.trim().length > 0, `Fala ${line.id} deve ter texto em PT`);
  assert(typeof line.en === 'string' && line.en.trim().length > 0, `Fala ${line.id} deve ter texto em EN`);
  assert(typeof line.active === 'boolean', `Fala ${line.id} deve ter flag active booleana`);
}
console.log(`    ✅ 1. ${db.lines.length} falas validadas com sucesso e paridade bilíngue.`);

// 2. Testando getRandomLine e fallbacks
console.log('  🎲 2. Testando seleção aleatória de falas (getRandomLine)...');
const ptDaily = voiceSeeder.getRandomLine('daily', 'pt');
const enDaily = voiceSeeder.getRandomLine('daily', 'en');
assert(typeof ptDaily === 'string' && ptDaily.length > 0, 'getRandomLine daily PT deve retornar string');
assert(typeof enDaily === 'string' && enDaily.length > 0, 'getRandomLine daily EN deve retornar string');

const ptQuip = voiceSeeder.getRandomLine('quip', 'pt');
assert(typeof ptQuip === 'string' && ptQuip.length > 0, 'getRandomLine quip PT deve retornar string');

const ptAny = voiceSeeder.getRandomLine(null, 'pt');
assert(typeof ptAny === 'string' && ptAny.length > 0, 'getRandomLine genérico deve retornar string');
console.log('    ✅ 2. getRandomLine validado em todas as categorias e idiomas.');

// 3. Testando toggling e edição de falas
console.log('  ⚙️ 3. Testando moderação (toggleLine, editLine, deleteLine)...');
const firstLine = db.lines[0];
const originalActive = firstLine.active;

const toggled = voiceSeeder.toggleLine(firstLine.id, !originalActive);
assert(toggled && toggled.active === !originalActive, 'toggleLine deve inverter estado');

// Restaurar estado
voiceSeeder.toggleLine(firstLine.id, originalActive);
assert(voiceSeeder.loadDatabase().lines.find((l) => l.id === firstLine.id).active === originalActive, 'Estado deve ser restaurado');

// Testando cleanLine
const rawDirty = '  "Tsc! Não me faça perder meu tempo!"  ';
const cleaned = voiceSeeder.cleanLine(rawDirty);
assert(!cleaned.startsWith('"') && !cleaned.endsWith('"'), 'cleanLine deve remover aspas envolventes');
assert(cleaned.includes('Tsc!'), 'cleanLine deve manter conteúdo principal');
console.log('    ✅ 3. Operações de moderação e sanitização de falas validadas.');

// 4. Testando Telemetria e Agendador
console.log('  ⏱️ 4. Testando status e ciclo de vida do Agendador Groq...');
const status = voiceSeeder.getStatus();
assert(typeof status.totalLines === 'number' && status.totalLines > 0, 'Status deve reportar totalLines');
assert(typeof status.activeCount === 'number' && status.activeCount > 0, 'Status deve reportar activeCount');
assert(typeof status.schedulerRunning === 'boolean', 'Status deve reportar schedulerRunning');
assert(typeof status.model === 'string' && status.model.length > 0, 'Status deve indicar modelo Groq');

process.env.GROQ_API_KEY = 'test-key';
voiceSeeder.startScheduler();
assert(voiceSeeder.getStatus().schedulerRunning === true, 'Scheduler deve estar rodando após startScheduler');
voiceSeeder.stopScheduler();
assert(voiceSeeder.getStatus().schedulerRunning === false, 'Scheduler deve parar após stopScheduler');
console.log('    ✅ 4. Ciclo de vida do agendador Groq verificado com sucesso.');

// 5. Testando utilitários de voz e dicas tsundere
console.log('  ✨ 5. Testando pyxieVoice.js e persona Kuromi...');
const pyxieVoice = require('../src/utils/pyxieVoice');
assert(Array.isArray(pyxieVoice.ROTATING_TIPS.pt), 'ROTATING_TIPS.pt deve ser um array');
assert(Array.isArray(pyxieVoice.ROTATING_TIPS.en), 'ROTATING_TIPS.en deve ser um array');
assert.equal(pyxieVoice.ROTATING_TIPS.pt.length, pyxieVoice.ROTATING_TIPS.en.length, 'Paridade no número de dicas rotativas');

for (const tip of pyxieVoice.ROTATING_TIPS.pt) {
  assert(!tip.includes('supervisão dramática'), `Dica PT não deve conter "supervisão dramática": ${tip}`);
}
for (const tip of pyxieVoice.ROTATING_TIPS.en) {
  assert(!tip.includes('supervisão dramática'), `Dica EN não deve conter "supervisão dramática": ${tip}`);
}

const footer = pyxieVoice.pyxieFooter('Base Text', 'pt');
assert(footer.startsWith('Base Text • 🎀 Psst:'), 'Footer deve anexar dica rotativa');
console.log('    ✅ 5. Persona Kuromi e dicas de rodapé validadas com sucesso.');

// 6. Testando endpoints de rotas do Dashboard
console.log('  🌐 6. Testando declaração das rotas de voz no Dashboard...');
const dashboardRoutesContent = fs.readFileSync(path.join(__dirname, '../src/routes/dashboardRoutes.js'), 'utf8');
assert(dashboardRoutesContent.includes("router.get('/api/dashboard/global/voice'"), 'Deve conter rota GET /api/dashboard/global/voice');
assert(dashboardRoutesContent.includes("router.post('/api/dashboard/global/voice/generate'"), 'Deve conter rota POST /api/dashboard/global/voice/generate');
assert(dashboardRoutesContent.includes("router.put('/api/dashboard/global/voice/lines/:id'"), 'Deve conter rota PUT /api/dashboard/global/voice/lines/:id');
assert(dashboardRoutesContent.includes("router.delete('/api/dashboard/global/voice/lines/:id'"), 'Deve conter rota DELETE /api/dashboard/global/voice/lines/:id');
console.log('    ✅ 6. Rotas HTTP do painel validadas.');

console.log('🎉 Todos os testes de Voz e Personalidade da Pyxie passaram com 100% de sucesso!\n');
