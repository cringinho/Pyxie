const fs = require('fs');
let content = fs.readFileSync('src/services/gloomRealm.js', 'utf8');

const newRelicsStr = "  cravo_negro: { id: 'cravo_negro', tier: 1, name: { pt: 'Cravo Negro', en: 'Black Carnation' }, desc: { pt: 'Uma flor escura encontrada nas sombras.', en: 'A dark flower found in the shadows.' }, cost: 20 },\n" +
"  pedra_tumular: { id: 'pedra_tumular', tier: 1, name: { pt: 'Fragmento de Lápide', en: 'Tombstone Shard' }, desc: { pt: 'Pedaço quebrado de um túmulo antigo.', en: 'Broken piece of an ancient tomb.' }, cost: 20 },\n" +
"  lagrima_emo: { id: 'lagrima_emo', tier: 1, name: { pt: 'Lágrima Emo', en: 'Emo Tear' }, desc: { pt: 'Uma gota cristalizada de pura melancolia.', en: 'A crystallized drop of pure melancholy.' }, cost: 25 },\n" +
"  cogumelo_rochedo: { id: 'cogumelo_rochedo', tier: 1, name: { pt: 'Cogumelo Violeta', en: 'Violet Mushroom' }, desc: { pt: 'Fungo bioluminescente raro.', en: 'Rare bioluminescent fungus.' }, cost: 20 },\n" +
"  corda_guitarra: { id: 'corda_guitarra', tier: 1, name: { pt: 'Corda Rompida', en: 'Broken Guitar String' }, desc: { pt: 'Um fio de aço que ainda vibra levemente.', en: 'A steel string that still vibrates faintly.' }, cost: 15 },\n" +
"  lodo_espectral: { id: 'lodo_espectral', tier: 1, name: { pt: 'Lodo Espectral', en: 'Spectral Slime' }, desc: { pt: 'Resíduo ectoplasmático.', en: 'Ectoplasmic residue.' }, cost: 15 },\n" +
"  cera_roxa: { id: 'cera_roxa', tier: 3, name: { pt: 'Cera Roxa', en: 'Purple Wax' }, desc: { pt: 'Restos de velas derretidas em rituais.', en: 'Melted candle remains from rituals.' }, cost: 150 },\n" +
"  reliquia_ancestral: { id: 'reliquia_ancestral', tier: 3, name: { pt: 'Relíquia Ancestral', en: 'Ancient Relic' }, desc: { pt: 'Objeto de um passado esquecido.', en: 'Object from a forgotten past.' }, cost: 200 },\n" +
"  pergaminho_antigo: { id: 'pergaminho_antigo', tier: 3, name: { pt: 'Pergaminho Antigo', en: 'Ancient Scroll' }, desc: { pt: 'Contém escritas místicas e rasgadas.', en: 'Contains torn mystic writings.' }, cost: 180 },\n" +
"  fragmento_abismo: { id: 'fragmento_abismo', tier: 3, name: { pt: 'Fragmento do Abismo', en: 'Void Shard' }, desc: { pt: 'Pedra de escuridão solidificada.', en: 'Solidified darkness stone.' }, cost: 190 },\n" +
"  pluma_corvo: { id: 'pluma_corvo', tier: 3, name: { pt: 'Pluma de Corvo', en: 'Raven Feather' }, desc: { pt: 'Pena negra de ave sombria.', en: 'Black feather of a shadowy bird.' }, cost: 140 },\n" +
"  cristal_purpura: { id: 'cristal_purpura', tier: 4, name: { pt: 'Cristal Púrpura', en: 'Purple Crystal' }, desc: { pt: 'Brilha com energia ancestral.', en: 'Shines with ancestral energy.' }, cost: 350 },\n" +
"  rosa_vidro: { id: 'rosa_vidro', tier: 4, name: { pt: 'Rosa de Vidro', en: 'Glass Rose' }, desc: { pt: 'Delicada, mas perigosa e cortante.', en: 'Delicate, yet dangerous and sharp.' }, cost: 380 },\n" +
"  'gota_orvalho_místico': { id: 'gota_orvalho_místico', tier: 4, name: { pt: 'Orvalho Místico', en: 'Mystic Dew' }, desc: { pt: 'Água sagrada das fadas.', en: 'Sacred water of fairies.' }, cost: 400 },\n" +
"  essencia_sombra: { id: 'essencia_sombra', tier: 5, name: { pt: 'Essência da Sombra', en: 'Shadow Essence' }, desc: { pt: 'A manifestação da escuridão.', en: 'The manifestation of darkness.' }, cost: 800 },\n" +
"  insignia_touca_preta: { id: 'insignia_touca_preta', tier: 5, name: { pt: 'Insígnia da Touca Preta', en: 'Black Beanie Insignia' }, desc: { pt: 'Prova de coragem no Santuário.', en: 'Proof of courage in the Sanctuary.' }, cost: 900 },\n";

content = content.replace(/(lagrima_deusa_touca:\s*\{[\s\S]*?cost:\s*800,\s*\},)/, "\n" + newRelicsStr);

fs.writeFileSync('src/services/gloomRealm.js', content, 'utf8');
console.log('Injected new relics successfully.');
