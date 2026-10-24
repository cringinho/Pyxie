const assert = require('node:assert/strict');

/**
 * Diário da Pyxie: +1 moedinha por dia seguido, falas por sequência e marcos, energia do dia
 * com reação, Xícaras (uma jogada por diário, prêmio sob a trava) e botões só da dona do diário.
 * As moedinhas ficam no data/economy.json real: as contas de teste são apagadas no fim.
 */

const economy = require('../src/services/economy');
const daily = require('../src/commands/daily');
const pyxieDaily = require('../src/data/pyxieDaily');
const { t } = require('../src/utils/i18n');

const runId = Date.now();
const users = {
  a: `user_test_daily_a_${runId}`,
  b: `user_test_daily_b_${runId}`,
  c: `user_test_daily_c_${runId}`,
  d: `user_test_daily_d_${runId}`,
};
const HOUR = 60 * 60 * 1000;
const now = Date.UTC(2026, 9, 24, 15, 0, 0);
const wordCount = (s) => s.trim().split(/\s+/).length;

console.log('☀️ Iniciando testes do Diário da Pyxie...');

function checkEmbed(embed) {
  const data = embed.data;
  assert.ok(/^\p{Extended_Pictographic}/u.test(data.title), `Título com emoji: ${data.title}`);
  assert.ok(wordCount(data.title) <= 8, `Título curto: ${data.title}`);
  assert.ok(data.description.length <= 4096);
  assert.ok(!/━|═|-{6,}/.test(data.description), 'Sem divisores ASCII');
}

function mockButton(customId, userId, message = null) {
  const calls = { update: [], reply: [], followUp: [] };
  return {
    calls,
    interaction: {
      customId,
      user: { id: userId },
      lang: 'pt',
      locale: 'pt-BR',
      message,
      isButton: () => true,
      update: async (p) => calls.update.push(p),
      reply: async (p) => calls.reply.push(p),
      followUp: async (p) => calls.followUp.push(p),
    },
  };
}

