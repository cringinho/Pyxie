#!/usr/bin/env node
require('dotenv').config();

/**
 * Preview de homologação (AGENTS.md §11) do diário novo e dos embeds reescritos na voz da Pyxie
 * (biscoito, cara ou coroa, dados, carteira) no canal 1461937203214024891.
 * Usa contas de teste (apagadas no fim). Uso: node scripts/dispatch_voice_previews.js [pt|en]
 */

const lang = process.argv[2] === 'en' ? 'en' : 'pt';
const { dispatchHomologationPreview } = require('../src/utils/homologationPreviewDispatcher');
const economy = require('../src/services/economy');
const daily = require('../src/commands/daily');
const cookieCmd = require('../src/commands/biscoito');
const coinflip = require('../src/commands/coinflip');
const { buildWalletEmbed } = require('../src/commands/economyHelpers');
const { grantExtraCookie } = require('../src/services/cookie');

const user = `user_test_preview_${Date.now()}`;
const fakeUser = { id: user, username: 'homologacao', displayName: 'Homologação', displayAvatarURL: () => null };

async function send(commandName, context, payload) {
  const result = await dispatchHomologationPreview({ commandName, context, embeds: payload.embeds, components: payload.components || [] });
  console.log(`[VoicePreview] ${context}:`, result.simulated ? 'simulado' : `enviado (${result.messageId})`);
}

async function main() {
  const now = Date.now();
  economy.updateUserAccount(user, (acc) => {
    acc.coins = 500;
    acc.dailyStreak = 6;
    acc.lastDailyAt = new Date(now - 25 * 60 * 60 * 1000).toISOString();
  });
  await send('py-daily', `Diário no marco de 7 dias (${lang})`, daily.buildDailyView(user, lang, null, now));
  await send('py-daily', `Xícaras da Pyxie (${lang})`, daily.buildCupsView(user, lang));
  await send('py-daily', `Diário em espera (${lang})`, daily.buildDailyView(user, lang, null, now + 60 * 1000));

  grantExtraCookie(user);
  const cookieView = cookieCmd.executeSlash
    ? await new Promise((resolve) => cookieCmd.executeSlash({ interaction: { user: { id: user }, lang, editReply: resolve } }))
    : null;
  if (cookieView) await send('py-cookie', `Biscoito da sorte (${lang})`, cookieView);

  const flip = coinflip.executeSlash
    ? await new Promise((resolve) => coinflip.executeSlash({
        interaction: {
          user: { id: user },
          lang,
          options: { getString: () => 'cara', getInteger: () => 10 },
          editReply: resolve,
        },
      }))
    : null;
  if (flip) await send('py-coinflip', `Cara ou coroa (${lang})`, flip);

  await send('py-wallet', `Carteira (${lang})`, { embeds: [buildWalletEmbed(fakeUser, economy.getCurrencyBalances(user, lang), 12, lang)] });
}

main()
  .catch((err) => {
    console.error('[VoicePreview] Falha:', err);
    process.exitCode = 1;
  })
  .finally(() => economy.purgeTestAccounts());
