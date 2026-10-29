const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyxie-quizgames-'));

const challengeService = require('../src/services/dailyChallengeService');
const duelService = require('../src/services/quizDuelService');
const animeService = require('../src/services/animeQuizService');
challengeService._setDataFileForTests(path.join(tmpDir, 'dailyChallenge.json'));
duelService._setDataFileForTests(path.join(tmpDir, 'quizDuels.json'));
animeService._setDataFileForTests(path.join(tmpDir, 'animeQuiz.json'));

const { getBrtDateKey, getPreviousDateKey, msUntilNextBrtMidnight } = require('../src/utils/brtDate');
const quizQuestions = require('../src/data/quiz_questions.json');

console.log('🧪 Iniciando testes dos jogos de quiz (Duelo, Desafio do Dia e Maratona Otaku)...');

const DAY = 24 * 60 * 60 * 1000;
// 15:00 UTC = 12:00 BRT, longe da virada do dia
const day1 = Date.parse('2026-10-20T15:00:00Z');
const day2 = day1 + DAY;
const day3 = day1 + 2 * DAY;
const day5 = day1 + 4 * DAY;

// 1. Datas em BRT
assert.equal(getBrtDateKey(Date.parse('2026-10-21T02:59:00Z')), '2026-10-20', '23:59 BRT ainda é o dia anterior');
assert.equal(getBrtDateKey(Date.parse('2026-10-21T03:00:00Z')), '2026-10-21', 'Meia-noite BRT vira o dia');
assert.equal(getPreviousDateKey('2026-03-01'), '2026-02-28');
assert.equal(msUntilNextBrtMidnight(Date.parse('2026-10-21T02:00:00Z')), 60 * 60 * 1000);
console.log('  ✅ 1. Calendário BRT validado.');

// 2. Desafio do Dia: pergunta determinística, igual em PT e EN
const keyA = getBrtDateKey(day1);
const ptChallenge = challengeService.pickChallenge(quizQuestions, keyA, 'pt');
const enChallenge = challengeService.pickChallenge(quizQuestions, keyA, 'en');
assert.deepEqual(challengeService.pickChallenge(quizQuestions, keyA, 'pt'), ptChallenge, 'Mesmo dia deve gerar o mesmo desafio');
assert.equal(ptChallenge.key, enChallenge.key, 'PT e EN devem receber a mesma pergunta');
assert.equal(ptChallenge.correctIndex, enChallenge.correctIndex, 'O índice da resposta deve valer nos dois idiomas');
assert.equal(ptChallenge.choices[ptChallenge.correctIndex], ptChallenge.correctText);
assert.equal(ptChallenge.choices.length, 4);
assert.ok([3, 4].includes(ptChallenge.level), 'Desafio do dia usa perguntas difíceis (nível 3 ou 4)');
console.log('  ✅ 2. Desafio diário determinístico e bilíngue.');

// 3. Desafio do Dia: tentativa única, sequência e prêmio pequeno
assert.equal(challengeService.computeReward(1), 3);
assert.equal(challengeService.computeReward(4), 6);
assert.equal(challengeService.computeReward(30), 8, 'Prêmio máximo do desafio deve ser 8 moedinhas');

const u = 'test_challenge_user';
const c1 = challengeService.pickChallenge(quizQuestions, getBrtDateKey(day1), 'pt');
let res = challengeService.submitAnswer(u, getBrtDateKey(day1), c1.correctIndex, c1.correctIndex, day1);
assert.deepEqual(res, { status: 'correct', streak: 1, reward: 3 });
res = challengeService.submitAnswer(u, getBrtDateKey(day1), c1.correctIndex, c1.correctIndex, day1);
assert.equal(res.status, 'already', 'Segunda tentativa no mesmo dia deve ser bloqueada');
assert.equal(challengeService.submitAnswer(u, getBrtDateKey(day1), 0, 0, day2).status, 'expired', 'Botão de ontem expira');

const c2 = challengeService.pickChallenge(quizQuestions, getBrtDateKey(day2), 'pt');
res = challengeService.submitAnswer(u, getBrtDateKey(day2), c2.correctIndex, c2.correctIndex, day2);
assert.deepEqual(res, { status: 'correct', streak: 2, reward: 4 }, 'Dias seguidos aumentam a sequência');

const c3 = challengeService.pickChallenge(quizQuestions, getBrtDateKey(day3), 'pt');
res = challengeService.submitAnswer(u, getBrtDateKey(day3), (c3.correctIndex + 1) % 4, c3.correctIndex, day3);
assert.deepEqual(res, { status: 'wrong', streak: 0, reward: 0 }, 'Erro zera a sequência sem prêmio');

