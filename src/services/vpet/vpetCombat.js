const { BASE_SPRITE_URL } = require('./vpetSpecies');

const WILD_ENEMIES = [
  { key: 'slime', name: { pt: 'Slime Selvagem', en: 'Wild Slime' }, hp: 50, atk: 12, def: 8, spd: 10, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/slime.gif` },
  { key: 'mushroom', name: { pt: 'Cogumelo Saltitante', en: 'Bouncing Shroom' }, hp: 60, atk: 15, def: 10, spd: 12, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/mushroom.gif` },
  { key: 'bat', name: { pt: 'Morcego Cavernoso', en: 'Cave Bat' }, hp: 65, atk: 18, def: 11, spd: 20, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/bat.gif` },
  { key: 'ghost', name: { pt: 'Espírito Errante', en: 'Wandering Ghost' }, hp: 70, atk: 20, def: 14, spd: 15, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/ghost.gif` },
  { key: 'snake', name: { pt: 'Víbora do Pântano', en: 'Swamp Viper' }, hp: 85, atk: 24, def: 16, spd: 22, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/snake.gif` },
  { key: 'boar', name: { pt: 'Javali Feroz', en: 'Fierce Boar' }, hp: 100, atk: 28, def: 22, spd: 16, sprite: `${BASE_SPRITE_URL}/sprites/vpet/enemies/boar.gif` },
];

function resolveSparring(pet, enemyIndex = null, lang = 'pt') {
  const enemy = enemyIndex !== null && WILD_ENEMIES[enemyIndex] 
    ? WILD_ENEMIES[enemyIndex] 
    : WILD_ENEMIES[Math.floor(Math.random() * WILD_ENEMIES.length)];

  // Combat power calculation
  const petPower = (pet.stats?.atk || 20) * 1.5 + (pet.stats?.spd || 15) + (pet.strengthHearts || 2) * 5 + (Math.random() * 20);
  const enemyPower = enemy.atk * 1.5 + enemy.spd + (Math.random() * 20);

  const victory = petPower >= enemyPower;
  const enemyName = enemy.name[lang] || enemy.name.pt;

  const coinsWon = victory ? 60 : 15;
  const xpWon = victory ? 35 : 10;

  const rounds = [];
  if (lang === 'pt') {
    rounds.push(`🥊 **Round 1**: Seu Pymon e **${enemyName}** se encaram na arena!`);
    if (victory) {
      rounds.push(`⚡ **Round 2**: Seu Pymon esquiva com agilidade e acerta um combo!`);
      rounds.push(`🏆 **Final**: Golpe decisivo! **${enemyName}** foi derrotado!`);
      rounds.push(`🪙 **Recompensa**: +${coinsWon} Moedinhas  •  🐾 +${xpWon} XP`);
    } else {
      rounds.push(`💥 **Round 2**: **${enemyName}** surpreende com uma investida pesada!`);
      rounds.push(`⚠️ **Final**: Seu Pymon lutou bravamente! Mais treinos o fortalecerão.`);
      rounds.push(`🪙 **Incentivo**: +${coinsWon} Moedinhas  •  🐾 +${xpWon} XP`);
    }
  } else {
    rounds.push(`🥊 **Round 1**: Your Pymon and **${enemyName}** clash in the ring!`);
    if (victory) {
      rounds.push(`⚡ **Round 2**: Your Pymon dodges gracefully and lands a crisp combo!`);
      rounds.push(`🏆 **Final**: Decisive strike! **${enemyName}** was defeated!`);
      rounds.push(`🪙 **Reward**: +${coinsWon} Coins  •  🐾 +${xpWon} XP`);
    } else {
      rounds.push(`💥 **Round 2**: **${enemyName}** counters with a powerful surge!`);
      rounds.push(`⚠️ **Final**: Your Pymon fought with heart! More training will help.`);
      rounds.push(`🪙 **Consolation**: +${coinsWon} Coins  •  🐾 +${xpWon} XP`);
    }
  }

  return {
    victory,
    enemy,
    rounds,
    coinsWon,
    xpWon,
    log: rounds.join('\n'),
    petSpriteState: victory ? 'attack' : 'hit',
  };
}

module.exports = {
  WILD_ENEMIES,
  resolveSparring,
};

