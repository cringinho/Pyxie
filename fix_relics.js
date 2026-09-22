const fs = require('fs');
let c = fs.readFileSync('src/services/gloomRealm.js', 'utf8');

const keyDef = "  spectral_key: {\n    id: 'spectral_key',\n    tier: 1,\n    name: { pt: 'Chave Espectral', en: 'Spectral Key' },\n    desc: { pt: 'Uma chave translúcida que emite um brilho frio.', en: 'A translucent key emitting a cold glow.' },\n    cost: 50,\n  },\n  amuleto_osso:";

c = c.replace(/  amuleto_osso:/, keyDef);

fs.writeFileSync('src/services/gloomRealm.js', c, 'utf8');