const c5 = challengeService.pickChallenge(quizQuestions, getBrtDateKey(day5), 'pt');
res = challengeService.submitAnswer(u, getBrtDateKey(day5), c5.correctIndex, c5.correctIndex, day5);
assert.equal(res.streak, 1, 'Depois de pular dias a sequência recomeça');

const state = challengeService.getPlayerState(u, day5);
assert.equal(state.attemptedToday, true);
assert.equal(state.bestStreak, 2);
assert.deepEqual(challengeService.getDayStats(getBrtDateKey(day3)), { attempts: 1, correct: 0 });
assert.deepEqual(challengeService.getTopStreaks(5, day5), [{ userId: u, streak: 1 }]);
console.log('  ✅ 3. Tentativa única, sequência, reset e prêmio limitado validados.');

// 4. Duelo de Quiz: fluxo completo
const A = 'test_duel_a';
const B = 'test_duel_b';
let created = duelService.createDuel({ challengerId: A, opponentId: B, lang: 'pt', questions: quizQuestions, now: day1 });
let duel = created.duel;
assert.ok(duel && duel.status === 'pending');
assert.equal(duel.questions.length, 3);
assert.equal(duelService.createDuel({ challengerId: B, opponentId: 'test_duel_c', questions: quizQuestions }).error, 'challenger_busy');
assert.equal(duelService.acceptDuel(duel.id, A).error, 'not_opponent', 'Só o desafiado aceita');
assert.ok(duelService.acceptDuel(duel.id, B).duel);
assert.equal(duel.round, 1);

const wrongOf = (d) => (d.questions[d.round - 1].correctIndex + 1) % 4;
const rightOf = (d) => d.questions[d.round - 1].correctIndex;

assert.equal(duelService.submitAnswer(duel.id, 'intruso', 1, 0).error, 'not_player');
assert.equal(duelService.submitAnswer(duel.id, A, 2, 0).error, 'stale_round');
assert.equal(duelService.submitAnswer(duel.id, A, 1, wrongOf(duel)).result, 'wrong');
assert.equal(duelService.submitAnswer(duel.id, A, 1, rightOf(duel)).error, 'locked_out', 'Quem errou fica de fora da rodada');
let step = duelService.submitAnswer(duel.id, B, 1, rightOf(duel), day1);
assert.equal(step.result, 'round_won');
assert.equal(duel.scores[B], 1);
assert.equal(duel.round, 2);

duelService.submitAnswer(duel.id, A, 2, wrongOf(duel), day1);
step = duelService.submitAnswer(duel.id, B, 2, wrongOf(duel), day1);
assert.equal(step.result, 'round_void', 'Dois erros anulam a rodada');
assert.equal(duel.round, 3);

step = duelService.submitAnswer(duel.id, B, 3, rightOf(duel), day1);
assert.equal(step.finished, true);
assert.equal(step.outcome.winnerId, B);
assert.equal(step.outcome.reward, duelService.WIN_REWARD);
assert.equal(duelService.WIN_REWARD, 5, 'Prêmio do duelo deve ser pequeno');
assert.equal(duelService.getDuel(duel.id), null, 'Duelo encerrado sai da memória');
assert.deepEqual(duelService.getPlayerStats(B), { wins: 1, losses: 0, draws: 0 });
assert.deepEqual(duelService.getPlayerStats(A), { wins: 0, losses: 1, draws: 0 });
console.log('  ✅ 4. Duelo: aceite, bloqueio após erro, rodada anulada e vitória validados.');

// 5. Duelo: limite diário de prêmios, empate, recusa e tempo esgotado
for (let i = 0; i < 2; i++) duelService.recordResult({ winnerId: B, loserId: A }, day1);
const limited = duelService.recordResult({ winnerId: B, loserId: A }, day1);
assert.deepEqual(limited, { reward: 0, rewardLimited: true }, '4ª vitória premiada no dia deve render 0');
assert.equal(duelService.recordResult({ winnerId: B, loserId: A }, day2).reward, 5, 'Limite renova no dia seguinte');

created = duelService.createDuel({ challengerId: A, opponentId: B, questions: quizQuestions, now: day1 });
duelService.acceptDuel(created.duel.id, B);
for (let r = 1; r <= 3; r++) {
  step = duelService.timeoutRound(created.duel.id, r, day1);
  assert.equal(step.result, 'round_void');
}
assert.equal(step.finished, true);
assert.equal(step.outcome.draw, true, 'Três rodadas sem acerto terminam empatadas');
assert.equal(step.outcome.reward, 0);

