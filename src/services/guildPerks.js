// Benefícios efetivos de um servidor conforme o plano (sem multiplicador de moedinhas):
// hoje é o bônus fixo do /py-daily. O cooldown do diário nunca muda.
const plans = require('./guildPlans');

const DAILY_BONUS = { free: 0, founder: 20, basic: 50, premium: 120 };
const DAILY_BONUS_MAX = 500;

function forGuild(guildId, now = Date.now()) {
  const plan = plans.getPlan(guildId, now);
  const dailyBonus = plan.active ? Math.min(DAILY_BONUS_MAX, DAILY_BONUS[plan.plan] || 0) : 0;
  return {
    guildId: String(guildId || ''),
    plan: plan.plan,
    active: plan.active,
    expired: plan.expired,
    paidUntil: plan.paidUntil,
    dailyBonus,
  };
}

module.exports = { DAILY_BONUS, DAILY_BONUS_MAX, forGuild };
