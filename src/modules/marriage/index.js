const pyCasamento = require('./commands/pyCasamento');
const pyDivorcio = require('./commands/pyDivorcio');
const pyFilho = require('./commands/pyFilho');
const marriageManager = require('./marriageManager');
const { playChildBirthAnimation } = require('./marriageAnimations');
const { getLanguage, t, formatCoins } = require('../../utils/i18n');
const { spendCoins } = require('../../services/economy');

/**
 * Módulo Oficial de Matrimônio & Família da Pyxie (Cog Pattern)
 * 
 * Fornece:
 * - Ciclo matrimonial completo (/py-casamento, /py-divorcio, /py-filho)
 * - Barra do Amor com Decaimento Preguiçoso (Lazy Decay) de 20%/dia
 * - Árvore da Vida com recarga de +10% e cooldown compartilhado de 12h
 * - Casa Familiar e Cofre do Amor Eterno com rendimentos diários proporcionais
 * - Date Night interativo com 400 questões generativas bilíngues
 * - Sistema de Filiação com animação assíncrona de 3 frames (1200ms)
 * - Estágio de 24h dos filhos com trava temporal estrita (Job Lock)
 */
module.exports = {
  id: 'marriage',
  name: {
    'pt-BR': 'Matrimônio & Família',
    en: 'Marriage & Family',
  },
  description: {
    'pt-BR': 'Casamentos, Árvore da Vida, Casa Familiar, Cofre do Amor Eterno, Date Night e Filhos.',
    en: 'Marriage, Tree of Life, Family House, Love Vault, Date Night and Children system.',
  },
  category: 'social',
  icon: '💍',
  version: '1.0.0',
  author: 'Pyxie Team',
  defaultEnabled: true,

  // Comandos fornecidos pelo módulo
  commands: [
    pyCasamento,
    pyDivorcio,
    pyFilho,
  ],

  // Hook de ciclo de vida onLoad
  async onLoad(ctx) {
    // Registrar Listener de Interações Stateless para botões marr:*
    if (ctx.registerListener) {
      ctx.registerListener('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        const customId = interaction.customId || '';
        if (!customId.startsWith('marr:')) return;

        const parts = customId.split(':');
        const action = parts[1];

        // 1. Aceitar / Recusar Proposta de Casamento
        if (action === 'aceitar' || action === 'recusar') {
          const requestId = parts[2];
          const accepted = action === 'aceitar';
          const result = marriageManager.resolveMarriageProposal(
            requestId,
            interaction.user.id,
            accepted
          );

          if (!result.resolved) {
            let errorKey = 'marriage.expired';
            if (result.reason === 'married') errorKey = 'marriage.alreadyMarried';
            if (result.reason === 'pending') errorKey = 'marriage.pendingProposal';
            await interaction.reply({
              content: t(errorKey, interaction),
              flags: 64,
            });
            return;
          }

          if (!accepted) {
            await interaction.update({
              content: t('marriage.rejectReply', interaction),
              embeds: [],
              components: [],
            });
            return;
          }

          await interaction.update({
            content: t('marriage.acceptReply', interaction, {
              requester: `<@${result.request.requesterId}>`,
              target: `<@${result.request.targetId}>`,
            }),
            embeds: [],
            components: [],
          });
          return;
        }

        // 2. Aceitar / Recusar Filho
        if (action === 'filho_aceitar' || action === 'filho_recusar') {
          const marriageId = parts[2];
          const proposerId = parts[3];

          // Somente o parceiro pode responder ao convite
          const marriage = marriageManager.getMarriage(interaction.user.id);
          if (!marriage || marriage.id !== marriageId || interaction.user.id === proposerId) {
            await interaction.reply({
              content: t('marriage.childOnlySpouseCanAnswer', interaction),
              flags: 64,
            });
            return;
          }

          if (action === 'filho_recusar') {
            await interaction.update({
              content: t('marriage.childProposalRejected', interaction),
              embeds: [],
              components: [],
            });
            return;
          }

          // Verificação de condições e custos
          const check = marriageManager.canHaveChild(proposerId);
          if (!check.allowed) {
            let errorMsg = t('marriage.genericError', interaction);
            if (check.reason === 'max_children') errorMsg = t('marriage.childMaxReached', interaction);
            if (check.reason === 'no_house') errorMsg = t('marriage.childRequiresHouse', interaction);
            if (check.reason === 'insufficient_coins') {
              errorMsg = t('marriage.childNeedCoins', interaction, { cost: formatCoins(check.cost, interaction) });
            }
            await interaction.reply({ content: errorMsg, flags: 64 });
            return;
          }

          // Se tiver custo (2º ao 5º), debita do proponente
          if (check.cost > 0) {
            const spend = spendCoins(proposerId, check.cost);
            if (!spend.spent) {
              await interaction.reply({
                content: t('marriage.childNeedCoins', interaction, { cost: formatCoins(check.cost, interaction) }),
                flags: 64,
              });
              return;
            }
          }

          // Executa a animação sequencial visual de 3 frames (1200ms)
          const chosenGender = Math.random() < 0.5 ? 'male' : 'female';
          await interaction.deferUpdate();
          await playChildBirthAnimation({
            target: interaction,
            gender: chosenGender,
            lang: getLanguage(interaction),
          });

          // Adiciona o filho
          const defaultName = chosenGender === 'male' ? 'Luminar' : 'Estelar';
          marriageManager.addChild(marriageId, {
            name: defaultName,
            gender: chosenGender,
          });
          return;
        }

        // 3. Resposta de Date Night
        if (action === 'date_ans') {
          const sessionId = parts[2];
          const optIdx = parseInt(parts[3], 10);
          const session = pyCasamento.activeDateSessions?.get(sessionId);

          if (!session) {
            await interaction.reply({
              content: t('marriage.dateSessionExpired', interaction),
              flags: 64,
            });
            return;
          }

          if (!session.spouses.includes(interaction.user.id)) {
            await interaction.reply({
              content: t('marriage.dateNotYourSession', interaction),
              flags: 64,
            });
            return;
          }

          session.answers[interaction.user.id] = optIdx;
          await interaction.reply({
            content: t('marriage.dateAnswerRecorded', interaction),
            flags: 64,
          });

          // Se ambos responderam, resolve a rodada
          const spouseA = session.spouses[0];
          const spouseB = session.spouses[1];
          if (session.answers[spouseA] !== undefined && session.answers[spouseB] !== undefined) {
            const isMatch = session.answers[spouseA] === session.answers[spouseB];
            const outcome = marriageManager.resolveDateNight(session.marriageId, isMatch);
            pyCasamento.activeDateSessions.delete(sessionId);

            const resultText = isMatch
              ? t('marriage.dateOutcomeMatch', interaction, {
                  love: outcome.newLove,
                  coins: formatCoins(100, interaction),
                })
              : t('marriage.dateOutcomeDivergent', interaction, {
                  love: outcome.newLove,
                });

            try {
              await interaction.channel.send({
                content: resultText,
              });
            } catch (_) {}
          }
          return;
        }
      });
    }
  },

  // Hook de ciclo de vida onUnload (Zero Memory Leak)
  async onUnload(ctx) {
    if (pyCasamento.activeDateSessions) {
      pyCasamento.activeDateSessions.clear();
    }
  },
};