created = duelService.createDuel({ challengerId: A, opponentId: B, questions: quizQuestions });
assert.equal(duelService.declineDuel(created.duel.id, A).cancelled, true, 'Desafiante pode cancelar');
created = duelService.createDuel({ challengerId: A, opponentId: B, questions: quizQuestions });
assert.ok(duelService.expirePendingDuel(created.duel.id));
assert.equal(duelService.isUserInDuel(A), false);
console.log('  ✅ 5. Limite diário, empate por tempo, cancelamento e expiração validados.');

// 6. Banco de anime: integridade e paridade bilíngue
const animeBank = animeService.loadAnimeQuestions();
assert.equal(animeBank.length, 64);
const ids = new Set();
const perLevel = { 1: 0, 2: 0, 3: 0, 4: 0 };
for (const q of animeBank) {
  assert.ok(!ids.has(q.id), `ID duplicado: ${q.id}`);
  ids.add(q.id);
  perLevel[q.level]++;
  for (const lang of ['pt', 'en']) {
    const d = q[lang];
    assert.ok(d.topic && d.question && d.correct, `${q.id}.${lang} incompleto`);
    assert.equal(d.wrongs.length, 3, `${q.id}.${lang} precisa de 3 alternativas erradas`);
    const all = [d.correct, ...d.wrongs];
    assert.equal(new Set(all).size, 4, `${q.id}.${lang} tem alternativas repetidas`);
    assert.ok(all.every((x) => x.length <= 70), `${q.id}.${lang} tem alternativa longa demais`);
  }
}
assert.deepEqual(perLevel, { 1: 16, 2: 16, 3: 16, 4: 16 });
console.log('  ✅ 6. Banco de 64 perguntas de anime íntegro e bilíngue.');

// 7. Maratona Otaku: níveis crescentes, sem repetição, cooldown e recorde
const runQs = animeService.pickRunQuestions(animeBank, 'en');
assert.deepEqual(runQs.map((q) => q.level), [1, 2, 3, 4, 4]);
assert.equal(new Set(runQs.map((q) => q.id)).size, 5, 'Sem perguntas repetidas na mesma maratona');
assert.ok(runQs.every((q) => q.choices[q.correctIndex] === q.correctText));
assert.ok(/[a-z]/i.test(runQs[0].topic) && runQs[0].question === animeBank.find((q) => q.id === runQs[0].id).en.question);

const otaku = 'test_otaku_user';
assert.equal(animeService.getRunStatus(otaku, day1).available, true);
assert.equal(animeService.startRun(otaku, day1).started, true);
assert.equal(animeService.startRun(otaku, day1 + 1000).started, false, 'Cooldown de 3h entre maratonas');
assert.equal(animeService.getRunStatus(otaku, day1 + animeService.RUN_COOLDOWN_MS).available, true);
let finish = animeService.finishRun(otaku, 3, 5);
assert.deepEqual(finish, { isPerfect: false, bestScore: 3, newRecord: true });
finish = animeService.finishRun(otaku, 5, 5);
assert.equal(finish.isPerfect, true);
assert.equal(5 * animeService.REWARD_PER_CORRECT + animeService.PERFECT_BONUS, 8, 'Maratona perfeita rende no máximo 8 moedinhas');
console.log('  ✅ 7. Maratona Otaku: progressão, cooldown e recordes validados.');

// 8. Comandos: validações do duelo, canal de jogos opcional e embeds registrados
const guildConfigService = require('../src/services/guildConfigService');
const originalGetGuildConfig = guildConfigService.getGuildConfig;
guildConfigService.getGuildConfig = (guildId) => (guildId === 'test_guild_games' ? { gamesChannelId: '999' } : {});
const duelCommand = require('../src/commands/duelo');
guildConfigService.getGuildConfig = originalGetGuildConfig;

const guild = { id: 'test_guild_free', name: 'Servidor Teste' };
const alice = { id: 'test_cmd_alice', bot: false };
const bob = { id: 'test_cmd_bob', bot: false };
assert.ok(duelCommand.prepareDuel({ challenger: alice, opponent: bob, guild: null, channelId: '1', lang: 'pt' }).error.includes('servidores'));
assert.ok(duelCommand.prepareDuel({ challenger: alice, opponent: alice, guild, channelId: '1', lang: 'pt' }).error.includes('si mesmo'));
assert.ok(duelCommand.prepareDuel({ challenger: alice, opponent: { id: 'x', bot: true }, guild, channelId: '1', lang: 'en' }).error.includes('Bots'));
const wrongChannel = duelCommand.prepareDuel({ challenger: alice, opponent: bob, guild: { id: 'test_guild_games', name: 'G' }, channelId: '1', lang: 'pt' });
assert.ok(wrongChannel.error.includes('<#999>'), 'Com canal de jogos definido, duelos fora dele são recusados');