(async () => {
  try {
    // 1. +1 por dia seguido, e a disponibilidade é conferida dentro da trava
    const day1 = economy.claimDaily(users.a, now);
    assert.equal(day1.claimed, true);
    assert.equal(day1.streakBonus, 1);
    assert.equal(economy.claimDaily(users.a, now + 1000).claimed, false, 'Segundo clique no mesmo dia não paga');
    const day2 = economy.claimDaily(users.a, now + 25 * HOUR);
    assert.equal(day2.streak, 2);
    assert.equal(day2.streakBonus, 2);
    assert.equal(day2.totalAmount, day2.amount + 2);
    console.log('  ✅ 1. Cada dia seguido vale +1 moedinha.');

    // 2. Marco de 7 dias e sequência quebrada
    economy.updateUserAccount(users.b, (acc) => {
      acc.dailyStreak = 6;
      acc.lastDailyAt = new Date(now - 25 * HOUR).toISOString();
    });
    const milestoneView = daily.buildDailyView(users.b, 'pt', null, now);
    checkEmbed(milestoneView.embeds[0]);
    assert.ok(milestoneView.embeds[0].data.title.includes('7'), 'Título mostra a sequência');
    assert.ok(milestoneView.embeds[0].data.description.includes('Uma semana inteira'));
    assert.ok(milestoneView.embeds[0].data.description.includes('pro marco de **30**'));
    assert.equal(economy.getUserAccount(users.b).dailyStreak, 7);

    economy.updateUserAccount(users.c, (acc) => {
      acc.dailyStreak = 12;
      acc.lastDailyAt = new Date(now - 72 * HOUR).toISOString();
    });
    const brokenView = daily.buildDailyView(users.c, 'en', null, now);
    checkEmbed(brokenView.embeds[0]);
    assert.ok(brokenView.embeds[0].data.description.includes('**12**-day streak ended'));
    assert.equal(economy.getUserAccount(users.c).dailyStreak, 1);
    console.log('  ✅ 2. Marcos e sequência quebrada com a fala da Pyxie.');

    // 3. Energia do dia: a mesma o dia todo, com reação e botões
    const energy = pyxieDaily.getDailyEnergy(users.b, now);
    assert.equal(pyxieDaily.getDailyEnergy(users.b, now + 2 * HOUR).id, energy.id);
    assert.ok(milestoneView.embeds[0].data.description.includes(energy.name.pt));
    const ids = milestoneView.components[0].toJSON().components.map((c) => c.custom_id).filter(Boolean);
    assert.deepEqual(ids, [`daily:react:${users.b}:right`, `daily:react:${users.b}:wrong`, `daily:cups:${users.b}`]);
    for (const e of pyxieDaily.ENERGIES) assert.ok(e.name.pt && e.name.en && e.line.pt && e.line.en, e.id);
    console.log('  ✅ 3. Energia do dia estável e completa em PT/EN.');

    // 4. Reação: só a dona do diário, e os botões de reação somem
    const message = { embeds: milestoneView.embeds.map((e) => e.toJSON()), components: milestoneView.components.map((r) => r.toJSON()) };
    message.components = message.components.map((row) => ({ ...row, components: row.components.map((c) => ({ ...c, customId: c.custom_id })) }));
    const intruder = mockButton(`daily:react:${users.b}:right`, users.a, message);
    assert.ok(daily.isDailyInteraction(intruder.interaction));
    await daily.handleDailyInteraction(intruder.interaction, now);
    assert.equal(intruder.calls.reply[0].content, t('daily.notYours', 'pt'));
    const react = mockButton(`daily:react:${users.b}:right`, users.b, message);
    await daily.handleDailyInteraction(react.interaction, now);
    const updated = react.calls.update[0];
    assert.ok(updated.embeds[0].data.description.includes('-# 💬'));
    const left = updated.components[0].toJSON().components.map((c) => c.custom_id).filter(Boolean);
    assert.deepEqual(left, [`daily:cups:${users.b}`]);
    console.log('  ✅ 4. Reação da Pyxie só para a dona do diário.');

    // 5. Xícaras: uma jogada por diário, prêmio só para a xícara certa
    assert.equal(economy.playDailyCups(users.d, 0, now).reason, 'not_claimed');
    economy.claimDaily(users.d, now);
    assert.equal(economy.canPlayDailyCups(users.d, now), true);
    const before = economy.getUserAccount(users.d).coins;
    const first = economy.playDailyCups(users.d, 1, now + 1000);
    assert.equal(first.ok, true);
    assert.equal(first.win, first.winningCup === 1);
    assert.equal(economy.getUserAccount(users.d).coins, before + (first.win ? economy.DAILY_CUPS_PRIZE : 0));
    assert.equal(economy.playDailyCups(users.d, first.winningCup, now + 2000).reason, 'already_played');
    assert.equal(economy.canPlayDailyCups(users.d, now + 2000), false);
    assert.equal(economy.playDailyCups(users.d, 7, now).reason, 'invalid');

    const cupsView = daily.buildCupsView(users.d, 'pt');
    checkEmbed(cupsView.embeds[0]);
    assert.equal(cupsView.components[0].toJSON().components.length, economy.DAILY_CUPS_COUNT);
    const result = daily.buildCupsView(users.d, 'en', first);
    assert.ok(result.components[0].toJSON().components.every((c) => c.disabled));
    console.log('  ✅ 5. Xícaras com uma jogada por diário.');

    // 6. Fora do horário: a Pyxie lembra das xícaras se ainda der para jogar
    economy.claimDaily(users.a, now + 50 * HOUR);
    const cooldown = daily.buildDailyView(users.a, 'pt', null, now + 51 * HOUR);
    checkEmbed(cooldown.embeds[0]);
    assert.ok(cooldown.embeds[0].data.description.includes(t('daily.cooldownCups', 'pt')));
    const cooldownIds = cooldown.components[0].toJSON().components.map((c) => c.custom_id).filter(Boolean);
    assert.deepEqual(cooldownIds, [`daily:cups:${users.a}`]);
    const cooldownD = daily.buildDailyView(users.d, 'en', null, now + 3000);
    assert.ok(cooldownD.embeds[0].data.description.includes(t('daily.cooldownIdle', 'en')));
    console.log('  ✅ 6. Tela de espera com energia e xícaras pendentes.');

    // 7. Falas da Pyxie completas em PT/EN
    for (const tier of pyxieDaily.GREETINGS) for (const line of tier.lines) assert.ok(line.pt && line.en);
    for (const list of Object.values(pyxieDaily.REACTIONS)) for (const line of list) assert.ok(line.pt && line.en);
    for (const m of pyxieDaily.STREAK_MILESTONES) {
      assert.notEqual(t(`daily.milestone.${m}`, 'pt'), t(`daily.milestone.${m}`, 'en'));
    }
    console.log('  ✅ 7. Falas e marcos nos dois idiomas.');

    console.log('✨ Diário da Pyxie validado.');
  } catch (err) {
    console.error('❌ Falha nos testes do diário:', err);
    process.exitCode = 1;
  } finally {
    economy.purgeTestAccounts();
  }
})();