const ok = duelCommand.prepareDuel({ challenger: alice, opponent: bob, guild, channelId: '1', lang: 'pt', theme: 'anime' });
assert.ok(ok.duel && ok.payload, 'Duelo válido deve gerar o desafio');
assert.ok(ok.duel.questions.every((q) => animeBank.some((a) => a.pt.question === q.question)), 'Tema anime usa só o banco de anime');
assert.deepEqual(ok.payload.allowedMentions.users, [bob.id], 'Só o desafiado é notificado');
const challengeEmbed = ok.payload.embeds[0].toJSON();
assert.ok(challengeEmbed.title.split(/\s+/).length <= 8, 'Título curto (máx. 8 palavras)');
assert.ok(challengeEmbed.description.includes('Anime & Geek'));
assert.ok(!/━|═|-{10,}/.test(challengeEmbed.description), 'Sem divisores ASCII legados');
duelService.declineDuel(ok.duel.id, alice.id);

const challengeCommand = require('../src/commands/desafio');
const animeCommand = require('../src/commands/anime');
assert.equal(challengeCommand.ephemeral, true, 'Desafio do Dia é privado');
assert.equal(animeCommand.ephemeral, true, 'Maratona Otaku é privada');
const view = animeCommand.startRunView({ id: 'test_cmd_runner' }, 'pt');
assert.equal(view.components[0].components.length, 4);
animeCommand.activeRuns.clear();

const { EMBED_REGISTRY } = require('../src/utils/embedRegistry');
for (const id of ['quiz_duel', 'daily_challenge', 'anime_marathon']) {
  assert.ok(EMBED_REGISTRY.has(id), `Embed ${id} deve estar registrado`);
}
const { COMMAND_CATEGORY_MAP } = require('../src/commands/commandHelpers');
assert.equal(COMMAND_CATEGORY_MAP['py-duel'], 'social');
assert.equal(COMMAND_CATEGORY_MAP['py-challenge'], 'economia');
assert.equal(COMMAND_CATEGORY_MAP['py-anime'], 'economia');
console.log('  ✅ 8. Comandos, canal de jogos opcional, embeds e catálogo validados.');

// 8.1 Emojis do bot em vez de Unicode nos embeds dos três minigames
{
  const { emojify, appEmojiFor, UNICODE_TO_APP } = require('../src/utils/emojify');
  const custom = /<a?:[\w~]+:\d+>/;
  const pictographic = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B50\u231B\u23F3]/u;
  assert.ok(custom.test(emojify('⚔️ Duelo ✅ ❌ 🪙')), 'emojify troca por emojis do bot');
  assert.equal(emojify('sem emoji'), 'sem emoji');
  for (const unicode of Object.keys(UNICODE_TO_APP)) assert.ok(appEmojiFor(unicode), `${unicode} precisa de um emoji do bot no catálogo`);
  const sample = [
    animeCommand.startRunView({ id: 'test_emoji_runner' }, 'pt'),
    animeCommand.startRunView({ id: 'test_emoji_runner2' }, 'en'),
  ];
  animeCommand.activeRuns.clear();
  for (const view of sample) {
    const json = view.embeds[0].toJSON();
    assert.ok(custom.test(json.title), `Título com emoji do bot: ${json.title}`);
    assert.ok(!pictographic.test(json.title + json.description + json.fields.map((f) => f.name + f.value).join('')), 'Sem emoji Unicode no embed');
  }
  const duelEmbed = ok.payload.embeds[0].toJSON();
  assert.ok(custom.test(duelEmbed.title) && !pictographic.test(duelEmbed.title + duelEmbed.description), 'Duelo sem Unicode');
  const challengeView = challengeCommand.buildQuestionView('test_emoji_user', 'pt');
  const challengeJson = challengeView.embeds[0].toJSON();
  assert.ok(custom.test(challengeJson.title) && !pictographic.test(challengeJson.title + challengeJson.description), 'Desafio sem Unicode');
  for (const id of ['quiz_duel', 'daily_challenge', 'anime_marathon']) {
    const schema = EMBED_REGISTRY.get(id);
    assert.ok(custom.test(schema.previewFields[0].name) && !pictographic.test(schema.previewDesc), `Preview ${id} com emojis do bot`);
  }
  console.log('  ✅ 8.1 Duelo, Desafio do Dia e Maratona Otaku usam emojis do bot, sem Unicode.');
}

// 9. Guardrail dos agentes (.agents/hooks): o código novo passa no veto PreToolUse
const hook = path.join(__dirname, '..', '.agents', 'hooks', 'pre-tool-validator.sh');
const bash = spawnSync('bash', ['--version']);
if (fs.existsSync(hook) && bash.status === 0) {
  const newFiles = [
    'src/commands/duelo.js',
    'src/commands/desafio.js',
    'src/commands/anime.js',
    'src/services/quizDuelService.js',
    'src/services/dailyChallengeService.js',
    'src/services/animeQuizService.js',
    'src/utils/brtDate.js',
    'src/utils/emojify.js',
  ];
  for (const rel of newFiles) {
    const abs = path.join(__dirname, '..', rel);
    // Caminho inexistente simula a criação do arquivo, ativando também a regra de isolamento de tenant
    const candidate = abs.replace(/\.js$/, '.hookcheck.js');
    const payload = JSON.stringify({ toolCall: { args: { TargetFile: candidate, CodeContent: fs.readFileSync(abs, 'utf8') } } });
    const out = spawnSync('bash', [path.relative(process.cwd(), hook).replace(/\\/g, '/')], { input: payload, encoding: 'utf8' });
    assert.ok(/"allow_tool": true/.test(out.stdout), `Hook vetou ${rel}: ${out.stdout}`);
  }
  console.log('  ✅ 9. Hook PreToolUse aprova os 7 arquivos novos (zero-mock e isolamento de tenant).');
} else {
  console.log('  ⏭️ 9. bash indisponível: verificação do hook pulada.');
}

// 10. /py-set via slash: o index.js já fez deferReply, então a resposta precisa ser editReply
(async () => {
  const originalAssign = guildConfigService.assignDedicatedChannel;
  const assigned = [];
  guildConfigService.assignDedicatedChannel = (guildId, featureKey, channelId) => {
    assigned.push({ guildId, featureKey, channelId });
    return { status: 'ASSIGNED', featureKey, featureName: 'Jogos & Minigames', featureNameEn: 'Games & Minigames', channelId, previousChannelId: null, conflictFeature: null };
  };
  const setCommand = require('../src/commands/set');
  guildConfigService.assignDedicatedChannel = originalAssign;

  assert.equal(setCommand.ephemeral, true, '/py-set deve abrir o defer em modo privado');

  const makeInteraction = (sub) => {
    const calls = { editReply: [], reply: 0 };
    const interaction = {
      deferred: true,
      replied: false,
      guildId: 'test_guild_set',
      guild: { id: 'test_guild_set', name: 'Servidor Teste' },
      locale: 'pt-BR',
      member: { permissions: { has: () => true } },
      options: {
        getSubcommand: () => sub,
        getChannel: () => ({ id: '555', isTextBased: () => true }),
      },
      editReply: async (payload) => calls.editReply.push(payload),
      reply: async () => {
        calls.reply += 1;
        throw new Error('InteractionAlreadyReplied');
      },
    };
    return { interaction, calls };
  };

  const games = makeInteraction('games');
  await setCommand.executeSlash({ interaction: games.interaction });
  assert.equal(games.calls.reply, 0, 'Não pode chamar reply() depois do defer');
  assert.equal(games.calls.editReply.length, 1);
  assert.ok(games.calls.editReply[0].content.includes('<#555>'), 'Confirma o canal de jogos configurado');
  assert.ok(!('ephemeral' in games.calls.editReply[0]), 'editReply não recebe a flag ephemeral');
  assert.deepEqual(assigned, [{ guildId: 'test_guild_set', featureKey: 'games', channelId: '555' }]);

  const help = makeInteraction(null);
  await setCommand.executeSlash({ interaction: help.interaction });
  assert.equal(help.calls.reply, 0);
  assert.equal(help.calls.editReply[0].embeds.length, 1, 'Sem subcomando mostra a central de configuração');
  console.log('  ✅ 10. /py-set via slash responde com editReply após o defer (inclui py-set jogos).');

  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log('🎉 tests/quizGames.test.js concluído com 100% de sucesso!');
})().catch((err) => {
  console.error('❌ Falha nos testes de /py-set:', err);
  process.exit(1);
});
